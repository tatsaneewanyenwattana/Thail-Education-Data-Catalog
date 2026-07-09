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
import app.services.hero_image_service as hero_image_service
import app.services.page_content_service as page_content_service
import app.services.public_service as public_service
import app.services.site_setting_service as site_setting_service
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


@router.get("/pages", status_code=200)
def public_list_pages(db: Session = Depends(get_db)):
    result = page_content_service.list_published_pages(db)
    return success_response([r.model_dump(mode="json") for r in result])


@router.get("/pages/{slug}", status_code=200)
def public_get_page(slug: str, db: Session = Depends(get_db)):
    """
    ดึงเนื้อหาหน้า Static
    - Auth ❌
    - ไม่แสดงหน้าที่ status = draft
    """
    result = page_content_service.get_public_page(db, slug)
    return success_response(result.model_dump(mode="json"))


@router.get("/pages/{slug}/pdf")
def public_stream_page_pdf(slug: str):
    """
    สตรีม PDF ของหน้า static จาก MinIO
    - Auth ❌
    """
    from app.core.errors import raise_app_error

    object_name = f"pages/{slug}/document.pdf"
    minio_client = _get_minio()
    bucket = settings.MINIO_BUCKET_NAME
    response = None

    try:
        response = minio_client.get_object(bucket, object_name)
        content = response.read()
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/pdf",
            headers={"Cache-Control": "public, max-age=300"},
        )
    except Exception:
        raise_app_error("FILE_NOT_FOUND", "ไม่พบไฟล์ PDF")
    finally:
        if response is not None:
            response.close()
            response.release_conn()


@router.get("/settings/hero-image", status_code=200)
def public_get_hero_image():
    """
    ดึง URL รูป Hero หน้าหลัก (path ไปยัง backend proxy)
    - Auth ❌
    """
    result = hero_image_service.get_hero_image(_get_minio())
    return success_response(result.model_dump(mode="json"))


@router.get("/settings/hero-image/file")
def public_stream_hero_image():
    """
    สตรีมรูป Hero หน้าหลักจาก MinIO ผ่าน Backend
    - Auth ❌
    """
    from app.core.errors import raise_app_error

    payload = hero_image_service.stream_hero_image(_get_minio())
    if payload is None:
        raise_app_error("FILE_NOT_FOUND", "ไม่พบไฟล์")

    content, media_type = payload
    return StreamingResponse(
        io.BytesIO(content),
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=300"},
    )


@router.get("/settings/site", status_code=200)
def public_get_site_settings(db: Session = Depends(get_db)):
    """
    ดึง site settings (ribbon, grayscale)
    - Auth ❌
    """
    result = site_setting_service.get_public_settings(db, _get_minio())
    return success_response(result.model_dump(mode="json"))


@router.get("/settings/ribbon-image/file")
def public_stream_ribbon_image():
    """
    สตรีมรูป ribbon จาก MinIO
    - Auth ❌
    """
    from app.core.errors import raise_app_error

    payload = site_setting_service.stream_ribbon_image(_get_minio())
    if payload is None:
        raise_app_error("FILE_NOT_FOUND", "ไม่พบไฟล์")

    content, media_type = payload
    return StreamingResponse(
        io.BytesIO(content),
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=300"},
    )


@router.get("/settings/{key}/file")
def public_stream_setting_image(key: str):
    """
    สตรีมรูป setting image จาก MinIO
    - Auth ❌
    """
    from app.core.errors import raise_app_error

    payload = site_setting_service.stream_setting_image(_get_minio(), key)
    if payload is None:
        raise_app_error("FILE_NOT_FOUND", "ไม่พบไฟล์")

    content, media_type = payload
    return StreamingResponse(
        io.BytesIO(content),
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=300"},
    )


@router.get("/agencies", status_code=200)
def public_list_agencies(db: Session = Depends(get_db)):
    """
    รายการหน่วยงาน Agency ที่ active และมี Dataset เผยแพร่แล้ว
    - Auth ❌
    """
    items = public_service.list_agencies_with_published_datasets(db)
    return success_response([i.model_dump(mode="json") for i in items])


@router.get("/agencies/{agency_id}", status_code=200)
def public_get_agency(
    agency_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    ดึงรายละเอียดหน่วยงาน Agency
    - Auth ❌
    """
    result = public_service.get_agency_detail(db, agency_id)
    return success_response(result.model_dump(mode="json"))


@router.get("/agencies/{agency_id}/datasets", status_code=200)
def public_list_agency_datasets(
    agency_id: uuid.UUID,
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db),
):
    """
    รายการ Dataset ที่เผยแพร่แล้วของหน่วยงาน
    - Auth ❌
    """
    items, total = public_service.list_agency_published_datasets(
        db, agency_id, pagination
    )
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


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
    file_id: uuid.UUID | None = Query(None),
):
    """
    Preview ข้อมูล Dataset ตาม #20
    - Auth ❌
    - Query: file_id (optional)
    """
    result = download_service.preview(
        db=db,
        minio_client=_get_minio(),
        redis_client=_get_redis(),
        dataset_id=id,
        file_id=file_id,
    )
    return success_response(result.model_dump())


@router.get("/datasets/{id}/download")
def public_download_dataset(
    id: uuid.UUID,
    request: Request,
    purpose: str = Query(...),
    file_format: str = Query(..., alias="format"),
    db: Session = Depends(get_db),
    file_id: uuid.UUID | None = Query(None),
):
    """
    ดาวน์โหลด Dataset ตาม #20
    - Auth ❌
    - Query: file_id (optional)
    """
    file_content, media_type, filename = download_service.download(
        db=db,
        minio_client=_get_minio(),
        dataset_id=id,
        purpose=purpose,
        file_format=file_format,
        user_id=None,
        ip_address=get_client_ip(request),
        source="api",
        file_id=file_id,
    )
    _ascii_ext = {
        "csv": "csv",
        "excel": "xlsx",
        "json": "json",
        "xml": "xml",
        "pdf": "pdf",
        "sql": "sql",
    }
    filename_rfc = f"dataset_{id}.{file_format}"
    filename_encoded = quote(filename_rfc, encoding="utf-8")
    ascii_filename = f"dataset.{_ascii_ext.get(file_format, file_format)}"
    content_disposition = (
        f'attachment; filename="{ascii_filename}"; '
        f"filename*=UTF-8''{filename_encoded}"
    )
    body = io.BytesIO(file_content) if isinstance(file_content, bytes) else file_content
    return StreamingResponse(
        body,
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
