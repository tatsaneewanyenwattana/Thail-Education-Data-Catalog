# Module: Notification
# Feature: Email Sending ตาม #33 claude-v3 M9

import logging
import smtplib
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import BackgroundTasks
from sqlalchemy import or_
from sqlalchemy.orm import Session

import app.repositories.email_log_repository as email_log_repo
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.email_template_type import EmailTemplateType
from app.core.logging import get_logger, log_request
from app.models.saved_search_model import SavedSearch
from app.models.subscription_model import Subscription
from app.models.user_model import User

logger = get_logger(__name__)

ALLOWED_FILTER_KEYS = frozenset({
    "category_id",
    "license",
    "year",
    "province",
    "agency_user_id",
})

ADMIN_USERS_PATH = "/admin/users"
DATASET_PATH_PREFIX = "/datasets"
EMAIL_SUBJECT_PREFIX = "[Thai EduData]"
EMAIL_FOOTER = (
    "\n\n---\n"
    "Thai Education Data Catalog\n"
    "ท่านได้รับอีเมลนี้เนื่องจากท่านได้ใช้งานหรือลงทะเบียนกับระบบ"
)


def _format_subject(title: str) -> str:
    return f"{EMAIL_SUBJECT_PREFIX} {title}"


def _send_smtp(
    to: str,
    subject: str,
    body: str,
) -> tuple[bool, str | None, str | None]:
    """ส่ง Email ผ่าน SMTP — คืน (success, error_message, provider_message_id)."""
    if not settings.smtp_configured:
        return False, "SMTP not configured", None

    try:
        message = MIMEMultipart()
        message["Subject"] = subject
        message["From"] = settings.smtp_from_address
        message["To"] = to
        message.attach(MIMEText(body, "plain", "utf-8"))

        envelope_from = settings.SMTP_FROM_EMAIL or settings.SMTP_FROM
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            refused = server.sendmail(
                envelope_from,
                [to],
                message.as_string(),
            )

        if refused:
            return False, f"SMTP refused recipients: {refused}", None

        return True, None, None
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"Email send failed to {to}: {exc}",
            error_code="INTERNAL_SERVER_ERROR",
        )
        return False, str(exc), None


def send_email(to: str, subject: str, body: str) -> None:
    """ส่ง Email ผ่าน SMTP — ไม่ raise exception ตาม #33 (legacy helpers)."""
    success, error_message, _ = _send_smtp(to, subject, body)
    if not success and error_message == "SMTP not configured":
        log_request(
            logger,
            logging.WARNING,
            "SMTP not configured, skip email",
            error_code="INTERNAL_SERVER_ERROR",
        )


def _send_logged_email(
    db: Session,
    *,
    template: EmailTemplateType,
    recipient_email: str,
    subject: str,
    body: str,
    user_id: uuid.UUID | None = None,
) -> None:
    log = email_log_repo.create_email_log(
        db,
        template_name=template.value,
        recipient_email=recipient_email,
        subject=subject,
        user_id=user_id,
    )
    db.flush()

    success, error_message, provider_message_id = _send_smtp(
        recipient_email,
        subject,
        body,
    )
    if success:
        email_log_repo.mark_sent(
            db,
            log.id,
            provider_message_id=provider_message_id,
        )
    else:
        email_log_repo.mark_failed(db, log.id, error_message or "Unknown error")

    db.commit()


def _get_admin_emails(db: Session) -> list[str]:
    rows = (
        db.query(User.email)
        .filter(
            User.role == "admin",
            User.is_deleted.is_(False),
        )
        .all()
    )
    return [row[0] for row in rows]


def _get_subscriber_emails(
    db: Session,
    category_id: uuid.UUID | None,
    agency_user_id: uuid.UUID,
) -> list[str]:
    conditions = [Subscription.agency_user_id == agency_user_id]
    if category_id is not None:
        conditions.append(Subscription.category_id == category_id)

    rows = (
        db.query(User.email)
        .join(Subscription, Subscription.user_id == User.id)
        .filter(or_(*conditions))
        .filter(User.is_deleted.is_(False))
        .distinct()
        .all()
    )
    return [row[0] for row in rows]


def _dataset_matches_saved_search_filters(dataset, filters: dict) -> bool:
    if not filters or not isinstance(filters, dict):
        return False

    meta = dataset.dataset_metadata or {}
    matched_any = False

    for key, value in filters.items():
        if key not in ALLOWED_FILTER_KEYS:
            continue
        if value is None or value == "":
            continue

        matched_any = True

        if key == "category_id":
            if dataset.category_id is None or str(dataset.category_id) != str(value):
                return False
        elif key == "license":
            if dataset.license != value:
                return False
        elif key == "agency_user_id":
            if str(dataset.user_id) != str(value):
                return False
        elif key == "year":
            try:
                expected_year = int(value)
            except (TypeError, ValueError):
                return False
            year_val = meta.get("year")
            if year_val is None or int(year_val) != expected_year:
                return False
        elif key == "province":
            if meta.get("province") != str(value):
                return False

    return matched_any


def _send_to_many(emails: list[str], subject: str, body: str) -> None:
    for email in emails:
        send_email(email, subject, body)


def _build_verify_email_body(user: User) -> str:
    verify_url = f"{settings.APP_BASE_URL}/verify-email?token={user.verify_token}"
    agency = user.agency_name or user.email
    return (
        f"เรียน คุณ{agency}\n\n"
        "กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของท่าน "
        "(ลิงก์หมดอายุภายใน 24 ชั่วโมง):\n\n"
        f"{verify_url}\n\n"
        "หากท่านไม่ได้สมัครสมาชิก กรุณาเพิกเฉยต่ออีเมลนี้"
        f"{EMAIL_FOOTER}"
    )


def _build_admin_new_registration_body(user: User) -> str:
    admin_url = f"{settings.APP_BASE_URL}{ADMIN_USERS_PATH}"
    return (
        "เรียน ผู้ดูแลระบบ\n\n"
        "มีหน่วยงานใหม่ยืนยันอีเมลแล้วและรอการอนุมัติบัญชี:\n\n"
        f"หน่วยงาน: {user.agency_name or '-'}\n"
        f"Email: {user.email}\n"
        f"ลิงก์จัดการผู้ใช้: {admin_url}"
        f"{EMAIL_FOOTER}"
    )


def _build_account_lockout_body(user: User) -> str:
    return (
        f"เรียน คุณ{user.agency_name or user.email}\n\n"
        "บัญชีของท่านถูกล็อกชั่วคราว 15 นาที "
        "เนื่องจากมีการพยายามเข้าสู่ระบบด้วยรหัสผ่านไม่ถูกต้องเกินจำนวนที่กำหนด\n\n"
        "หากท่านไม่ได้เป็นผู้ดำเนินการ กรุณาติดต่อผู้ดูแลระบบ"
        f"{EMAIL_FOOTER}"
    )


def _build_password_reset_body(user: User) -> str:
    reset_url = f"{settings.APP_BASE_URL}/reset-password?token={user.reset_token}"
    return (
        f"เรียน คุณ{user.agency_name or user.email}\n\n"
        "ท่านได้ขอตั้งรหัสผ่านใหม่ "
        "กรุณาคลิกลิงก์ด้านล่าง (ลิงก์หมดอายุภายใน 1 ชั่วโมง):\n\n"
        f"{reset_url}\n\n"
        "หากท่านไม่ได้ขอตั้งรหัสผ่านใหม่ กรุณาเพิกเฉยต่ออีเมลนี้"
        f"{EMAIL_FOOTER}"
    )


def _build_password_changed_body(user: User) -> str:
    return (
        f"เรียน คุณ{user.agency_name or user.email}\n\n"
        "รหัสผ่านของท่านถูกเปลี่ยนเรียบร้อยแล้ว\n\n"
        "หากท่านไม่ได้เป็นผู้ดำเนินการ กรุณาติดต่อผู้ดูแลระบบทันที"
        f"{EMAIL_FOOTER}"
    )


def _build_account_deleted_body(user: User) -> str:
    return (
        f"เรียน คุณ{user.agency_name or user.email}\n\n"
        "บัญชีของท่านถูกลบเรียบร้อยแล้วตามคำขอ\n\n"
        "ขอบคุณที่ใช้บริการ Thai Education Data Catalog"
        f"{EMAIL_FOOTER}"
    )


def _build_account_approved_body(user: User) -> str:
    login_url = f"{settings.APP_BASE_URL}/login"
    return (
        f"เรียน คุณ{user.agency_name or user.email}\n\n"
        "บัญชีของท่านได้รับการอนุมัติแล้ว "
        "ท่านสามารถเข้าสู่ระบบและเริ่มใช้งานได้ทันที:\n\n"
        f"{login_url}\n\n"
        "ขอบคุณที่ลงทะเบียนกับ Thai Education Data Catalog"
        f"{EMAIL_FOOTER}"
    )


def _build_account_rejected_body(user: User) -> str:
    reason = user.reject_reason or "-"
    return (
        f"เรียน คุณ{user.agency_name or user.email}\n\n"
        "บัญชีของท่านไม่ผ่านการพิจารณา\n\n"
        f"เหตุผล: {reason}\n\n"
        "หากมีข้อสงสัย กรุณาติดต่อผู้ดูแลระบบ"
        f"{EMAIL_FOOTER}"
    )


def _build_account_suspended_body(user: User) -> str:
    reason = user.suspend_reason or "-"
    return (
        f"เรียน คุณ{user.agency_name or user.email}\n\n"
        "บัญชีของท่านถูกระงับชั่วคราว\n\n"
        f"เหตุผล: {reason}\n\n"
        "Dataset ที่เผยแพร่ไว้แล้วยังคงแสดงต่อสาธารณะตามปกติ\n"
        "หากมีข้อสงสัย กรุณาติดต่อผู้ดูแลระบบ"
        f"{EMAIL_FOOTER}"
    )


def _build_account_unsuspended_body(user: User) -> str:
    login_url = f"{settings.APP_BASE_URL}/login"
    return (
        f"เรียน คุณ{user.agency_name or user.email}\n\n"
        "บัญชีของท่านเปิดใช้งานอีกครั้งแล้ว "
        "ท่านสามารถเข้าสู่ระบบได้ที่:\n\n"
        f"{login_url}"
        f"{EMAIL_FOOTER}"
    )


def send_verify_email(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    """ส่งอีเมลยืนยัน — synchronous + บันทึก email_logs."""
    if not user.verify_token:
        return
    subject = _format_subject("ยืนยันอีเมลของคุณ")
    body = _build_verify_email_body(user)
    _send_logged_email(
        db,
        template=EmailTemplateType.VERIFY_EMAIL,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def notify_admin_new_registration(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    """แจ้ง Admin หลัง Agency ยืนยันอีเมล — synchronous + email_logs."""
    admin_emails = _get_admin_emails(db)
    if not admin_emails:
        return

    subject = _format_subject("มีหน่วยงานใหม่รอการอนุมัติ")
    body = _build_admin_new_registration_body(user)
    for admin_email in admin_emails:
        _send_logged_email(
            db,
            template=EmailTemplateType.ADMIN_NEW_REGISTRATION,
            recipient_email=admin_email,
            subject=subject,
            body=body,
            user_id=None,
        )


def _send_logged_email_standalone(
    *,
    template: EmailTemplateType,
    recipient_email: str,
    subject: str,
    body: str,
    user_id: uuid.UUID | None = None,
) -> None:
    db = SessionLocal()
    try:
        _send_logged_email(
            db,
            template=template,
            recipient_email=recipient_email,
            subject=subject,
            body=body,
            user_id=user_id,
        )
    finally:
        db.close()


def send_account_lockout(
    background_tasks: BackgroundTasks,
    user: User,
) -> None:
    """แจ้งเตือนบัญชีถูกล็อก — synchronous + email_logs."""
    subject = _format_subject("บัญชีถูกล็อกชั่วคราว")
    body = _build_account_lockout_body(user)
    _send_logged_email_standalone(
        template=EmailTemplateType.ACCOUNT_LOCKOUT,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def send_password_reset(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    """ส่งลิงก์ตั้งรหัสผ่านใหม่ — synchronous + email_logs."""
    if not user.reset_token:
        return
    subject = _format_subject("ตั้งรหัสผ่านใหม่")
    body = _build_password_reset_body(user)
    _send_logged_email(
        db,
        template=EmailTemplateType.PASSWORD_RESET,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def send_password_changed(
    background_tasks: BackgroundTasks,
    user: User,
) -> None:
    """แจ้งเปลี่ยนรหัสผ่านสำเร็จ — synchronous + email_logs."""
    subject = _format_subject("รหัสผ่านถูกเปลี่ยนแล้ว")
    body = _build_password_changed_body(user)
    _send_logged_email_standalone(
        template=EmailTemplateType.PASSWORD_CHANGED,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def send_account_deleted(
    background_tasks: BackgroundTasks,
    user: User,
) -> None:
    """แจ้งลบบัญชี — synchronous + email_logs."""
    subject = _format_subject("บัญชีถูกลบแล้ว")
    body = _build_account_deleted_body(user)
    _send_logged_email_standalone(
        template=EmailTemplateType.ACCOUNT_DELETED,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def send_account_approved(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    """แจ้งอนุมัติบัญชี — synchronous + email_logs."""
    subject = _format_subject("บัญชีได้รับการอนุมัติแล้ว")
    body = _build_account_approved_body(user)
    _send_logged_email(
        db,
        template=EmailTemplateType.ACCOUNT_APPROVED,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def send_account_rejected(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    """แจ้งปฏิเสธบัญชี — synchronous + email_logs."""
    subject = _format_subject("บัญชีไม่ผ่านการพิจารณา")
    body = _build_account_rejected_body(user)
    _send_logged_email(
        db,
        template=EmailTemplateType.ACCOUNT_REJECTED,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def send_account_suspended(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    """แจ้งระงับบัญชี — synchronous + email_logs."""
    subject = _format_subject("บัญชีถูกระงับชั่วคราว")
    body = _build_account_suspended_body(user)
    _send_logged_email(
        db,
        template=EmailTemplateType.ACCOUNT_SUSPENDED,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def send_account_unsuspended(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    """แจ้งปลดระงับบัญชี — synchronous + email_logs."""
    subject = _format_subject("บัญชีเปิดใช้งานอีกครั้ง")
    body = _build_account_unsuspended_body(user)
    _send_logged_email(
        db,
        template=EmailTemplateType.ACCOUNT_UNSUSPENDED,
        recipient_email=user.email,
        subject=subject,
        body=body,
        user_id=user.id,
    )


def _task_notify_admins_new_register(
    admin_emails: list[str],
    agency_name: str,
    user_email: str,
) -> None:
    subject = "มีบัญชีใหม่รอการอนุมัติ"
    body = (
        f"หน่วยงาน: {agency_name}\n"
        f"Email: {user_email}\n"
        f"Link: {ADMIN_USERS_PATH}"
    )
    _send_to_many(admin_emails, subject, body)


def _task_notify_agency_register_success(
    user_email: str,
    agency_name: str,
) -> None:
    subject = "สมัครสมาชิกสำเร็จ"
    body = (
        f"หน่วยงาน: {agency_name}\n"
        "สมัครสำเร็จ รอ Admin อนุมัติบัญชีก่อน Login"
    )
    send_email(user_email, subject, body)


def _task_notify_subscribers(
    emails: list[str],
    dataset_title: str,
    dataset_id: str,
) -> None:
    subject = "มี Dataset ใหม่ในหมวดที่คุณติดตาม"
    body = (
        f"ชื่อ Dataset: {dataset_title}\n"
        f"Link: {DATASET_PATH_PREFIX}/{dataset_id}"
    )
    _send_to_many(emails, subject, body)


def _task_notify_saved_search_users(
    notifications: list[tuple[str, str, str]],
) -> None:
    subject = "มี Dataset ใหม่ตรงกับการค้นหาที่คุณบันทึกไว้"
    for user_email, dataset_title, dataset_id in notifications:
        body = (
            f"ชื่อ Dataset: {dataset_title}\n"
            f"Link: {DATASET_PATH_PREFIX}/{dataset_id}"
        )
        send_email(user_email, subject, body)


def _task_notify_agency_approved(
    agency_email: str,
    agency_name: str,
) -> None:
    subject = "บัญชีได้รับการอนุมัติแล้ว"
    body = (
        f"หน่วยงาน: {agency_name}\n"
        "บัญชีของคุณได้รับการอนุมัติแล้ว สามารถ Login เข้าใช้งานได้"
    )
    send_email(agency_email, subject, body)


def _task_notify_agency_rejected(
    agency_email: str,
    agency_name: str,
) -> None:
    subject = "บัญชีถูกปฏิเสธ"
    body = (
        f"หน่วยงาน: {agency_name}\n"
        "บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ"
    )
    send_email(agency_email, subject, body)


def notify_admin_new_register(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    admin_emails = _get_admin_emails(db)
    if not admin_emails:
        return
    background_tasks.add_task(
        _task_notify_admins_new_register,
        admin_emails,
        user.agency_name or "-",
        user.email,
    )


def notify_agency_register_success(
    background_tasks: BackgroundTasks,
    user: User,
) -> None:
    background_tasks.add_task(
        _task_notify_agency_register_success,
        user.email,
        user.agency_name or "-",
    )


def notify_subscribers_new_dataset(
    background_tasks: BackgroundTasks,
    db: Session,
    dataset,
) -> None:
    emails = _get_subscriber_emails(db, dataset.category_id, dataset.user_id)
    if not emails:
        return
    background_tasks.add_task(
        _task_notify_subscribers,
        emails,
        dataset.title,
        str(dataset.id),
    )


def notify_saved_search(
    background_tasks: BackgroundTasks,
    db: Session,
    dataset,
) -> None:
    rows = (
        db.query(SavedSearch, User.email)
        .join(User, SavedSearch.user_id == User.id)
        .filter(
            SavedSearch.is_deleted.is_(False),
            User.is_deleted.is_(False),
        )
        .all()
    )

    notifications: list[tuple[str, str, str]] = []
    seen: set[tuple[str, str]] = set()

    for saved_search, user_email in rows:
        if not _dataset_matches_saved_search_filters(dataset, saved_search.filters):
            continue
        key = (user_email, str(dataset.id))
        if key in seen:
            continue
        seen.add(key)
        notifications.append((user_email, dataset.title, str(dataset.id)))

    if not notifications:
        return

    background_tasks.add_task(
        _task_notify_saved_search_users,
        notifications,
    )


def notify_agency_approved(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    background_tasks.add_task(
        _task_notify_agency_approved,
        user.email,
        user.agency_name or "-",
    )


def notify_agency_rejected(
    background_tasks: BackgroundTasks,
    db: Session,
    user: User,
) -> None:
    background_tasks.add_task(
        _task_notify_agency_rejected,
        user.email,
        user.agency_name or "-",
    )
