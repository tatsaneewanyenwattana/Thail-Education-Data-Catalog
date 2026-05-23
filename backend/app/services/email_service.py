# Module: Notification
# Feature: Email Sending ตาม #33

import logging
import smtplib
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import BackgroundTasks
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
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
ADMIN_DATASETS_PATH = "/admin/datasets"
DATASET_PATH_PREFIX = "/datasets"


def send_email(to: str, subject: str, body: str) -> None:
    """ส่ง Email ผ่าน SMTP — ไม่ raise exception ตาม #33"""
    if not settings.SMTP_HOST or not settings.SMTP_FROM:
        log_request(
            logger,
            logging.WARNING,
            "SMTP not configured, skip email",
            error_code="INTERNAL_SERVER_ERROR",
        )
        return

    try:
        message = MIMEMultipart()
        message["Subject"] = subject
        message["From"] = settings.SMTP_FROM
        message["To"] = to
        message.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(
                settings.SMTP_FROM,
                [to],
                message.as_string(),
            )
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"Email send failed to {to}: {exc}",
            error_code="INTERNAL_SERVER_ERROR",
        )


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


def _get_agency_owner(db: Session, user_id: uuid.UUID) -> User | None:
    return (
        db.query(User)
        .filter(User.id == user_id, User.is_deleted.is_(False))
        .first()
    )


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


def _task_notify_admins_dataset_submitted(
    admin_emails: list[str],
    dataset_title: str,
    agency_name: str,
    dataset_id: str,
) -> None:
    subject = "มี Dataset ใหม่รอการอนุมัติ"
    body = (
        f"ชื่อ Dataset: {dataset_title}\n"
        f"หน่วยงาน: {agency_name}\n"
        f"Link: {ADMIN_DATASETS_PATH} (Dataset ID: {dataset_id})"
    )
    _send_to_many(admin_emails, subject, body)


def _task_notify_agency_dataset_approved(
    agency_email: str,
    dataset_title: str,
    dataset_id: str,
) -> None:
    subject = "Dataset ของคุณได้รับการอนุมัติแล้ว"
    body = (
        f"ชื่อ Dataset: {dataset_title}\n"
        f"Link: {DATASET_PATH_PREFIX}/{dataset_id}"
    )
    send_email(agency_email, subject, body)


def _task_notify_agency_dataset_rejected(
    agency_email: str,
    dataset_title: str,
    dataset_id: str,
    comment: str,
) -> None:
    subject = "Dataset ของคุณถูกส่งกลับเพื่อแก้ไข"
    body = (
        f"ชื่อ Dataset: {dataset_title}\n"
        f"เหตุผล: {comment}\n"
        f"Link: {DATASET_PATH_PREFIX}/{dataset_id}/edit"
    )
    send_email(agency_email, subject, body)


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


def notify_admin_dataset_submitted(
    background_tasks: BackgroundTasks,
    db: Session,
    dataset,
) -> None:
    admin_emails = _get_admin_emails(db)
    if not admin_emails:
        return
    owner = _get_agency_owner(db, dataset.user_id)
    agency_name = owner.agency_name if owner else "-"
    background_tasks.add_task(
        _task_notify_admins_dataset_submitted,
        admin_emails,
        dataset.title,
        agency_name,
        str(dataset.id),
    )


def notify_agency_dataset_approved(
    background_tasks: BackgroundTasks,
    db: Session,
    dataset,
) -> None:
    owner = _get_agency_owner(db, dataset.user_id)
    if owner is None:
        return
    background_tasks.add_task(
        _task_notify_agency_dataset_approved,
        owner.email,
        dataset.title,
        str(dataset.id),
    )


def notify_agency_dataset_rejected(
    background_tasks: BackgroundTasks,
    db: Session,
    dataset,
    comment: str,
) -> None:
    owner = _get_agency_owner(db, dataset.user_id)
    if owner is None:
        return
    background_tasks.add_task(
        _task_notify_agency_dataset_rejected,
        owner.email,
        dataset.title,
        str(dataset.id),
        comment,
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
