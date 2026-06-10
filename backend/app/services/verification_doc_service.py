# Module: M1 Auth / M8 Security
# Feature: เอกสารยืนยันตน Agency ตาม claude-v3 #45

import io
import logging
import re
import uuid

from minio import Minio

from app.core.config import settings
from app.core.errors import raise_app_error
from app.core.logging import get_logger, log_request

logger = get_logger(__name__)

PDF_MAGIC = b"%PDF-"
_VERIFICATION_DOC_OBJECT_PREFIX = "verification-docs"
_DOUBLE_EXT_PATTERN = re.compile(r"\.pdf\.", re.IGNORECASE)


def _max_bytes() -> int:
    return settings.MAX_VERIFICATION_DOC_SIZE_MB * 1024 * 1024


def validate_verification_doc(
    content: bytes,
    filename: str | None = None,
) -> None:
    if not content:
        raise_app_error("VERIFICATION_DOC_REQUIRED")

    if len(content) > _max_bytes():
        raise_app_error("VERIFICATION_DOC_TOO_LARGE")

    if filename:
        lower_name = filename.lower().strip()
        if _DOUBLE_EXT_PATTERN.search(lower_name):
            raise_app_error("INVALID_MIME_TYPE")
        if not lower_name.endswith(".pdf"):
            raise_app_error("INVALID_MIME_TYPE")

    if not content.startswith(PDF_MAGIC):
        raise_app_error("INVALID_MIME_TYPE")


def build_verification_doc_path(user_id: uuid.UUID) -> str:
    return f"{_VERIFICATION_DOC_OBJECT_PREFIX}/{user_id}/{uuid.uuid4()}.pdf"


def upload_verification_doc(
    minio_client: Minio,
    user_id: uuid.UUID,
    content: bytes,
) -> str:
    object_name = build_verification_doc_path(user_id)
    try:
        minio_client.put_object(
            settings.MINIO_BUCKET_NAME,
            object_name,
            io.BytesIO(content),
            length=len(content),
            content_type="application/pdf",
        )
    except Exception as exc:
        log_request(
            logger,
            logging.ERROR,
            f"MinIO upload failed: {exc}",
            error_code="FILE_UPLOAD_FAILED",
        )
        raise_app_error("FILE_UPLOAD_FAILED")
    return object_name


def delete_verification_doc(minio_client: Minio, object_name: str | None) -> None:
    if not object_name:
        return
    try:
        minio_client.remove_object(settings.MINIO_BUCKET_NAME, object_name)
    except Exception as exc:
        log_request(
            logger,
            logging.WARNING,
            f"MinIO delete failed: {exc}",
            error_code="FILE_UPLOAD_FAILED",
        )
