# Module: M6 Admin
# Feature: Database Queries ตาม #56

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.schemas.admin_schema import AdminUserListFilters

from app.core.pagination import PaginationParams
from app.models.announcement_model import Announcement
from app.models.audit_log_model import AuditLog
from app.models.dataset_model import Dataset
from app.models.download_log_model import DownloadLog
from app.models.user_model import User


def _user_sort_column(sort: str):
    allowed = {
        "created_at": User.created_at,
        "email": User.email,
        "role": User.role,
        "status": User.status,
    }
    return allowed.get(sort, User.created_at)


def _announcement_sort_column(sort: str):
    allowed = {
        "created_at": Announcement.created_at,
        "updated_at": Announcement.updated_at,
        "title": Announcement.title,
    }
    return allowed.get(sort, Announcement.created_at)


def get_admin_stats(db: Session) -> dict[str, Any]:
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    total_users = (
        db.query(func.count(User.id))
        .filter(User.is_deleted.is_(False))
        .scalar()
    ) or 0

    pending_agencies = (
        db.query(func.count(User.id))
        .filter(
            User.is_deleted.is_(False),
            User.role == "agency",
            User.status == "pending",
        )
        .scalar()
    ) or 0

    total_datasets = (
        db.query(func.count(Dataset.id))
        .filter(Dataset.is_deleted.is_(False))
        .scalar()
    ) or 0

    total_downloads = (
        db.query(func.coalesce(func.sum(Dataset.download_count), 0))
        .filter(Dataset.is_deleted.is_(False))
        .scalar()
    ) or 0

    users_today = (
        db.query(func.count(User.id))
        .filter(
            User.is_deleted.is_(False),
            User.created_at >= today_start,
        )
        .scalar()
    ) or 0

    datasets_today = (
        db.query(func.count(Dataset.id))
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.created_at >= today_start,
        )
        .scalar()
    ) or 0

    downloads_today = (
        db.query(func.count(DownloadLog.id))
        .filter(DownloadLog.created_at >= today_start)
        .scalar()
    ) or 0

    return {
        "total_users": int(total_users),
        "total_datasets": int(total_datasets),
        "total_downloads": int(total_downloads),
        "pending_agencies": int(pending_agencies),
        "users_today": int(users_today),
        "datasets_today": int(datasets_today),
        "downloads_today": int(downloads_today),
    }


def get_all_users(
    db: Session,
    pagination: PaginationParams,
    filters: AdminUserListFilters | None = None,
) -> tuple[list[User], int]:
    query = db.query(User).filter(User.is_deleted.is_(False))

    if filters is not None:
        if filters.status and filters.status != "all":
            query = query.filter(User.status == filters.status)
        if filters.role and filters.role != "all":
            query = query.filter(User.role == filters.role)
        if filters.search and filters.search.strip():
            keyword = f"%{filters.search.strip()}%"
            query = query.filter(
                or_(
                    User.email.ilike(keyword),
                    User.agency_name.ilike(keyword),
                )
            )

    total = query.count()
    sort_col = _user_sort_column(pagination.sort)
    order = sort_col.desc() if pagination.order == "desc" else sort_col.asc()
    items = (
        query.order_by(order)
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )
    return items, total


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return (
        db.query(User)
        .filter(User.id == user_id, User.is_deleted.is_(False))
        .first()
    )


def update_user(db: Session, user_id: uuid.UUID, **fields: Any) -> User:
    from app.core.errors import raise_app_error

    user = get_user_by_id(db, user_id)
    if user is None:
        raise_app_error("USER_NOT_FOUND")
    for key, value in fields.items():
        if value is not None:
            setattr(user, key, value)
    db.flush()
    return user


def _audit_log_action_patterns(ui_action: str) -> list[str]:
    patterns = {
        "LOGIN": ["login"],
        "UPLOAD": ["upload"],
        "DOWNLOAD": ["download"],
        "DELETE": ["delete"],
        "APPROVE": ["approve"],
        "REJECT": ["reject"],
    }
    return patterns.get(ui_action.upper(), [ui_action.lower()])


def get_all_audit_logs(
    db: Session,
    pagination: PaginationParams,
    *,
    date_from: str | None = None,
    date_to: str | None = None,
    action: str | None = None,
    search: str | None = None,
) -> tuple[list[tuple[AuditLog, str | None]], int]:
    from datetime import datetime, time, timezone

    from sqlalchemy import or_

    from app.models.user_model import User

    query = (
        db.query(AuditLog, User.email)
        .outerjoin(User, AuditLog.user_id == User.id)
    )

    if date_from:
        start = datetime.strptime(date_from, "%Y-%m-%d").replace(
            hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
        )
        query = query.filter(AuditLog.created_at >= start)

    if date_to:
        end = datetime.strptime(date_to, "%Y-%m-%d").replace(
            hour=23,
            minute=59,
            second=59,
            microsecond=999999,
            tzinfo=timezone.utc,
        )
        query = query.filter(AuditLog.created_at <= end)

    if action and action.lower() != "all":
        patterns = _audit_log_action_patterns(action)
        query = query.filter(
            or_(*[AuditLog.action.ilike(f"%{pattern}%") for pattern in patterns])
        )

    if search and search.strip():
        keyword = f"%{search.strip()}%"
        query = query.filter(User.email.ilike(keyword))

    total = query.count()
    sort_col = AuditLog.created_at
    order = sort_col.desc() if pagination.order == "desc" else sort_col.asc()
    items = (
        query.order_by(order)
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )
    return items, total


def create_announcement(
    db: Session,
    title: str,
    content: str,
    is_active: bool,
    created_by: uuid.UUID,
) -> Announcement:
    announcement = Announcement(
        title=title,
        content=content,
        is_active=is_active,
        created_by=created_by,
    )
    db.add(announcement)
    db.flush()
    return announcement


def get_active_announcements(db: Session, limit: int = 20) -> list[Announcement]:
    return (
        db.query(Announcement)
        .filter(
            Announcement.is_deleted.is_(False),
            Announcement.is_active.is_(True),
        )
        .order_by(Announcement.created_at.desc())
        .limit(limit)
        .all()
    )


def get_announcements(
    db: Session, pagination: PaginationParams
) -> tuple[list[Announcement], int]:
    query = db.query(Announcement).filter(Announcement.is_deleted.is_(False))
    total = query.count()
    sort_col = _announcement_sort_column(pagination.sort)
    order = sort_col.desc() if pagination.order == "desc" else sort_col.asc()
    items = (
        query.order_by(order)
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )
    return items, total


def get_announcement_by_id(
    db: Session, announcement_id: uuid.UUID
) -> Announcement | None:
    return (
        db.query(Announcement)
        .filter(
            Announcement.id == announcement_id,
            Announcement.is_deleted.is_(False),
        )
        .first()
    )


def update_announcement(
    db: Session, announcement_id: uuid.UUID, **fields: Any
) -> Announcement:
    from app.core.errors import raise_app_error

    announcement = get_announcement_by_id(db, announcement_id)
    if announcement is None:
        raise_app_error("NOT_FOUND")
    for key, value in fields.items():
        if value is not None:
            setattr(announcement, key, value)
    db.flush()
    return announcement


def soft_delete_announcement(db: Session, announcement_id: uuid.UUID) -> None:
    from app.core.errors import raise_app_error

    announcement = get_announcement_by_id(db, announcement_id)
    if announcement is None:
        raise_app_error("NOT_FOUND")
    announcement.is_deleted = True
    db.flush()
