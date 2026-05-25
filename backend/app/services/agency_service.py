# Module: Agency Dashboard
# Feature: Agency dashboard business logic

import uuid

from sqlalchemy.orm import Session

import app.repositories.agency_repository as agency_repo
from app.core.pagination import PaginationParams
from app.schemas.agency import AgencyDashboardStats, AgencyDatasetListItem, MonthlyDownloadItem


def get_agency_dashboard(db: Session, user_id: uuid.UUID) -> AgencyDashboardStats:
    counts = agency_repo.get_dataset_stats(db, user_id)
    monthly = agency_repo.get_monthly_downloads(db, user_id)
    return AgencyDashboardStats(
        total_datasets=counts["total_datasets"],
        published_datasets=counts["published_datasets"],
        draft_datasets=counts["draft_datasets"],
        submitted_datasets=counts["submitted_datasets"],
        total_downloads=agency_repo.get_total_downloads(db, user_id),
        monthly_downloads=[MonthlyDownloadItem(**item) for item in monthly],
    )


def list_agency_datasets(
    db: Session,
    user_id: uuid.UUID,
    pagination: PaginationParams,
    status_filter: str | None = None,
) -> tuple[list[AgencyDatasetListItem], int]:
    items, total = agency_repo.list_agency_datasets(
        db=db,
        user_id=user_id,
        pagination=pagination,
        status_filter=status_filter,
    )
    return [AgencyDatasetListItem(**item) for item in items], total
