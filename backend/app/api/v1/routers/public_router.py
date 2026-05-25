# Module: M7 Public API
# Feature: Public API Endpoints ตาม #20

import io
import uuid
from urllib.parse import quote

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import app.services.admin_service as admin_service
import app.services.download_service as download_service
import app.services.public_service as public_service
from app.core.config import settings
from app.core.database import get_db
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import list_response, success_response
from app.core.security import get_client_ip

router = APIRouter(prefix="/public")


def _get_minio():
    from minio import Minio

    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


def _get_redis():
    import redis

    return redis.from_url(settings.redis_url, decode_responses=True)


@router.get("/announcements", status_code=200)
def public_list_announcements(db: Session = Depends(get_db)):
    """
    ประกาศที่เปิดใช้งานสำหรับ Banner หน้าหลัก
    - Auth ❌
    """
    items = admin_service.get_active_announcements(db)
    return success_response([i.model_dump(mode="json") for i in items])


@router.get("/datasets", status_code=200)
def public_list_datasets(
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db),
):
    """
    ดึงรายการ Dataset ที่ Publish แล้ว ตาม #20
    - Auth ❌
    - Rate Limit: 60/min/IP ตาม #47
    """
    items, total = public_service.list_published_datasets(db, pagination)
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/datasets/{id}", status_code=200)
def public_get_dataset(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    ดึงข้อมูล Dataset ที่ Publish แล้ว ตาม #20
    - Auth ❌
    """
    result = public_service.get_published_dataset(db, dataset_id=id)
    return success_response(result.model_dump(mode="json"))


@router.get("/datasets/{id}/preview", status_code=200)
def public_preview_dataset(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Preview ข้อมูล Dataset ตาม #20
    - Auth ❌
    """
    result = download_service.preview(
        db=db,
        minio_client=_get_minio(),
        redis_client=_get_redis(),
        dataset_id=id,
    )
    return success_response(result.model_dump())


@router.get("/datasets/{id}/download")
def public_download_dataset(
    id: uuid.UUID,
    request: Request,
    purpose: str = Query(...),
    file_format: str = Query(..., alias="format"),
    db: Session = Depends(get_db),
):
    """
    ดาวน์โหลด Dataset ตาม #20
    - Auth ❌
    """
    file_bytes, media_type, filename = download_service.download(
        db=db,
        minio_client=_get_minio(),
        dataset_id=id,
        purpose=purpose,
        file_format=file_format,
        user_id=None,
        ip_address=get_client_ip(request),
    )
    _ascii_ext = {"csv": "csv", "excel": "xlsx", "json": "json", "xml": "xml"}
    filename_rfc = f"dataset_{id}.{file_format}"
    filename_encoded = quote(filename_rfc, encoding="utf-8")
    ascii_filename = f"dataset.{_ascii_ext.get(file_format, file_format)}"
    content_disposition = (
        f'attachment; filename="{ascii_filename}"; '
        f"filename*=UTF-8''{filename_encoded}"
    )
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=media_type,
        headers={"Content-Disposition": content_disposition},
    )


@router.get("/datasets/{id}/stats", status_code=200)
def public_dataset_stats(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    สถิติ Dataset ตาม #20
    - Auth ❌
    """
    result = public_service.get_dataset_stats(db, dataset_id=id)
    return success_response(result.model_dump(mode="json"))
