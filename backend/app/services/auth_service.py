# Module: M1 Auth
# Feature: Business Logic ตาม #5 #28 #33 #34 #43 #48 #56

import uuid
from datetime import datetime, timedelta, timezone

import redis as redis_lib
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

import app.repositories.auth_repository as auth_repo
import app.services.email_service as email_service
import app.services.verification_doc_service as verification_doc_service
from app.core.auth_cooldown import enforce_cooldown, set_cooldown
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams
from app.core.security import (
    create_access_token,
    delete_session,
    hash_password,
    login_session,
    validate_password,
    verify_password,
)
from app.models.audit_log_model import AuditLog
from app.models.user_model import User
from app.schemas.auth_schema import (
    BookmarkResponse,
    RegisterMetadata,
    SubscriptionResponse,
    TokenResponse,
    UserResponse,
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _run_background_tasks(background_tasks: BackgroundTasks) -> None:
    for task in background_tasks.tasks:
        task()


def _log_login_audit(
    db: Session,
    user_id: uuid.UUID | None,
    action: str,
    ip_address: str,
    user_agent: str | None = None,
) -> None:
    db.add(
        AuditLog(
            user_id=user_id,
            action=action,
            target_type="user",
            target_id=user_id,
            detail=None,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    )


def _log_auth_audit(
    db: Session,
    user_id: uuid.UUID,
    action: str,
    ip_address: str,
    user_agent: str | None = None,
) -> None:
    db.add(
        AuditLog(
            user_id=user_id,
            action=action,
            target_type="user",
            target_id=user_id,
            detail=None,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    )


def register(
    db: Session,
    request: RegisterMetadata,
    ip_address: str,
    background_tasks: BackgroundTasks,
    minio_client,
    verification_doc_content: bytes,
    verification_doc_filename: str | None = None,
) -> UserResponse:
    verification_doc_service.validate_verification_doc(
        verification_doc_content,
        verification_doc_filename,
    )
    validate_password(request.password)

    if len(request.password.encode("utf-8")) > 72:
        raise_app_error("VALIDATION_ERROR", "รหัสผ่านต้องไม่เกิน 72 bytes (ข้อจำกัด bcrypt)")

    existing = auth_repo.get_user_by_email(db, request.email)
    if existing is not None:
        raise_app_error("USER_EMAIL_EXISTS")

    password_hash = hash_password(request.password)
    now = _utc_now()
    object_name: str | None = None

    try:
        user = auth_repo.create_user(
            db,
            agency_name=request.agency_name,
            email=request.email,
            password_hash=password_hash,
            agency_name_en=request.agency_name_en,
            agency_type=(
                request.agency_type.value
                if request.agency_type is not None
                else None
            ),
            agency_code=request.agency_code,
            agency_website=request.agency_website,
            contact_name=request.contact_name,
            contact_position=request.contact_position,
            contact_phone=request.contact_phone,
        )
        user.verify_token = str(uuid.uuid4())
        user.verify_expires_at = now + timedelta(hours=24)

        object_name = verification_doc_service.upload_verification_doc(
            minio_client,
            user.id,
            verification_doc_content,
        )
        user.verification_doc_path = object_name

        auth_repo.create_pdpa_consent(
            db,
            user_id=user.id,
            terms_version=request.terms_version,
            pdpa_version=request.pdpa_version,
            ip_address=ip_address,
        )
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        verification_doc_service.delete_verification_doc(minio_client, object_name)
        raise

    email_service.send_verify_email(background_tasks, db, user)

    return UserResponse.model_validate(user)


def login(
    db: Session,
    redis_client: redis_lib.Redis,
    email: str,
    password: str,
    ip_address: str,
    user_agent: str | None = None,
) -> TokenResponse:
    if len(password.encode("utf-8")) > 72:
        raise_app_error("VALIDATION_ERROR", "รหัสผ่านต้องไม่เกิน 72 bytes (ข้อจำกัด bcrypt)")

    user = auth_repo.get_user_by_email(db, email)
    if user is None:
        raise_app_error("AUTH_INVALID_CREDENTIALS")

    now = _utc_now()
    if user.locked_until is not None and _ensure_aware(user.locked_until) > now:
        retry_after = int(
            (_ensure_aware(user.locked_until) - now).total_seconds()
        )
        raise_app_error(
            "AUTH_ACCOUNT_LOCKED",
            f"บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ใน {retry_after} วินาที",
            details={"retry_after": max(retry_after, 1)},
        )

    if not verify_password(password, user.password_hash):
        user.failed_login_count += 1
        if user.failed_login_count >= 5:
            user.locked_until = now + timedelta(minutes=15)
            lockout_tasks = BackgroundTasks()
            email_service.send_account_lockout(lockout_tasks, user)
            _run_background_tasks(lockout_tasks)
        _log_login_audit(db, user.id, "LOGIN_FAIL", ip_address, user_agent)
        db.commit()
        raise_app_error("AUTH_INVALID_CREDENTIALS")

    user.failed_login_count = 0
    user.locked_until = None
    _log_login_audit(db, user.id, "LOGIN_SUCCESS", ip_address, user_agent)
    db.commit()

    if user.status == "email_unverified":
        raise_app_error("AUTH_EMAIL_NOT_VERIFIED")

    if user.status == "suspended":
        raise_app_error("AUTH_ACCOUNT_SUSPENDED")
    if user.status == "pending":
        raise_app_error("AUTH_ACCOUNT_PENDING")
    if user.status == "rejected":
        raise_app_error("AUTH_ACCOUNT_REJECTED")
    if user.status != "active":
        raise_app_error("USER_STATUS_INVALID")

    token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )
    login_session(str(user.id), token)

    return TokenResponse(access_token=token)


def logout(redis_client: redis_lib.Redis, user_id: str) -> None:
    delete_session(user_id)


def get_me(db: Session, user_id: uuid.UUID) -> UserResponse:
    user = auth_repo.get_user_by_id(db, user_id)
    if user is None:
        raise_app_error("USER_NOT_FOUND")
    return UserResponse.model_validate(user)


def verify_email(db: Session, token: str) -> None:
    user = auth_repo.get_user_by_verify_token(db, token)
    if user is None:
        raise_app_error("AUTH_TOKEN_INVALID")

    if user.status != "email_unverified":
        raise_app_error("AUTH_TOKEN_ALREADY_USED")

    now = _utc_now()
    if user.verify_expires_at is None or _ensure_aware(user.verify_expires_at) < now:
        raise_app_error("AUTH_TOKEN_EXPIRED")

    user.status = "pending"
    user.email_verified_at = now
    user.verify_token = None
    user.verify_expires_at = None
    db.commit()

    background_tasks = BackgroundTasks()
    email_service.notify_admin_new_registration(background_tasks, db, user)
    _run_background_tasks(background_tasks)


def resend_verification(
    db: Session,
    redis_client: redis_lib.Redis,
    email: str,
    ip_address: str,
) -> None:
    user = auth_repo.get_user_by_email(db, email)
    if user is None or user.status != "email_unverified":
        raise_app_error("USER_NOT_FOUND")

    enforce_cooldown(redis_client, "resend_verification", email)

    now = _utc_now()
    user.verify_token = str(uuid.uuid4())
    user.verify_expires_at = now + timedelta(hours=24)
    db.commit()
    db.refresh(user)

    background_tasks = BackgroundTasks()
    email_service.send_verify_email(background_tasks, db, user)
    _run_background_tasks(background_tasks)
    set_cooldown(redis_client, "resend_verification", email)


def get_register_status(db: Session, email: str) -> dict:
    user = (
        db.query(User)
        .filter(User.email == email, User.is_deleted.is_(False))
        .first()
    )
    if user is None:
        return {"status": "not_found"}
    return {"status": user.status, "created_at": user.created_at}


def forgot_password(
    db: Session,
    redis_client: redis_lib.Redis,
    email: str,
    background_tasks: BackgroundTasks,
) -> None:
    user = auth_repo.get_user_by_email(db, email)
    if user is None:
        return

    enforce_cooldown(redis_client, "forgot_password", email)

    now = _utc_now()
    user.reset_token = str(uuid.uuid4())
    user.reset_expires_at = now + timedelta(hours=1)
    db.commit()
    db.refresh(user)

    email_service.send_password_reset(background_tasks, db, user)
    set_cooldown(redis_client, "forgot_password", email)


def reset_password(
    db: Session,
    token: str,
    new_password: str,
    ip_address: str,
    user_agent: str | None = None,
) -> None:
    user = auth_repo.get_user_by_reset_token(db, token)
    if user is None:
        raise_app_error("AUTH_TOKEN_INVALID")

    now = _utc_now()
    if user.reset_expires_at is None or _ensure_aware(user.reset_expires_at) < now:
        raise_app_error("AUTH_TOKEN_EXPIRED")

    validate_password(new_password)

    if len(new_password.encode("utf-8")) > 72:
        raise_app_error("VALIDATION_ERROR", "รหัสผ่านต้องไม่เกิน 72 bytes (ข้อจำกัด bcrypt)")

    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_expires_at = None
    user.failed_login_count = 0
    user.locked_until = None
    _log_auth_audit(db, user.id, "PASSWORD_RESET", ip_address, user_agent)
    db.commit()

    delete_session(str(user.id))

    background_tasks = BackgroundTasks()
    email_service.send_password_changed(background_tasks, user)
    _run_background_tasks(background_tasks)


def get_login_history(
    db: Session,
    user_id: uuid.UUID,
    pagination: PaginationParams,
) -> tuple[list[AuditLog], int]:
    query = db.query(AuditLog).filter(
        AuditLog.user_id == user_id,
        AuditLog.action.in_(["LOGIN_SUCCESS", "LOGIN_FAIL"]),
    )
    total = query.count()
    items = (
        query.order_by(AuditLog.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )
    return items, total


def delete_account(
    db: Session,
    redis_client: redis_lib.Redis,
    user_id: uuid.UUID,
    password: str,
    ip_address: str,
    user_agent: str | None = None,
) -> None:
    user = auth_repo.get_user_by_id(db, user_id)
    if user is None:
        raise_app_error("USER_NOT_FOUND")

    if not verify_password(password, user.password_hash):
        raise_app_error("AUTH_INVALID_CREDENTIALS")

    background_tasks = BackgroundTasks()
    email_service.send_account_deleted(background_tasks, user)
    _run_background_tasks(background_tasks)

    user.email = f"deleted-{uuid.uuid4()}@deleted.local"
    user.password_hash = hash_password(str(uuid.uuid4()))
    user.agency_name = "[ลบแล้ว]"
    user.agency_name_en = "[deleted]"
    user.agency_code = None
    user.agency_website = None
    user.contact_name = None
    user.contact_position = None
    user.contact_phone = None
    user.verification_doc_path = None
    user.suspend_reason = None
    user.reject_reason = None
    user.verify_token = None
    user.reset_token = None
    user.is_deleted = True

    delete_session(str(user.id))

    db.add(
        AuditLog(
            user_id=user_id,
            action="USER_SELF_ANONYMIZED",
            target_type="user",
            target_id=user_id,
            detail=None,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    )
    db.commit()


def add_bookmark(
    db: Session,
    user_id: uuid.UUID,
    dataset_id: uuid.UUID,
) -> BookmarkResponse:
    from sqlalchemy.exc import IntegrityError

    try:
        bookmark = auth_repo.create_bookmark(db, user_id=user_id, dataset_id=dataset_id)
        db.commit()
        db.refresh(bookmark)
        return BookmarkResponse.model_validate(bookmark)
    except IntegrityError:
        db.rollback()
        raise_app_error("VALIDATION_ERROR", "Bookmark นี้มีอยู่แล้ว")


def remove_bookmark(
    db: Session,
    user_id: uuid.UUID,
    dataset_id: uuid.UUID,
) -> None:
    auth_repo.delete_bookmark(db, user_id=user_id, dataset_id=dataset_id)
    db.commit()


def list_bookmarks(
    db: Session,
    user_id: uuid.UUID,
    pagination: PaginationParams,
) -> tuple[list[BookmarkResponse], int]:
    items, total = auth_repo.get_bookmarks(db, user_id=user_id, pagination=pagination)
    return [BookmarkResponse.model_validate(b) for b in items], total


def add_subscription(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID | None,
    agency_user_id: uuid.UUID | None,
) -> SubscriptionResponse:
    from sqlalchemy.exc import IntegrityError

    try:
        sub = auth_repo.create_subscription(
            db,
            user_id=user_id,
            category_id=category_id,
            agency_user_id=agency_user_id,
        )
        db.commit()
        db.refresh(sub)
        return SubscriptionResponse.model_validate(sub)
    except IntegrityError:
        db.rollback()
        raise_app_error("VALIDATION_ERROR", "Subscription นี้มีอยู่แล้ว")


def remove_subscription(
    db: Session,
    user_id: uuid.UUID,
    subscription_id: uuid.UUID,
) -> None:
    auth_repo.delete_subscription(db, user_id=user_id, subscription_id=subscription_id)
    db.commit()


def list_subscriptions(
    db: Session,
    user_id: uuid.UUID,
) -> list[SubscriptionResponse]:
    items = auth_repo.get_subscriptions(db, user_id=user_id)
    return [SubscriptionResponse.model_validate(s) for s in items]
