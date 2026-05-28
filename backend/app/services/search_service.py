# Module: M3 Search
# Feature: Business Logic ตาม #5 #31 #56

import uuid

from pythainlp.tokenize import word_tokenize
from sqlalchemy.orm import Session

import app.repositories.saved_search_repository as saved_search_repo
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams
from app.schemas.search_schema import (
    AutocompleteResponse,
    SavedSearchCreateRequest,
    SavedSearchResponse,
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
    "province",
    "agency_user_id",
    "tag",
}

ALLOWED_LICENSES = {"open", "conditional", "cc"}


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
        elif key == "year":
            try:
                validated[key] = int(value)
            except (TypeError, ValueError):
                raise_app_error("SEARCH_INVALID_FILTER")
        elif key == "province":
            validated[key] = str(value)
        elif key == "tag":
            validated[key] = str(value).strip()
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
    )


def search(
    es_client,
    keyword: str | None,
    filters: dict | None,
    pagination: PaginationParams,
) -> tuple[list[SearchResponse], int]:
    kw = (keyword or "").strip()
    if len(kw) < 2:
        raise_app_error("SEARCH_KEYWORD_TOO_SHORT")

    validated_filters = _validate_filters(filters)

    result = search_datasets(es_client, kw, validated_filters, pagination)
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
