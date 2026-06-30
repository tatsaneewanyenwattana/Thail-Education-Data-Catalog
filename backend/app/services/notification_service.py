# Module: Notification
# Feature: In-app notification business logic

import uuid

from sqlalchemy import or_
from sqlalchemy.orm import Session

import app.repositories.notification_repository as notification_repo
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams
from app.models.saved_search_model import SavedSearch
from app.models.subscription_model import Subscription
from app.models.user_model import User
from app.schemas.notification_schema import (
    NotificationReadAllResponse,
    NotificationResponse,
    NotificationUnreadCountResponse,
)
from app.services.email_service import _dataset_matches_saved_search_filters


def _to_response(
    notification,
    *,
    is_read: bool,
) -> NotificationResponse:
    return NotificationResponse(
        id=notification.id,
        type=notification.type,
        title=notification.title,
        content=notification.content,
        link=notification.link,
        reference_id=notification.reference_id,
        is_read=is_read,
        created_at=notification.created_at,
    )


def _resolve_is_read(
    db: Session,
    notification,
    user_id: uuid.UUID | None,
    read_broadcast_ids: set[uuid.UUID],
) -> bool:
    if notification.user_id is not None:
        return bool(notification.is_read)
    if user_id is None:
        return False
    return notification.id in read_broadcast_ids


def list_notifications(
    db: Session,
    pagination: PaginationParams,
    user_id: uuid.UUID | None = None,
) -> tuple[list[NotificationResponse], int]:
    items, total = notification_repo.list_notifications(
        db,
        user_id=user_id,
        offset=pagination.offset,
        limit=pagination.page_size,
    )

    broadcast_ids = [row.id for row in items if row.user_id is None]
    read_broadcast_ids: set[uuid.UUID] = set()
    if user_id is not None and broadcast_ids:
        read_broadcast_ids = notification_repo.get_read_broadcast_ids(
            db, user_id, broadcast_ids
        )

    responses = [
        _to_response(
            row,
            is_read=_resolve_is_read(db, row, user_id, read_broadcast_ids),
        )
        for row in items
    ]
    return responses, total


def get_unread_count(
    db: Session,
    user_id: uuid.UUID | None = None,
) -> NotificationUnreadCountResponse:
    return NotificationUnreadCountResponse(
        count=notification_repo.count_unread(db, user_id=user_id)
    )


def mark_read(
    db: Session,
    notification_id: uuid.UUID,
    user_id: uuid.UUID | None,
) -> NotificationResponse:
    row = notification_repo.get_notification_by_id(db, notification_id)
    if row is None:
        raise_app_error("NOT_FOUND")

    if row.user_id is not None:
        if user_id is None or row.user_id != user_id:
            raise_app_error("AUTH_PERMISSION_DENIED")
        updated = notification_repo.mark_personal_read(db, notification_id, user_id)
        if updated is None:
            raise_app_error("NOT_FOUND")
        db.commit()
        return _to_response(updated, is_read=True)

    if user_id is None:
        return _to_response(row, is_read=False)

    notification_repo.mark_broadcast_read(db, notification_id, user_id)
    db.commit()
    return _to_response(row, is_read=True)


def mark_all_read(
    db: Session,
    user_id: uuid.UUID,
) -> NotificationReadAllResponse:
    updated = notification_repo.mark_all_read(db, user_id)
    db.commit()
    return NotificationReadAllResponse(updated_count=updated)


def create_broadcast_notification(
    db: Session,
    *,
    notification_type: str,
    title: str,
    content: str,
    link: str | None = None,
    reference_id: uuid.UUID | None = None,
    image_url: str | None = None,
) -> NotificationResponse:
    row = notification_repo.create_notification(
        db,
        user_id=None,
        notification_type=notification_type,
        title=title,
        content=content,
        link=link,
        reference_id=reference_id,
        image_url=image_url,
    )
    return _to_response(row, is_read=False)


def create_announcement_notification(
    db: Session,
    *,
    title: str,
    content: str,
    announcement_id: uuid.UUID,
    image_url: str | None = None,
) -> NotificationResponse:
    return create_broadcast_notification(
        db,
        notification_type="announcement",
        title=title,
        content=content,
        link=None,
        reference_id=announcement_id,
        image_url=image_url,
    )


def create_scholarship_notification(
    db: Session,
    *,
    title: str,
    content: str,
    link: str | None = None,
    reference_id: uuid.UUID | None = None,
) -> NotificationResponse:
    """เตรียมไว้สำหรับ module ทุนการศึกษาในอนาคต"""
    return create_broadcast_notification(
        db,
        notification_type="scholarship",
        title=title,
        content=content,
        link=link,
        reference_id=reference_id,
    )


def _get_subscriber_user_ids(
    db: Session,
    category_id: uuid.UUID | None,
    agency_user_id: uuid.UUID,
) -> list[uuid.UUID]:
    conditions = [Subscription.agency_user_id == agency_user_id]
    if category_id is not None:
        conditions.append(Subscription.category_id == category_id)

    rows = (
        db.query(Subscription.user_id)
        .join(User, Subscription.user_id == User.id)
        .filter(or_(*conditions))
        .filter(User.is_deleted.is_(False))
        .distinct()
        .all()
    )
    return [row[0] for row in rows]


def _get_saved_search_user_ids(db: Session, dataset) -> list[uuid.UUID]:
    rows = (
        db.query(SavedSearch.user_id, SavedSearch.filters)
        .join(User, SavedSearch.user_id == User.id)
        .filter(
            SavedSearch.is_deleted.is_(False),
            User.is_deleted.is_(False),
        )
        .all()
    )
    user_ids: list[uuid.UUID] = []
    seen: set[uuid.UUID] = set()
    for user_id, filters in rows:
        if user_id in seen:
            continue
        if not _dataset_matches_saved_search_filters(dataset, filters):
            continue
        seen.add(user_id)
        user_ids.append(user_id)
    return user_ids


def notify_subscribers_new_dataset(
    db: Session,
    dataset,
) -> int:
    """สร้าง in-app notification ให้ subscriber และ saved search (คู่กับอีเมล)"""
    target_ids: set[uuid.UUID] = set()
    target_ids.update(
        _get_subscriber_user_ids(db, dataset.category_id, dataset.user_id)
    )
    target_ids.update(_get_saved_search_user_ids(db, dataset))

    if not target_ids:
        return 0

    link = f"/datasets/{dataset.id}"
    title = f"Dataset ใหม่: {dataset.title}"
    content = "มีชุดข้อมูลใหม่ที่ตรงกับการติดตามหรือการค้นหาที่คุณบันทึกไว้"

    created = 0
    for user_id in target_ids:
        notification_repo.create_notification(
            db,
            user_id=user_id,
            notification_type="new_dataset",
            title=title,
            content=content,
            link=link,
            reference_id=dataset.id,
        )
        created += 1

    return created
