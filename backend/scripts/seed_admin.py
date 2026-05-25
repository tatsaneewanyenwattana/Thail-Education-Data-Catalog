import os
import sys
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user_model import User


def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(
            User.email == "admin@edudata.go.th",
            User.is_deleted == False,
        ).first()

        if existing:
            print(f"✅ Admin already exists: {existing.email}")
            print(f"   Role: {existing.role}")
            print(f"   Status: {existing.status}")
            return

        admin = User(
            id=uuid.uuid4(),
            email="admin@edudata.go.th",
            password_hash=hash_password("Admin1234"),
            role="admin",
            status="active",
            agency_name="ผู้ดูแลระบบ",
            is_deleted=False,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("✅ Admin created successfully")
        print("   Email: admin@edudata.go.th")
        print("   Password: Admin1234")
        print("   Role: admin")
        print("   Status: active")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
