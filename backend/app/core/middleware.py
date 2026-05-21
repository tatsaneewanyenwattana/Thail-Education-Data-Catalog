# Module: Core
# Feature: RBAC Middleware ตาม #44 + Rate Limit ตาม #47

import logging
import re
import time
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.errors import AppException, ERROR_DEFINITIONS
from app.core.logging import get_logger, log_request
from app.core.security import (
    decode_access_token,
    extract_bearer_token,
    get_client_ip,
    get_redis_client,
    get_user_status,
    validate_token_in_redis,
    validate_user_status,
)
from fastapi.security import HTTPAuthorizationCredentials

logger = get_logger(__name__)

PUBLIC_PATHS = {
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
}

PUBLIC_PREFIXES = (
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/public",
)

ADMIN_PREFIX = "/api/v1/admin"

RATE_LIMIT_RULES: list[tuple[str, str, int]] = [
    ("POST", r"^/api/v1/auth/login$", 5),
    ("POST", r"^/api/v1/auth/register$", 3),
    ("GET", r"^/api/v1/search$", 30),
    ("GET", r"^/api/v1/datasets/[^/]+/download$", 10),
    ("POST", r"^/api/v1/datasets$", 10),
    ("GET", r"^/api/v1/public", 60),
]

DEFAULT_RATE_LIMIT = settings.RATE_LIMIT_PER_MINUTE
RATE_LIMIT_WINDOW_SECONDS = 60


def _is_public_path(path: str) -> bool:
    if path in PUBLIC_PATHS:
        return True
    return any(path.startswith(prefix) for prefix in PUBLIC_PREFIXES)


def _get_rate_limit(method: str, path: str) -> int:
    for rule_method, pattern, limit in RATE_LIMIT_RULES:
        if method == rule_method and re.match(pattern, path):
            return limit
    if method == "GET" and path.startswith("/api/v1/public"):
        return 60
    return DEFAULT_RATE_LIMIT


def _rate_limit_key(ip: str, method: str, path: str) -> str:
    return f"rate_limit:{ip}:{method}:{path}"


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        ip = get_client_ip(request)
        method = request.method
        path = request.url.path
        limit = _get_rate_limit(method, path)
        key = _rate_limit_key(ip, method, path)

        try:
            client = get_redis_client()
            current = client.incr(key)
            if current == 1:
                client.expire(key, RATE_LIMIT_WINDOW_SECONDS)
            ttl = client.ttl(key)
            reset_at = int(time.time()) + (ttl if ttl > 0 else RATE_LIMIT_WINDOW_SECONDS)
            remaining = max(0, limit - current)

            if current > limit:
                _, message = ERROR_DEFINITIONS["RATE_LIMIT_EXCEEDED"]
                log_request(
                    logger,
                    logging.WARNING,
                    "Rate limit exceeded",
                    ip_address=ip,
                    endpoint=path,
                    error_code="RATE_LIMIT_EXCEEDED",
                )
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": message,
                        },
                    },
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(reset_at),
                    },
                )

            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(reset_at)
            return response
        except Exception:
            return await call_next(request)


class RBACMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path

        if _is_public_path(path):
            return await call_next(request)

        if not path.startswith("/api/v1"):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")

        # ไม่มี token → ผ่านไปได้ (route dependencies จะ enforce auth เอง)
        if not auth_header:
            return await call_next(request)

        parts = auth_header.split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return _error_response("AUTH_TOKEN_INVALID", 401)

        credentials = HTTPAuthorizationCredentials(
            scheme=parts[0],
            credentials=parts[1],
        )

        try:
            token = extract_bearer_token(credentials)
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            role = payload.get("role")
            if not user_id or not role:
                return _error_response("AUTH_TOKEN_INVALID", 401)

            validate_token_in_redis(user_id, token)

            db = SessionLocal()
            try:
                status = get_user_status(db, user_id)
                validate_user_status(status)
            finally:
                db.close()

            # Admin prefix ต้องเป็น admin เท่านั้น
            if path.startswith(ADMIN_PREFIX) and role != "admin":
                return _error_response("AUTH_PERMISSION_DENIED", 403)

            request.state.current_user = payload
            return await call_next(request)

        except AppException as exc:
            return JSONResponse(status_code=exc.status_code, content=exc.detail)
        except Exception:
            return _error_response("INTERNAL_SERVER_ERROR", 500)


def _error_response(code: str, status_code: int) -> JSONResponse:
    _, message = ERROR_DEFINITIONS.get(
        code, (500, "ระบบขัดข้อง")
    )
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {"code": code, "message": message},
        },
    )
