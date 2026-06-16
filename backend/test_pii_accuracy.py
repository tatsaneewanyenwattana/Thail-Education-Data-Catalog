import sys, pandas as pd

sys.path.insert(0, '/app')
from app.pii.detector import detect_pii

def make_valid_id(first12):
    digits = [int(d) for d in first12]
    total = sum(d * (13 - i) for i, d in enumerate(digits))
    check = (11 - (total % 11)) % 10
    return first12 + str(check)

test_cases = {
    "เลขบัตร (ผ่าน checksum)":     ({"เลขบัตร": [make_valid_id("100101234567"), make_valid_id("200202345678")]}, "national_id", True),
    "เลขบัตร (invalid checksum)":   ({"เลขบัตร": ["1234567890123", "9999999999999"]}, "national_id", False),
    "เบอร์มือถือ 0[689]":           ({"เบอร์": ["0812345678", "0898765432"]}, "phone", True),
    "เบอร์บ้าน 0[2-7]":            ({"โทรศัพท์": ["021234567", "033456789"]}, "phone", True),
    "รหัส 5 หลัก (ไม่ใช่เบอร์)":   ({"รหัส": ["10110", "20212"]}, "phone", False),
    "อีเมลจริง":                    ({"อีเมล": ["test@email.com", "user@gmail.com"]}, "email", True),
    "ข้อความทั่วไป":                ({"หมายเหตุ": ["ข้อมูลปี 2566", "ระดับ ม.3"]}, "email", False),
    "ชื่อนักเรียน + คำนำหน้า":      ({"ชื่อนักเรียน": ["นายสมชาย ใจดี", "นางสาวมาลี สวยงาม"]}, "full_name", True),
    "column fullname":              ({"fullname": ["Somchai Jaidee", "Malee Suvannee"]}, "full_name", True),
    "ชื่อโรงเรียน (ไม่ใช่ชื่อคน)": ({"โรงเรียน": ["โรงเรียนตัวอย่าง", "โรงเรียน A"]}, "full_name", False),
    "เลขที่บัญชี (TP)":             ({"เลขที่บัญชี": ["1234567890", "0987654321"]}, "bank_account", True),
    "รหัสโรงเรียน (TN)":            ({"รหัสโรงเรียน": ["1234567890", "0987654321"]}, "bank_account", False),
    "วันเกิด (TP)":                 ({"วันเกิด": ["2548-03-15", "2547-07-22"]}, "birth_date", True),
    "ปีการศึกษา (TN)":              ({"ปีการศึกษา": ["2566", "2565"]}, "birth_date", False),
    "ศาสนา (TP)":                   ({"ศาสนา": ["พุทธ", "อิสลาม", "คริสต์"]}, "religion", True),
    "หมวดหมู่ value ศาสนา (TN)":    ({"หมวดหมู่": ["พุทธ", "อิสลาม", "คริสต์"]}, "religion", False),
}

print("=" * 60)
print("  PII Detector - Accuracy Test")
print("=" * 60)

passed = failed = 0
by_type = {}

for name, (data, pii_type, expect) in test_cases.items():
    df = pd.DataFrame(data)
    result = detect_pii(df)
    found = any(f.pii_type == pii_type for f in result.findings)
    ok = found == expect
    if pii_type not in by_type:
        by_type[pii_type] = [0, 0]
    by_type[pii_type][1] += 1
    if ok:
        passed += 1
        by_type[pii_type][0] += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        want = "เจอ" if expect else "ไม่เจอ"
        got  = "เจอ" if found  else "ไม่เจอ"
        print(f"  FAIL  {name}  (คาดหวัง:{want} / จริง:{got})")

print()
print("=" * 60)
print("  ความแม่นยำแยกตามประเภท")
print("=" * 60)
labels = {
    "national_id":  "เลขบัตร",
    "phone":        "เบอร์โทร",
    "email":        "อีเมล",
    "full_name":    "ชื่อ-นามสกุล",
    "bank_account": "เลขบัญชี",
    "birth_date":   "วันเกิด",
    "religion":     "ศาสนา",
}
for t, (p, total) in by_type.items():
    pct = p / total * 100
    bar = "X" * int(pct / 10) + "." * (10 - int(pct / 10))
    print(f"  {labels.get(t,t):<18} [{bar}] {pct:5.1f}%  ({p}/{total})")

total_all = passed + failed
print()
print(f"  รวม: {passed/total_all*100:.1f}%  ({passed}/{total_all} cases)")
print("=" * 60)