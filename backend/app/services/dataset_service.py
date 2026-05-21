# Module: M2 Dataset
# Feature: Business Logic ตาม #5 #29 #30 #33 #34 #45 #46 #49 #56

import io
import logging
import uuid
from datetime import datetime, timezone

import pandas as pd
from fastapi import BackgroundTasks, UploadFile

import app.repositories.dataset_repository as dataset_repo
from app.core.config import settings
from app.core.errors import raise_app_error
from app.core.logging import get_logger, log_request
from app.core.pagination import PaginationParams
from app.schemas.dataset_schema import (
    BulkUploadResponse,
    BulkUploadRowError,
    DatasetCreateRequest,
    DatasetResponse,
    DatasetUpdateRequest,
    DatasetVersionResponse,
)
from app.utils.pii_masking import scan_and_mask
from app.utils.quality_score import calculate_quality_score
from sqlalchemy import or_
from sqlalchemy.orm import Session

logger = get_logger(__name__)

MAX_FILE_SIZE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/json",
}

MIME_TO_FORMAT = {
    "text/csv": "csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
    "application/vnd.ms-excel": "excel",
    "application/json": "json",
}


def _validate_file(file: UploadFile, content: bytes) -> str:
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise_app_error("FILE_TOO_LARGE")

    content_type = (file.content_type or "").split(";")[0].strip()
    if content_type not in ALLOWED_MIME_TYPES:
        raise_app_error("FILE_INVALID_FORMAT")

    filename = file.filename or ""
    parts = filename.split(".")
    if len(parts) > 2:
        raise_app_error("FILE_INVALID_FORMAT")

    return content_type


def _read_dataframe(content: bytes, content_type: str) -> pd.DataFrame:
    if content_type == "text/csv":
        return pd.read_csv(io.BytesIO(content))
    elif content_type == "application/json":
        return pd.read_json(io.BytesIO(content))
    else:
        return pd.read_excel(io.BytesIO(content))


def _save_to_minio(
    minio_client,
    dataset_id: uuid.UUID,
    content: bytes,
    ext: str,
) -> str:
    file_uuid = uuid.uuid4()
    object_name = f"datasets/{dataset_id}/{file_uuid}.{ext}"
    minio_client.put_object(
        settings.MINIO_BUCKET_NAME,
        object_name,
        io.BytesIO(content),
        length=len(content),
    )
    return object_name


def _delete_from_minio(minio_client, object_name: str) -> None:
    try:
        minio_client.remove_object(settings.MINIO_BUCKET_NAME, object_name)
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"MinIO delete failed: {exc}",
            error_code="FILE_UPLOAD_FAILED",
        )


_SAFE_METADATA_KEYS = frozenset({"year", "province", "agency"})


def _metadata_for_search(metadata: dict | None) -> dict | None:
    """ส่งเฉพาะฟิลด์ DCAT-AP ที่กำหนดใน #21 — ไม่ index คอลัมน์ไฟล์ที่ Mask แล้ว ตาม #46"""
    if not metadata or not isinstance(metadata, dict):
        return None
    filtered = {k: v for k, v in metadata.items() if k in _SAFE_METADATA_KEYS}
    return filtered or None


def _build_dataset_index_document(db: Session, dataset) -> dict:
    from app.models.tag_model import Tag
    from app.models.user_model import User

    user = db.query(User).filter(User.id == dataset.user_id).first()
    tag_ids = dataset_repo.get_dataset_tag_ids(db, dataset.id)
    tag_names: list[str] = []
    if tag_ids:
        tags = db.query(Tag.name).filter(Tag.id.in_(tag_ids)).all()
        tag_names = [t[0] for t in tags]

    published_at = dataset.published_at
    if published_at is not None:
        published_at = published_at.isoformat()

    return {
        "id": str(dataset.id),
        "title": dataset.title,
        "description": dataset.description,
        "tags": tag_names,
        "agency_name": user.agency_name if user else None,
        "category_id": str(dataset.category_id) if dataset.category_id else None,
        "user_id": str(dataset.user_id),
        "license": dataset.license,
        "status": dataset.status,
        "published_at": published_at,
        "download_count": dataset.download_count,
        "quality_score": dataset.quality_score,
        "metadata": _metadata_for_search(dataset.dataset_metadata),
    }


def _send_email_background(to: str, subject: str, body: str) -> None:
    try:
        import smtplib
        if not settings.SMTP_HOST:
            return
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            msg = (
                f"Subject: {subject}\r\nFrom: {settings.SMTP_FROM}\r\n"
                f"To: {to}\r\n\r\n{body}"
            )
            server.sendmail(settings.SMTP_FROM, to, msg)
    except Exception as exc:
        log_request(
            logger, logging.ERROR, f"Email send failed: {exc}",
            error_code="INTERNAL_SERVER_ERROR",
        )


def _get_subscriber_emails(
    db: Session,
    category_id: uuid.UUID | None,
    agency_user_id: uuid.UUID,
) -> list[str]:
    from app.models.subscription_model import Subscription
    from app.models.user_model import User

    conditions = [Subscription.agency_user_id == agency_user_id]
    if category_id is not None:
        conditions.append(Subscription.category_id == category_id)

    rows = (
        db.query(User.email)
        .join(Subscription, Subscription.user_id == User.id)
        .filter(or_(*conditions))
        .filter(User.is_deleted.is_(False))
        .distinct()
        .all()
    )
    return [row[0] for row in rows]


def _notify_subscribers_background(
    emails: list[str],
    dataset_title: str,
    dataset_id: str,
) -> None:
    subject = "มี Dataset ใหม่ในหมวดที่คุณติดตาม"
    body = f"ชื่อ Dataset: {dataset_title}\nLink: /datasets/{dataset_id}"
    for email in emails:
        try:
            _send_email_background(email, subject, body)
        except Exception as exc:
            log_request(
                logger,
                logging.ERROR,
                f"Subscriber notification failed for {email}: {exc}",
                error_code="INTERNAL_SERVER_ERROR",
            )


def _build_dataset_response(
    db: Session, dataset_id: uuid.UUID
) -> DatasetResponse:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    tag_ids = dataset_repo.get_dataset_tag_ids(db, dataset_id)
    data = DatasetResponse.model_validate(dataset)
    data.tags = tag_ids
    return data


def upload(
    db: Session,
    minio_client,
    es_client,
    background_tasks: BackgroundTasks,
    file: UploadFile,
    request: DatasetCreateRequest,
    current_user: dict,
    ip_address: str,
) -> DatasetResponse:
    content = file.file.read()
    content_type = _validate_file(file, content)
    file_format = MIME_TO_FORMAT[content_type]
    ext = file_format if file_format != "excel" else "xlsx"

    df = _read_dataframe(content, content_type)
    masked_df, masked_columns = scan_and_mask(df)
    quality_score = calculate_quality_score(masked_df)

    if file_format == "csv":
        masked_content = masked_df.to_csv(index=False).encode("utf-8")
    elif file_format == "json":
        masked_content = masked_df.to_json(orient="records", force_ascii=False).encode("utf-8")
    else:
        buf = io.BytesIO()
        masked_df.to_excel(buf, index=False)
        masked_content = buf.getvalue()

    object_name: str | None = None
    try:
        dataset = dataset_repo.create_dataset(
            db,
            user_id=uuid.UUID(current_user["sub"]),
            title=request.title,
            description=request.description,
            license=request.license,
            category_id=request.category_id,
            metadata=request.metadata,
            quality_score=quality_score,
        )

        object_name = _save_to_minio(minio_client, dataset.id, masked_content, ext)

        dataset_repo.create_dataset_file(
            db,
            dataset_id=dataset.id,
            file_name=file.filename or f"{dataset.id}.{ext}",
            file_path=object_name,
            file_size=len(masked_content),
            file_format=file_format,
        )
        dataset_repo.create_dataset_version(
            db,
            dataset_id=dataset.id,
            version_number=1,
            file_path=object_name,
            changelog="Initial upload",
            created_by=uuid.UUID(current_user["sub"]),
        )
        if request.tags:
            dataset_repo.create_dataset_tags(db, dataset.id, request.tags)

        dataset.status = "published"
        dataset.published_at = datetime.now(timezone.utc)

        dataset_repo.create_audit_log(
            db,
            user_id=uuid.UUID(current_user["sub"]),
            action="dataset.upload",
            target_type="dataset",
            target_id=dataset.id,
            detail={"masked_columns": masked_columns, "quality_score": quality_score},
            ip_address=ip_address,
        )

        db.commit()
        db.refresh(dataset)

    except Exception as exc:
        import traceback, sys
        print(traceback.format_exc(), file=sys.stderr, flush=True)
        logger.error(f"UPLOAD ERROR: {traceback.format_exc()}")
        db.rollback()
        if object_name:
            _delete_from_minio(minio_client, object_name)
        raise_app_error("FILE_UPLOAD_FAILED", str(exc))

    subscriber_emails = _get_subscriber_emails(
        db, request.category_id, dataset.user_id
    )

    from app.utils.elasticsearch_utils import index_dataset

    index_doc = _build_dataset_index_document(db, dataset)
    background_tasks.add_task(index_dataset, es_client, index_doc)
    if subscriber_emails:
        background_tasks.add_task(
            _notify_subscribers_background,
            subscriber_emails,
            dataset.title,
            str(dataset.id),
        )

    return _build_dataset_response(db, dataset.id)


def get_dataset(db: Session, dataset_id: uuid.UUID) -> DatasetResponse:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")
    return _build_dataset_response(db, dataset_id)


def list_datasets(
    db: Session,
    pagination: PaginationParams,
    status_filter: str = "published",
    user_id: uuid.UUID | None = None,
) -> tuple[list[DatasetResponse], int]:
    filters: dict = {"status": status_filter}
    if user_id:
        filters["user_id"] = user_id
    items, total = dataset_repo.get_datasets(
        db, page=pagination.page, page_size=pagination.page_size, filters=filters
    )
    responses = []
    for ds in items:
        tag_ids = dataset_repo.get_dataset_tag_ids(db, ds.id)
        r = DatasetResponse.model_validate(ds)
        r.tags = tag_ids
        responses.append(r)
    return responses, total


def update_dataset(
    db: Session,
    dataset_id: uuid.UUID,
    request: DatasetUpdateRequest,
    current_user: dict,
    ip_address: str,
) -> DatasetResponse:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")

    if current_user.get("role") != "admin":
        if str(dataset.user_id) != current_user["sub"]:
            raise_app_error("DATASET_PERMISSION_DENIED")

    fields: dict = {}
    if request.title is not None:
        fields["title"] = request.title
    if request.description is not None:
        fields["description"] = request.description
    if request.license is not None:
        fields["license"] = request.license
    if request.category_id is not None:
        fields["category_id"] = request.category_id
    if request.metadata is not None:
        fields["metadata"] = request.metadata

    if fields:
        dataset_repo.update_dataset(db, dataset_id, **fields)

    if request.tags is not None:
        dataset_repo.delete_dataset_tags(db, dataset_id)
        if request.tags:
            dataset_repo.create_dataset_tags(db, dataset_id, request.tags)

    dataset_repo.create_audit_log(
        db,
        user_id=uuid.UUID(current_user["sub"]),
        action="dataset.update",
        target_type="dataset",
        target_id=dataset_id,
        detail={"updated_fields": list(fields.keys())},
        ip_address=ip_address,
    )
    db.commit()
    return _build_dataset_response(db, dataset_id)


def delete_dataset(
    db: Session,
    dataset_id: uuid.UUID,
    current_user: dict,
    ip_address: str,
    background_tasks: BackgroundTasks | None = None,
    es_client=None,
) -> None:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")

    if current_user.get("role") != "admin":
        if str(dataset.user_id) != current_user["sub"]:
            raise_app_error("DATASET_PERMISSION_DENIED")

    dataset_repo.soft_delete_dataset(db, dataset_id)
    dataset_repo.create_audit_log(
        db,
        user_id=uuid.UUID(current_user["sub"]),
        action="dataset.delete",
        target_type="dataset",
        target_id=dataset_id,
        detail=None,
        ip_address=ip_address,
    )
    db.commit()

    if background_tasks is not None and es_client is not None:
        from app.utils.elasticsearch_utils import delete_dataset_index

        background_tasks.add_task(
            delete_dataset_index, es_client, str(dataset_id)
        )


def get_versions(
    db: Session,
    dataset_id: uuid.UUID,
    current_user: dict,
) -> list[DatasetVersionResponse]:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")

    if current_user.get("role") != "admin":
        if str(dataset.user_id) != current_user["sub"]:
            raise_app_error("DATASET_PERMISSION_DENIED")

    versions = dataset_repo.get_dataset_versions(db, dataset_id)
    return [DatasetVersionResponse.model_validate(v) for v in versions]


def restore_version(
    db: Session,
    dataset_id: uuid.UUID,
    version_number: int,
    current_user: dict,
    ip_address: str,
) -> DatasetResponse:
    from datetime import datetime, timezone

    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")

    if current_user.get("role") != "admin":
        if str(dataset.user_id) != current_user["sub"]:
            raise_app_error("DATASET_PERMISSION_DENIED")

    versions = dataset_repo.get_dataset_versions(db, dataset_id)
    target = next((v for v in versions if v.version_number == version_number), None)
    if target is None:
        raise_app_error("NOT_FOUND")

    new_version_number = dataset_repo.get_latest_version_number(db, dataset_id) + 1
    dataset_repo.create_dataset_version(
        db,
        dataset_id=dataset_id,
        version_number=new_version_number,
        file_path=target.file_path,
        changelog=f"Restored from version {version_number}",
        created_by=uuid.UUID(current_user["sub"]),
    )
    dataset_repo.update_dataset(
        db, dataset_id, updated_at=datetime.now(timezone.utc)
    )
    dataset_repo.create_audit_log(
        db,
        user_id=uuid.UUID(current_user["sub"]),
        action="dataset.restore_version",
        target_type="dataset",
        target_id=dataset_id,
        detail={"restored_from_version": version_number},
        ip_address=ip_address,
    )
    db.commit()
    return _build_dataset_response(db, dataset_id)


def get_quality_score(
    db: Session,
    dataset_id: uuid.UUID,
    current_user: dict,
) -> int | None:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")

    if current_user.get("role") != "admin":
        if str(dataset.user_id) != current_user["sub"]:
            raise_app_error("DATASET_PERMISSION_DENIED")

    return dataset.quality_score


def bulk_upload(
    db: Session,
    minio_client,
    es_client,
    background_tasks: BackgroundTasks,
    file: UploadFile,
    current_user: dict,
    ip_address: str,
) -> BulkUploadResponse:
    content = file.file.read()
    content_type = (file.content_type or "").split(";")[0].strip()
    is_excel = content_type in (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    )
    if not is_excel:
        raise_app_error("FILE_INVALID_FORMAT")

    try:
        template_df = pd.read_excel(io.BytesIO(content))
    except Exception:
        raise_app_error("FILE_INVALID_FORMAT")

    success_count = 0
    errors: list[BulkUploadRowError] = []

    for idx, row in template_df.iterrows():
        row_num = int(idx) + 2
        try:
            title = str(row.get("title", "")).strip()
            license_val = str(row.get("license", "")).strip()
            if not title:
                raise ValueError("title is required")
            if license_val not in ("open", "conditional", "cc"):
                raise ValueError("license must be open/conditional/cc")

            row_request = DatasetCreateRequest(
                title=title,
                description=str(row.get("description", "") or "").strip() or None,
                license=license_val,
            )
            row_df = pd.DataFrame([row.to_dict()])
            masked_df, masked_columns = scan_and_mask(row_df)
            quality_score = calculate_quality_score(masked_df)

            buf = io.BytesIO()
            masked_df.to_excel(buf, index=False)
            masked_content = buf.getvalue()

            dataset = dataset_repo.create_dataset(
                db,
                user_id=uuid.UUID(current_user["sub"]),
                title=row_request.title,
                description=row_request.description,
                license=row_request.license,
                category_id=None,
                metadata=None,
                quality_score=quality_score,
            )
            dataset.status = "published"
            dataset.published_at = datetime.now(timezone.utc)

            object_name = _save_to_minio(
                minio_client, dataset.id, masked_content, "xlsx"
            )
            dataset_repo.create_dataset_file(
                db,
                dataset_id=dataset.id,
                file_name=f"bulk_row_{row_num}.xlsx",
                file_path=object_name,
                file_size=len(masked_content),
                file_format="excel",
            )
            dataset_repo.create_dataset_version(
                db,
                dataset_id=dataset.id,
                version_number=1,
                file_path=object_name,
                changelog="Bulk upload",
                created_by=uuid.UUID(current_user["sub"]),
            )
            dataset_repo.create_audit_log(
                db,
                user_id=uuid.UUID(current_user["sub"]),
                action="dataset.bulk_upload",
                target_type="dataset",
                target_id=dataset.id,
                detail={"row": row_num, "masked_columns": masked_columns},
                ip_address=ip_address,
            )
            db.commit()
            success_count += 1

            subscriber_emails = _get_subscriber_emails(
                db, dataset.category_id, dataset.user_id
            )
            if subscriber_emails:
                background_tasks.add_task(
                    _notify_subscribers_background,
                    subscriber_emails,
                    dataset.title,
                    str(dataset.id),
                )
        except Exception as exc:
            db.rollback()
            errors.append(BulkUploadRowError(row=row_num, error=str(exc)))

    return BulkUploadResponse(
        success_count=success_count,
        error_count=len(errors),
        errors=errors,
    )
