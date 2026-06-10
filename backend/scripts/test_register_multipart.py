"""ทดสอบ POST /auth/register multipart — รันใน container:
docker exec thail-datacatalog-backend-1 python scripts/test_register_multipart.py
"""

from __future__ import annotations

import io
import json
import os
import sys
import uuid
import urllib.request

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import SessionLocal
from minio import Minio
from app.models.user_model import User


def main() -> None:
    email = f"register-2e-{uuid.uuid4().hex[:8]}@example.com"
    data = {
        "agency_name": "หน่วยงานทดสอบ Phase2E",
        "agency_type": "central",
        "contact_name": "สมชาย ใจดี",
        "contact_phone": "081-234-5678",
        "email": email,
        "password": "Register2E!",
        "terms_version": "1.0",
        "pdpa_version": "1.0",
        "terms_consent": True,
        "pdpa_consent": True,
    }
    pdf = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"

    boundary = uuid.uuid4().hex
    body = io.BytesIO()
    for name, content, filename, ctype in [
        ("data", json.dumps(data).encode(), None, "application/json"),
        ("verification_doc", pdf, "verification.pdf", "application/pdf"),
    ]:
        body.write(f"--{boundary}\r\n".encode())
        if filename:
            body.write(
                f'Content-Disposition: form-data; name="{name}"; '
                f'filename="{filename}"\r\n'.encode()
            )
        else:
            body.write(f'Content-Disposition: form-data; name="{name}"\r\n'.encode())
        body.write(f"Content-Type: {ctype}\r\n\r\n".encode())
        body.write(content)
        body.write(b"\r\n")
    body.write(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        "http://localhost:8000/api/v1/auth/register",
        data=body.getvalue(),
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print("HTTP", resp.status)
            print(resp.read().decode())
    except urllib.error.HTTPError as exc:
        print("HTTP", exc.code)
        print(exc.read().decode())
        raise

    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    print("email:", email)
    print("status:", user.status if user else None)
    print("verification_doc_path:", user.verification_doc_path if user else None)

    if user and user.verification_doc_path:
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False,
        )
        stat = client.stat_object(
            settings.MINIO_BUCKET_NAME,
            user.verification_doc_path,
        )
        print("minio size:", stat.size)
    db.close()


if __name__ == "__main__":
    main()
