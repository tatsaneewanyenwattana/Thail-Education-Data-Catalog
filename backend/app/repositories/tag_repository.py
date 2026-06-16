# Module: M2 Dataset
# Feature: Tag Database Queries ตาม #56

import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.dataset_model import Dataset
from app.models.dataset_tag_model import DatasetTag
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


def count_datasets_by_tag(db: Session) -> dict[uuid.UUID, int]:
    rows = (
        db.query(DatasetTag.tag_id, func.count(Dataset.id))
        .join(Dataset, Dataset.id == DatasetTag.dataset_id)
        .filter(Dataset.is_deleted.is_(False))
        .group_by(DatasetTag.tag_id)
        .all()
    )
    return {tag_id: count for tag_id, count in rows}


def get_tag_names_by_category_id(
    db: Session,
    category_id: uuid.UUID,
) -> list[str]:
    """แท็กที่เคยใช้ใน Dataset ของหมวดหมู่นี้ เรียงตามความถี่"""
    rows = (
        db.query(Tag.name, func.count(Tag.name).label("usage_count"))
        .join(DatasetTag, DatasetTag.tag_id == Tag.id)
        .join(Dataset, Dataset.id == DatasetTag.dataset_id)
        .filter(
            Dataset.category_id == category_id,
            Dataset.is_deleted.is_(False),
            Tag.is_deleted.is_(False),
        )
        .group_by(Tag.name)
        .order_by(func.count(Tag.name).desc(), Tag.name.asc())
        .all()
    )
    return [row[0] for row in rows]


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
