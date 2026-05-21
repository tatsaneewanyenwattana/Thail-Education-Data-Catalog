# Module: M2 Dataset
# Feature: Tag Database Queries ตาม #56

import uuid

from sqlalchemy.orm import Session

from app.models.tag_model import Tag


def create_tag(db: Session, name: str) -> Tag:
    tag = Tag(name=name)
    db.add(tag)
    db.flush()
    return tag


def get_tag_by_id(db: Session, tag_id: uuid.UUID) -> Tag | None:
    return (
        db.query(Tag)
        .filter(Tag.id == tag_id, Tag.is_deleted.is_(False))
        .first()
    )


def get_tag_by_name(db: Session, name: str) -> Tag | None:
    return (
        db.query(Tag)
        .filter(Tag.name == name, Tag.is_deleted.is_(False))
        .first()
    )


def get_all_tags(db: Session) -> list[Tag]:
    return (
        db.query(Tag)
        .filter(Tag.is_deleted.is_(False))
        .order_by(Tag.name)
        .all()
    )


def update_tag(db: Session, tag_id: uuid.UUID, name: str) -> Tag:
    from app.core.errors import raise_app_error

    tag = get_tag_by_id(db, tag_id)
    if tag is None:
        raise_app_error("TAG_NOT_FOUND")
    tag.name = name
    db.flush()
    return tag


def soft_delete_tag(db: Session, tag_id: uuid.UUID) -> None:
    from app.core.errors import raise_app_error

    tag = get_tag_by_id(db, tag_id)
    if tag is None:
        raise_app_error("TAG_NOT_FOUND")
    tag.is_deleted = True
    db.flush()
