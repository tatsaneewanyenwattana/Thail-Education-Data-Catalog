# Module: M2 Dataset
# Feature: Dataset API Endpoints ตาม #20

import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, Request, UploadFile, status
from sqlalchemy.orm import Session

import app.services.dataset_service as dataset_service
from app.core.database import get_db
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import delete_response, list_response, success_response
from app.core.security import (
    get_client_ip,
    get_current_user_payload_with_status,
    require_roles,
)
from app.schemas.dataset_schema import DatasetCreateRequest, DatasetUpdateRequest

router = APIRouter()


def _get_minio():
    from minio import Minio
    from app.core.config import settings
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


def _get_es():
    from elasticsearch import Elasticsearch
    from app.core.config import settings
    return Elasticsearch(settings.ELASTICSEARCH_URL)


@router.post("/datasets", status_code=status.HTTP_201_CREATED)
def upload_dataset(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str | None = Form(None),
    license: str = Form(...),
    category_id: str | None = Form(None),
    tags: str | None = Form(None),
    metadata: str | None = Form(None),
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    อัปโหลด Dataset (multipart/form-data) ตาม #20
    - Auth ✅ Agency/Admin
    - PII Scan → Mask → MinIO → Transaction → ES Index ตาม #29
    """
    import json

    content = file.file.read()
    dataset_service._validate_file(file, content)
    file.file.seek(0)

    cat_id = uuid.UUID(category_id) if category_id else None

    tag_list: list[uuid.UUID] = []
    if tags:
        try:
            tag_list = [uuid.UUID(t) for t in json.loads(tags)]
        except Exception:
            tag_list = []

    meta_dict = None
    if metadata:
        try:
            meta_dict = json.loads(metadata)
        except Exception:
            meta_dict = None

    req = DatasetCreateRequest(
        title=title,
        description=description,
        license=license,
        category_id=cat_id,
        tags=tag_list,
        metadata=meta_dict,
    )
    result = dataset_service.upload(
        db=db,
        minio_client=_get_minio(),
        es_client=_get_es(),
        background_tasks=background_tasks,
        file=file,
        request=req,
        current_user=payload,
        ip_address=get_client_ip(request),
    )
    return success_response(data=result.model_dump(mode="json"))


@router.get("/datasets", status_code=status.HTTP_200_OK)
def list_datasets(
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db),
):
    """
    ดูรายการ Dataset — แสดงเฉพาะ published ตาม #5 M2
    - Auth ❌
    - คืน 200 + list_response
    """
    items, total = dataset_service.list_datasets(
        db=db, pagination=pagination, status_filter="published"
    )
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/datasets/{dataset_id}", status_code=status.HTTP_200_OK)
def get_dataset(
    dataset_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    ดู Dataset ชิ้นเดียว
    - Auth ❌
    """
    result = dataset_service.get_dataset(db=db, dataset_id=dataset_id)
    return success_response(data=result.model_dump(mode="json"))


@router.patch("/datasets/{dataset_id}", status_code=status.HTTP_200_OK)
def update_dataset(
    dataset_id: uuid.UUID,
    request_body: DatasetUpdateRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    แก้ไข Dataset — เช็ค Ownership ตาม #4 #5
    - Auth ✅
    """
    result = dataset_service.update_dataset(
        db=db,
        dataset_id=dataset_id,
        request=request_body,
        current_user=payload,
        ip_address=get_client_ip(request),
        background_tasks=background_tasks,
    )
    return success_response(data=result.model_dump(mode="json"))


@router.post("/datasets/{dataset_id}/submit", status_code=status.HTTP_200_OK)
def submit_dataset(
    dataset_id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    ส่ง Dataset เพื่อขออนุมัติ (draft → submitted) ตาม #5 M2
    - Auth ✅ Agency/Admin
    """
    result = dataset_service.submit_dataset(
        db=db,
        dataset_id=dataset_id,
        current_user=payload,
        ip_address=get_client_ip(request),
        background_tasks=background_tasks,
    )
    return success_response(data=result.model_dump(mode="json"))


@router.delete("/datasets/{dataset_id}", status_code=status.HTTP_200_OK)
def delete_dataset(
    dataset_id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ลบ Dataset (Soft Delete) — เช็ค Ownership ตาม #4 #5 #15
    - Auth ✅
    """
    dataset_service.delete_dataset(
        db=db,
        dataset_id=dataset_id,
        current_user=payload,
        ip_address=get_client_ip(request),
        background_tasks=background_tasks,
        es_client=_get_es(),
    )
    return delete_response()


@router.get("/datasets/{dataset_id}/versions", status_code=status.HTTP_200_OK)
def get_versions(
    dataset_id: uuid.UUID,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ดูประวัติ Version
    - Auth ✅
    """
    versions = dataset_service.get_versions(
        db=db, dataset_id=dataset_id, current_user=payload
    )
    return list_response(
        data=[v.model_dump(mode="json") for v in versions],
        page=1,
        page_size=len(versions),
        total_items=len(versions),
    )


@router.post(
    "/datasets/{dataset_id}/versions/{version_number}/restore",
    status_code=status.HTTP_200_OK,
)
def restore_version(
    dataset_id: uuid.UUID,
    version_number: int,
    request: Request,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    Restore Version ตาม #34
    - Auth ✅
    """
    result = dataset_service.restore_version(
        db=db,
        dataset_id=dataset_id,
        version_number=version_number,
        current_user=payload,
        ip_address=get_client_ip(request),
    )
    return success_response(data=result.model_dump(mode="json"))


@router.post("/datasets/bulk-upload", status_code=status.HTTP_200_OK)
def bulk_upload(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    Bulk Upload จาก Excel Template ตาม #29
    - Auth ✅ Agency/Admin
    """
    result = dataset_service.bulk_upload(
        db=db,
        minio_client=_get_minio(),
        es_client=_get_es(),
        background_tasks=background_tasks,
        file=file,
        current_user=payload,
        ip_address=get_client_ip(request),
    )
    return success_response(data=result.model_dump())


@router.get("/datasets/{dataset_id}/quality-score", status_code=status.HTTP_200_OK)
def get_quality_score(
    dataset_id: uuid.UUID,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ดู Data Quality Score ตาม #4
    - Auth ✅
    """
    score = dataset_service.get_quality_score(
        db=db, dataset_id=dataset_id, current_user=payload
    )
    return success_response(data={"quality_score": score})
