"""Smoke test: upload / PATCH / restore / search — รันใน container หลัง rebuild."""

from __future__ import annotations

import json
import sys
import time
import uuid
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@edudata.go.th"
ADMIN_PASSWORD = "admintest12345"
FIXTURE = "/app/tests/fixtures/test_data.csv"


def req(method: str, path: str, token: str | None = None, **kwargs):
    headers = dict(kwargs.pop("headers", {}))
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = kwargs.get("data")
    if isinstance(data, dict):
        data = json.dumps(data).encode()
        headers.setdefault("Content-Type", "application/json")
        kwargs["data"] = data
    request = urllib.request.Request(
        f"{BASE}{path}",
        method=method,
        headers=headers,
        **kwargs,
    )
    try:
        with urllib.request.urlopen(request) as resp:
            body = resp.read().decode()
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode()
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            payload = {"raw": body}
        return exc.code, payload


def login() -> str:
    status, body = req(
        "POST",
        "/auth/login",
        data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert status == 200, f"login failed: {status} {body}"
    return body["data"]["access_token"]


def upload(token: str, title: str) -> str:
    boundary = uuid.uuid4().hex
    with open(FIXTURE, "rb") as f:
        csv = f.read()
    body = io_parts(boundary, title, csv)
    status, payload = req(
        "POST",
        "/datasets",
        token=token,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    assert status == 201, f"upload failed: {status} {payload}"
    return payload["data"]["id"]


def io_parts(boundary: str, title: str, csv: bytes) -> bytes:
    chunks: list[bytes] = []
    for name, value in [
        ("title", title),
        ("license", "open"),
        ("status", "published"),
    ]:
        chunks.append(
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'
            f"{value}\r\n".encode()
        )
    chunks.append(
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="test_data.csv"\r\n'
        f"Content-Type: text/csv\r\n\r\n".encode()
    )
    chunks.append(csv)
    chunks.append(f"\r\n--{boundary}--\r\n".encode())
    return b"".join(chunks)


def patch(token: str, dataset_id: str, new_title: str) -> None:
    status, payload = req(
        "PATCH",
        f"/datasets/{dataset_id}",
        token=token,
        data={"title": new_title},
    )
    assert status == 200, f"patch failed: {status} {payload}"


def restore(token: str, dataset_id: str, version_number: int) -> None:
    status, payload = req(
        "POST",
        f"/datasets/{dataset_id}/versions/{version_number}/restore",
        token=token,
    )
    assert status == 200, f"restore failed: {status} {payload}"


def search(keyword: str, filters: dict | None = None) -> tuple[int, dict]:
    params: list[str] = []
    if keyword:
        params.append(f"keyword={urllib.parse.quote(keyword)}")
    if filters:
        params.append(f"filters={urllib.parse.quote(json.dumps(filters))}")
    query = "&".join(params) if params else ""
    path = f"/search?{query}" if query else "/search"
    return req("GET", path)


def main() -> int:
    uid = uuid.uuid4().hex[:8]
    title = f"SmokeTest-{uid}"
    updated = f"SmokeTest-Updated-{uid}"

    print("1) Login admin...")
    token = login()
    print("   OK")

    print("2) Upload CSV (published)...")
    dataset_id = upload(token, title)
    print(f"   OK dataset_id={dataset_id}")

    print("3) PATCH title...")
    patch(token, dataset_id, updated)
    print("   OK")

    print("4) Restore version 1...")
    restore(token, dataset_id, 1)
    print("   OK")

    print("5) Wait ES background index...")
    time.sleep(3)

    print("6) Search filter format=csv...")
    status, body = search(updated, {"format": "csv"})
    assert status == 200, f"search failed: {status} {body}"
    ids = [item["id"] for item in body.get("data", [])]
    print(f"   HTTP 200, results={len(ids)}, found_uploaded={dataset_id in ids}")

    print("7) Search invalid format...")
    status, body = search("", {"format": "pdf"})
    assert status == 400 and body.get("error", {}).get("code") == "SEARCH_INVALID_FILTER"
    print("   OK SEARCH_INVALID_FILTER")

    print("\nAll smoke tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
