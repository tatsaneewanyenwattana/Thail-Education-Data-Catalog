# Module: M2 Dataset
# Feature: Request/Response Schemas ตาม #21 #22

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class DatasetCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: str | None = None
    license: str = Field(pattern="^(open|conditional|cc)$")
    category_id: uuid.UUID | None = None
    tags: list[uuid.UUID] = Field(default_factory=list, max_length=10)
    metadata: dict[str, Any] | None = None


class DatasetUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    license: str | None = Field(default=None, pattern="^(open|conditional|cc)$")
    category_id: uuid.UUID | None = None
    tags: list[uuid.UUID] | None = Field(default=None, max_length=10)
    metadata: dict[str, Any] | None = None


class DatasetResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    status: str
    license: str
    category_id: uuid.UUID | None
    tags: list[uuid.UUID] = Field(default_factory=list)
    dataset_metadata: dict[str, Any] | None = Field(None, alias="metadata")
    quality_score: int | None
    download_count: int
    view_count: int
    reject_comment: str | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    user_id: uuid.UUID

    model_config = {"from_attributes": True, "populate_by_name": True}


class DatasetVersionResponse(BaseModel):
    id: uuid.UUID
    dataset_id: uuid.UUID
    version_number: int
    file_path: str
    changelog: str | None
    created_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class BulkUploadRowError(BaseModel):
    row: int
    error: str


class BulkUploadResponse(BaseModel):
    success_count: int
    error_count: int
    errors: list[BulkUploadRowError]


class CategoryCreateRequest(BaseModel):
    name_th: str = Field(min_length=1, max_length=255)
    name_en: str = Field(min_length=1, max_length=255)
    parent_id: uuid.UUID | None = None


class CategoryUpdateRequest(BaseModel):
    name_th: str | None = Field(default=None, min_length=1, max_length=255)
    name_en: str | None = Field(default=None, min_length=1, max_length=255)


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name_th: str
    name_en: str
    slug: str
    level: int
    parent_id: uuid.UUID | None
    created_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class TagCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class TagUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class TagResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RejectRequest(BaseModel):
    comment: str = Field(min_length=10)
