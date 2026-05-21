# Module: M2 Dataset
# Feature: Category Database Queries ตาม #56

import uuid
from typing import Any

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
