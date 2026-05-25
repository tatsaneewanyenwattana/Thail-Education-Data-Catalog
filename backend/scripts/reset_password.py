import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user_model import User


def reset_password(email: str, new_password: str) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            User.email == email,
            User.is_deleted == False,
        ).first()
        if not user:
            print(f"User not found: {email}")
            return
        user.password_hash = hash_password(new_password)
        db.commit()
        print(f"Password reset: {email}")
        print(f"New password: {new_password}")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/reset_password.py <email> <new_password>")
        sys.exit(1)
    reset_password(sys.argv[1], sys.argv[2])
