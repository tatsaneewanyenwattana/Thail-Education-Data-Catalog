# Module: M6 Admin
# Feature: Request/Response Schemas

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AdminStatsResponse(BaseModel):
    total_users: int
    total_datasets: int
    total_downloads: int
    pending_agencies: int
    users_today: int
    datasets_today: int
    downloads_today: int


class AdminUserListFilters(BaseModel):
    status: str | None = None
    role: str | None = None
    search: str | None = None


class UserRejectRequest(BaseModel):
    reason: str = Field(min_length=10, max_length=500)


class AdminDatasetListItem(BaseModel):
    id: uuid.UUID
    title: str
    title_en: str = Field(serialization_alias="titleEn")
    agency: str
    agency_en: str = Field(serialization_alias="agencyEn")
    category: str
    category_en: str = Field(serialization_alias="categoryEn")
    status: str
    quality_score: int | None = Field(serialization_alias="qualityScore")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = {"populate_by_name": True}


class UserListResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    status: str
    agency_name: str | None
    reject_reason: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    role: str | None = Field(default=None, pattern="^(visitor|agency|admin)$")
    status: str | None = Field(
        default=None,
        pattern="^(pending|active|rejected|suspended)$",
    )


class AnnouncementCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    content: str = Field(min_length=1)
    is_active: bool = True


class AnnouncementUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    content: str | None = Field(default=None, min_length=1)
    is_active: bool | None = None


class AnnouncementResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    is_active: bool
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PageContentUpdateRequest(BaseModel):
    content_th: str = ""
    content_en: str = ""


class PageContentResponse(BaseModel):
    slug: str
    title_th: str
    title_en: str
    content_th: str
    content_en: str
    updated_at: datetime


class AuditLogListFilters(BaseModel):
    date_from: str | None = None
    date_to: str | None = None
    action: str | None = None
    search: str | None = None


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    email: str | None = None
    action: str
    target_type: str
    target_id: uuid.UUID | None
    detail: dict[str, Any] | None
    ip_address: str
    created_at: datetime

    model_config = {"from_attributes": True}
