# Module: M2 Dataset
# Feature: Category Business Logic ตาม #5 #56

import re
import uuid

from sqlalchemy.orm import Session

import app.repositories.category_repository as cat_repo
import app.repositories.tag_repository as tag_repo
from app.core.errors import raise_app_error
from app.models.category_model import Category
from app.models.user_model import User
from app.schemas.dataset_schema import (
    CategoryCreateRequest,
    CategoryResponse,
    CategoryUpdateRequest,
    CategoryWithDatasetCountResponse,
)

MAX_CATEGORY_DEPTH = 5


def _slugify_text(value: str) -> str:
    slug = value.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug


def _make_slug(name_en: str, name_th: str | None = None) -> str:
    slug = _slugify_text(name_en)
    if not slug and name_th:
        slug = _slugify_text(name_th)
    if not slug:
        slug = f"category-{uuid.uuid4().hex[:8]}"
    return slug


def _ensure_slug_available(
    db: Session,
    slug: str,
    *,
    exclude_id: uuid.UUID | None = None,
) -> None:
    if cat_repo.is_slug_taken(db, slug, exclude_id=exclude_id):
        raise_app_error("CATEGORY_SLUG_EXISTS")


def _resolve_parent_for_create(
    db: Session,
    parent_id: uuid.UUID,
    current_user: dict,
) -> Category:
    parent = cat_repo.get_category_by_id(db, parent_id)
    if parent is None:
        raise_app_error("CATEGORY_PARENT_NOT_FOUND")

    if parent.level >= MAX_CATEGORY_DEPTH:
        raise_app_error("CATEGORY_MAX_DEPTH_REACHED")

    if current_user.get("role") != "admin":
        if str(parent.created_by) != current_user["sub"]:
            raise_app_error("CATEGORY_NOT_OWNED")

    return parent


def validate_category_is_leaf(db: Session, category_id: uuid.UUID) -> None:
    category = cat_repo.get_category_by_id(db, category_id)
    if category is None:
        raise_app_error("CATEGORY_NOT_FOUND")
    if not cat_repo.is_leaf_category(db, category_id):
        raise_app_error("CATEGORY_NOT_LEAF")


def create_category(
    db: Session,
    request: CategoryCreateRequest,
    current_user: dict,
) -> CategoryResponse:
    slug = _make_slug(request.name_en, request.name_th)
    _ensure_slug_available(db, slug)

    level = 1
    parent_id = request.parent_id
    if parent_id is not None:
        parent = _resolve_parent_for_create(db, parent_id, current_user)
        level = parent.level + 1

    category = cat_repo.create_category(
        db,
        name_th=request.name_th,
        name_en=request.name_en,
        slug=slug,
        level=level,
        parent_id=parent_id,
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
    parent = _resolve_parent_for_create(db, parent_id, current_user)

    slug = _make_slug(request.name_en, request.name_th)
    _ensure_slug_available(db, slug)

    category = cat_repo.create_category(
        db,
        name_th=request.name_th,
        name_en=request.name_en,
        slug=slug,
        level=parent.level + 1,
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
        fields["slug"] = _make_slug(
            request.name_en,
            request.name_th or category.name_th,
        )

    if fields:
        if "slug" in fields:
            _ensure_slug_available(
                db,
                fields["slug"],
                exclude_id=category_id,
            )
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

    if cat_repo.check_category_has_children(db, category_id):
        raise_app_error("CATEGORY_HAS_CHILDREN")

    if cat_repo.check_category_has_datasets(db, category_id):
        raise_app_error("CATEGORY_HAS_DATASETS")

    cat_repo.soft_delete_category(db, category_id)
    db.commit()


def _categories_with_dataset_counts(
    categories: list[Category],
    counts: dict[uuid.UUID, int],
    *,
    owner_by_user_id: dict[uuid.UUID, User] | None = None,
) -> list[CategoryWithDatasetCountResponse]:
    items: list[CategoryWithDatasetCountResponse] = []
    for category in categories:
        agency_name: str | None = None
        creator_role: str | None = None
        if owner_by_user_id is not None:
            owner = owner_by_user_id.get(category.created_by)
            if owner is not None:
                creator_role = owner.role
                if owner.role == "agency":
                    agency_name = owner.agency_name
        items.append(
            CategoryWithDatasetCountResponse(
                **CategoryResponse.model_validate(category).model_dump(),
                dataset_count=counts.get(category.id, 0),
                agency_name=agency_name,
                creator_role=creator_role,
            )
        )
    return items


def _load_category_owners(db: Session, categories: list[Category]) -> dict[uuid.UUID, User]:
    owner_ids = {category.created_by for category in categories}
    if not owner_ids:
        return {}
    rows = (
        db.query(User)
        .filter(User.id.in_(owner_ids), User.is_deleted.is_(False))
        .all()
    )
    return {row.id: row for row in rows}


def list_categories(db: Session) -> list[CategoryResponse]:
    items = cat_repo.get_all_categories(db)
    return [CategoryResponse.model_validate(c) for c in items]


def list_agency_categories_with_counts(
    db: Session,
    user_id: uuid.UUID,
) -> list[CategoryWithDatasetCountResponse]:
    categories = cat_repo.get_categories_by_agency(db, user_id)
    counts = cat_repo.count_datasets_by_category(db, user_id=user_id)
    return _categories_with_dataset_counts(categories, counts)


def list_all_categories_admin(db: Session) -> list[CategoryResponse]:
    items = cat_repo.get_all_categories(db)
    return [CategoryResponse.model_validate(c) for c in items]


def list_all_categories_admin_with_counts(
    db: Session,
) -> list[CategoryWithDatasetCountResponse]:
    categories = cat_repo.get_all_categories(db)
    counts = cat_repo.count_datasets_by_category(db)
    owners = _load_category_owners(db, categories)
    return _categories_with_dataset_counts(
        categories,
        counts,
        owner_by_user_id=owners,
    )


def get_category_suggested_tags(
    db: Session,
    category_id: uuid.UUID,
    current_user: dict,
) -> list[str]:
    category = cat_repo.get_category_by_id(db, category_id)
    if category is None:
        raise_app_error("CATEGORY_NOT_FOUND")

    if current_user.get("role") != "admin":
        if str(category.created_by) != current_user["sub"]:
            raise_app_error("CATEGORY_NOT_OWNED")

    return tag_repo.get_tag_names_by_category_id(db, category_id)
