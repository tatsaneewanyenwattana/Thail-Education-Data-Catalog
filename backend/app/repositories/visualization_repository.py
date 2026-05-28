# Module: M5 Visualization
# Feature: Database Queries ตาม #56

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.category_model import Category
from app.models.dashboard_layout_model import DashboardLayout
from app.models.dataset_model import Dataset
from app.models.download_log_model import DownloadLog
from app.models.user_model import User


def _month_start(year: int, month: int) -> datetime:
    return datetime(year, month, 1, tzinfo=timezone.utc)


def _previous_month(year: int, month: int) -> tuple[int, int]:
    if month == 1:
        return year - 1, 12
    return year, month - 1


def _count_published_between(
    db: Session,
    published_filter: tuple,
    start: datetime,
    end: datetime,
) -> int:
    return int(
        db.query(func.count(Dataset.id))
        .filter(
            *published_filter,
            Dataset.published_at.isnot(None),
            Dataset.published_at >= start,
            Dataset.published_at < end,
        )
        .scalar()
        or 0
    )


def _month_change_percent(current: int, previous: int) -> float | None:
    if previous == 0:
        return 100.0 if current > 0 else 0.0 if current == 0 else None
    return round(((current - previous) / previous) * 100, 1)


def get_stats_overview(db: Session) -> dict[str, Any]:
    published_filter = (
        Dataset.is_deleted.is_(False),
        Dataset.status == "published",
    )

    total_datasets = (
        db.query(func.count(Dataset.id))
        .filter(*published_filter)
        .scalar()
    ) or 0

    total_downloads = (
        db.query(func.coalesce(func.sum(Dataset.download_count), 0))
        .filter(*published_filter)
        .scalar()
    ) or 0

    total_agencies = (
        db.query(func.count(User.id))
        .filter(
            User.is_deleted.is_(False),
            User.role == "agency",
            User.status == "active",
        )
        .scalar()
    ) or 0

    year_rows = (
        db.query(
            extract("year", Dataset.published_at).label("year"),
            func.count(Dataset.id).label("count"),
        )
        .filter(
            *published_filter,
            Dataset.published_at.isnot(None),
        )
        .group_by(extract("year", Dataset.published_at))
        .order_by(extract("year", Dataset.published_at))
        .all()
    )

    datasets_by_year = [
        {"year": int(row.year), "count": int(row.count)}
        for row in year_rows
        if row.year is not None
    ]

    now = datetime.now(timezone.utc)
    this_month_start = _month_start(now.year, now.month)
    prev_year, prev_month = _previous_month(now.year, now.month)
    prev_month_start = _month_start(prev_year, prev_month)

    datasets_this_month = _count_published_between(
        db, published_filter, this_month_start, now
    )
    datasets_last_month = _count_published_between(
        db, published_filter, prev_month_start, this_month_start
    )
    datasets_month_change_percent = _month_change_percent(
        datasets_this_month, datasets_last_month
    )

    agencies_with_published_datasets = int(
        db.query(func.count(func.distinct(Dataset.user_id)))
        .filter(*published_filter)
        .scalar()
        or 0
    )

    format_row = (
        db.query(
            DownloadLog.file_format,
            func.count(DownloadLog.id).label("cnt"),
        )
        .group_by(DownloadLog.file_format)
        .order_by(func.count(DownloadLog.id).desc())
        .first()
    )
    top_download_format: str | None = None
    top_download_format_percent: int | None = None
    if format_row is not None:
        total_format_downloads = int(
            db.query(func.count(DownloadLog.id)).scalar() or 0
        )
        format_count = int(format_row.cnt)
        if total_format_downloads > 0:
            top_download_format = str(format_row.file_format)
            top_download_format_percent = round(
                (format_count / total_format_downloads) * 100
            )

    total_categories_level1 = int(
        db.query(func.count(Category.id))
        .filter(Category.is_deleted.is_(False), Category.level == 1)
        .scalar()
        or 0
    )
    total_categories_level2 = int(
        db.query(func.count(Category.id))
        .filter(Category.is_deleted.is_(False), Category.level == 2)
        .scalar()
        or 0
    )

    return {
        "total_datasets": int(total_datasets),
        "total_downloads": int(total_downloads),
        "total_agencies": int(total_agencies),
        "total_categories_level1": total_categories_level1,
        "total_categories_level2": total_categories_level2,
        "datasets_by_year": datasets_by_year,
        "datasets_published_this_month": datasets_this_month,
        "datasets_published_last_month": datasets_last_month,
        "datasets_month_change_percent": datasets_month_change_percent,
        "agencies_with_published_datasets": agencies_with_published_datasets,
        "top_download_format": top_download_format,
        "top_download_format_percent": top_download_format_percent,
    }


def get_trending_datasets(db: Session, limit: int) -> list[Dataset]:
    return (
        db.query(Dataset)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
        )
        .order_by(Dataset.download_count.desc())
        .limit(limit)
        .all()
    )


def get_new_releases(db: Session, limit: int) -> list[Dataset]:
    return (
        db.query(Dataset)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
            Dataset.published_at.isnot(None),
        )
        .order_by(Dataset.published_at.desc())
        .limit(limit)
        .all()
    )


def get_datasets_for_compare(
    db: Session, dataset_ids: list[uuid.UUID]
) -> list[Dataset]:
    if not dataset_ids:
        return []
    return (
        db.query(Dataset)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
            Dataset.id.in_(dataset_ids),
        )
        .all()
    )


def get_dashboard_layout(
    db: Session, user_id: uuid.UUID
) -> DashboardLayout | None:
    return (
        db.query(DashboardLayout)
        .filter(DashboardLayout.user_id == user_id)
        .first()
    )


def upsert_dashboard_layout(
    db: Session, user_id: uuid.UUID, layout: dict
) -> DashboardLayout:
    record = get_dashboard_layout(db, user_id)
    if record is None:
        record = DashboardLayout(user_id=user_id, layout=layout)
        db.add(record)
    else:
        record.layout = layout
    db.flush()
    return record
