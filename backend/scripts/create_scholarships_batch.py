"""
สร้างทุนการศึกษาทดสอบ 7 รายการ ผ่าน API (Agency)
กระจายประเภททุน/ระดับ/หน่วยงานเจ้าของทุนในข้อมูล (โพสต์โดยบัญชี Agency เดียว)

Usage:
  python backend/scripts/create_scholarships_batch.py
  python backend/scripts/create_scholarships_batch.py --api-base http://127.0.0.1:8000/api/v1
"""

from __future__ import annotations

import argparse
import sys

import httpx

DEFAULT_API_BASE = "http://127.0.0.1:8000/api/v1"
AGENCY_EMAIL = "tatsaneewanyenwattana@gmail.com"
AGENCY_PASSWORD = "Admin@1234567"

SCHOLARSHIPS = [
    {
        "title": "ทุน ก.พ.อ. สำหรับข้าราชการครูและบุคลากรทางการศึกษา 2569",
        "description": (
            "คณะกรรมการข้าราชการพลเรือน (ก.พ.อ.) เปิดรับสมัครทุนพัฒนาบุคลากรภาครัฐ "
            "สำหรับข้าราชการครูและบุคลากรทางการศึกษา เพื่อศึกษาต่อระดับปริญญาโท"
        ),
        "scholarship_type": "government",
        "target_level": "master",
        "eligibility": (
            "หน่วยงานเจ้าของทุน: คณะกรรมการข้าราชการพลเรือน (ก.พ.อ.)\n\n"
            "* เป็นข้าราชการครูหรือบุคลากรทางการศึกษา\n"
            "* มีอายุงานไม่น้อยกว่า 3 ปี\n"
            "* ได้รับการอนุมัติจากสถานศึกษา/หน่วยงานต้นสังกัด\n"
            "* GPAX ป.ตรี ไม่ต่ำกว่า 2.75\n\n"
            "เอกสาร: แบบฟอร์ม ก.พ.อ., หนังสืออนุมัติจากต้นสังกัด, Transcript"
        ),
        "open_date": "2026-06-01",
        "close_date": "2026-08-15",
        "amount": 90000,
        "amount_note": "ต่อปีการศึกษา",
        "application_url": "https://www.ocsc.go.th/scholarship",
        "contact_phone": "02-247-0000",
        "contact_email": "scholarship@ocsc.go.th",
    },
    {
        "title": "ทุนส่งเสริมผู้เรียนดี ม.ปลาย ภาคเหนือ 2569",
        "description": (
            "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน เปิดรับสมัครนักเรียนมัธยมศึกษาตอนปลาย "
            "ที่มีผลการเรียนดีเยี่ยมในพื้นที่ภาคเหนือ เพื่อสนับสนุนค่าใช้จ่ายในการเตรียมสอบเข้ามหาวิทยาลัย"
        ),
        "scholarship_type": "government",
        "target_level": "high_school",
        "eligibility": (
            "หน่วยงานเจ้าของทุน: สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)\n\n"
            "* นักเรียนม.6 ในพื้นที่ภาคเหนือ\n"
            "* GPAX ไม่ต่ำกว่า 3.50\n"
            "* ครอบครัวมีรายได้ไม่เกินเกณฑ์ที่กำหนด\n"
            "* ไม่เคยได้รับทุนประเภทเดียวกันในปีการศึกษานี้\n\n"
            "เอกสาร: สำเนาทะเบียนบ้าน, ใบแสดงผลการเรียน, หนังสือรับรองจากโรงเรียน"
        ),
        "open_date": "2026-05-01",
        "close_date": "2026-08-31",
        "amount": 15000,
        "amount_note": "ต่อปีการศึกษา",
        "application_url": "https://www.obec.go.th/scholarship",
        "contact_phone": "02-628-5000",
        "contact_email": "scholarship@obec.go.th",
    },
    {
        "title": "ทุนเรียนดี มหาวิทยาลัยขอนแก่น ระดับปริญญาตรี",
        "description": (
            "มหาวิทยาลัยขอนแก่น มอบทุนการศึกษาให้นักศึกษาใหม่ที่มีผลการเรียนดี "
            "ในสาขาวิทยาศาสตร์และเทคโนโลยี เพื่อส่งเสริมบุคลากรด้าน STEM ในภาคตะวันออกเฉียงเหนือ"
        ),
        "scholarship_type": "university",
        "target_level": "bachelor",
        "eligibility": (
            "หน่วยงานเจ้าของทุน: มหาวิทยาลัยขอนแก่น\n\n"
            "* นักเรียนที่สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย\n"
            "* ได้รับการตอบรับเข้าศึกษาในหลักสูตรวิทยาศาสตร์หรือวิศวกรรมศาสตร์\n"
            "* GPAX ไม่ต่ำกว่า 3.00\n"
            "* มีความประพฤติดี\n\n"
            "เอกสาร: ใบสมัคร, Transcript, จดหมายแนะนำจากครู"
        ),
        "open_date": "2026-04-01",
        "close_date": "2026-09-30",
        "amount": 50000,
        "amount_note": "ต่อภาคการศึกษา",
        "application_url": "https://www.kku.ac.th/scholarship",
        "contact_phone": "043-202-411",
        "contact_email": "admission@kku.ac.th",
    },
    {
        "title": "ทุนมูลนิธิร่วมพัฒนาการศึกษาไทย สำหรับครูและบุคลากร",
        "description": (
            "มูลนิธิร่วมพัฒนาการศึกษาไทย เปิดรับสมัครทุนสนับสนุนการศึกษาต่อ "
            "สำหรับครูและบุคลากรทางการศึกษาที่ต้องการพัฒนาศักยภาพวิชาชีพ"
        ),
        "scholarship_type": "foundation",
        "target_level": "any",
        "eligibility": (
            "หน่วยงานเจ้าของทุน: มูลนิธิร่วมพัฒนาการศึกษาไทย\n\n"
            "* เป็นครูหรือบุคลากรทางการศึกษาในสถานศึกษาไทย\n"
            "* มีประสบการณ์การสอนไม่น้อยกว่า 3 ปี\n"
            "* มีแผนการนำความรู้ไปใช้ประโยชน์หลังสำเร็จการศึกษา\n"
            "* ได้รับการรับรองจากสถานศึกษา\n\n"
            "เอกสาร: หนังสือรับรองจากสถานศึกษา, แผนการพัฒนาวิชาชีพ"
        ),
        "open_date": "2026-06-01",
        "close_date": "2026-10-15",
        "amount": 80000,
        "amount_note": "ต่อปีการศึกษา",
        "application_url": "https://www.edfoundation.or.th/apply",
        "contact_phone": "02-123-4567",
        "contact_email": "fund@edfoundation.or.th",
    },
    {
        "title": "ทุน SCB ส่งเสริมเยาวชนด้านดิจิทัล 2569",
        "description": (
            "ธนาคารไทยพาณิชย์ ร่วมกับพันธมิตรด้านเทคโนโลยี มอบทุนการศึกษา "
            "ให้นักศึกษาระดับปริญญาตรีที่สนใจพัฒนาทักษะดิจิทัลและนวัตกรรม"
        ),
        "scholarship_type": "private",
        "target_level": "bachelor",
        "eligibility": (
            "หน่วยงานเจ้าของทุน: ธนาคารไทยพาณิชย์ (SCB)\n\n"
            "* นักศึกษาระดับปริญญาตรี ปี 2–4\n"
            "* สาขาวิทยาการคอมพิวเตอร์ ไอที หรือสาขาที่เกี่ยวข้อง\n"
            "* GPAX ไม่ต่ำกว่า 2.75\n"
            "* มีผลงานหรือโครงการด้านดิจิทัล\n\n"
            "เอกสาร: Portfolio ผลงาน, Transcript, จดหมายแนะนำ"
        ),
        "open_date": "2026-07-01",
        "close_date": "2026-09-01",
        "amount": 100000,
        "amount_note": "ต่อปีการศึกษา",
        "application_url": "https://www.scb.co.th/th/corp-community/scholarship.html",
        "contact_phone": "02-777-7777",
        "contact_email": "scholarship@scb.co.th",
    },
    {
        "title": "ทุนแลกเปลี่ยน JASSO ญี่ปุ่น–ไทย 2569",
        "description": (
            "Japan Student Services Organization (JASSO) ร่วมกับสำนักงานคณะกรรมการการอุดมศึกษา "
            "เปิดรับสมัครทุนแลกเปลี่ยนระยะสั้นและระยะยาว สำหรับนักศึกษาไทยไปศึกษาต่อที่ญี่ปุ่น"
        ),
        "scholarship_type": "exchange",
        "target_level": "master",
        "eligibility": (
            "หน่วยงานเจ้าของทุน: JASSO / สกอ.\n\n"
            "* นักศึกษาระดับปริญญาโทหรือเอก\n"
            "* อายุไม่เกิน 35 ปี\n"
            "* มีความรู้ภาษาญี่ปุ่นหรือภาษาอังกฤษตามเกณฑ์\n"
            "* ได้รับการเสนอชื่อจากสถาบันอุดมศึกษาไทย\n\n"
            "เอกสาร: ใบสมัคร JASSO, แผนการเรียน, จดหมายตอบรับจากมหาวิทยาลัยญี่ปุ่น"
        ),
        "open_date": "2026-03-15",
        "close_date": "2026-11-30",
        "amount": 0,
        "amount_note": "ครอบคลุมค่าเล่าเรียนและค่าครองชีพตามเกณฑ์ JASSO",
        "application_url": "https://www.studyinjapan.go.th",
        "contact_phone": "02-354-7400",
        "contact_email": "jasso@studyinjapan.go.th",
    },
    {
        "title": "ทุนวิจัยระดับปริญญาเอก ด้านการศึกษาและสังคม",
        "description": (
            "ศูนย์วิจัยและพัฒนาการศึกษา เปิดรับสมัครทุนวิจัยระดับปริญญาเอก "
            "สำหรับผู้ที่ต้องการศึกษาวิจัยด้านนโยบายการศึกษา ความไม่เท่าเทียมทางการศึกษา "
            "และการพัฒนาระบบการศึกษาไทย"
        ),
        "scholarship_type": "other",
        "target_level": "doctoral",
        "eligibility": (
            "หน่วยงานเจ้าของทุน: ศูนย์วิจัยและพัฒนาการศึกษา\n\n"
            "* ผู้สมัครต้องได้รับการตอบรับเข้าศึกษาระดับปริญญาเอก\n"
            "* มี Proposal วิจัยที่เกี่ยวข้องกับการศึกษาไทย\n"
            "* GPAX ป.โท ไม่ต่ำกว่า 3.50\n"
            "* มีผลงานตีพิมพ์หรืองานวิจัยที่เกี่ยวข้อง (ถ้ามีจะพิจารณาเป็นพิเศษ)\n\n"
            "เอกสาร: Proposal วิจัย, Transcript ป.โท, CV, จดหมายแนะนำ 2 ฉบับ"
        ),
        "open_date": "2026-06-10",
        "close_date": "2026-12-31",
        "amount": 200000,
        "amount_note": "ต่อปีการศึกษา สูงสุด 4 ปี",
        "application_url": "https://www.edresearch.or.th/doctoral-fund",
        "contact_phone": "02-987-6543",
        "contact_email": "doctoral@edresearch.or.th",
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


def create_scholarship(
    client: httpx.Client,
    api_base: str,
    token: str,
    payload: dict,
) -> dict:
    body = {**payload, "status": "published"}
    res = client.post(
        f"{api_base}/scholarship",
        headers={"Authorization": f"Bearer {token}"},
        json=body,
        timeout=60.0,
    )
    if res.status_code >= 400:
        raise RuntimeError(f"Create failed ({payload['title']}): {res.text}")
    return res.json()["data"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-base", default=DEFAULT_API_BASE)
    args = parser.parse_args()
    api_base = args.api_base.rstrip("/")

    print(f"API: {api_base}")
    print(f"Agency: {AGENCY_EMAIL}")
    print(f"จำนวนทุน: {len(SCHOLARSHIPS)}")

    results: list[tuple[str, str, str]] = []

    with httpx.Client() as client:
        token = login(client, api_base)
        print("Login สำเร็จ\n")

        for index, item in enumerate(SCHOLARSHIPS, start=1):
            print(f"=== [{index}/{len(SCHOLARSHIPS)}] {item['title'][:50]}... ===")
            scholarship = create_scholarship(client, api_base, token, item)
            sid = scholarship["id"]
            status = scholarship.get("status", "?")
            stype = scholarship.get("scholarship_type", "?")
            print(f"  ✓ id={sid} type={stype} status={status}")
            results.append((item["title"], sid, status))

    print("\n========== สรุป ==========")
    for title, sid, status in results:
        print(f"  {title[:55]}...")
        print(f"    → {sid} ({status})")
    print(f"\n  รวม {len(results)}/{len(SCHOLARSHIPS)} รายการ")
    return 0 if len(results) == len(SCHOLARSHIPS) else 1


if __name__ == "__main__":
    raise SystemExit(main())
