# Module: M8 Security
# Feature: Cloudflare Turnstile verification

import logging

import httpx

from app.core.config import settings
from app.core.errors import raise_app_error

logger = logging.getLogger(__name__)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def verify_turnstile(token: str | None, remote_ip: str | None = None) -> None:
    """Verify Turnstile token with Cloudflare before sensitive auth actions."""
    if not settings.TURNSTILE_ENABLED:
        return

    if not token or not token.strip():
        raise_app_error("TURNSTILE_REQUIRED")

    if not settings.TURNSTILE_SECRET_KEY:
        logger.error("TURNSTILE_ENABLED is true but TURNSTILE_SECRET_KEY is empty")
        raise_app_error("TURNSTILE_FAILED")

    payload: dict[str, str] = {
        "secret": settings.TURNSTILE_SECRET_KEY,
        "response": token.strip(),
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(TURNSTILE_VERIFY_URL, data=payload)
            response.raise_for_status()
            result = response.json()
    except Exception:
        logger.exception("Turnstile siteverify request failed")
        raise_app_error("TURNSTILE_FAILED")

    if not result.get("success"):
        logger.info("Turnstile verification failed: %s", result.get("error-codes"))
        raise_app_error("TURNSTILE_FAILED")
