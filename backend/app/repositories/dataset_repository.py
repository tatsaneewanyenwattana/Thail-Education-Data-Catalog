# Module: M2 Dataset
# Feature: Database Queries ตาม #56

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log_model import AuditLog
from app.models.dataset_file_model import DatasetFile
from app.models.dataset_model import Dataset
from app.models.dataset_tag_model import DatasetTag
from app.models.dataset_version_model import DatasetVersion


def create_dataset(
    db: Session,
    user_id: uuid.UUID,
    title: str,
    description: str | None,
    license: str,
    category_id: uuid.UUID | None,
    metadata: dict | None,
    quality_score: int | None,
) -> Dataset:
    dataset = Dataset(
        user_id=user_id,
        title=title,
        description=description,
        status="draft",
        license=license,
        category_id=category_id,
        dataset_metadata=metadata,
        quality_score=quality_score,
        download_count=0,
        view_count=0,
    )
    db.add(dataset)
    db.flush()
    return dataset


def get_dataset_by_id(db: Session, dataset_id: uuid.UUID) -> Dataset | None:
    return (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.is_deleted.is_(False))
        .first()
    )


def get_datasets(
    db: Session,
    page: int,
    page_size: int,
    filters: dict[str, Any] | None = None,
) -> tuple[list[Dataset], int]:
    query = db.query(Dataset).filter(Dataset.is_deleted.is_(False))
    if filters:
        if filters.get("status"):
            query = query.filter(Dataset.status == filters["status"])
        if filters.get("user_id"):
            query = query.filter(Dataset.user_id == filters["user_id"])
        if filters.get("category_id"):
            query = query.filter(Dataset.category_id == filters["category_id"])
    total = query.count()
    items = (
        query.order_by(Dataset.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def update_dataset(
    db: Session,
    dataset_id: uuid.UUID,
    **fields: Any,
) -> Dataset:
    from app.core.errors import raise_app_error

    dataset = get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")
    for key, value in fields.items():
        setattr(dataset, key, value)
    db.flush()
    return dataset


def increment_view_count(db: Session, dataset_id: uuid.UUID) -> None:
    dataset = get_dataset_by_id(db, dataset_id)
    if dataset is None:
        return
    dataset.view_count += 1
    db.flush()


def soft_delete_dataset(db: Session, dataset_id: uuid.UUID) -> None:
    from app.core.errors import raise_app_error

    dataset = get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")
    dataset.is_deleted = True
    db.flush()


def update_dataset_status(
    db: Session,
    dataset_id: uuid.UUID,
    status: str,
) -> Dataset:
    return update_dataset(db, dataset_id, status=status)


def create_dataset_version(
    db: Session,
    dataset_id: uuid.UUID,
    version_number: int,
    file_path: str,
    changelog: str | None,
    created_by: uuid.UUID,
) -> DatasetVersion:
    version = DatasetVersion(
        dataset_id=dataset_id,
        version_number=version_number,
        file_path=file_path,
        changelog=changelog,
        created_by=created_by,
    )
    db.add(version)
    db.flush()
    return version


def get_dataset_versions(
    db: Session, dataset_id: uuid.UUID
) -> list[DatasetVersion]:
    return (
        db.query(DatasetVersion)
        .filter(DatasetVersion.dataset_id == dataset_id)
        .order_by(DatasetVersion.version_number.desc())
        .all()
    )


def get_latest_dataset_file_format(db: Session, dataset_id: uuid.UUID) -> str | None:
    row = (
        db.query(DatasetFile.file_format)
        .filter(
            DatasetFile.dataset_id == dataset_id,
            DatasetFile.is_deleted.is_(False),
        )
        .order_by(DatasetFile.created_at.desc())
        .first()
    )
    return row[0] if row else None


def get_latest_dataset_file_info(db: Session, dataset_id: uuid.UUID) -> dict | None:
    row = (
        db.query(DatasetFile.file_name, DatasetFile.file_size, DatasetFile.file_format)
        .filter(
            DatasetFile.dataset_id == dataset_id,
            DatasetFile.is_deleted.is_(False),
        )
        .order_by(DatasetFile.created_at.desc())
        .first()
    )
    if not row:
        return None
    return {"file_name": row[0], "file_size": row[1], "file_format": row[2]}


def get_latest_version_number(db: Session, dataset_id: uuid.UUID) -> int:
    from sqlalchemy import func as sa_func

    result = (
        db.query(sa_func.max(DatasetVersion.version_number))
        .filter(DatasetVersion.dataset_id == dataset_id)
        .scalar()
    )
    return result or 0


def create_dataset_file(
    db: Session,
    dataset_id: uuid.UUID,
    file_name: str,
    file_path: str,
    file_size: int,
    file_format: str,
) -> DatasetFile:
    dataset_file = DatasetFile(
        dataset_id=dataset_id,
        file_name=file_name,
        file_path=file_path,
        file_size=file_size,
        file_format=file_format,
    )
    db.add(dataset_file)
    db.flush()
    return dataset_file


def create_dataset_tags(
    db: Session,
    dataset_id: uuid.UUID,
    tag_ids: list[uuid.UUID],
) -> None:
    for tag_id in tag_ids:
        dt = DatasetTag(dataset_id=dataset_id, tag_id=tag_id)
        db.add(dt)
    db.flush()


def delete_dataset_tags(db: Session, dataset_id: uuid.UUID) -> None:
    db.query(DatasetTag).filter(DatasetTag.dataset_id == dataset_id).delete(
        synchronize_session=False
    )
    db.flush()


def get_dataset_tag_ids(db: Session, dataset_id: uuid.UUID) -> list[uuid.UUID]:
    rows = (
        db.query(DatasetTag.tag_id)
        .filter(DatasetTag.dataset_id == dataset_id)
        .all()
    )
    return [r[0] for r in rows]


def create_audit_log(
    db: Session,
    user_id: uuid.UUID | None,
    action: str,
    target_type: str,
    target_id: uuid.UUID | None,
    detail: dict | None,
    ip_address: str,
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail,
        ip_address=ip_address,
    )
    db.add(log)
    db.flush()
    return log
