# Module: Agency Dashboard
# Feature: Agency dashboard schemas

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MonthlyDownloadItem(BaseModel):
    month: str
    month_en: str = Field(serialization_alias="monthEn")
    count: int

    model_config = {"populate_by_name": True}


class AgencyDashboardStats(BaseModel):
    total_datasets: int
    published_datasets: int
    draft_datasets: int
    total_downloads: int
    monthly_downloads: list[MonthlyDownloadItem]
    datasets_created_this_month: int
    datasets_created_last_month: int
    datasets_month_change_percent: float | None = None
    downloads_this_month: int
    top_download_format: str | None = None
    top_download_format_percent: int | None = None


class AgencyDashboardResponse(BaseModel):
    """JSend wrapper (ใช้ success_response ใน router เป็นหลัก)."""

    success: bool
    data: AgencyDashboardStats
    message: str


class AgencyDatasetListItem(BaseModel):
    id: uuid.UUID
    title: str
    title_en: str = Field(serialization_alias="titleEn")
    category_id: uuid.UUID | None = Field(default=None, serialization_alias="categoryId")
    category: str
    category_en: str = Field(serialization_alias="categoryEn")
    subcategory: str
    subcategory_en: str = Field(serialization_alias="subcategoryEn")
    status: str
    quality_score: int | None = Field(serialization_alias="qualityScore")
    download_count: int = Field(serialization_alias="downloadCount")
    updated_at: datetime = Field(serialization_alias="updatedAt")
    file_format: str | None = Field(default=None, serialization_alias="fileFormat")

    model_config = {"populate_by_name": True}


class AgencyActivityLogItem(BaseModel):
    id: uuid.UUID
    created_at: datetime
    item_type: str = Field(serialization_alias="itemType")
    activity_type: str = Field(serialization_alias="activityType")
    title: str | None = None

    model_config = {"populate_by_name": True}


class AgencyActivityLogListResponse(BaseModel):
    items: list[AgencyActivityLogItem]
    total: int
