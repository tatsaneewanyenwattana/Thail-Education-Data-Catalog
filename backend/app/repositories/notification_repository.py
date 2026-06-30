# Module: Notification
# Feature: Database Queries

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.notification_model import Notification, NotificationRead


def create_notification(
    db: Session,
    *,
    notification_type: str,
    title: str,
    content: str,
    user_id: uuid.UUID | None = None,
    link: str | None = None,
    reference_id: uuid.UUID | None = None,
    image_url: str | None = None,
) -> Notification:
    row = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        content=content,
        link=link,
        reference_id=reference_id,
        image_url=image_url,
        is_read=False,
    )
    db.add(row)
    db.flush()
    return row


def get_notification_by_id(
    db: Session, notification_id: uuid.UUID
) -> Notification | None:
    return db.query(Notification).filter(Notification.id == notification_id).first()


def list_notifications(
    db: Session,
    *,
    user_id: uuid.UUID | None,
    offset: int,
    limit: int,
) -> tuple[list[Notification], int]:
    conditions = [Notification.user_id.is_(None)]
    if user_id is not None:
        conditions.append(Notification.user_id == user_id)

    query = db.query(Notification).filter(or_(*conditions))
    total = query.count()
    items = (
        query.order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def get_read_broadcast_ids(
    db: Session, user_id: uuid.UUID, notification_ids: list[uuid.UUID]
) -> set[uuid.UUID]:
    if not notification_ids:
        return set()
    rows = (
        db.query(NotificationRead.notification_id)
        .filter(
            NotificationRead.user_id == user_id,
            NotificationRead.notification_id.in_(notification_ids),
        )
        .all()
    )
    return {row[0] for row in rows}


def count_unread(
    db: Session,
    *,
    user_id: uuid.UUID | None,
) -> int:
    broadcast_query = db.query(func.count(Notification.id)).filter(
        Notification.user_id.is_(None)
    )
    if user_id is not None:
        read_ids = (
            db.query(NotificationRead.notification_id)
            .filter(NotificationRead.user_id == user_id)
        )
        broadcast_query = broadcast_query.filter(~Notification.id.in_(read_ids))
        personal_unread = int(
            db.query(func.count(Notification.id))
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .scalar()
            or 0
        )
        broadcast_unread = int(broadcast_query.scalar() or 0)
        return broadcast_unread + personal_unread

    return int(broadcast_query.scalar() or 0)


def mark_personal_read(
    db: Session,
    notification_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Notification | None:
    row = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        .first()
    )
    if row is None:
        return None
    row.is_read = True
    db.flush()
    return row


def mark_broadcast_read(
    db: Session,
    notification_id: uuid.UUID,
    user_id: uuid.UUID,
) -> bool:
    exists = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id.is_(None),
        )
        .first()
    )
    if exists is None:
        return False

    already = (
        db.query(NotificationRead)
        .filter(
            NotificationRead.notification_id == notification_id,
            NotificationRead.user_id == user_id,
        )
        .first()
    )
    if already is not None:
        return True

    db.add(
        NotificationRead(
            notification_id=notification_id,
            user_id=user_id,
            read_at=datetime.now(timezone.utc),
        )
    )
    db.flush()
    return True


def mark_all_read(db: Session, user_id: uuid.UUID) -> int:
    updated = 0

    personal_rows = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .all()
    )
    for row in personal_rows:
        row.is_read = True
        updated += 1

    broadcast_rows = (
        db.query(Notification)
        .filter(Notification.user_id.is_(None))
        .all()
    )
    read_ids = get_read_broadcast_ids(
        db, user_id, [row.id for row in broadcast_rows]
    )
    for row in broadcast_rows:
        if row.id in read_ids:
            continue
        db.add(
            NotificationRead(
                notification_id=row.id,
                user_id=user_id,
                read_at=datetime.now(timezone.utc),
            )
        )
        updated += 1

    db.flush()
    return updated
