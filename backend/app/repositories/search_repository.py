# Module: M3 Search
# Feature: Filter options from published datasets ตาม #5 M3

import uuid
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

import app.repositories.category_repository as cat_repo
from app.models.category_model import Category
from app.models.dataset_file_model import DatasetFile
from app.models.dataset_model import Dataset
from app.models.dataset_tag_model import DatasetTag
from app.models.tag_model import Tag
from app.models.user_model import User


def _published_dataset_query(db: Session):
    return db.query(Dataset).filter(
        Dataset.is_deleted.is_(False),
        Dataset.status == "published",
    )


def _resolve_scoped_dataset_ids(
    db: Session, scope: dict[str, Any] | None
) -> set[uuid.UUID] | None:
    """None = ไม่จำกัด scope, set() = ไม่มี dataset ที่ตรงเงื่อนไข"""
    if not scope:
        return None

    query = _published_dataset_query(db)

    category_id = scope.get("category_id")
    if category_id:
        try:
            leaf_ids = cat_repo.get_descendant_leaf_category_ids(
                db, uuid.UUID(str(category_id))
            )
        except ValueError:
            return set()
        if not leaf_ids:
            return set()
        query = query.filter(Dataset.category_id.in_(leaf_ids))

    agency_user_id = scope.get("agency_user_id")
    if agency_user_id:
        try:
            query = query.filter(Dataset.user_id == uuid.UUID(str(agency_user_id)))
        except ValueError:
            return set()

    province = scope.get("province")
    if province:
        query = query.filter(
            Dataset.dataset_metadata["province"].astext == str(province)
        )

    return {row[0] for row in query.with_entities(Dataset.id).all()}


def _collect_years_from_datasets(db: Session, dataset_ids: set[uuid.UUID] | None) -> list[int]:
    query = _published_dataset_query(db)
    if dataset_ids is not None:
        if not dataset_ids:
            return []
        query = query.filter(Dataset.id.in_(dataset_ids))

    years: set[int] = set()
    for row in query.with_entities(Dataset.dataset_metadata).all():
        meta = row[0] or {}
        for key in ("year", "year_start", "year_end"):
            value = meta.get(key)
            if value is not None:
                try:
                    years.add(int(value))
                except (TypeError, ValueError):
                    continue
    return sorted(years, reverse=True)


def _collect_provinces_from_datasets(
    db: Session, dataset_ids: set[uuid.UUID] | None
) -> list[str]:
    query = (
        _published_dataset_query(db)
        .filter(Dataset.dataset_metadata["province"].isnot(None))
        .with_entities(Dataset.dataset_metadata["province"].astext.label("province"))
    )
    if dataset_ids is not None:
        if not dataset_ids:
            return []
        query = query.filter(Dataset.id.in_(dataset_ids))

    province_rows = query.distinct().all()
    return sorted(
        {str(row.province).strip() for row in province_rows if row.province},
        key=lambda v: (v != "all", v),
    )


def _collect_formats_from_datasets(
    db: Session, dataset_ids: set[uuid.UUID] | None
) -> list[str]:
    latest_file_subq = (
        db.query(
            DatasetFile.dataset_id.label("dataset_id"),
            DatasetFile.file_format.label("file_format"),
            func.row_number()
            .over(
                partition_by=DatasetFile.dataset_id,
                order_by=DatasetFile.created_at.desc(),
            )
            .label("rn"),
        )
        .join(Dataset, Dataset.id == DatasetFile.dataset_id)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
            DatasetFile.is_deleted.is_(False),
        )
        .subquery()
    )
    format_query = (
        db.query(latest_file_subq.c.file_format)
        .filter(latest_file_subq.c.rn == 1)
        .distinct()
    )
    if dataset_ids is not None:
        if not dataset_ids:
            return []
        format_query = format_query.filter(
            latest_file_subq.c.dataset_id.in_(dataset_ids)
        )

    format_rows = format_query.all()
    format_order = ["csv", "excel", "json", "xml", "pdf", "sql"]
    return [
        fmt
        for fmt in format_order
        if fmt in {row[0] for row in format_rows if row[0]}
    ]


def _collect_tags_from_datasets(
    db: Session, dataset_ids: set[uuid.UUID] | None
) -> list[str]:
    tag_query = (
        db.query(Tag.name)
        .join(DatasetTag, DatasetTag.tag_id == Tag.id)
        .join(Dataset, Dataset.id == DatasetTag.dataset_id)
        .filter(
            Tag.is_deleted.is_(False),
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
        )
    )
    if dataset_ids is not None:
        if not dataset_ids:
            return []
        tag_query = tag_query.filter(Dataset.id.in_(dataset_ids))

    tag_rows = tag_query.distinct().order_by(Tag.name.asc()).all()
    return [row[0] for row in tag_rows if row[0]]


def _collect_all_system_tags(db: Session) -> list[str]:
    tag_rows = (
        db.query(Tag.name)
        .filter(Tag.is_deleted.is_(False))
        .order_by(Tag.name.asc())
        .all()
    )
    return [row[0] for row in tag_rows if row[0]]


def _merge_filter_tags(
    db: Session, dataset_ids: set[uuid.UUID] | None
) -> list[str]:
    dataset_tags = _collect_tags_from_datasets(db, dataset_ids)
    system_tags = _collect_all_system_tags(db)
    return sorted(set(dataset_tags) | set(system_tags))


def get_search_filter_options(
    db: Session, scope: dict[str, Any] | None = None
) -> dict[str, Any]:
    """คืนตัวเลือก filter ที่มีข้อมูลจริงใน Dataset ที่เผยแพร่แล้ว"""
    scoped_ids = _resolve_scoped_dataset_ids(db, scope)

    category_query = _published_dataset_query(db).filter(
        Dataset.category_id.isnot(None)
    )
    if scoped_ids is not None:
        if not scoped_ids:
            category_ids_with_data: set[uuid.UUID] = set()
        else:
            category_query = category_query.filter(Dataset.id.in_(scoped_ids))
            category_ids_with_data = {
                row[0]
                for row in category_query.with_entities(Dataset.category_id)
                .distinct()
                .all()
                if row[0]
            }
    else:
        category_ids_with_data = {
            row[0]
            for row in category_query.with_entities(Dataset.category_id)
            .distinct()
            .all()
            if row[0]
        }

    categories: list[Category] = []
    if category_ids_with_data:
        categories = (
            db.query(Category)
            .filter(
                Category.is_deleted.is_(False),
                Category.id.in_(category_ids_with_data),
            )
            .order_by(Category.level.asc(), Category.name_th.asc())
            .all()
        )
        parent_ids = {c.parent_id for c in categories if c.parent_id}
        if parent_ids:
            parents = (
                db.query(Category)
                .filter(
                    Category.is_deleted.is_(False),
                    Category.id.in_(parent_ids),
                )
                .all()
            )
            by_id = {c.id: c for c in categories}
            for parent in parents:
                by_id.setdefault(parent.id, parent)
            categories = sorted(
                by_id.values(),
                key=lambda c: (c.level, c.name_th),
            )

    agency_query = (
        db.query(User.id, User.agency_name, User.agency_name_en)
        .join(Dataset, Dataset.user_id == User.id)
        .filter(
            User.role == "agency",
            User.status == "active",
            User.is_deleted.is_(False),
            User.agency_name.isnot(None),
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
        )
    )
    if scoped_ids is not None:
        if not scoped_ids:
            agency_rows = []
        else:
            agency_rows = (
                agency_query.filter(Dataset.id.in_(scoped_ids))
                .distinct()
                .order_by(User.agency_name.asc())
                .all()
            )
    else:
        agency_rows = agency_query.distinct().order_by(User.agency_name.asc()).all()

    agencies = [
        {"agency_user_id": row[0], "agency_name": row[1], "agency_name_en": row[2]}
        for row in agency_rows
        if row[1]
    ]

    return {
        "categories": categories,
        "agencies": agencies,
        "years": _collect_years_from_datasets(db, scoped_ids),
        "provinces": _collect_provinces_from_datasets(db, scoped_ids),
        "formats": _collect_formats_from_datasets(db, scoped_ids),
        "tags": _merge_filter_tags(db, scoped_ids),
    }
