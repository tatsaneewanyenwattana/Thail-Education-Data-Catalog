"""Integration tests — admin approve/reject/suspend/unsuspend (Phase 2H)."""

from __future__ import annotations

import pytest

from tests.conftest import (
    DEFAULT_REGISTER_PASSWORD,
    admin_token,
    error_code,
    get_user,
    login,
    register_and_verify,
    unique_email,
)

pytestmark = pytest.mark.integration


def _auth_headers(client) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token(client)}"}


def test_admin_approve_allows_login(client):
    email, password, user = register_and_verify(client, unique_email("approve"))
    headers = _auth_headers(client)

    approve = client.post(f"/api/v1/admin/users/{user.id}/approve", headers=headers)
    assert approve.status_code == 200

    refreshed = get_user(email)
    assert refreshed is not None
    assert refreshed.status == "active"

    token = login(client, email, password)
    assert token.status_code == 200
    assert token.json()["data"]["access_token"]


def test_admin_reject_blocks_login(client):
    email, password, user = register_and_verify(client, unique_email("reject"))
    headers = _auth_headers(client)

    reject = client.post(
        f"/api/v1/admin/users/{user.id}/reject",
        headers=headers,
        json={"reason": "เอกสารไม่ครบ"},
    )
    assert reject.status_code == 200

    response = login(client, email, password)
    assert response.status_code == 403
    assert error_code(response) == "AUTH_ACCOUNT_REJECTED"


def test_admin_suspend_and_unsuspend(client):
    email, password, user = register_and_verify(client, unique_email("suspend"))
    headers = _auth_headers(client)

    assert client.post(f"/api/v1/admin/users/{user.id}/approve", headers=headers).status_code == 200
    assert login(client, email, password).status_code == 200

    suspend = client.post(
        f"/api/v1/admin/users/{user.id}/suspend",
        headers=headers,
        json={"reason": "ทดสอบระงับ"},
    )
    assert suspend.status_code == 200

    locked = login(client, email, password)
    assert locked.status_code == 403
    assert error_code(locked) == "AUTH_ACCOUNT_SUSPENDED"

    unsuspend = client.post(
        f"/api/v1/admin/users/{user.id}/unsuspend",
        headers=headers,
    )
    assert unsuspend.status_code == 200

    refreshed = get_user(email)
    assert refreshed is not None
    assert refreshed.status == "active"
    assert refreshed.suspend_reason is None

    assert login(client, email, password).status_code == 200
