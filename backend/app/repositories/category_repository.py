# Module: M2 Dataset
# Feature: Category Database Queries ตาม #56

import uuid
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.category_model import Category
from app.models.dataset_model import Dataset


def create_category(
    db: Session,
    name_th: str,
    name_en: str,
    slug: str,
    level: int,
    parent_id: uuid.UUID | None,
    created_by: uuid.UUID,
) -> Category:
    category = Category(
        name_th=name_th,
        name_en=name_en,
        slug=slug,
        level=level,
        parent_id=parent_id,
        created_by=created_by,
    )
    db.add(category)
    db.flush()
    return category


def get_category_by_id(db: Session, category_id: uuid.UUID) -> Category | None:
    return (
        db.query(Category)
        .filter(Category.id == category_id, Category.is_deleted.is_(False))
        .first()
    )


def get_categories_by_agency(
    db: Session, user_id: uuid.UUID
) -> list[Category]:
    return (
        db.query(Category)
        .filter(Category.created_by == user_id, Category.is_deleted.is_(False))
        .order_by(Category.level, Category.name_th)
        .all()
    )


def get_all_categories(db: Session) -> list[Category]:
    return (
        db.query(Category)
        .filter(Category.is_deleted.is_(False))
        .order_by(Category.level, Category.name_th)
        .all()
    )


def update_category(
    db: Session,
    category_id: uuid.UUID,
    **fields: Any,
) -> Category:
    from app.core.errors import raise_app_error

    category = get_category_by_id(db, category_id)
    if category is None:
        raise_app_error("CATEGORY_NOT_FOUND")
    for key, value in fields.items():
        setattr(category, key, value)
    db.flush()
    return category


def soft_delete_category(db: Session, category_id: uuid.UUID) -> None:
    from app.core.errors import raise_app_error

    category = get_category_by_id(db, category_id)
    if category is None:
        raise_app_error("CATEGORY_NOT_FOUND")
    category.is_deleted = True
    db.flush()


def count_datasets_by_category(
    db: Session,
    *,
    user_id: uuid.UUID | None = None,
) -> dict[uuid.UUID, int]:
    query = (
        db.query(Dataset.category_id, func.count(Dataset.id))
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.category_id.isnot(None),
        )
    )
    if user_id is not None:
        query = query.filter(Dataset.user_id == user_id)
    rows = query.group_by(Dataset.category_id).all()
    return {category_id: count for category_id, count in rows}


def check_category_has_datasets(db: Session, category_id: uuid.UUID) -> bool:
    count = (
        db.query(Dataset)
        .filter(
            Dataset.category_id == category_id,
            Dataset.is_deleted.is_(False),
        )
        .count()
    )
    return count > 0


def get_category_by_slug(db: Session, slug: str) -> Category | None:
    return (
        db.query(Category)
        .filter(Category.slug == slug, Category.is_deleted.is_(False))
        .first()
    )


def is_slug_taken(
    db: Session,
    slug: str,
    *,
    exclude_id: uuid.UUID | None = None,
) -> bool:
    """เช็ค slug ซ้ำทั้งระบบ (ไม่นับ soft-deleted)"""
    query = db.query(Category.id).filter(
        Category.slug == slug,
        Category.is_deleted.is_(False),
    )
    if exclude_id is not None:
        query = query.filter(Category.id != exclude_id)
    return query.first() is not None


def check_category_has_children(db: Session, category_id: uuid.UUID) -> bool:
    count = (
        db.query(Category.id)
        .filter(
            Category.parent_id == category_id,
            Category.is_deleted.is_(False),
        )
        .count()
    )
    return count > 0


def is_leaf_category(db: Session, category_id: uuid.UUID) -> bool:
    category = get_category_by_id(db, category_id)
    if category is None:
        return False
    return not check_category_has_children(db, category_id)


def get_descendant_leaf_category_ids(
    db: Session, category_id: uuid.UUID
) -> list[uuid.UUID]:
    """รวบรวม UUID หมวดใบ (leaf) ทั้งหมดใต้หมวดที่ระบุ รวมตัวเองถ้าเป็น leaf"""
    category = get_category_by_id(db, category_id)
    if category is None:
        return []

    if is_leaf_category(db, category_id):
        return [category_id]

    child_rows = (
        db.query(Category.id)
        .filter(
            Category.parent_id == category_id,
            Category.is_deleted.is_(False),
        )
        .all()
    )

    result: list[uuid.UUID] = []
    for (child_id,) in child_rows:
        result.extend(get_descendant_leaf_category_ids(db, child_id))
    return result
