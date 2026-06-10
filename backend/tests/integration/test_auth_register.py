"""Integration tests — POST /auth/register multipart."""

from __future__ import annotations

import json

import pytest

from app.core.config import settings
from tests.conftest import (
    VALID_PDF,
    error_code,
    get_user,
    post_register,
    register_metadata,
    unique_email,
)

pytestmark = pytest.mark.integration


def test_register_success(client):
    email = unique_email("register-ok")
    response = post_register(client, register_metadata(email))
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["email"] == email
    assert body["data"]["status"] == "email_unverified"
    user = get_user(email)
    assert user is not None
    assert user.verification_doc_path
    assert user.verification_doc_path.startswith("verification-docs/")


def test_register_duplicate_email(client):
    email = unique_email("register-dup")
    metadata = register_metadata(email)
    assert post_register(client, metadata).status_code == 201
    response = post_register(client, metadata)
    assert response.status_code == 409
    assert error_code(response) == "USER_EMAIL_EXISTS"


@pytest.mark.parametrize(
    ("pdf", "filename", "status", "code"),
    [
        (b"", "verification.pdf", 400, "VERIFICATION_DOC_REQUIRED"),
        (b"not-pdf", "verification.pdf", 415, "INVALID_MIME_TYPE"),
        (VALID_PDF, "doc.txt", 415, "INVALID_MIME_TYPE"),
        (VALID_PDF, "doc.pdf.exe", 415, "INVALID_MIME_TYPE"),
    ],
)
def test_register_invalid_verification_doc(client, pdf, filename, status, code):
    response = post_register(
        client,
        register_metadata(unique_email("register-doc")),
        pdf=pdf,
        filename=filename,
    )
    assert response.status_code == status
    assert error_code(response) == code


def test_register_oversized_pdf(client):
    max_bytes = settings.MAX_VERIFICATION_DOC_SIZE_MB * 1024 * 1024
    pdf = VALID_PDF + (b"0" * (max_bytes - len(VALID_PDF) + 1))
    response = post_register(
        client,
        register_metadata(unique_email("register-big")),
        pdf=pdf,
    )
    assert response.status_code == 413
    assert error_code(response) == "VERIFICATION_DOC_TOO_LARGE"


def test_register_invalid_json(client):
    response = client.post(
        "/api/v1/auth/register",
        data={"data": "{bad-json"},
        files={"verification_doc": ("verification.pdf", VALID_PDF, "application/pdf")},
    )
    assert response.status_code == 422
    assert error_code(response) == "VALIDATION_ERROR"


def test_register_missing_fields(client):
    response = client.post(
        "/api/v1/auth/register",
        data={"data": json.dumps(register_metadata(unique_email("register-missing")))},
    )
    assert response.status_code == 422
    assert error_code(response) == "VALIDATION_ERROR"
