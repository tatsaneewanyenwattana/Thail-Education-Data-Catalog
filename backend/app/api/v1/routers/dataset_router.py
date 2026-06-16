# Module: M2 Dataset
# Feature: Dataset API Endpoints ตาม #20

import io
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, Query, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

import app.services.dataset_service as dataset_service
from app.core.database import get_db
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import delete_response, list_response, success_response
from app.core.security import (
    decode_access_token,
    extract_bearer_token,
    get_client_ip,
    get_current_user_payload_with_status,
    get_user_status,
    require_roles,
    validate_token_in_redis,
    validate_user_status,
)
from app.schemas.dataset_schema import DatasetCreateRequest, DatasetUpdateRequest

router = APIRouter()
_bearer_optional = HTTPBearer(auto_error=False)


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
    year_start: int | None = Form(None),
    year_end: int | None = Form(None),
    status: str | None = Form(None, description="draft หรือ published"),
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
    tag_names: list[str] = []
    if tags:
        try:
            parsed_tags = json.loads(tags)
            if isinstance(parsed_tags, list):
                for value in parsed_tags:
                    try:
                        tag_list.append(uuid.UUID(str(value)))
                    except Exception:
                        text = str(value).strip()
                        if text:
                            tag_names.append(text)
        except Exception:
            raw_tags = (
                str(tags)
                .replace("[", "")
                .replace("]", "")
                .replace('"', "")
                .replace("'", "")
            )
            parsed_fallback = [chunk.strip() for chunk in raw_tags.split(",") if chunk.strip()]
            for value in parsed_fallback:
                try:
                    tag_list.append(uuid.UUID(str(value)))
                except Exception:
                    tag_names.append(str(value))

    meta_dict = None
    if metadata:
        try:
            meta_dict = json.loads(metadata)
        except Exception:
            meta_dict = None
    if meta_dict is None:
        meta_dict = {}
    if year_start is not None:
        meta_dict["year_start"] = year_start
    if year_end is not None:
        meta_dict["year_end"] = year_end
    if not meta_dict:
        meta_dict = None

    req = DatasetCreateRequest(
        title=title,
        description=description,
        license=license,
        category_id=cat_id,
        tags=tag_list,
        tag_names=tag_names,
        metadata=meta_dict,
        year_start=year_start,
        year_end=year_end,
        status=status if status in ("draft", "published") else None,
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


def _require_admin_payload(
    credentials: HTTPAuthorizationCredentials | None,
    db: Session,
) -> dict:
    token = extract_bearer_token(credentials)
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise_app_error("AUTH_TOKEN_INVALID")
    validate_token_in_redis(user_id, token)
    user_status = get_user_status(db, user_id)
    validate_user_status(user_status)
    if payload.get("role") != "admin":
        raise_app_error("AUTH_PERMISSION_DENIED")
    return payload


def _get_optional_user_payload(
    credentials: HTTPAuthorizationCredentials | None,
) -> dict | None:
    if credentials is None:
        return None
    if credentials.scheme.lower() != "bearer":
        return None
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        if payload.get("sub"):
            return payload
    except Exception:
        return None
    return None


@router.get("/datasets", status_code=status.HTTP_200_OK)
def list_datasets(
    pagination: PaginationParams = Depends(get_pagination_params),
    all: bool = Query(default=False, description="Admin: ทุกหน่วยงาน ทุก status"),
    status: str | None = Query(default=None, description="กรอง status (ใช้กับ all=true)"),
    search: str | None = Query(default=None),
    agency: str | None = Query(default=None),
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
    db: Session = Depends(get_db),
):
    """
    ดูรายการ Dataset
    - all=false: เฉพาะ published, Auth ❌
    - all=true: ทุก Agency ทุก status, Auth ✅ Admin
    """
    if all:
        _require_admin_payload(credentials, db)
        items, total = dataset_service.list_admin_datasets(
            db=db,
            pagination=pagination,
            status_filter=status,
            search=search,
            agency_filter=agency,
        )
        return list_response(
            data=[i.model_dump(mode="json", by_alias=True) for i in items],
            page=pagination.page,
            page_size=pagination.page_size,
            total_items=total,
        )

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
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
    db: Session = Depends(get_db),
):
    """
    ดู Dataset ชิ้นเดียว
    - Auth ❌
    """
    result = dataset_service.get_dataset(
        db=db,
        dataset_id=dataset_id,
        current_user=_get_optional_user_payload(credentials),
    )
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
        es_client=_get_es(),
    )
    return success_response(data=result.model_dump(mode="json"))


@router.post("/datasets/{dataset_id}/publish", status_code=status.HTTP_200_OK)
def publish_dataset(
    dataset_id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    เผยแพร่ Dataset (draft → published) ตาม #5 M2
    - Auth ✅ Agency/Admin
    """
    result = dataset_service.publish_dataset_directly(
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
    background_tasks: BackgroundTasks,
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
        background_tasks=background_tasks,
        es_client=_get_es(),
    )
    return success_response(data=result.model_dump(mode="json"))


@router.get("/datasets/bulk-upload/template")
def download_bulk_upload_template(
    payload: dict = Depends(require_roles("agency", "admin")),
):
    """
    ดาวน์โหลด Excel Template สำหรับ Bulk Upload
    - Auth ✅ Agency/Admin
    """
    del payload
    content = dataset_service.generate_bulk_upload_template()
    return StreamingResponse(
        io.BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="bulk-upload-template.xlsx"'
        },
    )


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
