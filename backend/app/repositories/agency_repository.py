# Module: Agency Dashboard
# Feature: Database queries for agency dashboard stats

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.core.pagination import PaginationParams
from app.models.audit_log_model import AuditLog
from app.models.category_model import Category
from app.models.dataset_model import Dataset
from app.models.download_log_model import DownloadLog

_UNCATEGORIZED_TH = "ไม่ระบุหมวดหมู่"
_UNCATEGORIZED_EN = "Uncategorized"

def _month_start(year: int, month: int) -> datetime:
    return datetime(year, month, 1, tzinfo=timezone.utc)


def _previous_month(year: int, month: int) -> tuple[int, int]:
    if month == 1:
        return year - 1, 12
    return year, month - 1


def _month_change_percent(current: int, previous: int) -> float | None:
    if previous == 0:
        return 100.0 if current > 0 else 0.0 if current == 0 else None
    return round(((current - previous) / previous) * 100, 1)


def _count_user_datasets_between(
    db: Session,
    user_id: uuid.UUID,
    start: datetime,
    end: datetime,
) -> int:
    return int(
        db.query(func.count(Dataset.id))
        .filter(
            Dataset.user_id == user_id,
            Dataset.is_deleted.is_(False),
            Dataset.created_at >= start,
            Dataset.created_at < end,
        )
        .scalar()
        or 0
    )


_TH_MONTHS = {
    1: "ม.ค.",
    2: "ก.พ.",
    3: "มี.ค.",
    4: "เม.ย.",
    5: "พ.ค.",
    6: "มิ.ย.",
    7: "ก.ค.",
    8: "ส.ค.",
    9: "ก.ย.",
    10: "ต.ค.",
    11: "พ.ย.",
    12: "ธ.ค.",
}
_EN_MONTHS = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
}


def _dataset_count(
    db: Session, user_id: uuid.UUID, status: str | None = None
) -> int:
    query = db.query(func.count(Dataset.id)).filter(
        Dataset.user_id == user_id,
        Dataset.is_deleted.is_(False),
    )
    if status is not None:
        query = query.filter(Dataset.status == status)
    return int(query.scalar() or 0)


def get_dataset_stats(db: Session, user_id: uuid.UUID) -> dict[str, int]:
    now = datetime.now(timezone.utc)
    this_month_start = _month_start(now.year, now.month)
    prev_year, prev_month = _previous_month(now.year, now.month)
    prev_month_start = _month_start(prev_year, prev_month)

    datasets_this_month = _count_user_datasets_between(
        db, user_id, this_month_start, now
    )
    datasets_last_month = _count_user_datasets_between(
        db, user_id, prev_month_start, this_month_start
    )

    return {
        "total_datasets": _dataset_count(db, user_id),
        "published_datasets": _dataset_count(db, user_id, "published"),
        "draft_datasets": _dataset_count(db, user_id, "draft"),
        "datasets_created_this_month": datasets_this_month,
        "datasets_created_last_month": datasets_last_month,
        "datasets_month_change_percent": _month_change_percent(
            datasets_this_month, datasets_last_month
        ),
    }


def get_total_downloads(db: Session, user_id: uuid.UUID) -> int:
    total = (
        db.query(func.coalesce(func.sum(Dataset.download_count), 0))
        .filter(
            Dataset.user_id == user_id,
            Dataset.is_deleted.is_(False),
        )
        .scalar()
    )
    return int(total or 0)


def get_downloads_this_month(db: Session, user_id: uuid.UUID) -> int:
    now = datetime.now(timezone.utc)
    this_month_start = _month_start(now.year, now.month)
    return int(
        db.query(func.count(DownloadLog.id))
        .join(Dataset, DownloadLog.dataset_id == Dataset.id)
        .filter(
            Dataset.user_id == user_id,
            Dataset.is_deleted.is_(False),
            DownloadLog.created_at >= this_month_start,
            DownloadLog.created_at <= now,
        )
        .scalar()
        or 0
    )


def get_top_download_format(
    db: Session, user_id: uuid.UUID
) -> tuple[str | None, int | None]:
    format_row = (
        db.query(
            DownloadLog.file_format,
            func.count(DownloadLog.id).label("cnt"),
        )
        .join(Dataset, DownloadLog.dataset_id == Dataset.id)
        .filter(
            Dataset.user_id == user_id,
            Dataset.is_deleted.is_(False),
        )
        .group_by(DownloadLog.file_format)
        .order_by(func.count(DownloadLog.id).desc())
        .first()
    )
    if format_row is None:
        return None, None

    total = int(
        db.query(func.count(DownloadLog.id))
        .join(Dataset, DownloadLog.dataset_id == Dataset.id)
        .filter(
            Dataset.user_id == user_id,
            Dataset.is_deleted.is_(False),
        )
        .scalar()
        or 0
    )
    if total == 0:
        return None, None

    return str(format_row.file_format), round((int(format_row.cnt) / total) * 100)


def get_monthly_downloads(
    db: Session, user_id: uuid.UUID, months: int = 6
) -> list[dict[str, Any]]:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=months * 31)

    rows = (
        db.query(
            extract("month", DownloadLog.created_at).label("month"),
            extract("year", DownloadLog.created_at).label("year"),
            func.count(DownloadLog.id).label("count"),
        )
        .join(Dataset, DownloadLog.dataset_id == Dataset.id)
        .filter(
            Dataset.user_id == user_id,
            Dataset.is_deleted.is_(False),
            DownloadLog.created_at >= start,
        )
        .group_by(
            extract("year", DownloadLog.created_at),
            extract("month", DownloadLog.created_at),
        )
        .order_by(
            extract("year", DownloadLog.created_at),
            extract("month", DownloadLog.created_at),
        )
        .all()
    )

    return [
        {
            "month": _TH_MONTHS.get(int(row.month), str(int(row.month))),
            "month_en": _EN_MONTHS.get(int(row.month), str(int(row.month))),
            "count": int(row.count),
        }
        for row in rows
    ]


def _resolve_category_labels(
    db: Session, category_id: uuid.UUID | None
) -> tuple[str, str, str, str]:
    if category_id is None:
        return _UNCATEGORIZED_TH, _UNCATEGORIZED_EN, "-", "-"

    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.is_deleted.is_(False))
        .first()
    )
    if category is None:
        return _UNCATEGORIZED_TH, _UNCATEGORIZED_EN, "-", "-"

    if category.level == 2 and category.parent_id:
        parent = (
            db.query(Category)
            .filter(Category.id == category.parent_id, Category.is_deleted.is_(False))
            .first()
        )
        if parent:
            return parent.name_th, parent.name_en, category.name_th, category.name_en
        return category.name_th, category.name_en, "-", "-"

    return category.name_th, category.name_en, "-", "-"


def list_agency_datasets(
    db: Session,
    user_id: uuid.UUID,
    pagination: PaginationParams,
    status_filter: str | None = None,
) -> tuple[list[dict[str, Any]], int]:
    query = db.query(Dataset).filter(
        Dataset.user_id == user_id,
        Dataset.is_deleted.is_(False),
    )
    if status_filter:
        query = query.filter(Dataset.status == status_filter)

    total = query.count()
    datasets = (
        query.order_by(Dataset.updated_at.desc())
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )

    items: list[dict[str, Any]] = []
    for dataset in datasets:
        cat_th, cat_en, sub_th, sub_en = _resolve_category_labels(
            db, dataset.category_id
        )
        items.append(
            {
                "id": dataset.id,
                "title": dataset.title,
                "title_en": dataset.title,
                "category": cat_th,
                "category_en": cat_en,
                "subcategory": sub_th,
                "subcategory_en": sub_en,
                "status": dataset.status,
                "quality_score": dataset.quality_score if dataset.quality_score is not None else 0,
                "download_count": dataset.download_count,
                "updated_at": dataset.updated_at,
            }
        )
    return items, total


def list_agency_activity_logs(
    db: Session,
    user_id: uuid.UUID,
    pagination: PaginationParams,
) -> tuple[list[dict[str, Any]], int]:
    query = (
        db.query(AuditLog, Dataset.title)
        .outerjoin(
            Dataset,
            (AuditLog.target_type == "dataset") & (AuditLog.target_id == Dataset.id),
        )
        .filter(AuditLog.user_id == user_id)
    )
    total = query.count()
    rows = (
        query.order_by(AuditLog.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )

    items: list[dict[str, Any]] = []
    for log, dataset_title in rows:
        items.append(
            {
                "created_at": log.created_at,
                "action": log.action,
                "target_type": log.target_type,
                "target_id": log.target_id,
                "dataset_title": dataset_title,
                "status": "success",
            }
        )
    return items, total
