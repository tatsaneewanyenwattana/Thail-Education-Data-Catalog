"""
Seed บัญชี Admin มาตรฐาน — แหล่งความจริงเดียวสำหรับ email/รหัสผ่าน admin

รันผ่าน Docker เท่านั้น (ใช้ DB เดียวกับ backend):
  docker exec -it thail-datacatalog-backend-1 python scripts/seed_admin.py

ห้ามรัน python scripts/seed_admin.py บนเครื่อง host โดยตรง
เพราะ DATABASE_URL ใน .env ชี้ host `postgres` (ใน Docker network)
"""

from __future__ import annotations

import os
import sys
import uuid
from urllib.parse import urlparse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password, verify_password
from app.models.user_model import User
from app.services import auth_service

ADMIN_EMAIL = "admin@edudata.go.th"
ADMIN_PASSWORD = "admintest12345"


def _database_target() -> str:
    parsed = urlparse(settings.DATABASE_URL)
    host = parsed.hostname or "(unknown)"
    port = parsed.port or ""
    db = (parsed.path or "").lstrip("/") or "(unknown)"
    return f"{host}:{port}/{db}" if port else f"{host}/{db}"


def _verify_login(db, email: str, password: str) -> None:
    user = (
        db.query(User)
        .filter(User.email == email, User.is_deleted.is_(False))
        .first()
    )
    if user is None:
        raise RuntimeError(f"User not found after seed: {email}")
    if not verify_password(password, user.password_hash):
        raise RuntimeError("password_hash does not match ADMIN_PASSWORD after seed")


def seed_admin() -> None:
    print(f"Database target: {_database_target()}")
    print(f"APP_ENV: {settings.APP_ENV}")
    print(f"Admin seed: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print()

    db = SessionLocal()
    try:
        existing = (
            db.query(User)
            .filter(User.email == ADMIN_EMAIL, User.is_deleted.is_(False))
            .first()
        )

        if existing:
            existing.password_hash = hash_password(ADMIN_PASSWORD)
            existing.role = "admin"
            existing.status = "active"
            if existing.agency_name is None:
                existing.agency_name = "ผู้ดูแลระบบ"
            db.commit()
            db.refresh(existing)
            print(f"✅ Admin synced (password reset): {existing.email}")
            print(f"   Role: {existing.role}")
            print(f"   Status: {existing.status}")
        else:
            admin = User(
                id=uuid.uuid4(),
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                role="admin",
                status="active",
                agency_name="ผู้ดูแลระบบ",
                is_deleted=False,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("✅ Admin created successfully")
            print(f"   Email: {ADMIN_EMAIL}")

        _verify_login(db, ADMIN_EMAIL, ADMIN_PASSWORD)

        # ยืนยันผ่าน auth_service เหมือน POST /auth/login
        import redis

        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        try:
            auth_service.login(
                db=db,
                redis_client=redis_client,
                email=ADMIN_EMAIL,
                password=ADMIN_PASSWORD,
                ip_address="127.0.0.1",
                user_agent="seed_admin.py",
            )
        finally:
            redis_client.close()

        print(f"   Password: {ADMIN_PASSWORD}")
        print("   Login verification: OK")
        print()
        print("Use at http://localhost:3000/th/login")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
