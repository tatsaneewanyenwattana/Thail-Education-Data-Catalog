# Module: M4 Download
# Feature: Download API Endpoints ตาม #20

import io
import uuid
from urllib.parse import quote

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import app.services.download_service as download_service
from app.core.config import settings
from app.core.database import get_db
from app.core.response import success_response
from app.core.security import decode_access_token, get_client_ip

router = APIRouter()


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


def _get_optional_user_id(request: Request) -> uuid.UUID | None:
    auth = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return None
    token = auth.split(" ", 1)[1].strip()
    try:
        payload = decode_access_token(token)
        sub = payload.get("sub")
        if sub:
            return uuid.UUID(str(sub))
    except Exception:
        return None
    return None


@router.get("/datasets/{id}/preview")
def preview_dataset(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Preview 100 แถวแรกของ Dataset ที่ Publish แล้ว

    - **Auth**: ไม่ต้อง Login
    - **Errors**: DATASET_NOT_FOUND, FILE_NOT_FOUND
    """
    result = download_service.preview(
        db=db,
        minio_client=_get_minio(),
        redis_client=_get_redis(),
        dataset_id=id,
    )
    return success_response(result.model_dump())


@router.get("/datasets/{id}/download")
def download_dataset(
    id: uuid.UUID,
    request: Request,
    purpose: str = Query(...),
    file_format: str = Query(..., alias="format"),
    db: Session = Depends(get_db),
):
    """
    ดาวน์โหลดไฟล์ Dataset (ผ่าน Backend เท่านั้น)

    - **Auth**: ไม่ต้อง Login (ส่ง Bearer ได้ถ้า Login แล้วเพื่อบันทึก user_id)
    - **Query**: purpose, format (csv|excel|json|xml)
    - **Errors**: DOWNLOAD_PURPOSE_REQUIRED, DOWNLOAD_INVALID_FORMAT,
      DATASET_NOT_FOUND, FILE_NOT_FOUND
    """
    file_bytes, media_type, filename = download_service.download(
        db=db,
        minio_client=_get_minio(),
        dataset_id=id,
        purpose=purpose,
        file_format=file_format,
        user_id=_get_optional_user_id(request),
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


@router.get("/datasets/{id}/citation")
def citation_dataset(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    ดู Citation ของ Dataset (APA / Vancouver)

    - **Auth**: ไม่ต้อง Login
    - **Errors**: DATASET_NOT_FOUND
    """
    result = download_service.get_citation(db=db, dataset_id=id)
    return success_response(result.model_dump())


@router.get("/datasets/{id}/export-pdf")
def export_pdf_dataset(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Export PDF รายงาน Dataset

    - **Auth**: ไม่ต้อง Login
    - **Errors**: DATASET_NOT_FOUND, FILE_NOT_FOUND
    """
    pdf_bytes, filename = download_service.export_pdf(
        db=db,
        minio_client=_get_minio(),
        dataset_id=id,
    )
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
