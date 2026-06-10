"""Unit tests — password policy (#48)."""

from __future__ import annotations

import pytest

from app.core.errors import AppException
from app.core.security import validate_password


@pytest.mark.parametrize(
    "password",
    [
        "short1!",
        "nouppercase1!",
        "NOLOWERCASE1!",
        "NoDigits!!",
        "NoSpecial1",
        "has space1!",
    ],
)
def test_validate_password_rejects_weak(password: str):
    with pytest.raises(AppException) as exc:
        validate_password(password)
    assert exc.value.code == "VALIDATION_ERROR"


def test_validate_password_accepts_strong():
    validate_password("StrongPass1!")
