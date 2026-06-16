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
    total_categories = int(
        db.query(func.count(Category.id))
        .filter(Category.is_deleted.is_(False))
        .scalar()
        or 0
    )
    level_rows = (
        db.query(Category.level, func.count(Category.id))
        .filter(Category.is_deleted.is_(False))
        .group_by(Category.level)
        .all()
    )
    categories_by_level = {
        str(int(row[0])): int(row[1]) for row in level_rows if row[0] is not None
    }

    return {
        "total_datasets": int(total_datasets),
        "total_downloads": int(total_downloads),
        "total_agencies": int(total_agencies),
        "total_categories": total_categories,
        "categories_by_level": categories_by_level,
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


def _category_ids_under_level1(db: Session, level1_id: uuid.UUID) -> list[uuid.UUID]:
    child_ids = (
        db.query(Category.id)
        .filter(
            Category.parent_id == level1_id,
            Category.is_deleted.is_(False),
        )
        .all()
    )
    return [level1_id] + [row[0] for row in child_ids]


def _resolve_level1_category(
    db: Session, category_id: uuid.UUID
) -> Category | None:
    """แมปหมวดหมู่ใดๆ (ระดับ 1 หรือ 2) ไปยังหมวดหมู่ใหญ่ระดับ 1"""
    cat = (
        db.query(Category)
        .filter(Category.id == category_id, Category.is_deleted.is_(False))
        .first()
    )
    if cat is None:
        return None
    if cat.level == 1:
        return cat
    if cat.parent_id is not None:
        parent = (
            db.query(Category)
            .filter(
                Category.id == cat.parent_id,
                Category.is_deleted.is_(False),
                Category.level == 1,
            )
            .first()
        )
        return parent
    return None


def get_stats_by_category(
    db: Session, category_id: uuid.UUID | None = None
) -> dict[str, Any]:
    """สถิติ Dataset แยกตามหมวดหมู่ระดับ 1 และแนวโน้มรายปี (กรองตามหมวดได้)"""
    published_filter = (
        Dataset.is_deleted.is_(False),
        Dataset.status == "published",
    )

    dataset_query = db.query(Dataset.category_id, func.count(Dataset.id)).filter(
        *published_filter
    )
    if category_id is not None:
        cat_ids = _category_ids_under_level1(db, category_id)
        dataset_query = dataset_query.filter(Dataset.category_id.in_(cat_ids))

    grouped_rows = dataset_query.group_by(Dataset.category_id).all()

    level1_counts: dict[uuid.UUID, int] = {}
    uncategorized_count = 0
    for row_category_id, row_count in grouped_rows:
        count = int(row_count or 0)
        if count <= 0:
            continue
        if row_category_id is None:
            uncategorized_count += count
            continue
        root = _resolve_level1_category(db, row_category_id)
        if root is None:
            uncategorized_count += count
            continue
        level1_counts[root.id] = level1_counts.get(root.id, 0) + count

    categories_breakdown: list[dict[str, Any]] = []
    if level1_counts:
        root_ids = list(level1_counts.keys())
        roots = (
            db.query(Category)
            .filter(Category.id.in_(root_ids), Category.is_deleted.is_(False))
            .all()
        )
        roots_by_id = {cat.id: cat for cat in roots}
        for root_id, count in sorted(
            level1_counts.items(), key=lambda item: item[1], reverse=True
        ):
            cat = roots_by_id.get(root_id)
            if cat is None:
                continue
            categories_breakdown.append(
                {
                    "id": str(cat.id),
                    "name_th": cat.name_th,
                    "name_en": cat.name_en,
                    "slug": cat.slug,
                    "count": count,
                }
            )

    if uncategorized_count > 0:
        categories_breakdown.append(
            {
                "id": None,
                "name_th": "ไม่ระบุหมวดหมู่",
                "name_en": "Uncategorized",
                "slug": "uncategorized",
                "count": uncategorized_count,
            }
        )

    year_query = db.query(
        extract("year", Dataset.published_at).label("year"),
        func.count(Dataset.id).label("count"),
    ).filter(*published_filter, Dataset.published_at.isnot(None))

    if category_id is not None:
        cat_ids = _category_ids_under_level1(db, category_id)
        year_query = year_query.filter(Dataset.category_id.in_(cat_ids))

    year_rows = (
        year_query.group_by(extract("year", Dataset.published_at))
        .order_by(extract("year", Dataset.published_at))
        .all()
    )

    datasets_by_year = [
        {"year": int(row.year), "count": int(row.count)}
        for row in year_rows
        if row.year is not None
    ]

    return {
        "categories": categories_breakdown,
        "datasets_by_year": datasets_by_year,
        "selected_category_id": str(category_id) if category_id else None,
    }


def get_trending_datasets(db: Session, limit: int) -> list[Dataset]:
    return (
        db.query(Dataset)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
        )
        .order_by(Dataset.view_count.desc(), Dataset.download_count.desc())
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
