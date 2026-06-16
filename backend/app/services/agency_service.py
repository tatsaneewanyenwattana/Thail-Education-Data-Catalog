# Module: Agency Dashboard
# Feature: Agency dashboard business logic

import uuid

from sqlalchemy.orm import Session

import app.repositories.agency_repository as agency_repo
from app.core.pagination import PaginationParams
from app.schemas.agency import (
    AgencyActivityLogItem,
    AgencyDashboardStats,
    AgencyDatasetListItem,
    MonthlyDownloadItem,
)


def get_agency_dashboard(db: Session, user_id: uuid.UUID) -> AgencyDashboardStats:
    counts = agency_repo.get_dataset_stats(db, user_id)
    monthly = agency_repo.get_monthly_downloads(db, user_id)
    top_format, top_format_percent = agency_repo.get_top_download_format(db, user_id)
    return AgencyDashboardStats(
        total_datasets=counts["total_datasets"],
        published_datasets=counts["published_datasets"],
        draft_datasets=counts["draft_datasets"],
        total_downloads=agency_repo.get_total_downloads(db, user_id),
        monthly_downloads=[MonthlyDownloadItem(**item) for item in monthly],
        datasets_created_this_month=counts["datasets_created_this_month"],
        datasets_created_last_month=counts["datasets_created_last_month"],
        datasets_month_change_percent=counts["datasets_month_change_percent"],
        downloads_this_month=agency_repo.get_downloads_this_month(db, user_id),
        top_download_format=top_format,
        top_download_format_percent=top_format_percent,
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


def _classify_upload_history_activity(
    action: str,
    detail: dict | None,
    entity_status: str | None,
) -> str | None:
    detail = detail or {}
    if action in ("dataset.delete", "scholarship.delete"):
        return "delete"
    if action in ("dataset.update", "scholarship.update"):
        return "update"
    if action in ("dataset.upload", "dataset.bulk_upload", "scholarship.create"):
        status = detail.get("status") or entity_status
        if status == "draft":
            return "draft"
        return "upload"
    return None


def list_agency_activity_logs(
    db: Session,
    user_id: uuid.UUID,
    pagination: PaginationParams,
) -> tuple[list[AgencyActivityLogItem], int]:
    rows, total = agency_repo.list_agency_activity_logs(
        db=db,
        user_id=user_id,
        pagination=pagination,
    )
    items: list[AgencyActivityLogItem] = []
    for row in rows:
        activity_type = _classify_upload_history_activity(
            row["action"],
            row.get("detail"),
            row.get("entity_status"),
        )
        if activity_type is None:
            continue
        item_type = row["target_type"]
        if item_type not in ("dataset", "scholarship"):
            continue
        items.append(
            AgencyActivityLogItem(
                id=row["id"],
                created_at=row["created_at"],
                item_type=item_type,
                activity_type=activity_type,
                title=row.get("title"),
            )
        )
    return items, total
