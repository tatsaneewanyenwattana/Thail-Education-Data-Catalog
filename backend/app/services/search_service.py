# Module: M3 Search
# Feature: Business Logic ตาม #5 #31 #56

import uuid
from typing import Any

from pythainlp.tokenize import word_tokenize
from sqlalchemy.orm import Session

import app.repositories.category_repository as cat_repo
import app.repositories.saved_search_repository as saved_search_repo
import app.repositories.search_repository as search_repo
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams
from app.schemas.search_schema import (
    AutocompleteResponse,
    SavedSearchCreateRequest,
    SavedSearchResponse,
    SearchFilterAgencyOption,
    SearchFilterCategoryOption,
    SearchFiltersResponse,
    SearchRequest,
    SearchResponse,
)
from app.utils.elasticsearch_utils import (
    autocomplete_datasets,
    search_datasets,
)

ALLOWED_FILTER_KEYS = {
    "category_id",
    "license",
    "year",
    "years",
    "province",
    "agency_user_id",
    "tag",
    "tags",
    "format",
    "formats",
}

ALLOWED_LICENSES = {"open", "conditional", "cc"}
ALLOWED_FORMATS = {"csv", "excel", "json", "xml", "pdf", "sql"}


def _normalize_filter_list(value: Any) -> list[Any]:
    if value is None or value == "":
        return []
    if isinstance(value, list):
        return [item for item in value if item is not None and item != ""]
    if isinstance(value, str) and "," in value:
        return [part.strip() for part in value.split(",") if part.strip()]
    return [value]


def _tokenize_thai(keyword: str) -> str:
    tokens = word_tokenize(keyword.strip(), engine="newmm")
    return " ".join(tokens)


def _validate_filters(filters: dict | None) -> dict:
    if not filters:
        return {}
    if not isinstance(filters, dict):
        raise_app_error("SEARCH_INVALID_FILTER")

    validated: dict = {}
    for key, value in filters.items():
        if key not in ALLOWED_FILTER_KEYS:
            raise_app_error("SEARCH_INVALID_FILTER")
        if value is None or value == "":
            continue
        if key == "category_id":
            try:
                validated[key] = str(uuid.UUID(str(value)))
            except ValueError:
                raise_app_error("SEARCH_INVALID_FILTER")
        elif key == "agency_user_id":
            try:
                validated[key] = str(uuid.UUID(str(value)))
            except ValueError:
                raise_app_error("SEARCH_INVALID_FILTER")
        elif key == "license":
            if value not in ALLOWED_LICENSES:
                raise_app_error("SEARCH_INVALID_FILTER")
            validated[key] = value
        elif key in ("year", "years"):
            years: list[int] = []
            for item in _normalize_filter_list(value):
                try:
                    years.append(int(item))
                except (TypeError, ValueError):
                    raise_app_error("SEARCH_INVALID_FILTER")
            if years:
                validated["years"] = years
        elif key == "province":
            validated[key] = str(value)
        elif key in ("tag", "tags"):
            tags = [str(item).strip() for item in _normalize_filter_list(value) if str(item).strip()]
            if tags:
                validated["tags"] = tags
        elif key in ("format", "formats"):
            formats: list[str] = []
            for item in _normalize_filter_list(value):
                fmt = str(item).strip()
                if fmt not in ALLOWED_FORMATS:
                    raise_app_error("SEARCH_INVALID_FILTER")
                formats.append(fmt)
            if formats:
                validated["formats"] = formats
    return validated


def _validate_saved_filters(filters: dict) -> None:
    if not isinstance(filters, dict) or not filters:
        raise_app_error("VALIDATION_ERROR", "ต้องมีเงื่อนไขอย่างน้อย 1 อย่าง")
    has_condition = any(
        v is not None and v != "" for v in filters.values()
    )
    if not has_condition:
        raise_app_error("VALIDATION_ERROR", "ต้องมีเงื่อนไขอย่างน้อย 1 อย่าง")
    _validate_filters(filters)


def _map_to_search_response(item: dict) -> SearchResponse:
    return SearchResponse(
        id=uuid.UUID(str(item["id"])),
        title=item.get("title", ""),
        description=item.get("description"),
        license=item.get("license", ""),
        category_id=(
            uuid.UUID(str(item["category_id"]))
            if item.get("category_id")
            else None
        ),
        quality_score=item.get("quality_score"),
        download_count=item.get("download_count", 0),
        published_at=item.get("published_at"),
        agency_name=item.get("agency_name"),
        agency_name_en=item.get("agency_name_en"),
        file_format=item.get("file_format"),
    )


def get_filter_options(
    db: Session, scope: dict | None = None
) -> SearchFiltersResponse:
    validated_scope = _validate_filters(scope) if scope else {}
    scope_payload = {
        key: validated_scope[key]
        for key in ("category_id", "agency_user_id", "province")
        if key in validated_scope
    }
    raw = search_repo.get_search_filter_options(db, scope_payload or None)
    categories = [
        SearchFilterCategoryOption(
            id=c.id,
            parent_id=c.parent_id,
            level=c.level,
            name_th=c.name_th,
            name_en=c.name_en,
            slug=c.slug,
        )
        for c in raw["categories"]
    ]
    agencies = [
        SearchFilterAgencyOption(
            agency_user_id=item["agency_user_id"],
            agency_name=item["agency_name"],
            agency_name_en=item.get("agency_name_en"),
        )
        for item in raw["agencies"]
    ]
    return SearchFiltersResponse(
        categories=categories,
        agencies=agencies,
        years=raw["years"],
        provinces=raw["provinces"],
        formats=raw["formats"],
        tags=raw["tags"],
    )


def _expand_category_filter(db: Session | None, filters: dict) -> dict:
    if db is None or not filters.get("category_id"):
        return filters

    try:
        category_id = uuid.UUID(str(filters["category_id"]))
    except ValueError:
        return filters

    leaf_ids = cat_repo.get_descendant_leaf_category_ids(db, category_id)
    if not leaf_ids:
        return filters

    expanded = dict(filters)
    expanded["category_ids"] = [str(item) for item in leaf_ids]
    return expanded


def search(
    es_client,
    keyword: str | None,
    filters: dict | None,
    pagination: PaginationParams,
    db: Session | None = None,
) -> tuple[list[SearchResponse], int]:
    kw = (keyword or "").strip()
    validated_filters = _validate_filters(filters)
    validated_filters = _expand_category_filter(db, validated_filters)

    # อนุญาตให้ค้นแบบ filter-only ได้ (ไม่ต้องมี keyword) ตาม #31
    # แต่ถ้ามี keyword ต้องยาวอย่างน้อย 2 ตัวอักษร
    has_filters = bool(validated_filters)
    if len(kw) < 2 and not has_filters:
        raise_app_error("SEARCH_KEYWORD_TOO_SHORT")

    # keyword สั้นเกินไปแต่มี filter → ค้นแบบ filter-only (ไม่ใช้ keyword)
    effective_keyword = kw if len(kw) >= 2 else ""

    result = search_datasets(
        es_client, effective_keyword, validated_filters, pagination
    )
    responses = [_map_to_search_response(item) for item in result.items]
    return responses, result.total


def autocomplete(es_client, keyword: str | None) -> AutocompleteResponse:
    kw = (keyword or "").strip()
    if len(kw) < 2:
        return AutocompleteResponse(suggestions=[])

    tokenized = _tokenize_thai(kw)
    suggestions = autocomplete_datasets(es_client, tokenized)
    return AutocompleteResponse(suggestions=suggestions[:10])


def create_saved_search(
    db: Session,
    user_id: uuid.UUID,
    name: str,
    filters: dict,
) -> SavedSearchResponse:
    _validate_saved_filters(filters)
    saved_search = saved_search_repo.create_saved_search(
        db, user_id=user_id, name=name, filters=filters
    )
    db.commit()
    db.refresh(saved_search)
    return SavedSearchResponse.model_validate(saved_search)


def get_saved_searches(
    db: Session, user_id: uuid.UUID
) -> list[SavedSearchResponse]:
    items = saved_search_repo.get_saved_searches(db, user_id)
    return [SavedSearchResponse.model_validate(s) for s in items]


def delete_saved_search(
    db: Session,
    user_id: uuid.UUID,
    saved_search_id: uuid.UUID,
) -> None:
    saved_search = saved_search_repo.get_saved_search_by_id(db, saved_search_id)
    if saved_search is None:
        raise_app_error("NOT_FOUND")
    if str(saved_search.user_id) != str(user_id):
        raise_app_error("AUTH_PERMISSION_DENIED")
    saved_search_repo.soft_delete_saved_search(db, saved_search_id)
    db.commit()
