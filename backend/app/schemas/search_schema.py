# Module: M3 Search
# Feature: Request/Response Schemas

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    keyword: str | None = None
    filters: dict[str, Any] | None = None
    sort: str = Field(default="published_at")
    order: Literal["asc", "desc"] = Field(default="desc")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class SearchResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    license: str
    category_id: uuid.UUID | None
    quality_score: int | None
    download_count: int
    published_at: datetime | None
    agency_name: str | None
    agency_name_en: str | None = None
    file_format: str | None = None


class AutocompleteResponse(BaseModel):
    suggestions: list[str] = Field(default_factory=list, max_length=10)


class SavedSearchCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    filters: dict[str, Any]


class SavedSearchResponse(BaseModel):
    id: uuid.UUID
    name: str
    filters: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class SearchFilterCategoryOption(BaseModel):
    id: uuid.UUID
    parent_id: uuid.UUID | None
    level: int
    name_th: str
    name_en: str
    slug: str


class SearchFilterAgencyOption(BaseModel):
    agency_user_id: uuid.UUID
    agency_name: str
    agency_name_en: str | None = None


class SearchFiltersResponse(BaseModel):
    categories: list[SearchFilterCategoryOption] = Field(default_factory=list)
    agencies: list[SearchFilterAgencyOption] = Field(default_factory=list)
    years: list[int] = Field(default_factory=list)
    provinces: list[str] = Field(default_factory=list)
    formats: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
