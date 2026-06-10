"""Integration tests — login, verify, session, password reset."""

from __future__ import annotations

import pytest

from app.core.security import verify_password
from tests.conftest import (
    DEFAULT_REGISTER_PASSWORD,
    admin_token,
    error_code,
    get_user,
    login,
    post_register,
    register_metadata,
    unique_email,
)

pytestmark = pytest.mark.integration


def test_login_invalid_credentials(client):
    response = login(client, "nobody@example.com", "WrongPass1!")
    assert response.status_code == 401
    assert error_code(response) == "AUTH_INVALID_CREDENTIALS"


def test_login_email_not_verified(client):
    email = unique_email("login-unverified")
    assert post_register(client, register_metadata(email)).status_code == 201
    response = login(client, email, DEFAULT_REGISTER_PASSWORD)
    assert response.status_code == 403
    assert error_code(response) == "AUTH_EMAIL_NOT_VERIFIED"


def test_verify_email_and_register_status(client):
    email = unique_email("verify-flow")
    assert post_register(client, register_metadata(email)).status_code == 201
    user = get_user(email)
    assert user is not None
    token = user.verify_token

    verify = client.post("/api/v1/auth/verify-email", json={"token": token})
    assert verify.status_code == 200

    status = client.get("/api/v1/auth/register-status", params={"email": email})
    assert status.status_code == 200
    assert status.json()["data"]["status"] == "pending"

    reused = client.post("/api/v1/auth/verify-email", json={"token": token})
    assert reused.status_code == 401
    assert error_code(reused) == "AUTH_TOKEN_INVALID"


def test_verify_email_invalid_token(client):
    response = client.post(
        "/api/v1/auth/verify-email",
        json={"token": "00000000-0000-0000-0000-000000000000"},
    )
    assert response.status_code == 401
    assert error_code(response) == "AUTH_TOKEN_INVALID"


def test_forgot_password_always_ok(client):
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "unknown@example.com"},
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_reset_password_flow(client):
    email = unique_email("reset-flow")
    metadata = register_metadata(email, password="OldPassw0rd!")
    assert post_register(client, metadata).status_code == 201

    forgot = client.post("/api/v1/auth/forgot-password", json={"email": email})
    assert forgot.status_code == 200

    user = get_user(email)
    assert user is not None
    assert user.reset_token

    reset = client.post(
        "/api/v1/auth/reset-password",
        json={"token": user.reset_token, "new_password": "NewPassw0rd!"},
    )
    assert reset.status_code == 200

    user = get_user(email)
    assert user is not None
    assert verify_password("NewPassw0rd!", user.password_hash)
    assert not verify_password("OldPassw0rd!", user.password_hash)


def test_me_logout_session(client):
    token = admin_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["data"]["email"] == "admin@edudata.go.th"

    logout = client.post("/api/v1/auth/logout", headers=headers)
    assert logout.status_code == 200

    me_after = client.get("/api/v1/auth/me", headers=headers)
    assert me_after.status_code == 401
