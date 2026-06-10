"""Shared fixtures for Group 2 auth tests — run inside Docker backend container."""

from __future__ import annotations

import json
import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.models.user_model import User
from main import app

VALID_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"
ADMIN_EMAIL = "admin@edudata.go.th"
ADMIN_PASSWORD = "admintest12345"
DEFAULT_REGISTER_PASSWORD = "Register2E!"


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def unique_email(prefix: str = "pytest") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}@example.com"


def register_metadata(
    email: str | None = None,
    password: str = DEFAULT_REGISTER_PASSWORD,
) -> dict:
    return {
        "agency_name": "หน่วยงานทดสอบ Pytest",
        "agency_type": "central",
        "contact_name": "สมชาย ใจดี",
        "contact_phone": "081-234-5678",
        "email": email or unique_email(),
        "password": password,
        "terms_version": "1.0",
        "pdpa_version": "1.0",
        "terms_consent": True,
        "pdpa_consent": True,
    }


def post_register(
    client: TestClient,
    metadata: dict | None = None,
    pdf: bytes = VALID_PDF,
    filename: str = "verification.pdf",
):
    payload = metadata or register_metadata()
    return client.post(
        "/api/v1/auth/register",
        data={"data": json.dumps(payload)},
        files={"verification_doc": (filename, pdf, "application/pdf")},
    )


def get_user(email: str) -> User | None:
    db = SessionLocal()
    try:
        return (
            db.query(User)
            .filter(User.email == email, User.is_deleted.is_(False))
            .first()
        )
    finally:
        db.close()


def error_code(response) -> str:
    body = response.json()
    return body["error"]["code"]


def login(client: TestClient, email: str, password: str):
    return client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )


def admin_token(client: TestClient) -> str:
    response = login(client, ADMIN_EMAIL, ADMIN_PASSWORD)
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


def register_and_verify(client: TestClient, email: str | None = None) -> tuple[str, str, User]:
    """Register agency + verify email → status pending."""
    metadata = register_metadata(email)
    email = metadata["email"]
    password = metadata["password"]
    response = post_register(client, metadata)
    assert response.status_code == 201, response.text

    user = get_user(email)
    assert user is not None
    assert user.verify_token

    verify = client.post(
        "/api/v1/auth/verify-email",
        json={"token": user.verify_token},
    )
    assert verify.status_code == 200, verify.text

    user = get_user(email)
    assert user is not None
    assert user.status == "pending"
    return email, password, user
