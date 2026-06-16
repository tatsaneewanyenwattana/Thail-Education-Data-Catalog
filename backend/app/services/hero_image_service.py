# Module: M6 Admin
# Feature: Hero background image in MinIO

import io
import logging

from fastapi import UploadFile
from minio.error import S3Error

from app.core.config import settings
from app.core.errors import raise_app_error
from app.core.logging import get_logger, log_request
from app.schemas.hero_image_schema import HeroImageResponse

logger = get_logger(__name__)

HERO_OBJECT_NAME = "settings/hero-image/current"
HERO_IMAGE_FILE_PATH = "/public/settings/hero-image/file"
MAX_HERO_IMAGE_BYTES = 5 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


def _validate_image(file: UploadFile, content: bytes) -> None:
    if len(content) > MAX_HERO_IMAGE_BYTES:
        raise_app_error("FILE_TOO_LARGE", "ไฟล์ใหญ่เกิน 5MB")

    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise_app_error("FILE_INVALID_FORMAT", "ไฟล์ไม่ใช่ JPEG, PNG หรือ WebP")


def _object_exists(minio_client, object_name: str) -> bool:
    try:
        minio_client.stat_object(settings.MINIO_BUCKET_NAME, object_name)
        return True
    except S3Error:
        return False
    except Exception as exc:
        log_request(
            logger,
            logging.WARNING,
            f"MinIO stat hero image failed: {exc}",
            error_code="FILE_UPLOAD_FAILED",
        )
        return False


def _hero_image_url(minio_client) -> str | None:
    try:
        stat = minio_client.stat_object(settings.MINIO_BUCKET_NAME, HERO_OBJECT_NAME)
        version = int(stat.last_modified.timestamp())
        return f"{HERO_IMAGE_FILE_PATH}?v={version}"
    except S3Error:
        return None
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"MinIO stat hero image failed: {exc}",
            error_code="FILE_UPLOAD_FAILED",
        )
        return None


def get_hero_image(minio_client) -> HeroImageResponse:
    if not _object_exists(minio_client, HERO_OBJECT_NAME):
        return HeroImageResponse(image_url=None)

    url = _hero_image_url(minio_client)
    return HeroImageResponse(image_url=url)


def stream_hero_image(minio_client) -> tuple[bytes, str] | None:
    if not _object_exists(minio_client, HERO_OBJECT_NAME):
        return None

    response = None
    try:
        response = minio_client.get_object(
            settings.MINIO_BUCKET_NAME, HERO_OBJECT_NAME
        )
        content = response.read()
        content_type = (
            response.headers.get("Content-Type", "image/jpeg").split(";")[0].strip()
        )
        return content, content_type
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"MinIO get hero image failed: {exc}",
            error_code="FILE_NOT_FOUND",
        )
        return None
    finally:
        if response is not None:
            response.close()
            response.release_conn()


def upload_hero_image(minio_client, file: UploadFile) -> HeroImageResponse:
    content = file.file.read()
    _validate_image(file, content)

    try:
        if _object_exists(minio_client, HERO_OBJECT_NAME):
            minio_client.remove_object(
                settings.MINIO_BUCKET_NAME, HERO_OBJECT_NAME
            )

        content_type = (file.content_type or "image/jpeg").split(";")[0].strip()
        minio_client.put_object(
            settings.MINIO_BUCKET_NAME,
            HERO_OBJECT_NAME,
            io.BytesIO(content),
            length=len(content),
            content_type=content_type,
        )
        url = _hero_image_url(minio_client)
        return HeroImageResponse(image_url=url)
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"MinIO upload hero image failed: {exc}",
            error_code="FILE_UPLOAD_FAILED",
        )
        raise_app_error("FILE_UPLOAD_FAILED")


def delete_hero_image(minio_client) -> HeroImageResponse:
    try:
        if _object_exists(minio_client, HERO_OBJECT_NAME):
            minio_client.remove_object(
                settings.MINIO_BUCKET_NAME, HERO_OBJECT_NAME
            )
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"MinIO delete hero image failed: {exc}",
            error_code="FILE_UPLOAD_FAILED",
        )
        raise_app_error("FILE_UPLOAD_FAILED")

    return HeroImageResponse(image_url=None)
