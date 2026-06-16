"""
อัปโหลด Dataset ทดสอบ ds08–ds11 ผ่าน API (Agency flow)
Usage (host):
  python backend/scripts/upload_agency_datasets.py
Usage (docker):
  docker cp "ไฟล์ สัหรับทดสอบ" backend:/tmp/test-files
  docker exec thail-datacatalog-backend-1 python scripts/upload_agency_datasets.py --files-dir /tmp/test-files
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import sys
from pathlib import Path

import httpx

DEFAULT_API_BASE = "http://127.0.0.1:8000/api/v1"
AGENCY_EMAIL = "tatsaneewanyenwattana@gmail.com"
AGENCY_PASSWORD = "Admin@1234567"
DEFAULT_FILES_DIR = Path(__file__).resolve().parents[2] / "ไฟล์ สัหรับทดสอบ"

DATASETS = [
    {
        "file": "ds08-schools-2567.csv",
        "title": "จำนวนโรงเรียนรายจังหวัด 2567",
        "description": (
            "ข้อมูลจำนวนโรงเรียนแยกเป็นโรงเรียนรัฐบาลและเอกชนรายจังหวัด "
            "ปีการศึกษา 2567 จัดทำโดยสำนักงานทดสอบ (ข้อมูลจำลอง)"
        ),
        "l1_th": "สถิติโรงเรียน",
        "l1_en": "Test School Statistics",
        "l2_th": "โรงเรียนรายจังหวัด",
        "l2_en": "Test Schools By Province",
        "tags": ["ทดสอบ", "โรงเรียน", "รายจังหวัด", "สถิติ"],
        "year_start": 2567,
        "year_end": 2567,
        "province": "เชียงใหม่",
    },
    {
        "file": "ds09-budget-2566.xlsx",
        "title": "งบประมาณการศึกษารายจังหวัด 2566",
        "description": (
            "ข้อมูลงบประมาณการศึกษาหน่วยล้านบาทแยกตามจังหวัด "
            "ปีการศึกษา 2566 จัดทำโดยสำนักงานทดสอบ (ข้อมูลจำลอง)"
        ),
        "l1_th": "งบประมาณการศึกษา",
        "l1_en": "Test Education Budget",
        "l2_th": "งบประมาณรายจังหวัด",
        "l2_en": "Test Budget By Province",
        "tags": ["ทดสอบ", "งบประมาณ", "การศึกษา", "รายจังหวัด"],
        "year_start": 2566,
        "year_end": 2566,
        "province": None,
    },
    {
        "file": "ds10-school-students-khonkaen-2566.csv",
        "title": "นักเรียนรายโรงเรียน จังหวัดขอนแก่น 2566",
        "description": (
            "ข้อมูลจำนวนนักเรียนแยกรายโรงเรียนและระดับชั้น "
            "ในจังหวัดขอนแก่น ปีการศึกษา 2566 จัดทำโดยสำนักงานทดสอบ (ข้อมูลจำลอง)"
        ),
        "l1_th": "สถิตินักเรียน",
        "l1_en": "Test Student Statistics",
        "l2_th": "นักเรียนรายโรงเรียน",
        "l2_en": "Test Students By School",
        "tags": ["ทดสอบ", "นักเรียน", "ขอนแก่น", "รายโรงเรียน"],
        "year_start": 2566,
        "year_end": 2566,
        "province": "ขอนแก่น",
    },
    {
        "file": "ds11-education-report-2566.pdf",
        "title": "รายงานสถานการณ์การศึกษา 2566",
        "description": (
            "รายงานสรุปสถานการณ์การศึกษาไทย ปีการศึกษา 2566 "
            "จัดทำโดยสำนักงานทดสอบ (ข้อมูลจำลอง)"
        ),
        "l1_th": "รายงานการศึกษา",
        "l1_en": "Test Education Reports",
        "l2_th": "รายงานประจำปี",
        "l2_en": "Test Annual Education Report",
        "tags": ["ทดสอบ", "รายงาน", "การศึกษา", "2566"],
        "year_start": 2566,
        "year_end": 2566,
        "province": None,
    },
]


def login(client: httpx.Client, api_base: str) -> str:
    res = client.post(
        f"{api_base}/auth/login",
        json={"email": AGENCY_EMAIL, "password": AGENCY_PASSWORD},
    )
    res.raise_for_status()
    body = res.json()
    if not body.get("success"):
        raise RuntimeError(f"Login failed: {body}")
    return body["data"]["access_token"]


def get_categories(client: httpx.Client, token: str, api_base: str) -> list[dict]:
    res = client.get(
        f"{api_base}/categories",
        headers={"Authorization": f"Bearer {token}"},
    )
    res.raise_for_status()
    return res.json().get("data") or []


def find_category(
    categories: list[dict],
    *,
    name_th: str,
    level: int,
    parent_id: str | None,
    owner_id: str,
) -> dict | None:
    for cat in categories:
        if (
            cat.get("name_th") == name_th
            and cat.get("level") == level
            and str(cat.get("created_by")) == owner_id
            and (
                (cat.get("parent_id") is None and parent_id is None)
                or str(cat.get("parent_id")) == str(parent_id)
            )
        ):
            return cat
    return None


def create_root_category(
    client: httpx.Client,
    token: str,
    api_base: str,
    name_th: str,
    name_en: str,
) -> dict:
    res = client.post(
        f"{api_base}/categories",
        headers={"Authorization": f"Bearer {token}"},
        json={"name_th": name_th, "name_en": name_en},
    )
    if res.status_code == 409:
        raise RuntimeError(f"Category slug conflict for {name_en}: {res.text}")
    res.raise_for_status()
    return res.json()["data"]


def create_subcategory(
    client: httpx.Client,
    token: str,
    api_base: str,
    parent_id: str,
    name_th: str,
    name_en: str,
) -> dict:
    res = client.post(
        f"{api_base}/categories/{parent_id}/subcategories",
        headers={"Authorization": f"Bearer {token}"},
        json={"name_th": name_th, "name_en": name_en},
    )
    if res.status_code == 409:
        raise RuntimeError(f"Subcategory slug conflict for {name_en}: {res.text}")
    res.raise_for_status()
    return res.json()["data"]


def ensure_leaf_category(
    client: httpx.Client,
    token: str,
    api_base: str,
    owner_id: str,
    l1_th: str,
    l1_en: str,
    l2_th: str,
    l2_en: str,
) -> str:
    categories = get_categories(client, token, api_base)
    l1 = find_category(
        categories, name_th=l1_th, level=1, parent_id=None, owner_id=owner_id
    )
    if l1 is None:
        print(f"  + สร้างหมวดหลัก: {l1_th}")
        l1 = create_root_category(client, token, api_base, l1_th, l1_en)
        categories.append(l1)

    l2 = find_category(
        categories,
        name_th=l2_th,
        level=2,
        parent_id=l1["id"],
        owner_id=owner_id,
    )
    if l2 is None:
        print(f"  + สร้างหมวดย่อย: {l1_th} → {l2_th}")
        l2 = create_subcategory(client, token, api_base, l1["id"], l2_th, l2_en)

    return str(l2["id"])


def upload_dataset(
    client: httpx.Client,
    token: str,
    api_base: str,
    *,
    file_path: Path,
    title: str,
    description: str,
    category_id: str,
    tags: list[str],
    year_start: int,
    year_end: int,
    province: str | None,
) -> dict:
    metadata: dict = {"year_start": year_start, "year_end": year_end}
    if province:
        metadata["province"] = province

    mime, _ = mimetypes.guess_type(str(file_path))
    if file_path.suffix.lower() == ".xlsx":
        mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif file_path.suffix.lower() == ".csv":
        mime = "text/csv"
    elif file_path.suffix.lower() == ".pdf":
        mime = "application/pdf"

    with file_path.open("rb") as fh:
        files = {"file": (file_path.name, fh, mime or "application/octet-stream")}
        data = {
            "title": title,
            "description": description,
            "license": "open",
            "category_id": category_id,
            "tags": json.dumps(tags, ensure_ascii=False),
            "year_start": str(year_start),
            "year_end": str(year_end),
            "status": "published",
            "metadata": json.dumps(metadata, ensure_ascii=False),
        }
        res = client.post(
            f"{api_base}/datasets",
            headers={"Authorization": f"Bearer {token}"},
            data=data,
            files=files,
            timeout=120.0,
        )

    if res.status_code >= 400:
        raise RuntimeError(f"Upload failed ({file_path.name}): {res.text}")

    return res.json()["data"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-base", default=DEFAULT_API_BASE)
    parser.add_argument("--files-dir", default=str(DEFAULT_FILES_DIR))
    args = parser.parse_args()

    api_base = args.api_base.rstrip("/")
    files_dir = Path(args.files_dir)

    if not files_dir.is_dir():
        print(f"ไม่พบโฟลเดอร์ไฟล์: {files_dir}", file=sys.stderr)
        return 1

    print(f"API: {api_base}")
    print(f"Files: {files_dir}")
    print(f"Agency: {AGENCY_EMAIL}")

    with httpx.Client() as client:
        token = login(client, api_base)
        print("Login สำเร็จ")

        me = client.get(
            f"{api_base}/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        ).json()["data"]
        owner_id = str(me["id"])
        print(f"User ID: {owner_id} | {me.get('agency_name')}")

        results: list[tuple[str, str, str]] = []

        for item in DATASETS:
            file_path = files_dir / item["file"]
            print(f"\n=== {item['file']} ===")
            if not file_path.is_file():
                print(f"  ข้าม — ไม่พบไฟล์: {file_path}")
                continue

            category_id = ensure_leaf_category(
                client,
                token,
                api_base,
                owner_id,
                item["l1_th"],
                item["l1_en"],
                item["l2_th"],
                item["l2_en"],
            )

            dataset = upload_dataset(
                client,
                token,
                api_base,
                file_path=file_path,
                title=item["title"],
                description=item["description"],
                category_id=category_id,
                tags=item["tags"],
                year_start=item["year_start"],
                year_end=item["year_end"],
                province=item["province"],
            )
            ds_id = dataset["id"]
            status = dataset.get("status", "?")
            print(f"  ✓ อัปโหลดสำเร็จ — id={ds_id} status={status}")
            results.append((item["file"], ds_id, status))

    print("\n========== สรุป ==========")
    for fname, ds_id, status in results:
        print(f"  {fname} → {ds_id} ({status})")
    print(f"  รวม {len(results)}/{len(DATASETS)} ชุด")
    return 0 if len(results) == len(DATASETS) else 1


if __name__ == "__main__":
    raise SystemExit(main())
