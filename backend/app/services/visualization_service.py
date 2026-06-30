# Module: M5 Visualization
# Feature: Business Logic ตาม #56

import uuid
from typing import Any

from sqlalchemy.orm import Session

import app.repositories.dataset_repository as dataset_repo
import app.repositories.visualization_repository as viz_repo
from app.models.user_model import User
from app.schemas.dataset_schema import DatasetResponse
from app.models.category_model import Category
from app.schemas.visualization_schema import (
    CategoryStatItem,
    CompareResponse,
    DashboardLayoutResponse,
    DatasetYearStat,
    NewReleasesResponse,
    StatsByCategoryResponse,
    StatsOverviewResponse,
    TrendingResponse,
    YearMetricStat,
)


def _datasets_to_responses(
    db: Session, datasets: list
) -> list[DatasetResponse]:
    from app.services.dataset_service import _resolve_category_names

    responses: list[DatasetResponse] = []
    for dataset in datasets:
        tag_ids = dataset_repo.get_dataset_tag_ids(db, dataset.id)
        owner = db.query(User).filter(User.id == dataset.user_id).first()
        item = DatasetResponse.model_validate(dataset)
        item.tags = tag_ids
        item.agency_name = owner.agency_name if owner else None
        item.agency_name_en = owner.agency_name_en if owner else None
        name_th, name_en = _resolve_category_names(db, dataset.category_id)
        item.category_name_th = name_th
        item.category_name_en = name_en
        item.file_format = dataset_repo.get_latest_dataset_file_format(
            db, dataset.id
        )
        responses.append(item)
    return responses


def get_stats_by_category(
    db: Session, category_id: uuid.UUID | None = None
) -> StatsByCategoryResponse:
    if category_id is not None:
        category = (
            db.query(Category)
            .filter(
                Category.id == category_id,
                Category.is_deleted.is_(False),
                Category.level == 1,
            )
            .first()
        )
        if category is None:
            from app.core.errors import raise_app_error

            raise_app_error("CATEGORY_NOT_FOUND")

    data = viz_repo.get_stats_by_category(db, category_id)
    return StatsByCategoryResponse(
        categories=[CategoryStatItem(**row) for row in data["categories"]],
        datasets_by_year=[
            DatasetYearStat(**row) for row in data["datasets_by_year"]
        ],
        metrics_by_year=[
            YearMetricStat(**row) for row in data.get("metrics_by_year", [])
        ],
        selected_category_id=data["selected_category_id"],
    )


def get_stats_overview(db: Session) -> StatsOverviewResponse:
    data = viz_repo.get_stats_overview(db)
    return StatsOverviewResponse(
        total_datasets=data["total_datasets"],
        total_downloads=data["total_downloads"],
        total_agencies=data["total_agencies"],
        total_categories=data["total_categories"],
        categories_by_level=data["categories_by_level"],
        total_categories_level1=data["total_categories_level1"],
        total_categories_level2=data["total_categories_level2"],
        datasets_by_year=[
            DatasetYearStat(**row) for row in data["datasets_by_year"]
        ],
        datasets_published_this_month=data["datasets_published_this_month"],
        datasets_published_last_month=data["datasets_published_last_month"],
        datasets_month_change_percent=data["datasets_month_change_percent"],
        agencies_with_published_datasets=data["agencies_with_published_datasets"],
        top_download_format=data["top_download_format"],
        top_download_format_percent=data["top_download_format_percent"],
    )


def get_trending(db: Session, limit: int = 10) -> TrendingResponse:
    datasets = viz_repo.get_trending_datasets(db, limit)
    return TrendingResponse(datasets=_datasets_to_responses(db, datasets))


def get_new_releases(db: Session, limit: int = 10) -> NewReleasesResponse:
    datasets = viz_repo.get_new_releases(db, limit)
    return NewReleasesResponse(datasets=_datasets_to_responses(db, datasets))


def compare_datasets(
    db: Session, dataset_ids: list[uuid.UUID]
) -> CompareResponse:
    datasets = viz_repo.get_datasets_for_compare(db, dataset_ids)
    return CompareResponse(datasets=_datasets_to_responses(db, datasets))


def get_dashboard_layout(
    db: Session, user_id: uuid.UUID
) -> DashboardLayoutResponse | None:
    layout = viz_repo.get_dashboard_layout(db, user_id)
    if layout is None:
        return None
    return DashboardLayoutResponse.model_validate(layout)


def save_dashboard_layout(
    db: Session, user_id: uuid.UUID, layout: dict[str, Any]
) -> DashboardLayoutResponse:
    record = viz_repo.upsert_dashboard_layout(db, user_id, layout)
    db.commit()
    db.refresh(record)
    return DashboardLayoutResponse.model_validate(record)
