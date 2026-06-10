"""Edge-case tests สำหรับ POST /auth/register (multipart).

รันใน container:
  docker exec thail-datacatalog-backend-1 python scripts/test_register_edge_cases.py
"""

from __future__ import annotations

import io
import json
import os
import sys
import uuid
import urllib.error
import urllib.request

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user_model import User
from minio import Minio

REGISTER_URL = "http://localhost:8000/api/v1/auth/register"
VALID_PDF = b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"


def _valid_metadata(email: str | None = None) -> dict:
    return {
        "agency_name": "หน่วยงานทดสอบ Edge Case",
        "agency_type": "central",
        "contact_name": "สมชาย ใจดี",
        "contact_phone": "081-234-5678",
        "email": email or f"register-edge-{uuid.uuid4().hex[:8]}@example.com",
        "password": "Register2E!",
        "terms_version": "1.0",
        "pdpa_version": "1.0",
        "terms_consent": True,
        "pdpa_consent": True,
    }


def _build_multipart(
    *,
    data: str | bytes | None = None,
    verification_doc: bytes | None = None,
    verification_filename: str | None = "verification.pdf",
    include_data: bool = True,
    include_doc: bool = True,
) -> tuple[bytes, str]:
    boundary = uuid.uuid4().hex
    body = io.BytesIO()

    if include_data and data is not None:
        payload = data if isinstance(data, bytes) else data.encode()
        body.write(f"--{boundary}\r\n".encode())
        body.write(b'Content-Disposition: form-data; name="data"\r\n')
        body.write(b"Content-Type: application/json\r\n\r\n")
        body.write(payload)
        body.write(b"\r\n")

    if include_doc and verification_doc is not None:
        body.write(f"--{boundary}\r\n".encode())
        body.write(
            f'Content-Disposition: form-data; name="verification_doc"; '
            f'filename="{verification_filename}"\r\n'.encode()
        )
        body.write(b"Content-Type: application/pdf\r\n\r\n")
        body.write(verification_doc)
        body.write(b"\r\n")

    body.write(f"--{boundary}--\r\n".encode())
    return body.getvalue(), boundary


def _post_register(body: bytes, boundary: str) -> tuple[int, dict]:
    req = urllib.request.Request(
        REGISTER_URL,
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read().decode())


def _error_code(payload: dict) -> str | None:
    err = payload.get("error")
    if isinstance(err, dict):
        return err.get("code")
    return None


class CaseResult:
    def __init__(self, name: str, passed: bool, detail: str) -> None:
        self.name = name
        self.passed = passed
        self.detail = detail


def _run_case(
    name: str,
    *,
    expected_status: int,
    expected_code: str | None = None,
    data: str | bytes | None = None,
    verification_doc: bytes | None = VALID_PDF,
    verification_filename: str = "verification.pdf",
    include_data: bool = True,
    include_doc: bool = True,
) -> CaseResult:
    if include_data and data is None:
        data = json.dumps(_valid_metadata())
    body, boundary = _build_multipart(
        data=data,
        verification_doc=verification_doc,
        verification_filename=verification_filename,
        include_data=include_data,
        include_doc=include_doc,
    )
    status, payload = _post_register(body, boundary)
    code = _error_code(payload)

    if status != expected_status:
        return CaseResult(
            name,
            False,
            f"expected HTTP {expected_status}, got {status} (code={code})",
        )
    if expected_code is not None and code != expected_code:
        return CaseResult(
            name,
            False,
            f"expected error {expected_code}, got {code}",
        )
    if expected_code is None and not payload.get("success"):
        return CaseResult(name, False, f"expected success, got code={code}")
    return CaseResult(name, True, f"HTTP {status}" + (f", {code}" if code else ""))


def main() -> int:
    results: list[CaseResult] = []
    max_bytes = settings.MAX_VERIFICATION_DOC_SIZE_MB * 1024 * 1024

    # --- Happy path ---
    ok_email = f"register-edge-ok-{uuid.uuid4().hex[:8]}@example.com"
    ok = _run_case(
        "success: valid multipart register",
        expected_status=201,
        data=json.dumps(_valid_metadata(ok_email)),
    )
    results.append(ok)
    if ok.passed:
        db = SessionLocal()
        user = db.query(User).filter(User.email == ok_email).first()
        if user and user.verification_doc_path:
            client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=False,
            )
            client.stat_object(
                settings.MINIO_BUCKET_NAME,
                user.verification_doc_path,
            )
            results.append(
                CaseResult("success: MinIO object exists", True, user.verification_doc_path)
            )
        else:
            results.append(
                CaseResult("success: MinIO object exists", False, "user or path missing")
            )
        db.close()

    # --- verification_doc edge cases ---
    results.append(
        _run_case(
            "doc: empty file",
            expected_status=400,
            expected_code="VERIFICATION_DOC_REQUIRED",
            verification_doc=b"",
        )
    )
    results.append(
        _run_case(
            "doc: wrong magic bytes (.txt content)",
            expected_status=415,
            expected_code="INVALID_MIME_TYPE",
            verification_doc=b"not a pdf file",
        )
    )
    results.append(
        _run_case(
            "doc: wrong extension",
            expected_status=415,
            expected_code="INVALID_MIME_TYPE",
            verification_filename="document.txt",
        )
    )
    results.append(
        _run_case(
            "doc: double extension (.pdf.exe)",
            expected_status=415,
            expected_code="INVALID_MIME_TYPE",
            verification_filename="verification.pdf.exe",
        )
    )
    oversized = VALID_PDF + (b"0" * (max_bytes - len(VALID_PDF) + 1))
    results.append(
        _run_case(
            f"doc: over {settings.MAX_VERIFICATION_DOC_SIZE_MB}MB",
            expected_status=413,
            expected_code="VERIFICATION_DOC_TOO_LARGE",
            verification_doc=oversized,
        )
    )
    results.append(
        _run_case(
            "doc: missing verification_doc field",
            expected_status=422,
            expected_code="VALIDATION_ERROR",
            include_doc=False,
            data=json.dumps(_valid_metadata()),
        )
    )

    # --- data JSON edge cases ---
    results.append(
        _run_case(
            "data: invalid JSON",
            expected_status=422,
            expected_code="VALIDATION_ERROR",
            data="{not-json",
        )
    )
    results.append(
        _run_case(
            "data: missing data field",
            expected_status=422,
            expected_code="VALIDATION_ERROR",
            include_data=False,
        )
    )

    # --- RegisterMetadata validation ---
    bad_phone = _valid_metadata()
    bad_phone["contact_phone"] = "08-1234-5678"
    results.append(
        _run_case(
            "metadata: invalid phone format",
            expected_status=422,
            expected_code="VALIDATION_ERROR",
            data=json.dumps(bad_phone),
        )
    )

    weak_pw = _valid_metadata()
    weak_pw["password"] = "short"
    results.append(
        _run_case(
            "metadata: weak password",
            expected_status=422,
            expected_code="VALIDATION_ERROR",
            data=json.dumps(weak_pw),
        )
    )

    no_terms = _valid_metadata()
    no_terms["terms_consent"] = False
    results.append(
        _run_case(
            "metadata: terms_consent=false",
            expected_status=422,
            expected_code="VALIDATION_ERROR",
            data=json.dumps(no_terms),
        )
    )

    no_pdpa = _valid_metadata()
    no_pdpa["pdpa_consent"] = False
    results.append(
        _run_case(
            "metadata: pdpa_consent=false",
            expected_status=422,
            expected_code="VALIDATION_ERROR",
            data=json.dumps(no_pdpa),
        )
    )

    # --- duplicate email ---
    dup_email = f"register-edge-dup-{uuid.uuid4().hex[:8]}@example.com"
    dup_meta = json.dumps(_valid_metadata(dup_email))
    first = _run_case(
        "duplicate: first register",
        expected_status=201,
        data=dup_meta,
    )
    results.append(first)
    if first.passed:
        results.append(
            _run_case(
                "duplicate: same email again",
                expected_status=409,
                expected_code="USER_EMAIL_EXISTS",
                data=dup_meta,
            )
        )

    # --- report ---
    passed = sum(1 for r in results if r.passed)
    failed = [r for r in results if not r.passed]
    print(f"\n{'=' * 60}")
    print(f"Register edge-case tests: {passed}/{len(results)} passed")
    print(f"{'=' * 60}")
    for r in results:
        mark = "PASS" if r.passed else "FAIL"
        print(f"  [{mark}] {r.name} — {r.detail}")
    if failed:
        print(f"\n{len(failed)} test(s) failed.")
        return 1
    print("\nAll edge-case tests passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
