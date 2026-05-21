# Module: M2 Dataset
# Feature: Category Business Logic ตาม #5 #56

import re
import uuid

from sqlalchemy.orm import Session

import app.repositories.category_repository as cat_repo
from app.core.errors import raise_app_error
from app.models.category_model import Category
from app.schemas.dataset_schema import (
    CategoryCreateRequest,
    CategoryResponse,
    CategoryUpdateRequest,
)


def _make_slug(name_en: str) -> str:
    slug = name_en.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug


def create_category(
    db: Session,
    request: CategoryCreateRequest,
    current_user: dict,
) -> CategoryResponse:
    slug = _make_slug(request.name_en)
    existing = cat_repo.get_category_by_slug(db, slug)
    if existing is not None:
        raise_app_error("CATEGORY_SLUG_EXISTS")

    level = 1
    if request.parent_id is not None:
        parent = cat_repo.get_category_by_id(db, request.parent_id)
        if parent is None:
            raise_app_error("CATEGORY_PARENT_NOT_FOUND")

        if parent.level != 1:
            raise_app_error("CATEGORY_MAX_DEPTH_REACHED")

        if current_user.get("role") != "admin":
            if str(parent.created_by) != current_user["sub"]:
                raise_app_error("CATEGORY_NOT_OWNED")

        level = 2

    category = cat_repo.create_category(
        db,
        name_th=request.name_th,
        name_en=request.name_en,
        slug=slug,
        level=level,
        parent_id=request.parent_id,
        created_by=uuid.UUID(current_user["sub"]),
    )
    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


def create_subcategory(
    db: Session,
    parent_id: uuid.UUID,
    request: CategoryCreateRequest,
    current_user: dict,
) -> CategoryResponse:
    parent = cat_repo.get_category_by_id(db, parent_id)
    if parent is None:
        raise_app_error("CATEGORY_PARENT_NOT_FOUND")

    if parent.level != 1:
        raise_app_error("CATEGORY_MAX_DEPTH_REACHED")

    if current_user.get("role") != "admin":
        if str(parent.created_by) != current_user["sub"]:
            raise_app_error("CATEGORY_NOT_OWNED")

    slug = _make_slug(request.name_en)
    existing = cat_repo.get_category_by_slug(db, slug)
    if existing is not None:
        raise_app_error("CATEGORY_SLUG_EXISTS")

    category = cat_repo.create_category(
        db,
        name_th=request.name_th,
        name_en=request.name_en,
        slug=slug,
        level=2,
        parent_id=parent_id,
        created_by=uuid.UUID(current_user["sub"]),
    )
    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


def update_category(
    db: Session,
    category_id: uuid.UUID,
    request: CategoryUpdateRequest,
    current_user: dict,
) -> CategoryResponse:
    category = cat_repo.get_category_by_id(db, category_id)
    if category is None:
        raise_app_error("CATEGORY_NOT_FOUND")

    if current_user.get("role") != "admin":
        if str(category.created_by) != current_user["sub"]:
            raise_app_error("CATEGORY_NOT_OWNED")

    fields: dict = {}
    if request.name_th is not None:
        fields["name_th"] = request.name_th
    if request.name_en is not None:
        fields["name_en"] = request.name_en
        fields["slug"] = _make_slug(request.name_en)

    if fields:
        if "slug" in fields:
            existing = cat_repo.get_category_by_slug(db, fields["slug"])
            if existing is not None and existing.id != category_id:
                raise_app_error("CATEGORY_SLUG_EXISTS")
        cat_repo.update_category(db, category_id, **fields)

    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


def delete_category(
    db: Session,
    category_id: uuid.UUID,
    current_user: dict,
) -> None:
    category = cat_repo.get_category_by_id(db, category_id)
    if category is None:
        raise_app_error("CATEGORY_NOT_FOUND")

    if current_user.get("role") != "admin":
        if str(category.created_by) != current_user["sub"]:
            raise_app_error("CATEGORY_NOT_OWNED")

    if cat_repo.check_category_has_datasets(db, category_id):
        raise_app_error("CATEGORY_HAS_DATASETS")

    cat_repo.soft_delete_category(db, category_id)
    db.commit()


def list_categories(db: Session) -> list[CategoryResponse]:
    items = cat_repo.get_all_categories(db)
    return [CategoryResponse.model_validate(c) for c in items]


def list_all_categories_admin(db: Session) -> list[CategoryResponse]:
    items = cat_repo.get_all_categories(db)
    return [CategoryResponse.model_validate(c) for c in items]
