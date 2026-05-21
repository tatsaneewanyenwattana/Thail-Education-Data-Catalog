# Module: M6 Admin
# Feature: Business Logic ตาม #5 #28 #33 #34 #56

import logging
import uuid

from fastapi import BackgroundTasks
from redis import Redis
from sqlalchemy.orm import Session

import app.repositories.admin_repository as admin_repo
from app.core.errors import raise_app_error
from app.core.logging import get_logger, log_request
from app.core.pagination import PaginationParams
from app.schemas.admin_schema import (
    AdminStatsResponse,
    AnnouncementCreateRequest,
    AnnouncementResponse,
    AnnouncementUpdateRequest,
    AuditLogResponse,
    UserListResponse,
    UserUpdateRequest,
)

logger = get_logger(__name__)

_SESSION_KEY_PREFIX = "session:"


def _send_agency_email(email_to: str, subject: str, body: str) -> None:
    try:
        import smtplib

        from app.core.config import settings

        if not settings.SMTP_HOST:
            return
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            message = (
                f"Subject: {subject}\r\n"
                f"From: {settings.SMTP_FROM}\r\n"
                f"To: {email_to}\r\n\r\n{body}"
            )
            server.sendmail(settings.SMTP_FROM, email_to, message)
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"Email send failed: {exc}",
            error_code="INTERNAL_SERVER_ERROR",
        )


def get_admin_stats(db: Session) -> AdminStatsResponse:
    data = admin_repo.get_admin_stats(db)
    return AdminStatsResponse(**data)


def get_all_users(
    db: Session, pagination: PaginationParams
) -> tuple[list[UserListResponse], int]:
    items, total = admin_repo.get_all_users(db, pagination)
    return [UserListResponse.model_validate(u) for u in items], total


def approve_user(
    db: Session,
    background_tasks: BackgroundTasks,
    user_id: uuid.UUID,
    current_user: dict,
) -> UserListResponse:
    user = admin_repo.get_user_by_id(db, user_id)
    if user is None:
        raise_app_error("USER_NOT_FOUND")
    if user.status != "pending":
        raise_app_error("USER_STATUS_INVALID")

    admin_repo.update_user(db, user_id, status="active")
    db.commit()
    db.refresh(user)

    background_tasks.add_task(
        _send_agency_email,
        email_to=user.email,
        subject="บัญชีได้รับการอนุมัติแล้ว",
        body=(
            f"หน่วยงาน: {user.agency_name or '-'}\n"
            "บัญชีของคุณได้รับการอนุมัติแล้ว สามารถ Login เข้าใช้งานได้"
        ),
    )

    return UserListResponse.model_validate(user)


def reject_user(
    db: Session,
    background_tasks: BackgroundTasks,
    user_id: uuid.UUID,
    current_user: dict,
) -> UserListResponse:
    user = admin_repo.get_user_by_id(db, user_id)
    if user is None:
        raise_app_error("USER_NOT_FOUND")
    if user.status != "pending":
        raise_app_error("USER_STATUS_INVALID")

    admin_repo.update_user(db, user_id, status="rejected")
    db.commit()
    db.refresh(user)

    background_tasks.add_task(
        _send_agency_email,
        email_to=user.email,
        subject="บัญชีถูกปฏิเสธ",
        body=(
            f"หน่วยงาน: {user.agency_name or '-'}\n"
            "บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ"
        ),
    )

    return UserListResponse.model_validate(user)


def suspend_user(
    db: Session,
    redis_client: Redis,
    user_id: uuid.UUID,
    current_user: dict,
) -> UserListResponse:
    if str(user_id) == current_user["sub"]:
        raise_app_error("USER_CANNOT_SUSPEND_SELF")

    user = admin_repo.get_user_by_id(db, user_id)
    if user is None:
        raise_app_error("USER_NOT_FOUND")

    try:
        admin_repo.update_user(db, user_id, status="suspended")
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise

    redis_client.delete(f"{_SESSION_KEY_PREFIX}{user_id}")

    return UserListResponse.model_validate(user)


def update_user(
    db: Session,
    user_id: uuid.UUID,
    request: UserUpdateRequest,
) -> UserListResponse:
    fields: dict = {}
    if request.role is not None:
        fields["role"] = request.role
    if request.status is not None:
        fields["status"] = request.status

    user = admin_repo.update_user(db, user_id, **fields)
    db.commit()
    db.refresh(user)
    return UserListResponse.model_validate(user)


def get_audit_logs(
    db: Session, pagination: PaginationParams
) -> tuple[list[AuditLogResponse], int]:
    items, total = admin_repo.get_all_audit_logs(db, pagination)
    return [AuditLogResponse.model_validate(log) for log in items], total


def create_announcement(
    db: Session,
    request: AnnouncementCreateRequest,
    current_user: dict,
) -> AnnouncementResponse:
    announcement = admin_repo.create_announcement(
        db,
        title=request.title,
        content=request.content,
        is_active=request.is_active,
        created_by=uuid.UUID(current_user["sub"]),
    )
    db.commit()
    db.refresh(announcement)
    return AnnouncementResponse.model_validate(announcement)


def get_announcements(
    db: Session, pagination: PaginationParams
) -> tuple[list[AnnouncementResponse], int]:
    items, total = admin_repo.get_announcements(db, pagination)
    return [AnnouncementResponse.model_validate(a) for a in items], total


def update_announcement(
    db: Session,
    announcement_id: uuid.UUID,
    request: AnnouncementUpdateRequest,
) -> AnnouncementResponse:
    fields: dict = {}
    if request.title is not None:
        fields["title"] = request.title
    if request.content is not None:
        fields["content"] = request.content
    if request.is_active is not None:
        fields["is_active"] = request.is_active

    announcement = admin_repo.update_announcement(
        db, announcement_id, **fields
    )
    db.commit()
    db.refresh(announcement)
    return AnnouncementResponse.model_validate(announcement)


def delete_announcement(db: Session, announcement_id: uuid.UUID) -> None:
    admin_repo.soft_delete_announcement(db, announcement_id)
    db.commit()
