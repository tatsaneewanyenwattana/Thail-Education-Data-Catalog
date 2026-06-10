# Module: Core
# Feature: JWT + Redis Session + passlib ตาม #8 #25 #43 #48

import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import redis
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.errors import raise_app_error

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)
bearer_scheme = HTTPBearer(auto_error=False)

_redis_client: redis.Redis | None = None

PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
PASSWORD_SPECIAL_CHAR_PATTERN = re.compile(r"[!@#$%^&*]")


def get_redis_client() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
    return _redis_client


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def validate_password(password: str) -> None:
    if len(password) < PASSWORD_MIN_LENGTH:
        raise_app_error("VALIDATION_ERROR", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    if len(password) > PASSWORD_MAX_LENGTH:
        raise_app_error("VALIDATION_ERROR", "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร")
    if not re.search(r"[a-z]", password):
        raise_app_error(
            "VALIDATION_ERROR",
            "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว",
        )
    if not re.search(r"[A-Z]", password):
        raise_app_error(
            "VALIDATION_ERROR",
            "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว",
        )
    if not re.search(r"[0-9]", password):
        raise_app_error(
            "VALIDATION_ERROR",
            "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว",
        )
    if not PASSWORD_SPECIAL_CHAR_PATTERN.search(password):
        raise_app_error(
            "VALIDATION_ERROR",
            "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว เช่น !@#$%^&*",
        )
    if " " in password:
        raise_app_error("VALIDATION_ERROR", "รหัสผ่านห้ามใช้ช่องว่าง")


def create_access_token(user_id: uuid.UUID, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except JWTError as exc:
        if "expired" in str(exc).lower():
            raise_app_error("AUTH_TOKEN_EXPIRED")
        raise_app_error("AUTH_TOKEN_INVALID")


def _session_key(user_id: str) -> str:
    return f"session:{user_id}"


def store_session(user_id: str, token: str) -> None:
    client = get_redis_client()
    client.setex(
        _session_key(user_id),
        settings.JWT_EXPIRE_MINUTES * 60,
        token,
    )


def get_session_token(user_id: str) -> str | None:
    return get_redis_client().get(_session_key(user_id))


def delete_session(user_id: str) -> None:
    get_redis_client().delete(_session_key(user_id))


def login_session(user_id: str, token: str) -> None:
    delete_session(user_id)
    store_session(user_id, token)


def validate_token_in_redis(user_id: str, token: str) -> None:
    stored = get_session_token(user_id)
    if not stored or stored != token:
        raise_app_error("AUTH_TOKEN_INVALID")


def extract_bearer_token(
    credentials: HTTPAuthorizationCredentials | None,
) -> str:
    if credentials is None:
        raise_app_error("AUTH_TOKEN_MISSING")
    if credentials.scheme.lower() != "bearer":
        raise_app_error("AUTH_TOKEN_INVALID")
    return credentials.credentials


def is_user_deleted(db: Session, user_id: str) -> bool:
    result = db.execute(
        text("SELECT is_deleted FROM users WHERE id = :uid"),
        {"uid": user_id},
    )
    row = result.fetchone()
    if row is None:
        return False
    return bool(row[0])


def get_user_status(db: Session, user_id: str) -> str | None:
    result = db.execute(
        text(
            "SELECT status FROM users WHERE id = :uid AND is_deleted = false"
        ),
        {"uid": user_id},
    )
    row = result.fetchone()
    return row[0] if row else None


def validate_user_status(status: str | None) -> None:
    if status is None:
        raise_app_error("USER_NOT_FOUND")
    if status == "email_unverified":
        raise_app_error("AUTH_EMAIL_NOT_VERIFIED")
    if status == "suspended":
        raise_app_error("AUTH_ACCOUNT_SUSPENDED")
    if status == "pending":
        raise_app_error("AUTH_ACCOUNT_PENDING")
    if status == "rejected":
        raise_app_error("AUTH_ACCOUNT_REJECTED")
    if status != "active":
        raise_app_error("USER_STATUS_INVALID")


def get_current_user_payload(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    token = extract_bearer_token(credentials)
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise_app_error("AUTH_TOKEN_INVALID")
    validate_token_in_redis(user_id, token)
    return payload


def get_current_user_payload_with_status(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    payload = get_current_user_payload(credentials)
    user_id = payload["sub"]
    if is_user_deleted(db, user_id):
        raise_app_error("AUTH_ACCOUNT_DELETED")
    status = get_user_status(db, user_id)
    validate_user_status(status)
    payload["status"] = status
    return payload


def require_roles(*allowed_roles: str):
    def dependency(
        payload: dict[str, Any] = Depends(get_current_user_payload_with_status),
    ) -> dict[str, Any]:
        if payload.get("role") not in allowed_roles:
            raise_app_error("AUTH_PERMISSION_DENIED")
        return payload

    return dependency


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def get_user_agent(request: Request) -> str | None:
    user_agent = request.headers.get("User-Agent")
    if not user_agent:
        return None
    if len(user_agent) > 500:
        return user_agent[:500]
    return user_agent
