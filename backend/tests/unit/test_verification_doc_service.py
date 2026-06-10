"""Unit tests — verification_doc_service (Phase 2E)."""

from __future__ import annotations

import pytest

from app.core.config import settings
from app.core.errors import AppException
from app.services import verification_doc_service

VALID_PDF = b"%PDF-1.4\n%%EOF\n"


def test_validate_accepts_valid_pdf():
    verification_doc_service.validate_verification_doc(VALID_PDF, "doc.pdf")


@pytest.mark.parametrize(
    ("content", "filename", "code"),
    [
        (b"", "doc.pdf", "VERIFICATION_DOC_REQUIRED"),
        (b"not-pdf", "doc.pdf", "INVALID_MIME_TYPE"),
        (VALID_PDF, "doc.txt", "INVALID_MIME_TYPE"),
        (VALID_PDF, "doc.pdf.exe", "INVALID_MIME_TYPE"),
    ],
)
def test_validate_rejects_invalid_docs(content, filename, code):
    with pytest.raises(AppException) as exc:
        verification_doc_service.validate_verification_doc(content, filename)
    assert exc.value.code == code


def test_validate_rejects_oversized_pdf():
    max_bytes = settings.MAX_VERIFICATION_DOC_SIZE_MB * 1024 * 1024
    content = VALID_PDF + (b"0" * (max_bytes - len(VALID_PDF) + 1))
    with pytest.raises(AppException) as exc:
        verification_doc_service.validate_verification_doc(content, "big.pdf")
    assert exc.value.code == "VERIFICATION_DOC_TOO_LARGE"


def test_build_verification_doc_path_format():
    user_id = __import__("uuid").uuid4()
    path = verification_doc_service.build_verification_doc_path(user_id)
    assert path.startswith(f"verification-docs/{user_id}/")
    assert path.endswith(".pdf")
