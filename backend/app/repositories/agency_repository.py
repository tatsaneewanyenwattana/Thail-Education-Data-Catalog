# Module: Agency Dashboard
# Feature: Database queries for agency dashboard stats

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.core.pagination import PaginationParams
from app.models.category_model import Category
from app.models.dataset_model import Dataset
from app.models.download_log_model import DownloadLog

_UNCATEGORIZED_TH = "ไม่ระบุหมวดหมู่"
_UNCATEGORIZED_EN = "Uncategorized"

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
    return {
        "total_datasets": _dataset_count(db, user_id),
        "published_datasets": _dataset_count(db, user_id, "published"),
        "draft_datasets": _dataset_count(db, user_id, "draft"),
        "submitted_datasets": _dataset_count(db, user_id, "submitted"),
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
