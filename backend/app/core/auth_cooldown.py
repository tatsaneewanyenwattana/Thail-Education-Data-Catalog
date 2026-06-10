# Module: M1 Auth
# Feature: Per-account email cooldown ตาม claude-v3 #28 #47

AUTH_EMAIL_COOLDOWN_SECONDS = 60


def _cooldown_key(prefix: str, email: str) -> str:
    return f"auth:cooldown:{prefix}:{email.strip().lower()}"


def get_cooldown_remaining(redis_client, prefix: str, email: str) -> int | None:
    ttl = redis_client.ttl(_cooldown_key(prefix, email))
    if ttl is None or ttl < 0:
        return None
    return int(ttl)


def set_cooldown(
    redis_client,
    prefix: str,
    email: str,
    seconds: int = AUTH_EMAIL_COOLDOWN_SECONDS,
) -> None:
    redis_client.setex(_cooldown_key(prefix, email), seconds, "1")


def enforce_cooldown(redis_client, prefix: str, email: str) -> None:
    from app.core.errors import raise_app_error

    remaining = get_cooldown_remaining(redis_client, prefix, email)
    if remaining is None:
        return
    raise_app_error(
        "AUTH_RESEND_COOLDOWN",
        f"กรุณารอ {remaining} วินาทีก่อนขออีเมลใหม่",
        details={"retry_after": remaining},
    )
