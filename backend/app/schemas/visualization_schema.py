# Module: M5 Visualization
# Feature: Request/Response Schemas

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.dataset_schema import DatasetResponse


class DatasetYearStat(BaseModel):
    year: int
    count: int


class CategoryStatItem(BaseModel):
    id: str | None
    name_th: str
    name_en: str
    slug: str
    count: int


class StatsByCategoryResponse(BaseModel):
    categories: list[CategoryStatItem]
    datasets_by_year: list[DatasetYearStat]
    selected_category_id: str | None = None


class StatsOverviewResponse(BaseModel):
    total_datasets: int
    total_downloads: int
    total_agencies: int
    total_categories: int
    categories_by_level: dict[str, int] = Field(default_factory=dict)
    total_categories_level1: int
    total_categories_level2: int
    datasets_by_year: list[DatasetYearStat]
    datasets_published_this_month: int
    datasets_published_last_month: int
    datasets_month_change_percent: float | None = None
    agencies_with_published_datasets: int
    top_download_format: str | None = None
    top_download_format_percent: int | None = None


class TrendingResponse(BaseModel):
    datasets: list[DatasetResponse]


class NewReleasesResponse(BaseModel):
    datasets: list[DatasetResponse]


class CompareResponse(BaseModel):
    datasets: list[DatasetResponse]


class DashboardLayoutResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    layout: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DashboardLayoutRequest(BaseModel):
    layout: dict[str, Any]
