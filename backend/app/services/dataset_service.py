# Module: M2 Dataset
# Feature: Business Logic ตาม #5 #29 #30 #33 #34 #45 #46 #49 #56

import io
import logging
import uuid
from datetime import datetime, timezone

import magic
import pandas as pd
from fastapi import BackgroundTasks, UploadFile

import app.repositories.dataset_repository as dataset_repo
import app.repositories.tag_repository as tag_repo
import app.services.category_service as category_service
import app.services.email_service as email_service
from app.core.config import settings
from app.core.errors import raise_app_error
from app.core.logging import get_logger, log_request
from app.core.pagination import PaginationParams
from app.models.user_model import User
from app.schemas.admin_schema import AdminDatasetListItem
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
from sqlalchemy.orm import Session

logger = get_logger(__name__)

BULK_UPLOAD_METADATA_COLUMNS = frozenset(
    {
        "title",
        "description",
        "category_id",
        "subcategory_id",
        "license",
        "tags",
        "year",
        "province",
        "year_start",
        "year_end",
        "status",
    }
)

BULK_UPLOAD_TEMPLATE_COLUMNS = [
    "title",
    "description",
    "category_id",
    "subcategory_id",
    "license",
    "tags",
    "year",
    "province",
    "sample_value",
]


def generate_bulk_upload_template() -> bytes:
    """สร้างไฟล์ Excel Template สำหรับ Bulk Upload"""
    example_row = {
        "title": "ตัวอย่าง Dataset",
        "description": "คำอธิบายชุดข้อมูล",
        "category_id": "",
        "subcategory_id": "your-subcategory-slug",
        "license": "open",
        "tags": "",
        "year": "2567",
        "province": "กรุงเทพมหานคร",
        "sample_value": 1000,
    }
    datasets_df = pd.DataFrame([example_row], columns=BULK_UPLOAD_TEMPLATE_COLUMNS)
    guide_df = pd.DataFrame(
        [
            {
                "column": "title",
                "required": "ใช่",
                "description": "ชื่อ Dataset (ขั้นต่ำ 3 ตัวอักษร)",
            },
            {
                "column": "description",
                "required": "ไม่",
                "description": "คำอธิบาย Dataset",
            },
            {
                "column": "category_id",
                "required": "ไม่",
                "description": "slug หรือ UUID หมวดระดับ 1 (ใช้เมื่อไม่ระบุ subcategory_id)",
            },
            {
                "column": "subcategory_id",
                "required": "แนะนำ",
                "description": "slug หรือ UUID หมวดระดับ 2 (ใบ) ของหน่วยงานคุณ",
            },
            {
                "column": "license",
                "required": "ใช่",
                "description": "open | conditional | cc",
            },
            {
                "column": "tags",
                "required": "ไม่",
                "description": "ชื่อแท็กคั่นด้วยเครื่องหมายจุลภาค",
            },
            {
                "column": "year",
                "required": "ไม่",
                "description": "ปี พ.ศ. 4 หลัก",
            },
            {
                "column": "province",
                "required": "ไม่",
                "description": "จังหวัด",
            },
            {
                "column": "sample_value",
                "required": "ตัวอย่าง",
                "description": "คอลัมน์ข้อมูลอื่นๆ ที่ไม่ใช่ metadata จะถูกบันทึกเป็นข้อมูลใน Dataset",
            },
        ]
    )

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        datasets_df.to_excel(writer, index=False, sheet_name="datasets")
        guide_df.to_excel(writer, index=False, sheet_name="guide")
    return buffer.getvalue()


def _bulk_cell_str(value: object) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip()
    return text or None


def _resolve_bulk_row_category_id(
    db: Session,
    row: pd.Series,
    current_user: dict,
) -> uuid.UUID | None:
    import app.repositories.category_repository as cat_repo

    subcategory_ref = _bulk_cell_str(row.get("subcategory_id"))
    category_ref = _bulk_cell_str(row.get("category_id"))
    reference = subcategory_ref or category_ref
    if reference is None:
        return None

    category = None
    try:
        category = cat_repo.get_category_by_id(db, uuid.UUID(reference))
    except ValueError:
        category = cat_repo.get_category_by_slug(db, reference)

    if category is None:
        raise ValueError("ไม่พบหมวดหมู่ที่ระบุ")

    if current_user.get("role") != "admin":
        if str(category.created_by) != current_user["sub"]:
            raise ValueError("ไม่มีสิทธิ์ใช้หมวดหมู่นี้")

    if not cat_repo.is_leaf_category(db, category.id):
        raise ValueError("ต้องเลือกหมวดหมู่ระดับย่อย (ใบ) เท่านั้น")

    return category.id

MAX_FILE_SIZE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/json",
    "application/pdf",
}

SQL_MIME_TYPES = {
    "text/plain",
    "application/octet-stream",
    "application/sql",
    "text/x-sql",
}

MIME_TO_FORMAT = {
    "text/csv": "csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
    "application/vnd.ms-excel": "excel",
    "application/json": "json",
    "application/pdf": "pdf",
}

FORMAT_TO_EXT = {
    "csv": "csv",
    "excel": "xlsx",
    "json": "json",
    "pdf": "pdf",
    "sql": "sql",
}


def _validate_file(file: UploadFile, content: bytes) -> str:
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise_app_error("FILE_TOO_LARGE")

    filename = file.filename or ""
    parts = filename.split(".")
    if len(parts) > 2:
        raise_app_error("FILE_INVALID_FORMAT")

    ext = parts[-1].lower() if len(parts) > 1 else ""
    content_type = (file.content_type or "").split(";")[0].strip()
    actual_mime = magic.from_buffer(content, mime=True)

    if ext == "sql":
        if content_type in SQL_MIME_TYPES or actual_mime in SQL_MIME_TYPES:
            return "sql"
        raise_app_error("FILE_INVALID_FORMAT")

    if content_type not in ALLOWED_MIME_TYPES:
        raise_app_error("FILE_INVALID_FORMAT")

    if actual_mime not in ALLOWED_MIME_TYPES:
        raise_app_error("INVALID_MIME_TYPE")

    return MIME_TO_FORMAT[content_type]


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


_SAFE_METADATA_KEYS = frozenset({"year", "year_start", "year_end", "province", "agency"})


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
        "file_format": dataset_repo.get_latest_dataset_file_format(db, dataset.id),
        "status": dataset.status,
        "published_at": published_at,
        "download_count": dataset.download_count,
        "quality_score": dataset.quality_score,
        "metadata": _metadata_for_search(dataset.dataset_metadata),
    }


def _resolve_category_names(
    db: Session, category_id: uuid.UUID | None
) -> tuple[str | None, str | None]:
    from app.models.category_model import Category

    if category_id is None:
        return None, None
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.is_deleted.is_(False))
        .first()
    )
    if category is None:
        return None, None
    if category.level == 2 and category.parent_id is not None:
        parent = (
            db.query(Category)
            .filter(
                Category.id == category.parent_id,
                Category.is_deleted.is_(False),
            )
            .first()
        )
        if parent is not None:
            return parent.name_th, parent.name_en
    return category.name_th, category.name_en


def _build_dataset_response(
    db: Session, dataset_id: uuid.UUID
) -> DatasetResponse:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    tag_ids = dataset_repo.get_dataset_tag_ids(db, dataset_id)
    data = DatasetResponse.model_validate(dataset)
    data.tags = tag_ids
    owner = db.query(User).filter(User.id == dataset.user_id).first()
    data.agency_name = owner.agency_name if owner else None
    name_th, name_en = _resolve_category_names(db, dataset.category_id)
    data.category_name_th = name_th
    data.category_name_en = name_en
    data.file_format = dataset_repo.get_latest_dataset_file_format(db, dataset_id)
    return data


def record_dataset_view(db: Session, dataset_id: uuid.UUID) -> None:
    """บันทึกการเข้าชม Dataset ที่เผยแพร่แล้ว"""
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None or dataset.status != "published":
        return
    dataset_repo.increment_view_count(db, dataset_id)
    db.commit()


def run_full_pii_scan(
    dataset_id: uuid.UUID,
    content: bytes,
    content_type: str,
) -> None:
    from app.core.database import SessionLocal
    from app.pii.detector import detect_pii
    from app.pii.repository import save_scan_results

    SCANNABLE = {
        "text/csv",
        "application/json",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    }

    db = SessionLocal()
    try:
        if content_type not in SCANNABLE:
            logger.warning(
                f"Full PII scan skipped (unsupported type): {dataset_id}"
            )
            return

        if content_type == "text/csv":
            df = pd.read_csv(io.BytesIO(content))
        elif content_type == "application/json":
            df = pd.read_json(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))

        result = detect_pii(df, sample_size=len(df))
        save_scan_results(db, dataset_id, result.findings, "full")

        if result.has_pii:
            logger.warning(
                f"Full PII scan found PII in dataset {dataset_id}: "
                f"{[f.pii_type for f in result.findings]}"
            )
    except Exception as exc:
        logger.error(f"Full PII scan error for dataset {dataset_id}: {exc}")
    finally:
        db.close()


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
    from app.utils.pii_masking import mask_text_content

    content = file.file.read()
    file_format = _validate_file(file, content)
    ext = FORMAT_TO_EXT[file_format]
    masked_columns: list[str] = []

    if file_format == "sql":
        text = content.decode("utf-8", errors="replace")
        masked_content = mask_text_content(text).encode("utf-8")
        quality_score = None
    elif file_format == "pdf":
        masked_content = content
        quality_score = None
    else:
        content_type = next(
            (mime for mime, fmt in MIME_TO_FORMAT.items() if fmt == file_format),
            "text/csv",
        )
        df = _read_dataframe(content, content_type)
        masked_df, masked_columns = scan_and_mask(df)
        quality_score = calculate_quality_score(masked_df)

        if file_format == "csv":
            masked_content = masked_df.to_csv(index=False).encode("utf-8")
        elif file_format == "json":
            masked_content = masked_df.to_json(
                orient="records", force_ascii=False
            ).encode("utf-8")
        else:
            buf = io.BytesIO()
            masked_df.to_excel(buf, index=False)
            masked_content = buf.getvalue()

    if request.category_id is not None:
        category_service.validate_category_is_leaf(db, request.category_id)

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
        tag_ids = list(request.tags)
        if request.tag_names:
            for raw_name in request.tag_names:
                tag_name = str(raw_name).strip()
                if not tag_name:
                    continue
                existing_tag = tag_repo.get_tag_by_name(db, tag_name)
                if existing_tag is None:
                    existing_tag = tag_repo.create_tag(db, tag_name)
                if existing_tag.id not in tag_ids:
                    tag_ids.append(existing_tag.id)

        if tag_ids:
            dataset_repo.create_dataset_tags(db, dataset.id, tag_ids)

        role = current_user.get("role")
        requested_status = (request.status or "draft").lower()
        if role == "admin":
            # Admin เผยแพร่ทันทีเสมอ
            dataset.status = "published"
            dataset.published_at = datetime.now(timezone.utc)
        elif requested_status == "published":
            # Agency เลือกเผยแพร่ทันที
            dataset.status = "published"
            dataset.published_at = datetime.now(timezone.utc)
        else:
            # Agency บันทึก Draft
            dataset.status = "draft"
            dataset.published_at = None

        dataset_repo.create_audit_log(
            db,
            user_id=uuid.UUID(current_user["sub"]),
            action="dataset.upload",
            target_type="dataset",
            target_id=dataset.id,
            detail={
                "masked_columns": masked_columns,
                "quality_score": quality_score,
                "status": dataset.status,
            },
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

    if dataset.status == "published":
        from app.utils.elasticsearch_utils import index_dataset
        import app.services.notification_service as notification_service

        index_doc = _build_dataset_index_document(db, dataset)
        background_tasks.add_task(index_dataset, es_client, index_doc)
        notification_service.notify_subscribers_new_dataset(db, dataset)
        db.commit()
        email_service.notify_subscribers_new_dataset(background_tasks, db, dataset)
        email_service.notify_saved_search(background_tasks, db, dataset)
        background_tasks.add_task(
            run_full_pii_scan,
            dataset.id,
            content,
            file.content_type or "",
        )
    return _build_dataset_response(db, dataset.id)


def publish_dataset_directly(
    db: Session,
    dataset_id: uuid.UUID,
    current_user: dict,
    ip_address: str,
    background_tasks: BackgroundTasks,
    es_client=None,
) -> DatasetResponse:
    """Agency เผยแพร่ Dataset ที่เป็น draft ทันที (ไม่ต้องรอ Admin)."""
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")

    role = current_user.get("role")
    if role != "admin" and str(dataset.user_id) != current_user["sub"]:
        raise_app_error("DATASET_PERMISSION_DENIED")

    now = datetime.now(timezone.utc)
    dataset_repo.update_dataset(db, dataset_id, status="published", published_at=now)
    dataset_repo.create_audit_log(
        db,
        user_id=uuid.UUID(current_user["sub"]),
        action="dataset.publish",
        target_type="dataset",
        target_id=dataset_id,
        detail=None,
        ip_address=ip_address,
    )
    db.commit()

    refreshed = dataset_repo.get_dataset_by_id(db, dataset_id)
    if refreshed:
        import app.services.notification_service as notification_service

        notification_service.notify_subscribers_new_dataset(db, refreshed)
        db.commit()
        if es_client:
            from app.utils.elasticsearch_utils import index_dataset
            index_doc = _build_dataset_index_document(db, refreshed)
            background_tasks.add_task(index_dataset, es_client, index_doc)
        email_service.notify_subscribers_new_dataset(background_tasks, db, refreshed)
        email_service.notify_saved_search(background_tasks, db, refreshed)

    return _build_dataset_response(db, dataset_id)


def hide_dataset(
    db: Session,
    dataset_id: uuid.UUID,
    current_user: dict,
    ip_address: str,
    background_tasks: BackgroundTasks,
    es_client,
) -> DatasetResponse:
    """Admin ซ่อน Dataset ที่ไม่เหมาะสมด้วย Soft Delete (is_deleted = true) ตาม #5 M6, #15."""
    if current_user.get("role") != "admin":
        raise_app_error("AUTH_PERMISSION_DENIED")

    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")

    # สร้าง response ก่อน Soft Delete เพราะหลังลบจะ query Dataset ไม่เจอแล้ว
    response = _build_dataset_response(db, dataset_id)

    dataset_repo.soft_delete_dataset(db, dataset_id)
    dataset_repo.create_audit_log(
        db,
        user_id=uuid.UUID(current_user["sub"]),
        action="dataset.hide",
        target_type="dataset",
        target_id=dataset_id,
        detail=None,
        ip_address=ip_address,
    )
    db.commit()

    from app.utils.elasticsearch_utils import delete_dataset_index as es_delete
    background_tasks.add_task(es_delete, es_client, str(dataset_id))

    return response


def can_view_dataset(dataset, current_user: dict | None) -> bool:
    if dataset.status == "published":
        return True
    if current_user and current_user.get("role") == "admin":
        return True
    if current_user:
        current_user_id = current_user.get("sub") or current_user.get("id")
        if current_user_id and str(dataset.user_id) == str(current_user_id):
            return True
    return False


def get_dataset(
    db: Session, dataset_id: uuid.UUID, current_user: dict | None = None
) -> DatasetResponse:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")
    if not can_view_dataset(dataset, current_user):
        raise_app_error("DATASET_NOT_FOUND")
    if dataset.status == "published":
        record_dataset_view(db, dataset_id)
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
        owner = db.query(User).filter(User.id == ds.user_id).first()
        r = DatasetResponse.model_validate(ds)
        r.tags = tag_ids
        r.agency_name = owner.agency_name if owner else None
        r.file_format = dataset_repo.get_latest_dataset_file_format(db, ds.id)
        responses.append(r)
    return responses, total


def list_admin_datasets(
    db: Session,
    pagination: PaginationParams,
    status_filter: str | None = None,
    search: str | None = None,
    agency_filter: str | None = None,
) -> tuple[list[AdminDatasetListItem], int]:
    """รายการ Dataset ทุกหน่วยงาน ทุก status สำหรับ Admin (GET /datasets?all=true)."""
    from sqlalchemy import or_

    from app.models.dataset_model import Dataset
    from app.models.user_model import User
    from app.repositories.agency_repository import _resolve_category_labels

    query = (
        db.query(Dataset, User)
        .join(User, Dataset.user_id == User.id)
        .filter(Dataset.is_deleted.is_(False), User.is_deleted.is_(False))
    )

    if status_filter and status_filter != "all":
        query = query.filter(Dataset.status == status_filter)
    if agency_filter and agency_filter != "all":
        query = query.filter(User.agency_name == agency_filter)
    if search and search.strip():
        keyword = f"%{search.strip()}%"
        query = query.filter(Dataset.title.ilike(keyword))

    total = query.count()

    sort_col = Dataset.updated_at
    if pagination.sort == "created_at":
        sort_col = Dataset.created_at
    elif pagination.sort == "title":
        sort_col = Dataset.title
    order = sort_col.desc() if pagination.order == "desc" else sort_col.asc()

    rows = (
        query.order_by(order)
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )

    items: list[AdminDatasetListItem] = []
    for dataset, user in rows:
        cat_th, cat_en, _, _ = _resolve_category_labels(db, dataset.category_id)
        agency_name = (user.agency_name or user.email).strip()
        items.append(
            AdminDatasetListItem(
                id=dataset.id,
                title=dataset.title,
                title_en=dataset.title,
                agency=agency_name,
                agency_en=agency_name,
                category=cat_th,
                category_en=cat_en,
                status=dataset.status,
                quality_score=dataset.quality_score if dataset.quality_score is not None else 0,
                updated_at=dataset.updated_at,
            )
        )
    return items, total


def list_admin_dataset_agencies(db: Session) -> list[str]:
    from app.models.dataset_model import Dataset
    from app.models.user_model import User

    rows = (
        db.query(User.agency_name)
        .join(Dataset, Dataset.user_id == User.id)
        .filter(Dataset.is_deleted.is_(False), User.is_deleted.is_(False))
        .distinct()
        .all()
    )
    agencies = sorted(
        {name.strip() for (name,) in rows if name and name.strip()}
    )
    return agencies


def update_dataset(
    db: Session,
    dataset_id: uuid.UUID,
    request: DatasetUpdateRequest,
    current_user: dict,
    ip_address: str,
    background_tasks: BackgroundTasks | None = None,
    es_client=None,
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
        category_service.validate_category_is_leaf(db, request.category_id)
        fields["category_id"] = request.category_id
    metadata_changed = (
        request.metadata is not None
        or request.year_start is not None
        or request.year_end is not None
    )
    if metadata_changed:
        metadata = dict(dataset.dataset_metadata or {})
        if request.metadata is not None:
            metadata.update(request.metadata)
        if request.year_start is not None:
            metadata["year_start"] = request.year_start
        if request.year_end is not None:
            metadata["year_end"] = request.year_end
        fields["dataset_metadata"] = metadata

    if request.status is not None:
        fields["status"] = request.status
        if request.status == "published" and dataset.published_at is None:
            fields["published_at"] = datetime.now(timezone.utc)
        elif request.status == "draft":
            fields["published_at"] = None

    if fields:
        dataset_repo.update_dataset(db, dataset_id, **fields)

    if request.tags is not None:
        dataset_repo.delete_dataset_tags(db, dataset_id)
        if request.tags:
            dataset_repo.create_dataset_tags(db, dataset_id, request.tags)

    versions = dataset_repo.get_dataset_versions(db, dataset_id)
    if versions:
        latest_file_path = versions[0].file_path
        next_version_number = dataset_repo.get_latest_version_number(db, dataset_id) + 1
        dataset_repo.create_dataset_version(
            db,
            dataset_id=dataset_id,
            version_number=next_version_number,
            file_path=latest_file_path,
            changelog="แก้ไขข้อมูล",
            created_by=uuid.UUID(current_user["sub"]),
        )

    was_published = dataset.status == "published"

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

    updated = dataset_repo.get_dataset_by_id(db, dataset_id)
    if updated is not None and updated.status == "published" and not was_published:
        import app.services.notification_service as notification_service

        notification_service.notify_subscribers_new_dataset(db, updated)
        db.commit()
        if background_tasks is not None:
            email_service.notify_subscribers_new_dataset(
                background_tasks, db, updated
            )
            email_service.notify_saved_search(background_tasks, db, updated)

    if background_tasks is not None and es_client is not None and updated is not None:
        if updated.status == "published":
            from app.utils.elasticsearch_utils import index_dataset

            doc = _build_dataset_index_document(db, updated)
            background_tasks.add_task(index_dataset, es_client, doc)
        elif updated.status == "draft":
            from app.utils.elasticsearch_utils import delete_dataset_index

            background_tasks.add_task(
                delete_dataset_index, es_client, str(dataset_id)
            )

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
    background_tasks: BackgroundTasks | None = None,
    es_client=None,
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

    if background_tasks is not None and es_client is not None:
        restored = dataset_repo.get_dataset_by_id(db, dataset_id)
        if restored is not None and restored.status == "published":
            from app.utils.elasticsearch_utils import index_dataset

            doc = _build_dataset_index_document(db, restored)
            background_tasks.add_task(index_dataset, es_client, doc)

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

            category_id = _resolve_bulk_row_category_id(db, row, current_user)

            row_request = DatasetCreateRequest(
                title=title,
                description=_bulk_cell_str(row.get("description")),
                license=license_val,
                category_id=category_id,
            )
            row_data = {
                key: value
                for key, value in row.to_dict().items()
                if key not in BULK_UPLOAD_METADATA_COLUMNS
            }
            row_df = pd.DataFrame([row_data])
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
                category_id=category_id,
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
                detail={
                    "row": row_num,
                    "masked_columns": masked_columns,
                    "status": "published",
                },
                ip_address=ip_address,
            )
            db.commit()
            success_count += 1

            import app.services.notification_service as notification_service

            notification_service.notify_subscribers_new_dataset(db, dataset)
            db.commit()

            if es_client is not None:
                from app.utils.elasticsearch_utils import index_dataset

                refreshed = dataset_repo.get_dataset_by_id(db, dataset.id)
                if refreshed is not None:
                    doc = _build_dataset_index_document(db, refreshed)
                    background_tasks.add_task(index_dataset, es_client, doc)

            email_service.notify_subscribers_new_dataset(
                background_tasks, db, dataset
            )
            email_service.notify_saved_search(background_tasks, db, dataset)
        except Exception as exc:
            db.rollback()
            errors.append(BulkUploadRowError(row=row_num, error=str(exc)))

    return BulkUploadResponse(
        success_count=success_count,
        error_count=len(errors),
        errors=errors,
    )
