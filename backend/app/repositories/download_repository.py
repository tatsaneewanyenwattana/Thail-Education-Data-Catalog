# Module: M4 Download
# Feature: Database Queries ตาม #56

import uuid

from sqlalchemy.orm import Session

from app.models.dataset_model import Dataset
from app.models.download_log_model import DownloadLog


def create_download_log(
    db: Session,
    dataset_id: uuid.UUID,
    user_id: uuid.UUID | None,
    ip_address: str,
    purpose: str,
    file_format: str,
) -> DownloadLog:
    log = DownloadLog(
        dataset_id=dataset_id,
        user_id=user_id,
        ip_address=ip_address,
        purpose=purpose,
        file_format=file_format,
    )
    db.add(log)
    db.flush()
    return log


def increment_download_count(db: Session, dataset_id: uuid.UUID) -> None:
    from app.core.errors import raise_app_error

    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.is_deleted.is_(False))
        .first()
    )
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")
    dataset.download_count += 1
    db.flush()
