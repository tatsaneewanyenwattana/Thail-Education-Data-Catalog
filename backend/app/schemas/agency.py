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
    submitted_datasets: int
    total_downloads: int
    monthly_downloads: list[MonthlyDownloadItem]


class AgencyDashboardResponse(BaseModel):
    """JSend wrapper (ใช้ success_response ใน router เป็นหลัก)."""

    success: bool
    data: AgencyDashboardStats
    message: str


class AgencyDatasetListItem(BaseModel):
    id: uuid.UUID
    title: str
    title_en: str = Field(serialization_alias="titleEn")
    category: str
    category_en: str = Field(serialization_alias="categoryEn")
    subcategory: str
    subcategory_en: str = Field(serialization_alias="subcategoryEn")
    status: str
    quality_score: int | None = Field(serialization_alias="qualityScore")
    download_count: int = Field(serialization_alias="downloadCount")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = {"populate_by_name": True}
