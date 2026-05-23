# Datacatalog — Project Spec

---

## #1 · Project Vision

ข้อมูลด้านการศึกษาไทยในปัจจุบันกระจัดกระจายอยู่ตามหน่วยงานต่างๆ เช่น สพฐ., สอศ., สกศ., มหาวิทยาลัย, data.go.th ไม่มีใครรวบรวมไว้ที่เดียว ทำให้ประชาชน นักวิจัย หรือหน่วยงานที่ต้องการข้อมูลต้องตามหาเองจากหลายแหล่ง เสียเวลามาก และบางครั้งก็หาไม่เจอ

**ปัญหาที่ระบบนี้แก้**
- ปัญหาที่ 1 — ข้อมูลกระจัดกระจาย ไม่มี Single Entry Point ที่รวมข้อมูลการศึกษาไว้ที่เดียว
- ปัญหาที่ 2 — ข้อมูลส่วนตัวปนอยู่ในไฟล์ เช่น รหัสนักเรียน เบอร์โทร เลขบัตรประชาชน ระบบนี้จึงมี PII Masking อัตโนมัติ
- ปัญหาที่ 3 — ไม่มีมาตรฐานการเผยแพร่ข้อมูล ระบบนี้บังคับใช้มาตรฐาน DCAT-AP และเผยแพร่ Dataset ทันทีหลังอัปโหลด
- ปัญหาที่ 4 — นักพัฒนาหรือนักวิจัยที่อยากนำข้อมูลไปใช้ต่อไม่มี API กลาง ระบบนี้สร้าง API อัตโนมัติให้ทุก Dataset
- ปัญหาที่ 5 — ไม่รู้ว่าข้อมูลนำไปใช้ได้แค่ไหน ระบบนี้มีระบบ License ชัดเจนทุก Dataset

---

## #2 · Scope / Out of Scope

**In Scope** — 41 Feature ใน 8 Module ตามที่กำหนด

**Out of Scope — สิ่งที่ระบบนี้ไม่ทำ**
1. ไม่มีระบบ Payment หรือเก็บค่าบริการใดๆ
2. ไม่มี Real-time Collaboration เช่น Google Docs style
3. ไม่มีระบบ Chat หรือ Comment ระหว่าง Agency กับ Admin
4. ไม่มีการ Crawl หรือดึงข้อมูลจากเว็บภายนอกอัตโนมัติ
5. ไม่มี Mobile App (iOS/Android) มีแค่ Web
6. ไม่มีระบบ SSO หรือ Login ผ่าน Social เช่น Google, Line
7. ไม่รองรับไฟล์ประเภท PDF, Word, รูปภาพ — รับเฉพาะ CSV/Excel/JSON
8. ไม่มี Data Pipeline หรือ ETL อัตโนมัติ
9. ไม่มีระบบ AI/ML วิเคราะห์ข้อมูลให้ผู้ใช้
10. ไม่มีการ Sync ข้อมูลกับ data.go.th หรือแหล่งอื่นแบบ Real-time

---

## #3 · User Roles

- **Visitor** — ประชาชนทั่วไป ไม่ต้อง Login ไม่ต้องสมัครสมาชิก เข้ามาค้นหา ดู Preview ดาวน์โหลด และใช้ API ได้เลย
- **Agency** — หน่วยงานรัฐ ต้อง Login ด้วยบัญชีที่ Admin อนุมัติแล้ว 1 หน่วยงาน = 1 บัญชีเท่านั้น
- **Admin** — ผู้ดูแลระบบ สิทธิ์สูงสุด ดูแลทุกอย่างในระบบ

---

## #4 · Permission Matrix

| Feature | Visitor | Agency | Admin |
|---|---|---|---|
| ค้นหา Dataset | ✅ | ✅ | ✅ |
| ดู Preview 100 แถว | ✅ | ✅ | ✅ |
| ดาวน์โหลดข้อมูล | ✅ | ✅ | ✅ |
| เรียกใช้ API | ✅ | ✅ | ✅ |
| ดูสถิติภาพรวม | ✅ | ✅ | ✅ |
| Bookmark Dataset | ❌ | ✅ | ✅ |
| ตั้ง Subscription แจ้งเตือน | ❌ | ✅ | ✅ |
| บันทึกเงื่อนไขค้นหา | ❌ | ✅ | ✅ |
| อัปโหลด Dataset | ❌ | ✅ | ✅ |
| แก้ไข Dataset ของตัวเอง | ❌ | ✅ | ✅ |
| ลบ Dataset ของตัวเอง | ❌ | ✅ | ✅ |
| ลบ Dataset ของ Agency (ทุกหน่วยงาน) | ❌ | ❌ | ✅ |
| ดู Version History Dataset ตัวเอง | ❌ | ✅ | ✅ |
| Restore Version Dataset ตัวเอง | ❌ | ✅ | ✅ |
| Bulk Upload Excel Template | ❌ | ✅ | ✅ |
| ดู Data Quality Score | ❌ | ✅ | ✅ |
| จัดการ User ทั้งหมด | ❌ | ❌ | ✅ |
| Suspend บัญชี Agency | ❌ | ❌ | ✅ |
| สร้าง/แก้ไขหมวดหมู่ของตัวเอง | ❌ | ✅ | ✅ |
| จัดการหมวดหมู่ทุกหน่วยงาน / แท็ก | ❌ | ❌ | ✅ |
| ดู Audit Log | ❌ | ❌ | ✅ |
| ประกาศ / Banner | ❌ | ❌ | ✅ |
| ดู Dashboard ภาพรวมระบบ | ❌ | ❌ | ✅ |
| Custom Dashboard Drag & Drop | ✅ | ✅ | ✅ |
| เปรียบเทียบข้อมูลระหว่าง Dataset | ✅ | ✅ | ✅ |

---

## #5 · Business Rules

**M1 · Auth**
- Agency 1 หน่วยงาน มีได้ 1 บัญชีเท่านั้น
- บัญชีที่ถูก Suspend ยังคงแสดง Dataset ที่ Publish ไว้แล้วปกติ
- Token หมดอายุใน Redis ต้อง Login ใหม่
- Agency ที่ Status เป็น pending หรือ rejected Login ไม่ได้
- Agency ที่ Status เป็น suspended Login ไม่ได้
- เฉพาะ active เท่านั้นที่ Login ได้
- Admin อนุมัติ → เปลี่ยน Status เป็น active
- Admin ปฏิเสธ → เปลี่ยน Status เป็น rejected
- Admin Suspend → เปลี่ยน Status เป็น suspended
- Admin Unsuspend → เปลี่ยน Status เป็น active

**M2 · Dataset**
- Agency อัปโหลด Dataset → Status = published ทันที บันทึก published_at
- Admin อัปโหลด Dataset → Status = published ทันที บันทึก published_at
- แสดงเฉพาะ Dataset ที่ Status = published ต่อ Visitor
- Agency แก้ไข Dataset ได้เฉพาะ Dataset ของตัวเองเท่านั้น
- Agency ลบ Dataset ได้เฉพาะของตัวเอง (Soft Delete)
- Admin แก้ไขได้ทุก Dataset
- Admin ลบ Dataset ของ Agency ได้ (Soft Delete)
- ไม่มี Submit / Reject อีกต่อไป (ไม่มี Approval Workflow)
- หลัง Publish แล้ว ส่ง Email แจ้ง Subscriber ที่ติดตามหมวดหรือหน่วยงาน

**M3 · Search**
- แสดงเฉพาะ Dataset ที่ Status เป็น Published เท่านั้น
- Filter ที่ไม่มีข้อมูลให้ซ่อน Option นั้น แต่ยังแสดง Filter อยู่

**M4 · Download**
- ต้องกรอกวัตถุประสงค์ก่อนดาวน์โหลดทุกครั้ง ทุก Role รวมถึง Visitor
- บันทึก IP + Timestamp ทุกครั้งที่ดาวน์โหลด
- INSERT download_log และ UPDATE download_count ต้องอยู่ใน Transaction เดียวกันเสมอ

**M6 · Admin**
- Admin ไม่สามารถ Suspend ตัวเองได้

**หมวดหมู่ (Categories)**
- หมวดหมู่มี 2 ระดับ Agency สร้างและจัดการของตัวเองได้เลย ไม่ต้องรอ Admin
- หมวดหมู่ผูกกับ Agency ที่สร้าง Agency อื่นใช้ร่วมไม่ได้
- Agency สร้างหมวดระดับ 1 ของตัวเองได้เลย
- Agency สร้างหมวดระดับ 2 ได้ ต้องอยู่ใต้ระดับ 1 ของตัวเองเท่านั้น
- Agency แก้ไขได้เฉพาะหมวดที่ตัวเองสร้างเท่านั้น
- ลบหมวดได้เฉพาะถ้าไม่มี Dataset อยู่ใต้นั้น
- Admin จัดการหมวดหมู่ของทุก Agency ได้
- เมื่อ Agency ถูก Suspend หมวดหมู่และ Dataset ที่ Publish ไว้แล้วยังแสดงปกติ

**M7 · API**
- Rate Limit 100 request/นาที/IP สำหรับทุก Role รวมถึง Visitor
- เกิน Rate Limit คืน HTTP 429

**M8 · Security**
- PII Masking ทำก่อนบันทึกลง DB เสมอ ทุก Role เห็นข้อมูลที่ Mask แล้วเท่านั้น
- ไฟล์ที่อัปโหลดต้องผ่าน PII Scan ก่อน Save ลง MinIO ทุกครั้ง
- ไฟล์ขนาดเกิน 100MB ต้องปฏิเสธทันที

---

## #6 · Naming Convention

**Database**
- ชื่อ Table → snake_case พหูพจน์ เช่น users, datasets, download_logs
- ชื่อ Column → snake_case เช่น created_at, dataset_id, is_deleted
- ชื่อ Index → idx_ชื่อtable_ชื่อcolumn เช่น idx_datasets_status
- ชื่อ Foreign Key → fk_ชื่อtable_ชื่อtableที่อ้างถึง เช่น fk_datasets_users

**Backend (Python/FastAPI)**
- ชื่อ File → snake_case เช่น dataset_service.py, auth_router.py
- ชื่อ Function → snake_case เช่น get_dataset_by_id()
- ชื่อ Class → PascalCase เช่น DatasetService, UserRepository
- ชื่อ Variable → snake_case เช่น dataset_id, user_role
- ชื่อ Constant → UPPER_SNAKE_CASE เช่น MAX_FILE_SIZE, JWT_EXPIRE_MINUTES

**Frontend (Next.js)**
- ชื่อ Component File → PascalCase เช่น DatasetCard.tsx, SearchFilter.tsx
- ชื่อ Page File → kebab-case เช่น dataset-detail.tsx
- ชื่อ Function/Hook → camelCase เช่น useDatasetSearch(), handleDownload()
- ชื่อ CSS Class → kebab-case เช่น dataset-card, search-filter
- ชื่อ Constant → UPPER_SNAKE_CASE เช่น API_BASE_URL

**API Endpoint**
- ใช้ kebab-case เสมอ เช่น /api/v1/datasets, /api/v1/bulk-upload
- ใช้ Noun ไม่ใช่ Verb เช่น /datasets ไม่ใช่ /getDatasets
- พหูพจน์เสมอ เช่น /datasets, /users, /tags

**Environment Variables**
- UPPER_SNAKE_CASE เสมอ เช่น DATABASE_URL, REDIS_HOST, JWT_SECRET

---

## #7 · Folder Structure

```
datacatalog/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── [locale]/
│   │   │       ├── (public)/
│   │   │       ├── (agency)/
│   │   │       └── (admin)/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dataset/
│   │   │   ├── search/
│   │   │   ├── dashboard/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── locales/
│   ├── .env.local
│   └── next.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── routers/
│   │   │       └── __init__.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── workers/
│   │   └── utils/
│   ├── migrations/
│   ├── tests/
│   ├── .env
│   └── main.py
│
├── docker/
│   ├── frontend.dockerfile
│   ├── backend.dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── docker-compose.staging.yml
├── docker-compose.prod.yml
└── README.md
```

---

## #8 · Tech Stack Rules

**Frontend**
- ใช้ Next.js 14 App Router เท่านั้น ห้ามใช้ Pages Router
- ใช้ TypeScript เท่านั้น ห้ามใช้ JavaScript
- ใช้ Recharts สำหรับกราฟทุกประเภท ห้ามใช้ Chart.js หรือ D3
- ใช้ React DnD Kit สำหรับ Drag & Drop ห้ามใช้ React Beautiful DnD
- ใช้ Zustand สำหรับ State Management ห้ามใช้ Redux
- ใช้ React Hook Form สำหรับ Form ทุกตัว ห้ามจัดการ Form State เอง
- ใช้ Zod สำหรับ Validation ทุกตัว
- ใช้ TailwindCSS สำหรับ Styling ห้ามเขียน CSS ตรงๆ
- ใช้ next-intl สำหรับ i18n

**Backend**
- ใช้ FastAPI เท่านั้น ห้ามใช้ Flask หรือ Django
- ใช้ SQLAlchemy สำหรับ ORM ทุกตัว ห้ามเขียน Raw SQL ยกเว้นกรณีที่ ORM ทำไม่ได้จริงๆ
- ใช้ Alembic สำหรับ Database Migration ทุกครั้ง ห้ามแก้ DB ตรงๆ
- ใช้ Pydantic สำหรับ Schema Validation ทุกตัว
- ใช้ Pandas สำหรับประมวลผลไฟล์ CSV/Excel/JSON เท่านั้น
- ใช้ FastAPI Background Tasks สำหรับ Async Task ห้ามใช้ Celery

**Database**
- ใช้ PostgreSQL สำหรับข้อมูลทุกประเภทที่เป็นโครงสร้าง
- ใช้ Redis สำหรับ Cache และ Session เท่านั้น ห้ามเก็บข้อมูลถาวรใน Redis
- ใช้ MinIO สำหรับเก็บไฟล์ทุกประเภท ห้ามเก็บไฟล์ใน Local Disk

**Search**
- ใช้ Elasticsearch สำหรับ Search ทุกอย่าง ห้ามใช้ PostgreSQL Full-text Search
- ใช้ PyThaiNLP ตัดคำไทยก่อนส่งให้ Elasticsearch ทุกครั้ง

**Security**
- ใช้ JWT สำหรับ Authentication ทุกตัว
- ใช้ python-jose สำหรับออก JWT
- ใช้ passlib สำหรับ Hash Password

---

## #9 · Environment Variables

**Backend `.env`**
```
# App
APP_ENV=development
APP_SECRET_KEY=

# Database
DATABASE_URL=
DATABASE_POOL_SIZE=10

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# MinIO
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_NAME=

# Elasticsearch
ELASTICSEARCH_URL=

# JWT
JWT_SECRET=
JWT_EXPIRE_MINUTES=60

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Rate Limit
RATE_LIMIT_PER_MINUTE=100

# File Upload
MAX_FILE_SIZE_MB=100
```

**Frontend `.env.local`**
```
# API
NEXT_PUBLIC_API_BASE_URL=

# App
NEXT_PUBLIC_APP_ENV=development
```

---

## #10 · API Response Standard (JSend)

**Success Response**
```json
{
  "success": true,
  "data": {},
  "message": "ok"
}
```

**Success Response แบบ List**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5
  },
  "message": "ok"
}
```

**Error Response**
```json
{
  "success": false,
  "error": {
    "code": "DATASET_NOT_FOUND",
    "message": "ไม่พบ Dataset ที่ต้องการ"
  }
}
```

**กฎ**
- ทุก Endpoint ต้องใช้รูปแบบนี้เสมอ ไม่มีข้อยกเว้น
- data เป็น Object สำหรับข้อมูลชิ้นเดียว
- data เป็น Array สำหรับข้อมูลหลายรายการ
- message ใช้ภาษาอังกฤษเสมอ
- error.message ใช้ภาษาไทยเพื่อแสดงให้ผู้ใช้เห็น
- error.code ใช้ UPPER_SNAKE_CASE เสมอ

---

## #11 · Database Tables

| ชื่อตาราง | เก็บอะไร | Module |
|---|---|---|
| users | ข้อมูล User ทุก Role | M1 |
| bookmarks | Dataset ที่ User bookmark ไว้ | M1 |
| subscriptions | การติดตามหมวด/หน่วยงาน | M1 |
| datasets | ข้อมูล Dataset ทั้งหมด | M2 |
| dataset_versions | ประวัติการแก้ไข Dataset | M2 |
| dataset_files | ไฟล์จริงที่อยู่ใน MinIO | M2 |
| categories | หมวดหมู่ Dataset แบบ 2 ระดับ Agency สร้างและจัดการของตัวเองได้เลย ผูกกับ Agency ที่สร้าง | M2 |
| tags | แท็กทั้งหมด | M2 |
| dataset_tags | ความสัมพันธ์ Dataset กับ Tag | M2 |
| saved_searches | เงื่อนไขค้นหาที่บันทึกไว้ | M3 |
| download_logs | ประวัติการดาวน์โหลด | M4 |
| dashboard_layouts | Layout Custom Dashboard | M5 |
| announcements | ประกาศ/Banner หน้าหลัก | M6 |
| audit_logs | ประวัติทุก Action ในระบบ | M6 |
| pdpa_consents | บันทึกการยอมรับ PDPA | M8 |

---

## #12 · Database Fields & Types

**`users`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| email | VARCHAR(255) | NO | - | Unique |
| password_hash | VARCHAR(255) | NO | - | |
| role | ENUM(user_role) | NO | - | visitor/agency/admin |
| status | ENUM(user_status) | NO | pending | pending/active/rejected/suspended |
| agency_name | VARCHAR(255) | YES | NULL | เฉพาะ Role Agency |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`datasets`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| category_id | UUID | YES | NULL | FK → categories |
| title | VARCHAR(500) | NO | - | |
| description | TEXT | YES | NULL | |
| status | ENUM(dataset_status) | NO | published | ตั้งเป็น published ทันทีหลังอัปโหลด |
| license | ENUM(dataset_license) | NO | - | |
| metadata | JSONB | YES | NULL | DCAT-AP metadata |
| quality_score | INTEGER | YES | NULL | 0-100 |
| download_count | INTEGER | NO | 0 | Cache ไม่ใช่ข้อมูลจริง |
| view_count | INTEGER | NO | 0 | |
| reject_comment | TEXT | YES | NULL | |
| published_at | TIMESTAMPTZ | YES | NULL | |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`dataset_versions`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| dataset_id | UUID | NO | - | FK → datasets |
| version_number | INTEGER | NO | - | เริ่มจาก 1 |
| file_path | VARCHAR(500) | NO | - | Path ใน MinIO |
| changelog | TEXT | YES | NULL | |
| created_by | UUID | NO | - | FK → users |
| created_at | TIMESTAMPTZ | NO | now() | |

**`dataset_files`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| dataset_id | UUID | NO | - | FK → datasets |
| file_name | VARCHAR(255) | NO | - | |
| file_path | VARCHAR(500) | NO | - | Path ใน MinIO |
| file_size | BIGINT | NO | - | หน่วย Bytes |
| file_format | ENUM(file_format) | NO | - | |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`categories`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| parent_id | UUID | YES | NULL | FK → categories ตัวเอง, NULL = ระดับ 1 |
| created_by | UUID | NO | - | FK → users (Agency ที่สร้าง) |
| level | INTEGER | NO | 1 | 1 = ระดับบนสุด, 2 = ระดับย่อย |
| name_th | VARCHAR(255) | NO | - | |
| name_en | VARCHAR(255) | NO | - | |
| slug | VARCHAR(255) | NO | - | Unique |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`tags`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| name | VARCHAR(100) | NO | - | Unique |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`dataset_tags`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| dataset_id | UUID | NO | - | FK → datasets |
| tag_id | UUID | NO | - | FK → tags |
| created_at | TIMESTAMPTZ | NO | now() | |

**`bookmarks`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| dataset_id | UUID | NO | - | FK → datasets |
| created_at | TIMESTAMPTZ | NO | now() | |

**`subscriptions`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| category_id | UUID | YES | NULL | FK → categories |
| agency_user_id | UUID | YES | NULL | FK → users |
| created_at | TIMESTAMPTZ | NO | now() | |

**`saved_searches`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| name | VARCHAR(255) | NO | - | |
| filters | JSONB | NO | - | |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`download_logs`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| dataset_id | UUID | NO | - | FK → datasets |
| user_id | UUID | YES | NULL | NULL ถ้าเป็น Visitor |
| ip_address | VARCHAR(45) | NO | - | |
| purpose | TEXT | NO | - | |
| file_format | ENUM(file_format) | NO | - | |
| created_at | TIMESTAMPTZ | NO | now() | |

**`dashboard_layouts`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users, Unique |
| layout | JSONB | NO | - | |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`announcements`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| title | VARCHAR(500) | NO | - | |
| content | TEXT | NO | - | |
| is_active | BOOLEAN | NO | true | |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_by | UUID | NO | - | FK → users |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`audit_logs`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | YES | NULL | NULL ถ้าเป็น Visitor |
| action | VARCHAR(100) | NO | - | เช่น DATASET_APPROVED |
| target_type | VARCHAR(100) | NO | - | เช่น dataset, user |
| target_id | UUID | YES | NULL | |
| detail | JSONB | YES | NULL | |
| ip_address | VARCHAR(45) | NO | - | |
| created_at | TIMESTAMPTZ | NO | now() | |

**`pdpa_consents`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| version | VARCHAR(50) | NO | - | |
| consented_at | TIMESTAMPTZ | NO | now() | |
| ip_address | VARCHAR(45) | NO | - | |

---

## #13 · Database Relationships

- User คนหนึ่ง → อัปโหลดได้หลาย Dataset
- User คนหนึ่ง → Bookmark ได้หลาย Dataset
- User คนหนึ่ง → Subscribe ได้หลายหมวด/หน่วยงาน
- User คนหนึ่ง → บันทึกการค้นหาได้หลายอัน
- User คนหนึ่ง → มี Dashboard Layout ได้แค่ 1 อัน
- User คนหนึ่ง → ดาวน์โหลดได้หลายครั้ง
- Agency คนหนึ่ง → สร้างหมวดหมู่ของตัวเองได้หลายหมวด
- Dataset หนึ่งชุด → เป็นของ User คนเดียวเท่านั้น
- Dataset หนึ่งชุด → อยู่ใน Category เดียวเท่านั้น
- Dataset หนึ่งชุด → มีได้หลาย Version
- Dataset หนึ่งชุด → มีได้หลายไฟล์
- Dataset หนึ่งชุด → ติดได้หลาย Tag
- Dataset หนึ่งชุด → ถูกดาวน์โหลดได้หลายครั้ง
- Dataset หนึ่งชุด → ถูก Bookmark ได้โดยหลายคน
- Category หนึ่งหมวด → เป็นของ Agency ที่สร้างเท่านั้น
- Category หนึ่งหมวด → มีได้หลาย Dataset
- Category ระดับ 1 → มีได้หลาย Category ระดับ 2 ใต้ตัวเอง
- Tag หนึ่งอัน → ติดได้กับหลาย Dataset และ Dataset หนึ่งชุดติดได้หลาย Tag ต้องมีตาราง dataset_tags กลางไว้เชื่อม

---

## #14 · ENUM Definitions

| ชื่อ ENUM | ใช้ที่ Column | ค่าที่มี | หมายความว่า |
|---|---|---|---|
| user_role | users.role | visitor | ประชาชนทั่วไป |
| | | agency | หน่วยงานรัฐ |
| | | admin | ผู้ดูแลระบบ |
| user_status | users.status | pending | รอ Admin อนุมัติ |
| | | active | ใช้งานได้ปกติ |
| | | rejected | ถูกปฏิเสธ |
| | | suspended | ถูกระงับ |
| dataset_status | datasets.status | published | เผยแพร่สาธารณะ — ค่าเดียวใน Flow (upload → published) |
| dataset_license | datasets.license | open | เปิดเผยสาธารณะ ใช้ได้เลย |
| | | conditional | มีเงื่อนไขการใช้งาน |
| | | cc | Creative Commons |
| file_format | dataset_files.file_format, download_logs.file_format | csv | ไฟล์ CSV |
| | | excel | ไฟล์ Excel |
| | | json | ไฟล์ JSON |
| | | xml | ไฟล์ XML สำหรับ Export เท่านั้น |

---

## #15 · Soft Delete Strategy

**หลักการ**
- ห้าม DELETE ข้อมูลออกจาก Database จริง ทุกกรณี
- ใช้การ SET is_deleted = true แทนเสมอ
- ข้อมูลที่ is_deleted = true ต้องไม่แสดงในทุก Query ทุกกรณี

**ตารางที่ใช้ Soft Delete**
- users, datasets, dataset_files, categories, tags, saved_searches, announcements

**ตารางที่ไม่ใช้ Soft Delete**
- download_logs — Log ห้ามลบเด็ดขาด
- audit_logs — Log ห้ามลบเด็ดขาด
- pdpa_consents — หลักฐานการยินยอม PDPA ห้ามลบ
- dataset_versions — ประวัติการแก้ไขห้ามลบ
- dataset_tags, bookmarks, subscriptions — ลบ Row จริงได้เพราะเป็นแค่ความสัมพันธ์

**กฎการเขียน Query**
- ทุก Query ที่ดึงข้อมูลต้องมี WHERE is_deleted = false เสมอ
- ใช้ SQLAlchemy Filter อัตโนมัติผ่าน Base Model ไม่เขียนเองทุกครั้ง

---

## #16 · Audit Fields

**กฎ**
- ทุกตารางต้องมี created_at เสมอ ไม่มีข้อยกเว้น
- ตารางที่แก้ไขได้ต้องมี updated_at ด้วยเสมอ
- updated_at ต้องอัปเดตอัตโนมัติทุกครั้งที่มีการแก้ไข

| ตาราง | created_at | updated_at |
|---|---|---|
| users | ✅ | ✅ |
| datasets | ✅ | ✅ |
| dataset_versions | ✅ | ❌ |
| dataset_files | ✅ | ✅ |
| categories | ✅ | ✅ |
| tags | ✅ | ✅ |
| dataset_tags | ✅ | ❌ |
| bookmarks | ✅ | ❌ |
| subscriptions | ✅ | ❌ |
| saved_searches | ✅ | ✅ |
| download_logs | ✅ | ❌ |
| dashboard_layouts | ✅ | ✅ |
| announcements | ✅ | ✅ |
| audit_logs | ✅ | ❌ |
| pdpa_consents | ✅ | ❌ |

---

## #17 · Database Index Strategy

| ตาราง | Index | เหตุผล |
|---|---|---|
| users | idx_users_email | ค้นหา User ด้วย Email ตอน Login |
| users | idx_users_role | กรอง User ตาม Role |
| users | idx_users_is_deleted | กรอง Soft Delete |
| datasets | idx_datasets_status | กรองเฉพาะ Published |
| datasets | idx_datasets_user_id | ดู Dataset ของ Agency |
| datasets | idx_datasets_category_id | กรองตาม Category |
| datasets | idx_datasets_is_deleted | กรอง Soft Delete |
| datasets | idx_datasets_published_at | เรียงตามวันที่ Publish |
| dataset_versions | idx_dataset_versions_dataset_id | ดู Version ของ Dataset |
| dataset_files | idx_dataset_files_dataset_id | ดูไฟล์ของ Dataset |
| dataset_tags | idx_dataset_tags_dataset_id | ดู Tag ของ Dataset |
| dataset_tags | idx_dataset_tags_tag_id | ดู Dataset ของ Tag |
| bookmarks | idx_bookmarks_user_id | ดู Bookmark ของ User |
| subscriptions | idx_subscriptions_user_id | ดู Subscription ของ User |
| saved_searches | idx_saved_searches_user_id | ดูการค้นหาที่บันทึกของ User |
| download_logs | idx_download_logs_dataset_id | ดูประวัติดาวน์โหลดของ Dataset |
| download_logs | idx_download_logs_user_id | ดูประวัติดาวน์โหลดของ User |
| download_logs | idx_download_logs_created_at | กรองตามช่วงเวลา |
| audit_logs | idx_audit_logs_user_id | ดู Log ของ User |
| audit_logs | idx_audit_logs_created_at | กรองตามช่วงเวลา |
| categories | idx_categories_slug | ค้นหาด้วย slug ใน URL |
| tags | idx_tags_name | ค้นหา Tag ด้วยชื่อ |
| dashboard_layouts | idx_dashboard_layouts_user_id | ดึง Dashboard ของ User |
| announcements | idx_announcements_is_active | ดึงเฉพาะประกาศที่ active |
| pdpa_consents | idx_pdpa_consents_user_id | เช็ค PDPA ของ User |

**Unique Constraints**
- dataset_versions: (dataset_id, version_number)
- dataset_tags: (dataset_id, tag_id)
- bookmarks: (user_id, dataset_id)
- subscriptions: (user_id, category_id)
- dashboard_layouts: (user_id)

---

## #18 · Migration Rules

**กฎหลัก**
- ทุกการเปลี่ยนแปลง Database ต้องทำผ่าน Alembic เท่านั้น ห้ามแก้ Database ตรงๆ
- ทุก Migration File ต้องมีทั้ง upgrade และ downgrade เสมอ
- ห้ามแก้ Migration File ที่ Deploy ไปแล้ว ถ้าต้องแก้ให้สร้าง Migration ใหม่

**การตั้งชื่อ Migration File**
- รูปแบบ → YYYY_MM_DD_HHmm_คำอธิบายสั้นๆ
- ตัวอย่าง → 2025_01_15_1030_add_quality_score_to_datasets

**สิ่งที่ทำได้**
- เพิ่ม Table ใหม่ ✅
- เพิ่ม Column ใหม่ ✅ ต้องเป็น Optional เสมอ
- เพิ่ม Index ✅
- แก้ชื่อ Column ⚠️ ต้องระวัง Code ที่ใช้ชื่อเดิม
- ลบ Column ❌ ห้ามลบ ให้ Deprecate แทน
- ลบ Table ❌ ห้ามลบ ให้ Deprecate แทน

**ขั้นตอน**
1. สร้าง Migration File ด้วย Alembic
2. ตรวจสอบ upgrade และ downgrade ให้ครบ
3. ทดสอบใน Dev ก่อนเสมอ
4. ทดสอบใน Staging ก่อน Deploy Production
5. Backup Database ก่อน Run Migration ใน Production ทุกครั้ง

---

## #19 · ER Diagram (DBML)

```dbml
Table users {
  id uuid [pk, default: `gen_random_uuid()`]
  email varchar(255) [not null, unique]
  password_hash varchar(255) [not null]
  role user_role [not null]
  status user_status [not null, default: 'pending']
  agency_name varchar(255) [null]
  is_deleted boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    email [name: 'idx_users_email']
    role [name: 'idx_users_role']
    is_deleted [name: 'idx_users_is_deleted']
  }
}

Table datasets {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  category_id uuid [null, ref: > categories.id]
  title varchar(500) [not null]
  description text [null]
  status dataset_status [not null, default: 'published']
  license dataset_license [not null]
  metadata jsonb [null]
  quality_score integer [null]
  download_count integer [not null, default: 0]
  view_count integer [not null, default: 0]
  reject_comment text [null]
  published_at timestamptz [null]
  is_deleted boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    status [name: 'idx_datasets_status']
    user_id [name: 'idx_datasets_user_id']
    category_id [name: 'idx_datasets_category_id']
    is_deleted [name: 'idx_datasets_is_deleted']
    published_at [name: 'idx_datasets_published_at']
  }
}

Table dataset_versions {
  id uuid [pk, default: `gen_random_uuid()`]
  dataset_id uuid [not null, ref: > datasets.id]
  created_by uuid [not null, ref: > users.id]
  version_number integer [not null]
  file_path varchar(500) [not null]
  changelog text [null]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    dataset_id [name: 'idx_dataset_versions_dataset_id']
    (dataset_id, version_number) [unique, name: 'uq_dataset_versions_dataset_version']
  }
}

Table dataset_files {
  id uuid [pk, default: `gen_random_uuid()`]
  dataset_id uuid [not null, ref: > datasets.id]
  file_name varchar(255) [not null]
  file_path varchar(500) [not null]
  file_size bigint [not null]
  file_format file_format [not null]
  is_deleted boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    dataset_id [name: 'idx_dataset_files_dataset_id']
  }
}

Table categories {
  id uuid [pk, default: `gen_random_uuid()`]
  parent_id uuid [null, ref: > categories.id]
  created_by uuid [not null, ref: > users.id]
  level integer [not null, default: 1]
  name_th varchar(255) [not null]
  name_en varchar(255) [not null]
  slug varchar(255) [not null, unique]
  is_deleted boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    slug [name: 'idx_categories_slug']
    parent_id [name: 'idx_categories_parent_id']
    level [name: 'idx_categories_level']
  }
}

Table tags {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(100) [not null, unique]
  is_deleted boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    name [name: 'idx_tags_name']
  }
}

Table dataset_tags {
  dataset_id uuid [not null, ref: > datasets.id]
  tag_id uuid [not null, ref: > tags.id]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    dataset_id [name: 'idx_dataset_tags_dataset_id']
    tag_id [name: 'idx_dataset_tags_tag_id']
    (dataset_id, tag_id) [unique, name: 'uq_dataset_tags_dataset_tag']
  }
}

Table bookmarks {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  dataset_id uuid [not null, ref: > datasets.id]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    user_id [name: 'idx_bookmarks_user_id']
    (user_id, dataset_id) [unique, name: 'uq_bookmarks_user_dataset']
  }
}

Table subscriptions {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  category_id uuid [null, ref: > categories.id]
  agency_user_id uuid [null, ref: > users.id]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    user_id [name: 'idx_subscriptions_user_id']
    (user_id, category_id) [unique, name: 'uq_subscriptions_user_category']
  }
}

Table saved_searches {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  name varchar(255) [not null]
  filters jsonb [not null]
  is_deleted boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    user_id [name: 'idx_saved_searches_user_id']
  }
}

Table download_logs {
  id uuid [pk, default: `gen_random_uuid()`]
  dataset_id uuid [not null, ref: > datasets.id]
  user_id uuid [null, ref: > users.id]
  ip_address varchar(45) [not null]
  purpose text [not null]
  file_format file_format [not null]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    dataset_id [name: 'idx_download_logs_dataset_id']
    user_id [name: 'idx_download_logs_user_id']
    created_at [name: 'idx_download_logs_created_at']
  }
}

Table dashboard_layouts {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, unique, ref: > users.id]
  layout jsonb [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    user_id [unique, name: 'idx_dashboard_layouts_user_id']
  }
}

Table announcements {
  id uuid [pk, default: `gen_random_uuid()`]
  created_by uuid [not null, ref: > users.id]
  title varchar(500) [not null]
  content text [not null]
  is_active boolean [not null, default: true]
  is_deleted boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    is_active [name: 'idx_announcements_is_active']
  }
}

Table audit_logs {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [null, ref: > users.id]
  action varchar(100) [not null]
  target_type varchar(100) [not null]
  target_id uuid [null]
  detail jsonb [null]
  ip_address varchar(45) [not null]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    user_id [name: 'idx_audit_logs_user_id']
    created_at [name: 'idx_audit_logs_created_at']
  }
}

Table pdpa_consents {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > users.id]
  version varchar(50) [not null]
  consented_at timestamptz [not null, default: `now()`]
  ip_address varchar(45) [not null]

  indexes {
    user_id [name: 'idx_pdpa_consents_user_id']
  }
}

Enum user_role {
  visitor
  agency
  admin
}

Enum user_status {
  pending
  active
  rejected
  suspended
}

Enum dataset_status {
  published
}

Enum dataset_license {
  open
  conditional
  cc
}

Enum file_format {
  csv
  excel
  json
  xml
}
```

---

## #20 · API List

**M1 · Auth**
| Method | Endpoint | ใช้ทำอะไร | Auth |
|---|---|---|---|
| POST | /api/v1/auth/register | สมัครสมาชิก | ❌ |
| POST | /api/v1/auth/login | Login ด้วย Email | ❌ |
| POST | /api/v1/auth/logout | Logout | ✅ |
| GET | /api/v1/auth/me | ดูข้อมูลตัวเอง | ✅ |
| POST | /api/v1/bookmarks | เพิ่ม Bookmark | ✅ |
| DELETE | /api/v1/bookmarks/{dataset_id} | ลบ Bookmark | ✅ |
| GET | /api/v1/bookmarks | ดูรายการ Bookmark | ✅ |
| POST | /api/v1/subscriptions | เพิ่ม Subscription | ✅ |
| DELETE | /api/v1/subscriptions/{id} | ลบ Subscription | ✅ |
| GET | /api/v1/subscriptions | ดูรายการ Subscription | ✅ |

**M2 · Dataset**
| Method | Endpoint | ใช้ทำอะไร | Auth |
|---|---|---|---|
| POST | /api/v1/datasets | อัปโหลด Dataset | ✅ |
| GET | /api/v1/datasets | ดูรายการ Dataset | ❌ |
| GET | /api/v1/datasets/{id} | ดู Dataset ชิ้นเดียว | ❌ |
| PATCH | /api/v1/datasets/{id} | แก้ไข Dataset | ✅ |
| DELETE | /api/v1/datasets/{id} | ลบ Dataset (Agency เฉพาะของตัวเอง / Admin ทุก Dataset) | ✅ |
| GET | /api/v1/datasets/{id}/versions | ดูประวัติ Version | ✅ |
| POST | /api/v1/datasets/{id}/versions/{version_number}/restore | Restore Version | ✅ |
| POST | /api/v1/datasets/bulk-upload | Bulk Upload | ✅ |
| GET | /api/v1/datasets/{id}/quality-score | ดู Quality Score | ✅ |

**M3 · Search**
| Method | Endpoint | ใช้ทำอะไร | Auth |
|---|---|---|---|
| GET | /api/v1/search | ค้นหา Dataset | ❌ |
| GET | /api/v1/search/autocomplete | Autocomplete | ❌ |
| POST | /api/v1/saved-searches | บันทึกการค้นหา | ✅ |
| GET | /api/v1/saved-searches | ดูรายการค้นหาที่บันทึก | ✅ |
| DELETE | /api/v1/saved-searches/{id} | ลบการค้นหาที่บันทึก | ✅ |

**M4 · Download**
| Method | Endpoint | ใช้ทำอะไร | Auth |
|---|---|---|---|
| GET | /api/v1/datasets/{id}/preview | Preview 100 แถวแรก | ❌ |
| GET | /api/v1/datasets/{id}/download | ดาวน์โหลดไฟล์ | ❌ |
| GET | /api/v1/datasets/{id}/citation | ดู Citation | ❌ |
| GET | /api/v1/datasets/{id}/export-pdf | Export PDF | ❌ |

**M5 · Visualization**
| Method | Endpoint | ใช้ทำอะไร | Auth |
|---|---|---|---|
| GET | /api/v1/stats/overview | สถิติภาพรวมการศึกษาไทย | ❌ |
| GET | /api/v1/stats/trending | Dataset ยอดนิยม | ❌ |
| GET | /api/v1/stats/new-releases | Dataset ใหม่ล่าสุด | ❌ |
| GET | /api/v1/stats/compare | เปรียบเทียบข้อมูล | ❌ |
| GET | /api/v1/dashboard-layouts | ดู Dashboard Layout | ✅ |
| PUT | /api/v1/dashboard-layouts | บันทึก Dashboard Layout | ✅ |

**M6 · Admin**
| Method | Endpoint | ใช้ทำอะไร | Auth |
|---|---|---|---|
| GET | /api/v1/admin/stats | Dashboard ภาพรวมระบบ | ✅ Admin |
| GET | /api/v1/admin/users | ดูรายการ User ทั้งหมด | ✅ Admin |
| PATCH | /api/v1/admin/users/{id} | แก้ไข User | ✅ Admin |
| POST | /api/v1/admin/users/{id}/approve | อนุมัติบัญชี Agency | ✅ Admin |
| POST | /api/v1/admin/users/{id}/reject | ปฏิเสธบัญชี Agency | ✅ Admin |
| POST | /api/v1/admin/users/{id}/suspend | Suspend User | ✅ Admin |
| GET | /api/v1/admin/categories | ดูรายการหมวดหมู่ทั้งหมดทุก Agency | ✅ Admin |
| POST | /api/v1/admin/categories | เพิ่มหมวดหมู่ของ Agency ใดก็ได้ | ✅ Admin |
| PATCH | /api/v1/admin/categories/{id} | แก้ไขหมวดหมู่ของ Agency ใดก็ได้ | ✅ Admin |
| DELETE | /api/v1/admin/categories/{id} | ลบหมวดหมู่ของ Agency ใดก็ได้ | ✅ Admin |
| GET | /api/v1/categories | ดูรายการหมวดหมู่ทั้งหมด จัดกลุ่มตามหน่วยงาน | ❌ |
| POST | /api/v1/categories | สร้างหมวดหมู่ระดับ 1 ของตัวเอง | ✅ Agency/Admin |
| POST | /api/v1/categories/{id}/subcategories | สร้างหมวดหมู่ระดับ 2 ใต้ระดับ 1 ของตัวเอง | ✅ Agency/Admin |
| PATCH | /api/v1/categories/{id} | แก้ไขหมวดหมู่ของตัวเอง | ✅ Agency/Admin |
| DELETE | /api/v1/categories/{id} | ลบหมวดหมู่ของตัวเอง | ✅ Agency/Admin |
| GET | /api/v1/admin/tags | ดูรายการแท็ก | ✅ Admin |
| POST | /api/v1/admin/tags | เพิ่มแท็ก | ✅ Admin |
| PATCH | /api/v1/admin/tags/{id} | แก้ไขแท็ก | ✅ Admin |
| DELETE | /api/v1/admin/tags/{id} | ลบแท็ก | ✅ Admin |
| GET | /api/v1/admin/audit-logs | ดู Audit Log | ✅ Admin |
| GET | /api/v1/admin/announcements | ดูรายการประกาศ | ✅ Admin |
| POST | /api/v1/admin/announcements | เพิ่มประกาศ | ✅ Admin |
| PATCH | /api/v1/admin/announcements/{id} | แก้ไขประกาศ | ✅ Admin |
| DELETE | /api/v1/admin/announcements/{id} | ลบประกาศ | ✅ Admin |

**M7 · Public API**
| Method | Endpoint | ใช้ทำอะไร | Auth |
|---|---|---|---|
| GET | /api/v1/public/datasets | ดึงรายการ Dataset | ❌ |
| GET | /api/v1/public/datasets/{id} | ดึงข้อมูล Dataset | ❌ |
| GET | /api/v1/public/datasets/{id}/preview | Preview ข้อมูล | ❌ |
| GET | /api/v1/public/datasets/{id}/download | ดาวน์โหลด | ❌ |
| GET | /api/v1/public/datasets/{id}/stats | สถิติ Dataset | ❌ |

---

## #21 · API Request Format

**Header มาตรฐาน**
```
Content-Type: application/json
Authorization: Bearer <token>
Accept-Language: th | en
```

**GET — ส่งข้อมูลผ่าน Query String**
```
GET /api/v1/search?keyword=นักเรียน&category_id=uuid&year=2567&page=1&page_size=20&sort=published_at&order=desc
```

**POST — ส่งข้อมูลผ่าน JSON Body**
```json
POST /api/v1/datasets
{
  "title": "สถิตินักเรียน 2567",
  "description": "ข้อมูลจำนวนนักเรียนรายจังหวัด",
  "category_id": "uuid",
  "license": "open",
  "tags": ["uuid1", "uuid2"],
  "metadata": {
    "year": 2567,
    "province": "กรุงเทพมหานคร",
    "agency": "สพฐ."
  }
}
```

**PATCH — ส่งเฉพาะ Field ที่แก้ไข**
```json
PATCH /api/v1/datasets/{id}
{
  "title": "ชื่อใหม่"
}
```

**Upload File — ส่งเป็น multipart/form-data**
```
POST /api/v1/datasets
Content-Type: multipart/form-data

file: <ไฟล์ CSV/Excel/JSON>
data: <JSON metadata>
```

**กฎ**
- GET ส่งข้อมูลผ่าน Query String เสมอ ห้ามใช้ Body
- POST ส่งข้อมูลผ่าน JSON Body เสมอ
- PATCH ส่งเฉพาะ Field ที่แก้ไข ไม่ต้องส่งทุก Field
- Upload File ใช้ multipart/form-data เสมอ
- Authorization Header ใส่ทุก Endpoint ที่ Auth ✅

---

## #22 · API Response Format

**Single Object**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "สถิตินักเรียน 2567",
    "status": "published",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "message": "ok"
}
```

**List + Pagination**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5
  },
  "message": "ok"
}
```

**Delete สำเร็จ**
```json
{
  "success": true,
  "data": null,
  "message": "ok"
}
```

**กฎ**
- ทุก Response ต้องมี success เสมอ
- data เป็น Object สำหรับข้อมูลชิ้นเดียว
- data เป็น Array สำหรับข้อมูลหลายรายการ
- data เป็น null สำหรับ Delete
- pagination มีเฉพาะ Response แบบ List
- Timestamp ใช้ ISO 8601 เสมอ เช่น 2025-01-15T10:30:00Z

---

## #23 · Pagination Standard

**Query Parameters มาตรฐาน**
| Parameter | Type | Default | หมายความว่า |
|---|---|---|---|
| page | integer | 1 | หน้าที่ต้องการ |
| page_size | integer | 20 | จำนวนรายการต่อหน้า |
| sort | string | created_at | เรียงตาม Field ไหน |
| order | string | desc | asc หรือ desc |

**กฎ**
- page เริ่มจาก 1 เสมอ ไม่ใช่ 0
- page_size สูงสุดไม่เกิน 100 ต่อครั้ง
- page_size ต่ำสุด 1
- ถ้าไม่ส่ง page และ page_size ใช้ค่า Default เสมอ
- ทุก Endpoint ที่ Return List ต้องมี pagination เสมอ

---

## #24 · Error Code Dictionary

**Auth**
| Code | HTTP Status | ความหมาย |
|---|---|---|
| AUTH_INVALID_CREDENTIALS | 401 | Email หรือ Password ไม่ถูกต้อง |
| AUTH_TOKEN_EXPIRED | 401 | Token หมดอายุ |
| AUTH_TOKEN_INVALID | 401 | Token ไม่ถูกต้อง |
| AUTH_TOKEN_MISSING | 401 | ไม่มี Token |
| AUTH_ACCOUNT_SUSPENDED | 403 | บัญชีถูก Suspend |
| AUTH_ACCOUNT_PENDING | 403 | บัญชียังรอการอนุมัติ |
| AUTH_ACCOUNT_REJECTED | 403 | บัญชีถูกปฏิเสธ |
| AUTH_PERMISSION_DENIED | 403 | ไม่มีสิทธิ์ทำสิ่งนี้ |

**User**
| Code | HTTP Status | ความหมาย |
|---|---|---|
| USER_NOT_FOUND | 404 | ไม่พบ User |
| USER_EMAIL_EXISTS | 409 | Email นี้มีในระบบแล้ว |
| USER_CANNOT_SUSPEND_SELF | 400 | Admin ไม่สามารถ Suspend ตัวเองได้ |
| USER_STATUS_INVALID | 400 | สถานะบัญชีไม่ถูกต้อง |

**Dataset**
| Code | HTTP Status | ความหมาย |
|---|---|---|
| DATASET_NOT_FOUND | 404 | ไม่พบ Dataset |
| DATASET_PERMISSION_DENIED | 403 | ไม่ใช่เจ้าของ Dataset |
| DATASET_INVALID_STATUS | 400 | สถานะ Dataset ไม่อนุญาตให้ทำสิ่งนี้ |
| DATASET_ALREADY_PUBLISHED | 400 | Dataset ถูก Publish แล้ว |

**File**
| Code | HTTP Status | ความหมาย |
|---|---|---|
| FILE_TOO_LARGE | 400 | ไฟล์ใหญ่เกิน 100MB |
| FILE_INVALID_FORMAT | 400 | ไฟล์ไม่ใช่ CSV/Excel/JSON |
| FILE_UPLOAD_FAILED | 500 | อัปโหลดไฟล์ไม่สำเร็จ |
| FILE_NOT_FOUND | 404 | ไม่พบไฟล์ |

**Search**
| Code | HTTP Status | ความหมาย |
|---|---|---|
| SEARCH_KEYWORD_TOO_SHORT | 400 | คำค้นหาสั้นเกินไป |
| SEARCH_INVALID_FILTER | 400 | Filter ไม่ถูกต้อง |

**Download**
| Code | HTTP Status | ความหมาย |
|---|---|---|
| DOWNLOAD_PURPOSE_REQUIRED | 400 | ต้องกรอกวัตถุประสงค์ก่อนดาวน์โหลด |
| DOWNLOAD_INVALID_FORMAT | 400 | Format ที่เลือกไม่รองรับ |

**Category / Tag**
| Code | HTTP Status | ความหมาย |
|---|---|---|
| CATEGORY_NOT_FOUND | 404 | ไม่พบหมวดหมู่ |
| CATEGORY_SLUG_EXISTS | 409 | Slug นี้มีในระบบแล้ว |
| CATEGORY_PARENT_NOT_FOUND | 404 | ไม่พบหมวดหมู่ระดับบนสุด |
| CATEGORY_MAX_DEPTH_REACHED | 400 | เกิน 2 ระดับ |
| CATEGORY_HAS_DATASETS | 400 | ลบไม่ได้เพราะมี Dataset อยู่ |
| CATEGORY_PERMISSION_DENIED | 403 | ไม่ใช่เจ้าของหมวดหมู่นี้ |
| CATEGORY_NOT_OWNED | 403 | หมวดหมู่นี้เป็นของ Agency อื่น |
| TAG_NOT_FOUND | 404 | ไม่พบแท็ก |
| TAG_NAME_EXISTS | 409 | ชื่อแท็กนี้มีในระบบแล้ว |

**System**
| Code | HTTP Status | ความหมาย |
|---|---|---|
| VALIDATION_ERROR | 422 | ข้อมูลที่ส่งมาไม่ถูกต้อง |
| RATE_LIMIT_EXCEEDED | 429 | เรียก API เกินจำนวนที่กำหนด |
| INTERNAL_SERVER_ERROR | 500 | ระบบขัดข้อง |
| NOT_FOUND | 404 | ไม่พบสิ่งที่ต้องการ |

---

## #25 · Auth Header Standard

**รูปแบบมาตรฐาน**
```
Authorization: Bearer <token>
```

**กฎ**
- ใช้ Bearer นำหน้า Token เสมอ มีช่องว่าง 1 ช่องระหว่าง Bearer กับ Token
- ส่งใน Header เสมอ ห้ามส่ง Token ใน URL หรือ Query String
- ห้ามส่ง Token ใน Body
- Endpoint ที่ Auth ✅ ทุกตัวต้องมี Header นี้เสมอ
- ถ้าไม่มี Header → คืน AUTH_TOKEN_MISSING 401
- ถ้า Token หมดอายุ → คืน AUTH_TOKEN_EXPIRED 401
- ถ้า Token ไม่ถูกต้อง → คืน AUTH_TOKEN_INVALID 401

**Token Payload มาตรฐาน**
```json
{
  "sub": "uuid",
  "email": "user@example.com",
  "role": "agency",
  "exp": 1234567890
}
```

---

## #26 · HTTP Status Rules

| HTTP Status | ใช้เมื่อไหร่ | ตัวอย่าง |
|---|---|---|
| 200 OK | สำเร็จทุกกรณี ยกเว้น Create | GET, PATCH, DELETE |
| 201 Created | สร้างข้อมูลใหม่สำเร็จ | POST /datasets |
| 400 Bad Request | ข้อมูลที่ส่งมาไม่ถูกต้อง | FILE_TOO_LARGE |
| 401 Unauthorized | ไม่มี Token หรือ Token ไม่ถูกต้อง | AUTH_TOKEN_MISSING |
| 403 Forbidden | มี Token แต่ไม่มีสิทธิ์ | AUTH_PERMISSION_DENIED |
| 404 Not Found | ไม่พบข้อมูลที่ต้องการ | DATASET_NOT_FOUND |
| 409 Conflict | ข้อมูลซ้ำกับที่มีอยู่แล้ว | USER_EMAIL_EXISTS |
| 422 Unprocessable Entity | Validation ไม่ผ่าน | VALIDATION_ERROR |
| 429 Too Many Requests | เรียก API เกิน Rate Limit | RATE_LIMIT_EXCEEDED |
| 500 Internal Server Error | ระบบขัดข้อง | INTERNAL_SERVER_ERROR |

**กฎ**
- ห้ามใช้ 200 สำหรับ Error ทุกกรณี
- ห้ามใช้ 500 แทน 400 หรือ 404
- 401 คือไม่มีสิทธิ์เพราะไม่มี Token
- 403 คือมี Token แล้วแต่ไม่มีสิทธิ์ทำสิ่งนี้
- ทุก Error ต้องมี Error Code ใน Response Body ด้วยเสมอ

---

## #27 · API Versioning Rules

**รูปแบบมาตรฐาน**
```
/api/v1/
/api/v2/
```

**กฎหลัก**
- ทุก Endpoint ต้องมี Version นำหน้าเสมอ
- Version ปัจจุบันคือ v1
- ห้ามแก้ไข Endpoint เดิมใน Version เดิม ให้สร้าง Version ใหม่แทน
- v1 ต้องยังใช้งานได้ปกติเมื่อมี v2 ขึ้นมา

**เมื่อไหรควรขึ้น Version ใหม่**
| สถานการณ์ | ทำอะไร |
|---|---|
| เพิ่ม Endpoint ใหม่ | เพิ่มใน v1 ได้เลย |
| เพิ่ม Field ใหม่ใน Response | เพิ่มใน v1 ได้เลย |
| เปลี่ยนชื่อ Field ใน Response | ขึ้น v2 |
| ลบ Field ออกจาก Response | ขึ้น v2 |
| เปลี่ยน Format ของ Response | ขึ้น v2 |
| เปลี่ยน URL ของ Endpoint | ขึ้น v2 |

---

## #28 · Authentication Flow

**Register Flow**
```
1. Agency กรอก ชื่อหน่วยงาน Email Password แล้วยอมรับ PDPA
2. ระบบเช็คว่า Email ซ้ำมั้ย → ซ้ำ → คืน USER_EMAIL_EXISTS 409
3. บันทึก User ลง Database → Status = pending
4. ส่ง Email แจ้ง Admin ว่ามีบัญชีใหม่รอการอนุมัติ
5. แจ้ง Agency ว่า สมัครสำเร็จ รอ Admin อนุมัติ
6. Admin อนุมัติ → เปลี่ยน Status เป็น active → ส่ง Email แจ้ง Agency
7. Admin ปฏิเสธ → เปลี่ยน Status เป็น rejected → ส่ง Email แจ้ง Agency
```

**Login Flow**
```
1. User ส่ง email + password มาที่ POST /api/v1/auth/login
2. ตรวจสอบว่า email มีในระบบมั้ย → ไม่มี → คืน AUTH_INVALID_CREDENTIALS 401
3. ตรวจสอบว่า password ถูกต้องมั้ย → ไม่ถูก → คืน AUTH_INVALID_CREDENTIALS 401
4. ตรวจสอบว่าบัญชีถูก Suspend มั้ย → คืน AUTH_ACCOUNT_SUSPENDED 403
5. ออก JWT Token ด้วย python-jose
6. บันทึก Token ลง Redis พร้อมกำหนด TTL = JWT_EXPIRE_MINUTES
7. คืน Token กลับไปให้ User
```

**ตรวจสอบ Token ทุก Request (Middleware)**
```
1. อ่าน Authorization Header → ไม่มี → คืน AUTH_TOKEN_MISSING 401
2. ตรวจสอบรูปแบบว่าขึ้นต้นด้วย Bearer มั้ย → ไม่ใช่ → คืน AUTH_TOKEN_INVALID 401
3. Decode JWT Token → Decode ไม่ได้ → คืน AUTH_TOKEN_INVALID 401
4. ตรวจสอบว่า Token หมดอายุมั้ย → คืน AUTH_TOKEN_EXPIRED 401
5. ตรวจสอบว่า Token ยังอยู่ใน Redis มั้ย → ไม่อยู่ → คืน AUTH_TOKEN_INVALID 401
6. ดึงข้อมูล User จาก Database
7. ตรวจสอบว่าบัญชีถูก Suspend มั้ย → คืน AUTH_ACCOUNT_SUSPENDED 403
8. ส่ง User Object ต่อให้ Route Handler
```

**Logout Flow**
```
1. User ส่ง Request มาที่ POST /api/v1/auth/logout
2. อ่าน Token จาก Authorization Header
3. ลบ Token ออกจาก Redis ทันที
4. คืน 200 OK
```

**Suspend Flow**
```
1. Admin กด Suspend User
2. SET status = suspended ใน Database
3. ลบ Token ของ User นั้นออกจาก Redis ทันที
4. User ที่ถูก Suspend จะถูก Logout อัตโนมัติ
```

**Visitor**
- ไม่มี Login Flow
- เข้าถึง Endpoint ที่ Auth ❌ ได้เลย
- ระบบยังบันทึก IP ทุกครั้งที่ดาวน์โหลด
- Rate Limit นับต่อ IP

---

## #29 · Upload Dataset Flow

**Upload Dataset Flow**
```
1. Agency/Admin ส่งไฟล์ + Metadata มาที่ POST /api/v1/datasets
2. ตรวจสอบ Token และสิทธิ์ → ไม่มีสิทธิ์ → คืน AUTH_PERMISSION_DENIED 403
3. ตรวจสอบขนาดไฟล์ → เกิน 100MB → คืน FILE_TOO_LARGE 400
4. ตรวจสอบประเภทไฟล์ → ไม่ใช่ CSV/Excel/JSON → คืน FILE_INVALID_FORMAT 400
5. Validate Metadata ตาม DCAT-AP Schema → ไม่ผ่าน → คืน VALIDATION_ERROR 422
6. Scan หาข้อมูล PII ในไฟล์ด้วย Pandas → พบ PII → Mask อัตโนมัติก่อนบันทึก
7. คำนวณ Data Quality Score ด้วย Pandas
8. บันทึกไฟล์ลง MinIO พร้อม Encryption
9. บันทึก Metadata ลง PostgreSQL → Status = published, published_at = now(), version_number = 1
10. Index ข้อมูลลง Elasticsearch
11. Background Task ส่ง Email แจ้ง Subscriber
12. คืน Dataset Object กลับไปพร้อม 201 Created
```

**Bulk Upload Flow**
```
1. Agency/Admin ส่งไฟล์ Excel Template มาที่ POST /api/v1/datasets/bulk-upload
2. ตรวจสอบ Token และสิทธิ์
3. ตรวจสอบว่าเป็นไฟล์ Excel มั้ย → ไม่ใช่ → คืน FILE_INVALID_FORMAT 400
4. อ่านไฟล์ Excel ด้วย OpenPyXL แยกเป็นรายแถว
5. Validate ทุกแถว → แถวไหนผิด → บันทึก Error รายแถวไว้
6. แถวที่ผ่าน → ทำ Upload Flow ปกติทีละแถว
7. คืนผลลัพธ์รวม สำเร็จกี่ชุด Error กี่ชุด พร้อมรายละเอียด Error รายแถว
```

---

## #30 · Dataset Publish Workflow

**Upload Flow (ทุก Role)**
```
1. Agency/Admin อัปโหลด Dataset
2. ระบบ Published ทันที
3. บันทึก published_at = เวลาปัจจุบัน
4. อัปเดต Elasticsearch Index
5. แจ้ง Subscriber ที่ติดตามหมวดหรือหน่วยงานนั้น
```

**Delete Flow**
```
1. Agency ลบที่ DELETE /api/v1/datasets/{id} → เฉพาะ Dataset ของตัวเอง
2. Admin ลบที่ DELETE /api/v1/datasets/{id} → ลบ Dataset ของ Agency ใดก็ได้
3. ไม่ใช่เจ้าของและไม่ใช่ Admin → คืน DATASET_PERMISSION_DENIED 403
4. Soft Delete (is_deleted = true) + บันทึก Audit Log
```

**State Diagram**
```
upload → published
```

---

## #31 · Search Flow

**Search Flow**
```
1. User พิมพ์คำค้นหาแล้วกดค้นหาที่ GET /api/v1/search
2. ตรวจสอบว่าคำค้นหาสั้นเกินไปมั้ย → น้อยกว่า 2 ตัวอักษร → คืน SEARCH_KEYWORD_TOO_SHORT 400
3. ตรวจสอบว่า Filter ที่ส่งมาถูกต้องมั้ย → ไม่ถูกต้อง → คืน SEARCH_INVALID_FILTER 400
4. ตัดคำภาษาไทยด้วย PyThaiNLP
5. ส่งคำที่ตัดแล้วไปค้นหาใน Elasticsearch
   - ค้นจากชื่อ คำอธิบาย แท็ก หน่วยงาน
   - กรองเฉพาะ Status = published เท่านั้น
   - กรองตาม Filter ที่ส่งมา
6. เรียงลำดับผลลัพธ์ตามที่เลือก
7. แบ่งหน้าตาม Pagination Standard
8. คืนผลลัพธ์พร้อม Pagination Object
```

**Autocomplete Flow**
```
1. User พิมพ์ตัวอักษรอย่างน้อย 2 ตัว
2. Frontend ส่งคำที่พิมพ์ไปที่ GET /api/v1/search/autocomplete
3. ตัดคำภาษาไทยด้วย PyThaiNLP
4. ค้นหาใน Elasticsearch แบบ Prefix Match
5. คืนคำแนะนำสูงสุด 10 คำ
```

**Saved Search Flow**
```
1. User กดบันทึกการค้นหาที่ POST /api/v1/saved-searches
2. ตรวจสอบ Token → Visitor ทำไม่ได้
3. Validate filters ใน JSONB → ไม่ถูกต้อง → คืน VALIDATION_ERROR 422
4. บันทึก filters ลงตาราง saved_searches
5. คืน Saved Search Object พร้อม 201 Created
```

---

## #32 · Download Flow

**Download Flow**
```
1. User เลือก Format และกรอกวัตถุประสงค์ แล้วกดดาวน์โหลดที่ GET /api/v1/datasets/{id}/download
2. ตรวจสอบว่ากรอกวัตถุประสงค์มั้ย → ไม่ได้กรอก → คืน DOWNLOAD_PURPOSE_REQUIRED 400
3. ตรวจสอบว่า Format ที่เลือกรองรับมั้ย → ไม่รองรับ → คืน DOWNLOAD_INVALID_FORMAT 400
4. ตรวจสอบว่า Dataset Status เป็น published มั้ย → ไม่ใช่ → คืน DATASET_NOT_FOUND 404
5. ดึงไฟล์จาก MinIO
6. แปลงไฟล์เป็น Format ที่เลือกด้วย Pandas
7. เริ่ม Transaction
   - INSERT download_log พร้อม IP วัตถุประสงค์ Format
   - UPDATE download_count + 1
   - ถ้า Transaction ล้มเหลว → Rollback ทั้งคู่
8. Stream ไฟล์กลับไปให้ User
```

**Preview Flow**
```
1. User กดดู Preview ที่ GET /api/v1/datasets/{id}/preview
2. ตรวจสอบว่า Dataset Status เป็น published มั้ย → ไม่ใช่ → คืน DATASET_NOT_FOUND 404
3. เช็คใน Redis ว่ามี Cache Preview อยู่มั้ย
   - มี → คืน Cache ทันที
   - ไม่มี → อ่านไฟล์ 100 แถวแรกจาก MinIO
4. คำนวณสถิติเบื้องต้นด้วย Pandas
5. บันทึก Cache ลง Redis กำหนด TTL = 1 ชั่วโมง
6. คืนข้อมูล 100 แถวพร้อมสถิติ
```

**Export PDF Flow**
```
1. User กด Export PDF ที่ GET /api/v1/datasets/{id}/export-pdf
2. ตรวจสอบว่า Dataset Status เป็น published มั้ย → ไม่ใช่ → คืน DATASET_NOT_FOUND 404
3. ดึงข้อมูลและ Metadata ของ Dataset
4. วาดกราฟจากข้อมูลด้วย Matplotlib
5. แปลง HTML + กราฟเป็น PDF ด้วย WeasyPrint
6. Stream ไฟล์ PDF กลับไปให้ User
```

---

## #33 · Notification Flow

**กฎ**
- ทุก Notification ส่งผ่าน FastAPI Background Tasks เสมอ
- ไม่บล็อก Response รอส่ง Email ก่อน ส่ง Response กลับทันทีแล้วส่ง Email ทีหลัง
- ถ้าส่ง Email ไม่สำเร็จ บันทึก Error Log ไว้ ไม่ต้อง Rollback Transaction หลัก

**New Dataset Published — แจ้ง Subscriber**
- ค้นหา User ที่ Subscribe หมวดหรือหน่วยงานนั้นไว้
- ส่ง Email ไปหาแต่ละ User
- หัวข้อ: มี Dataset ใหม่ในหมวดที่คุณติดตาม

**Saved Search Notification**
- ค้นหา Saved Searches ที่ filters ตรงกับ Dataset ที่ Publish
- ส่ง Email ไปหา User เจ้าของ Saved Search
- หัวข้อ: มี Dataset ใหม่ตรงกับการค้นหาที่คุณบันทึกไว้

---

## #34 · Transaction / Rollback Rules

**กฎหลัก**
- ทุกการเขียนข้อมูลที่เกี่ยวข้องกัน 2 อย่างขึ้นไปต้องอยู่ใน Transaction เดียวกันเสมอ
- ถ้าขั้นตอนใดล้มเหลว ต้อง Rollback ทุกอย่างในนั้นทันที
- Email และ Background Tasks ไม่อยู่ใน Transaction

**Download**
```
Transaction {
  INSERT download_logs
  UPDATE datasets.download_count + 1
}
→ ถ้าล้มเหลว Rollback ทั้งคู่
```

**Upload Dataset**
```
Transaction {
  INSERT datasets (status = published, published_at = now())
  INSERT dataset_files
  INSERT dataset_versions (version 1)
  INSERT dataset_tags (ถ้ามี)
}
→ ถ้าล้มเหลว Rollback ทั้งหมด + ลบไฟล์ออกจาก MinIO
→ Background Task ส่ง Email แจ้ง Subscriber อยู่นอก Transaction
```

**Delete Dataset**
```
Transaction {
  UPDATE datasets.is_deleted = true
}
→ บันทึก Audit Log ใน Transaction เดียวกัน
```

**Restore Version**
```
Transaction {
  INSERT dataset_versions (version ใหม่)
  UPDATE datasets.updated_at = now()
}
```

**Suspend User**
```
Transaction {
  UPDATE users.status = suspended
}
→ ถ้าสำเร็จ → ลบ Token ออกจาก Redis
```

---

## #35 · Frontend Route Structure

```
app/
└── [locale]/
    ├── (public)/
    │   ├── page.tsx                         # หน้าหลัก
    │   ├── search/
    │   │   └── page.tsx                     # หน้าค้นหา
    │   ├── datasets/
    │   │   └── [id]/
    │   │       ├── page.tsx                 # หน้ารายละเอียด Dataset + Modal Download
    │   │       └── compare/
    │   │           └── page.tsx             # หน้าเปรียบเทียบข้อมูล
    │   ├── categories/
    │   │   └── [slug]/
    │   │       └── page.tsx                 # หน้า Dataset ตามหมวดหมู่
    │   ├── stats/
    │   │   └── page.tsx                     # หน้าสถิติภาพรวม
    │   └── privacy-policy/
    │       └── page.tsx                     # หน้า Privacy Policy
    │
    ├── (auth)/
    │   ├── login/
    │   │   └── page.tsx                     # หน้า Login
    │   └── register/
    │       └── page.tsx                     # หน้า Register
    │
    ├── (agency)/
    │   ├── dashboard/
    │   │   ├── page.tsx                     # หน้า Dashboard ส่วนตัว
    │   │   └── custom/
    │   │       └── page.tsx                 # หน้า Custom Dashboard Drag & Drop
    │   ├── datasets/
    │   │   ├── page.tsx                     # รายการ Dataset ของตัวเอง
    │   │   ├── create/
    │   │   │   └── page.tsx                 # หน้าอัปโหลด Dataset
    │   │   ├── bulk-upload/
    │   │   │   └── page.tsx                 # หน้า Bulk Upload
    │   │   └── [id]/
    │   │       ├── edit/
    │   │       │   └── page.tsx             # หน้าแก้ไข Dataset
    │   │       └── versions/
    │   │           └── page.tsx             # หน้าประวัติ Version
    │   ├── bookmarks/
    │   │   └── page.tsx                     # หน้า Bookmark
    │   ├── subscriptions/
    │   │   └── page.tsx                     # หน้า Subscription
    │   └── saved-searches/
    │       └── page.tsx                     # หน้าการค้นหาที่บันทึก
    │
    └── (admin)/
        └── admin/
            ├── page.tsx                     # หน้า Dashboard Admin
            ├── users/
            │   └── page.tsx                 # หน้าจัดการ User
            ├── datasets/
            │   └── page.tsx                 # หน้าจัดการ Dataset ทุก Agency
            ├── categories/
            │   └── page.tsx                 # หน้าจัดการหมวดหมู่
            ├── tags/
            │   └── page.tsx                 # หน้าจัดการแท็ก
            ├── announcements/
            │   └── page.tsx                 # หน้าจัดการประกาศ
            └── audit-logs/
                └── page.tsx                 # หน้า Audit Log
```

**กฎ**
- Route ที่อยู่ใน (agency) ต้องเช็คว่า Login แล้ว ถ้ายังไม่ Login → Redirect ไปหน้า Login
- Route ที่อยู่ใน (admin) ต้องเช็คว่าเป็น Admin เท่านั้น ถ้าไม่ใช่ → Redirect ไปหน้าหลัก
- ทุก Route รองรับ [locale] ทั้ง th และ en

---

## #36 · Page / Screen List

**Public — ไม่ต้อง Login**
| หน้า | Route | มีอะไรบ้าง |
|---|---|---|
| หน้าหลัก | / | Banner, สถิติภาพรวม, Dataset ยอดนิยม, Dataset ใหม่, ช่องค้นหา |
| ค้นหา | /search | ช่องค้นหา, Autocomplete, Filter, เรียงลำดับ, ผลลัพธ์ |
| รายละเอียด Dataset | /datasets/[id] | ข้อมูล Dataset, Preview, Citation, Modal ดาวน์โหลด, Bookmark |
| เปรียบเทียบข้อมูล | /datasets/[id]/compare | เลือก Dataset ที่ 2, กราฟเปรียบเทียบ |
| Dataset ตามหมวดหมู่ | /categories/[slug] | รายการ Dataset, Filter, เรียงลำดับ |
| สถิติภาพรวม | /stats | กราฟนักเรียน/ครู/โรงเรียนรายปี |
| Privacy Policy | /privacy-policy | เนื้อหา PDPA Policy |

**Auth**
| หน้า | Route | มีอะไรบ้าง |
|---|---|---|
| Login | /login | Form Email + Password |
| Register | /register | Form สมัครสมาชิก ชื่อหน่วยงาน Email Password ยอมรับ PDPA |

**Agency / Admin — ต้อง Login**
| หน้า | Route | มีอะไรบ้าง |
|---|---|---|
| Dashboard | /dashboard | Dataset ของตัวเอง, สถานะ, ยอดดาวน์โหลด |
| Custom Dashboard | /dashboard/custom | Drag & Drop Widget, เลือก Dataset, เลือกประเภทกราฟ |
| รายการ Dataset | /datasets | รายการ Dataset, Status, ปุ่มแก้ไข, ปุ่มลบ |
| อัปโหลด Dataset | /datasets/create | Form อัปโหลดไฟล์, Metadata, License, Tag |
| Bulk Upload | /datasets/bulk-upload | ดาวน์โหลด Template, อัปโหลด Excel, ผลลัพธ์รายแถว |
| แก้ไข Dataset | /datasets/[id]/edit | Form แก้ไข, อัปโหลดไฟล์ใหม่, Quality Score |
| ประวัติ Version | /datasets/[id]/versions | รายการ Version, Changelog, Restore |
| จัดการหมวดหมู่ | /categories | รายการหมวดหมู่ของตัวเองแบบ 2 ระดับ, เพิ่ม/แก้ไข/ลบ |
| Bookmark | /bookmarks | รายการ Dataset ที่ Bookmark |
| Subscription | /subscriptions | รายการ Subscription, เพิ่ม/ลบ |
| Saved Search | /saved-searches | รายการการค้นหาที่บันทึก, เพิ่ม/ลบ |

**Admin — Admin เท่านั้น**
| หน้า | Route | มีอะไรบ้าง |
|---|---|---|
| Admin Dashboard | /admin | สถิติ Users/Datasets/Downloads รายวัน |
| จัดการ User | /admin/users | รายการ User, อนุมัติ/ปฏิเสธบัญชีใหม่, Suspend, เปลี่ยน Role |
| จัดการ Dataset | /admin/datasets | รายการ Dataset ทุก Agency, แก้ไข/ลบได้ |
| จัดการหมวดหมู่ทั้งหมด | /admin/categories | รายการหมวดหมู่ทุก Agency จัดกลุ่มตามหน่วยงาน, แก้ไข/ลบได้ทุกหมวด |
| จัดการแท็ก | /admin/tags | รายการแท็ก, เพิ่ม/แก้ไข/ลบ |
| จัดการประกาศ | /admin/announcements | รายการประกาศ, เพิ่ม/แก้ไข/ลบ, เปิด/ปิด |
| Audit Log | /admin/audit-logs | รายการ Log, กรองตาม User/Action/วันที่ |

---

## #37 · Component List

**Common**
| Component | ใช้ทำอะไร |
|---|---|
| Navbar | แถบเมนูด้านบน |
| Footer | แถบด้านล่าง |
| Sidebar | เมนูด้านข้างสำหรับ Agency/Admin |
| Button | ปุ่มทุกประเภท |
| Input | ช่องกรอกข้อมูล |
| Select | Dropdown เลือกค่า |
| Modal | Popup ทุกประเภท |
| Toast | แจ้งเตือนสำเร็จ/ผิดพลาด |
| Pagination | แบ่งหน้า |
| Loading | แสดงระหว่างโหลด |
| EmptyState | แสดงเมื่อไม่มีข้อมูล |
| ErrorBoundary | แสดงเมื่อเกิด Error |
| LanguageSwitcher | สลับภาษาไทย/อังกฤษ |
| Badge | ป้ายสถานะ |

**Dataset**
| Component | ใช้ทำอะไร |
|---|---|
| DatasetCard | การ์ดแสดงข้อมูล Dataset ในรายการ |
| DatasetList | รายการ Dataset Card |
| DatasetDetail | แสดงรายละเอียด Dataset เต็ม |
| DatasetForm | Form อัปโหลด/แก้ไข Dataset |
| DatasetStatus | แสดงสถานะ Dataset |
| DatasetQualityScore | แสดงคะแนนคุณภาพ |
| DatasetVersionList | รายการประวัติ Version |
| DatasetMetadata | แสดง Metadata DCAT-AP |
| CitationBox | แสดง Citation APA/Vancouver |
| DownloadModal | Modal กรอกวัตถุประสงค์ก่อนดาวน์โหลด |
| PreviewTable | ตารางแสดง 100 แถวแรก |
| BulkUploadResult | แสดงผลลัพธ์ Bulk Upload รายแถว |

**Search**
| Component | ใช้ทำอะไร |
|---|---|
| SearchBar | ช่องค้นหาพร้อม Autocomplete |
| SearchFilter | Filter หมวด/หน่วยงาน/ปี/จังหวัด/License |
| SearchSort | เรียงลำดับผลลัพธ์ |
| SearchResult | แสดงผลลัพธ์การค้นหา |
| SavedSearchList | รายการการค้นหาที่บันทึก |

**Dashboard / Visualization**
| Component | ใช้ทำอะไร |
|---|---|
| StatsOverview | กราฟสถิติภาพรวมการศึกษา |
| TrendingList | รายการ Dataset ยอดนิยม |
| NewReleaseList | รายการ Dataset ใหม่ล่าสุด |
| CompareChart | กราฟเปรียบเทียบข้อมูล |
| DashboardWidget | Widget แต่ละอันใน Custom Dashboard |
| DashboardGrid | Grid วาง Widget แบบ Drag & Drop |
| BarChart | กราฟแท่ง |
| LineChart | กราฟเส้น |
| PieChart | กราฟวงกลม |

**Admin**
| Component | ใช้ทำอะไร |
|---|---|
| AdminStatsCard | การ์ดแสดงสถิติภาพรวมระบบ |
| UserTable | ตารางรายการ User |
| AuditLogTable | ตารางรายการ Audit Log |
| AnnouncementForm | Form เพิ่ม/แก้ไขประกาศ |
| CategoryTree | แสดงหมวดหมู่แบบ 2 ระดับ จัดกลุ่มตามหน่วยงาน |
| CategoryForm | Form Agency เพิ่ม/แก้ไขหมวดหมู่ระดับ 1 ของตัวเอง |
| SubcategoryForm | Form Agency เพิ่ม/แก้ไขหมวดหมู่ระดับ 2 ของตัวเอง |
| TagForm | Form เพิ่ม/แก้ไขแท็ก |

**Auth**
| Component | ใช้ทำอะไร |
|---|---|
| LoginForm | Form Login |
| RegisterForm | Form สมัครสมาชิก |

---

## #38 · Layout Structure

**Public Layout**
```
┌─────────────────────────────┐
│         Navbar              │
│  Logo | Search | Language   │
├─────────────────────────────┤
│         Content             │
├─────────────────────────────┤
│         Footer              │
└─────────────────────────────┘
```

**Agency Layout**
```
┌─────────────────────────────┐
│         Navbar              │
│  Logo | Search | User Menu  │
├──────────┬──────────────────┤
│ Sidebar  │    Content       │
│ Dashboard│                  │
│ Datasets │                  │
│ Bookmark │                  │
│ Subscrib │                  │
│ Saved    │                  │
├──────────┴──────────────────┤
│         Footer              │
└─────────────────────────────┘
```

**Admin Layout**
```
┌─────────────────────────────┐
│         Navbar              │
│  Logo | User Menu           │
├──────────┬──────────────────┤
│ Sidebar  │    Content       │
│ Dashboard│                  │
│ Users    │                  │
│ Datasets │                  │
│ Category │                  │
│ Tags     │                  │
│ Announce │                  │
│ AuditLog │                  │
└──────────┴──────────────────┘
```

**Auth Layout**
```
┌─────────────────────────────┐
│         Navbar              │
│  Logo | Language            │
├─────────────────────────────┤
│     Form กลางหน้าจอ        │
└─────────────────────────────┘
```

**กฎ**
- Public Layout ใช้กับทุกหน้าใน (public)
- Agency Layout ใช้กับทุกหน้าใน (agency)
- Admin Layout ใช้กับทุกหน้าใน (admin)
- Auth Layout ใช้กับทุกหน้าใน (auth)
- Sidebar ย่อ/ขยายได้บน Desktop
- บน Mobile Sidebar เปลี่ยนเป็น Drawer แทน

---

## #39 · State Management Strategy

**เครื่องมือที่ใช้**
| ใช้อะไร | เก็บอะไร |
|---|---|
| Zustand | ข้อมูล User ที่ Login อยู่, ภาษาที่เลือก |
| React Query | ข้อมูลจาก API ทุกอย่าง |
| React Hook Form | ข้อมูลใน Form ทุกตัว |
| useState | Modal เปิด/ปิด, Tab ที่เลือก, สถานะ UI เล็กๆ |

**Zustand Store**

useAuthStore
```typescript
{
  user: User | null
  token: string | null
  login: (token, user) => void
  logout: () => void
}
```

useUIStore
```typescript
{
  sidebarOpen: boolean
  toggleSidebar: () => void
}
```

**React Query Key มาตรฐาน**
- ['datasets'] — รายการ Dataset
- ['datasets', id] — Dataset ชิ้นเดียว
- ['search', keyword, filters] — ผลลัพธ์ค้นหา
- ['users'] — รายการ User

**กฎ**
- ห้ามเก็บข้อมูลจาก API ใน Zustand ให้ใช้ React Query แทน
- ห้ามเก็บ State ของ Form ใน Zustand ให้ใช้ React Hook Form แทน
- ทุก API Call ต้องใช้ React Query เสมอ ห้ามใช้ fetch หรือ axios ตรงๆ ใน Component

---

## #40 · Form Validation Rules

**Login Form**
| Field | กฎ |
|---|---|
| email | Required, รูปแบบ Email ถูกต้อง |
| password | Required, ขั้นต่ำ 8 ตัวอักษร |

**Register Form**
| Field | กฎ |
|---|---|
| agency_name | Required, ขั้นต่ำ 3 ตัวอักษร, สูงสุด 255 ตัวอักษร |
| email | Required, รูปแบบ Email ถูกต้อง, ห้ามซ้ำในระบบ |
| password | Required, ขั้นต่ำ 8 ตัวอักษร, มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว, มีตัวเลขอย่างน้อย 1 ตัว |
| confirm_password | Required, ต้องตรงกับ password |
| pdpa_consent | Required, ต้องติ๊กยอมรับ |

**Dataset Form**
| Field | กฎ |
|---|---|
| title | Required, ขั้นต่ำ 3 ตัวอักษร, สูงสุด 500 ตัวอักษร |
| description | Optional, สูงสุด 5000 ตัวอักษร |
| category_id | Required |
| license | Required |
| tags | Optional, เลือกได้สูงสุด 10 แท็ก |
| file | Required, ประเภท CSV/Excel/JSON เท่านั้น, ขนาดไม่เกิน 100MB |
| metadata.year | Optional, ปี พ.ศ. 4 หลัก |
| metadata.province | Optional |

**Download Modal**
| Field | กฎ |
|---|---|
| purpose | Required, ขั้นต่ำ 10 ตัวอักษร, สูงสุด 500 ตัวอักษร |
| file_format | Required, เลือกได้ CSV/Excel/JSON/XML |

**Category Form**
| Field | กฎ |
|---|---|
| name_th | Required, ขั้นต่ำ 2 ตัวอักษร, สูงสุด 255 ตัวอักษร |
| name_en | Required, ขั้นต่ำ 2 ตัวอักษร, สูงสุด 255 ตัวอักษร |
| slug | Required, ตัวพิมพ์เล็กและ - เท่านั้น, ห้ามซ้ำในระบบ |

**Tag Form**
| Field | กฎ |
|---|---|
| name | Required, ขั้นต่ำ 2 ตัวอักษร, สูงสุด 100 ตัวอักษร, ห้ามซ้ำในระบบ |

**Announcement Form**
| Field | กฎ |
|---|---|
| title | Required, ขั้นต่ำ 3 ตัวอักษร, สูงสุด 500 ตัวอักษร |
| content | Required, ขั้นต่ำ 10 ตัวอักษร |
| is_active | Required, true หรือ false |

**Saved Search Form**
| Field | กฎ |
|---|---|
| name | Required, ขั้นต่ำ 2 ตัวอักษร, สูงสุด 255 ตัวอักษร |
| filters | Required, ต้องมีเงื่อนไขอย่างน้อย 1 อย่าง |

**กฎทั่วไป**
- Validate ทุก Form ด้วย Zod + React Hook Form เสมอ
- แสดง Error ใต้ Field ที่ผิดทันทีที่ User กรอกผิด
- ห้าม Submit Form ถ้า Validate ไม่ผ่าน
- Validate ทั้ง Frontend และ Backend เสมอ

---

## #41 · UI Design System

**สี**
| ชื่อ | ค่า | ใช้ทำอะไร |
|---|---|---|
| primary | #0D5EAF | ปุ่มหลัก, Link, Accent |
| primary-hover | #0A4A8C | Hover ปุ่มหลัก |
| secondary | #F4F6F9 | Background รอง |
| success | #16A34A | สถานะสำเร็จ, Published |
| warning | #D97706 | แจ้งเตือนทั่วไป |
| error | #DC2626 | สถานะผิดพลาด |
| info | #0284C7 | ข้อมูลเสริม |
| text-primary | #111827 | ข้อความหลัก |
| text-secondary | #6B7280 | ข้อความรอง |
| border | #E5E7EB | เส้นขอบ |
| background | #FFFFFF | พื้นหลังหลัก |

**Typography**
| ชื่อ | ขนาด | น้ำหนัก | ใช้ทำอะไร |
|---|---|---|---|
| heading-1 | 32px | Bold | หัวข้อหน้าหลัก |
| heading-2 | 24px | Bold | หัวข้อ Section |
| heading-3 | 20px | SemiBold | หัวข้อ Card |
| body-lg | 16px | Regular | เนื้อหาหลัก |
| body-sm | 14px | Regular | เนื้อหารอง |
| caption | 12px | Regular | คำอธิบายเล็ก |
| label | 14px | Medium | Label ใน Form |

- Font หลัก — Sarabun
- Font สำรอง — sans-serif

**Spacing**
| ชื่อ | ค่า |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

**Border Radius**
| ชื่อ | ค่า | ใช้ทำอะไร |
|---|---|---|
| sm | 4px | Input, Badge |
| md | 8px | Card, Button |
| lg | 12px | Modal, Dropdown |
| full | 9999px | Tag, Pill |

**Dataset Status สี**
| Status | สี |
|---|---|
| published | #16A34A |

**กฎ**
- ใช้สีจาก Design System เท่านั้น ห้าม Hardcode สีใน Component
- ใช้ Spacing จาก Design System เท่านั้น
- ใช้ Font Sarabun เสมอ
- ทุก Interactive Element ต้องมี Hover State เสมอ

---

## #42 · Responsive Design Rules

**Breakpoint มาตรฐาน**
| ชื่อ | ขนาด | อุปกรณ์ |
|---|---|---|
| sm | 640px | Mobile |
| md | 768px | Tablet |
| lg | 1024px | Laptop |
| xl | 1280px | Desktop |

**กฎแต่ละ Component**
- Navbar — Desktop: แสดงเมนูเต็ม, Mobile: Hamburger
- Sidebar — Desktop: แสดงด้านซ้ายตลอด, Mobile: Drawer
- Dataset List — Desktop: 3 คอลัมน์, Tablet: 2 คอลัมน์, Mobile: 1 คอลัมน์
- Search Filter — Desktop: แสดงด้านซ้ายตลอด, Mobile: Drawer
- Table (Admin) — Desktop: ครบทุก Column, Mobile: Scroll แนวนอน
- Modal — Desktop: กลางหน้าจอ, Mobile: เต็มหน้าจอ
- Dashboard Widget Grid — Desktop: 3 คอลัมน์, Tablet: 2 คอลัมน์, Mobile: 1 คอลัมน์

**กฎทั่วไป**
- ออกแบบ Mobile First เสมอ
- ทุกหน้าต้องใช้งานได้บน Mobile ขนาด 375px ขึ้นไป
- ห้ามมี Element ที่ล้นออกนอกหน้าจอแนวนอนบน Mobile
- Font ขั้นต่ำบน Mobile คือ 14px
- ปุ่มบน Mobile ต้องมีขนาดสูงอย่างน้อย 44px

---

## #43 · Authentication Rules

**กฎ JWT**
- Token หมดอายุใน 60 นาที กำหนดจาก JWT_EXPIRE_MINUTES
- Token ต้องเก็บใน localStorage บน Frontend
- ทุก Request ที่ต้อง Auth ต้องแนบ Token ใน Header เสมอ
- Token ที่หมดอายุต้อง Login ใหม่เท่านั้น ไม่มี Refresh Token

**กฎ Redis**
- ทุก Token ที่ออกต้องบันทึกลง Redis พร้อม TTL = JWT_EXPIRE_MINUTES
- Logout ต้องลบ Token ออกจาก Redis ทันที
- Suspend ต้องลบ Token ออกจาก Redis ทันที
- ถ้า Token ไม่อยู่ใน Redis ถือว่า Invalid ทันที

**กฎ Password**
- ขั้นต่ำ 8 ตัวอักษร
- มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
- มีตัวเลขอย่างน้อย 1 ตัว
- Hash ด้วย bcrypt ผ่าน passlib เสมอ

**กฎ Session**
- 1 User มีได้ 1 Token ที่ใช้งานอยู่เท่านั้น
- Login ใหม่ → ลบ Token เดิมออกจาก Redis → ออก Token ใหม่
- Token เก็บใน Redis ด้วย Key รูปแบบ session:{user_id}

**กฎ Frontend**
- ทุก Route ใน (agency) และ (admin) ต้องเช็ค Token ก่อนเสมอ
- ถ้าไม่มี Token → Redirect ไปหน้า Login ทันที
- ถ้า Token หมดอายุ → Redirect ไปหน้า Login พร้อมแจ้ง กรุณา Login ใหม่
- ถ้าเป็น Admin เข้าหน้า Agency → Redirect ไปหน้าหลัก
- ถ้าเป็น Agency เข้าหน้า Admin → Redirect ไปหน้าหลัก

---

## #44 · Authorization Rules (RBAC)

**หลักการ**
- ทุก Endpoint ที่ต้อง Auth ต้องมีการเช็ค Role เสมอ
- เช็ค Role ใน Middleware ก่อนถึง Route Handler ทุกครั้ง
- Permission เก็บใน Database ไม่ Hardcode ใน Code

**กฎแต่ละ Role**

Visitor
- เข้าถึงได้เฉพาะ Endpoint ที่ Auth ❌ เท่านั้น

Agency
- เข้าถึงได้เฉพาะ Dataset ของตัวเองเท่านั้น
- แก้ไข/ลบได้เฉพาะ Dataset ของตัวเอง
- ห้ามแก้ไข/ลบ Dataset ของ Agency อื่น
- ห้ามเข้าถึง Endpoint ของ Admin ทุกตัว

Admin
- เข้าถึงได้ทุก Endpoint
- แก้ไข/ลบได้ทุก Dataset รวมของ Agency
- แก้ไขได้ทุก User
- ห้าม Suspend ตัวเอง

**การเช็ค Ownership**
```
ตรวจสอบว่า dataset.user_id == current_user.id
→ ไม่ใช่และไม่ใช่ Admin → คืน DATASET_PERMISSION_DENIED 403
```

**Middleware ลำดับการเช็ค**
```
1. เช็ค Token → ไม่มี/Invalid → 401
2. เช็ค User Status → ไม่ใช่ active → 403
3. เช็ค Role → ไม่มีสิทธิ์ → 403
4. เช็ค Ownership → ไม่ใช่เจ้าของ → 403
5. ผ่านทุกข้อ → ทำงานต่อได้
```

**กฎ Frontend**
- ซ่อน UI Element ที่ User ไม่มีสิทธิ์เสมอ
- การซ่อน UI ไม่ใช่การป้องกันจริง ต้องเช็คสิทธิ์ที่ Backend เสมอ

---

## #45 · File Upload Rules

**กฎไฟล์**
- รับเฉพาะ CSV, Excel (.xlsx, .xls), JSON เท่านั้น
- ขนาดไม่เกิน 100MB ต่อไฟล์
- ตรวจสอบประเภทไฟล์จาก MIME Type ไม่ใช่แค่นามสกุล
- ห้ามรับไฟล์ที่มีนามสกุลซ้อน เช่น data.csv.exe

**MIME Type ที่รองรับ**
| ประเภทไฟล์ | MIME Type |
|---|---|
| CSV | text/csv |
| Excel | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| Excel เก่า | application/vnd.ms-excel |
| JSON | application/json |

**กฎการบันทึก**
- บันทึกไฟล์ลง MinIO เท่านั้น ห้ามบันทึกลง Local Disk
- เข้ารหัสไฟล์ทุกไฟล์ใน MinIO อัตโนมัติ
- ตั้งชื่อไฟล์ใหม่ด้วย UUID เสมอ ห้ามใช้ชื่อไฟล์เดิม
- Path ใน MinIO รูปแบบ datasets/{dataset_id}/{uuid}.{ext}

**กฎ Security**
- Scan หา PII ในไฟล์ก่อน Save ทุกครั้ง
- Mask PII อัตโนมัติก่อน Save
- ตรวจสอบว่าไฟล์ไม่มี Malicious Content

**กฎ Frontend**
- แสดง Progress Bar ระหว่างอัปโหลด
- แสดง Error ทันทีถ้าไฟล์ไม่ผ่านเงื่อนไข
- ห้าม Upload ซ้ำถ้ากำลัง Upload อยู่

---

## #46 · PII Masking Rules

**PII ที่ต้อง Mask**
| ประเภท | Pattern | ตัวอย่างก่อน Mask | ตัวอย่างหลัง Mask |
|---|---|---|---|
| เลขบัตรประชาชน | 13 หลัก | 1234567890123 | 1XXXXXXXXXXX3 |
| เบอร์โทรศัพท์ | 9-10 หลัก | 0812345678 | 08XXXXXX78 |
| อีเมล | รูปแบบ email | john@email.com | j***@email.com |
| รหัสนักเรียน | ตัวเลข 5-10 หลัก | 12345 | XXXXX |
| ชื่อ-นามสกุล | คอลัมน์ที่ชื่อมีคำว่า ชื่อ/นามสกุล/name | สมชาย ใจดี | สXX ใXX |

**กฎการตรวจจับ**
- ตรวจจับจากชื่อคอลัมน์ — ถ้ามีคำว่า ชื่อ, นามสกุล, เบอร์, โทร, บัตร, รหัส, name, phone, id, email
- ตรวจจับจากค่าในคอลัมน์ — ตรวจจาก Pattern Regex ทุกแถว

**กฎการ Mask**
- Mask ก่อน Save ลง MinIO ทุกครั้ง
- ทุก Role เห็นข้อมูลที่ Mask แล้วเสมอ ไม่มี Role ใดเห็นข้อมูลจริง
- บันทึก Log ว่า Mask คอลัมน์ไหนบ้างใน Audit Log
- ห้ามใช้คอลัมน์ที่ Mask แล้วใน Filter หรือ Search
- แสดงหมายเหตุในหน้า Preview ว่าคอลัมน์ไหนถูก Mask

---

## #47 · Rate Limit Rules

**Rate Limit แต่ละประเภท**
| Endpoint | จำกัด | หน่วย |
|---|---|---|
| ทุก Endpoint | 100 Request | ต่อนาทีต่อ IP |
| POST /auth/login | 5 Request | ต่อนาทีต่อ IP |
| POST /auth/register | 3 Request | ต่อนาทีต่อ IP |
| GET /search | 30 Request | ต่อนาทีต่อ IP |
| GET /datasets/{id}/download | 10 Request | ต่อนาทีต่อ IP |
| POST /datasets | 10 Request | ต่อนาทีต่อ IP |
| GET /public/* | 60 Request | ต่อนาทีต่อ IP |

**กฎ**
- นับ Request ต่อ IP เสมอ ไม่ว่าจะ Login หรือไม่
- เกิน Rate Limit → คืน RATE_LIMIT_EXCEEDED 429 ทันที
- เก็บ Counter ใน Redis พร้อม TTL 60 วินาที
- Reset Counter ทุก 60 วินาทีอัตโนมัติ

**Response Header มาตรฐาน**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## #48 · Password Policy

**เงื่อนไขรหัสผ่าน**
- ความยาวขั้นต่ำ 8 ตัวอักษร
- ความยาวสูงสุด 128 ตัวอักษร
- มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
- มีตัวเลขอย่างน้อย 1 ตัว
- ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น
- ห้ามใช้ช่องว่าง

**กฎการเก็บ**
- Hash ด้วย bcrypt ผ่าน passlib เสมอ
- ห้ามเก็บ Password จริงใน Database ทุกกรณี
- ห้าม Log Password ใน Audit Log หรือ Error Log ทุกกรณี

**Password Strength**
| ระดับ | เงื่อนไข |
|---|---|
| อ่อน | ผ่านขั้นต่ำแค่ความยาว |
| ปานกลาง | ผ่านทุกเงื่อนไข |
| แข็งแกร่ง | ผ่านทุกเงื่อนไข + ความยาวมากกว่า 12 ตัวอักษร |

**กฎ Frontend**
- แสดง Password Strength Indicator ขณะพิมพ์
- มีปุ่ม Show/Hide Password
- แสดง Error ทันทีถ้าไม่ผ่านเงื่อนไข

---

## #49 · HTTPS / TLS Rules

**กฎหลัก**
- บังคับ HTTPS ทุก Request ทุกกรณี ไม่มีข้อยกเว้น
- HTTP ทุก Request ต้อง Redirect ไป HTTPS อัตโนมัติ
- ใช้ TLS 1.2 ขึ้นไปเท่านั้น
- Certificate ต้อง Renew ก่อนหมดอายุอย่างน้อย 30 วัน

**Security Headers**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

**กฎ MinIO**
- ไฟล์ทุกไฟล์ใน MinIO ต้องเข้ารหัสอัตโนมัติ
- ห้าม Expose MinIO URL ตรงๆ ให้ User
- ดาวน์โหลดไฟล์ต้องผ่าน Backend เสมอ

**กฎ CORS**
- อนุญาตเฉพาะ Domain ที่กำหนดใน Config เท่านั้น
- ห้ามใช้ * ใน Production เด็ดขาด

---

## #50 · Docker Structure

**Services ทั้งหมด**
| Service | Image | Port | หมายเหตุ |
|---|---|---|---|
| frontend | Node.js 20 Alpine | 3000 | Next.js 14 |
| backend | Python 3.11 Slim | 8000 | FastAPI |
| postgres | PostgreSQL 15 | 5432 | Database หลัก |
| redis | Redis 7 Alpine | 6379 | Cache + Session |
| minio | MinIO Latest | 9000, 9001 | File Storage |
| elasticsearch | Elasticsearch 8 | 9200 | Search Engine |
| nginx | Nginx Alpine | 80, 443 | Reverse Proxy |

**โครงสร้างไฟล์**
```
datacatalog/
├── docker-compose.yml
├── docker-compose.staging.yml
├── docker-compose.prod.yml
└── docker/
    ├── frontend.dockerfile
    ├── backend.dockerfile
    └── nginx/
        ├── nginx.conf
        ├── dev.conf
        ├── staging.conf
        └── prod.conf
```

**กฎ**
- ทุก Service ต้องอยู่ใน Docker Network ชื่อ datacatalog_network
- ห้าม Expose Port Database, Redis, MinIO, Elasticsearch ตรงๆ ใน Production
- ใน Production Expose เฉพาะ Port 80 และ 443 ผ่าน Nginx
- ทุก Service ต้องมี Health Check
- ทุก Service ต้องมี Restart Policy unless-stopped
- Data ต้องเก็บใน Volume เสมอ

**Volume**
```
volumes:
  postgres_data
  redis_data
  minio_data
  elasticsearch_data
```

---

## #51 · Environment Separation

| | Dev | Staging | Production |
|---|---|---|---|
| ข้อมูล | Mock Data | ข้อมูลจำลอง | ข้อมูลจริง |
| Docker Compose | docker-compose.yml | docker-compose.staging.yml | docker-compose.prod.yml |
| ENV File | .env | .env.staging | .env.prod |
| Debug Mode | ✅ | ❌ | ❌ |
| HTTPS | ❌ | ✅ | ✅ |
| Rate Limit | ❌ | ✅ | ✅ |
| Swagger UI | ✅ | ✅ | ❌ |

**กฎเหล็ก**
- Mock Data ห้ามเข้า Production เด็ดขาด
- ENV File ของ Production ห้าม Commit ลง Git เด็ดขาด
- ห้าม Connect Production Database จาก Dev หรือ Staging
- ทุก Feature ต้องผ่าน Staging ก่อน Deploy Production เสมอ
- Database แต่ละ Environment ต้องแยกกันเด็ดขาด

**ENV File**
```
.env              # Dev — Commit ได้ แต่ห้ามใส่ค่าจริง
.env.staging      # Staging — ห้าม Commit
.env.prod         # Production — ห้าม Commit
.env.example      # ตัวอย่าง ENV — Commit ได้
```

---

## #52 · Backup Strategy

| สิ่งที่ Backup | วิธี | ความถี่ | เก็บนานแค่ไหน |
|---|---|---|---|
| PostgreSQL | pg_dump | ทุกวัน เวลา 02:00 น. | 7 วัน |
| MinIO | MinIO Snapshot | ทุกวัน เวลา 03:00 น. | 7 วัน |
| Elasticsearch | Snapshot API | ทุกวัน เวลา 04:00 น. | 7 วัน |
| ENV Files | Manual | ทุกครั้งที่แก้ไข | ตลอดไป |

**กฎ**
- Backup ต้องเก็บแยกออกจาก Server หลักเสมอ
- Backup ต้องเข้ารหัสก่อนเก็บทุกครั้ง
- ทดสอบ Restore จาก Backup อย่างน้อยเดือนละ 1 ครั้ง
- แจ้งเตือนทาง Email ถ้า Backup ล้มเหลว
- Redis ไม่ต้อง Backup เพราะเป็นแค่ Cache และ Session

**ที่เก็บ Backup**
- Dev — Local
- Staging — Railway Volume
- Production — Railway Volume + AWS S3

---

## #53 · Restore Procedure

**กรณีที่ 1 — Container พัง**
```
1. SSH เข้า Server
2. docker compose restart
3. รอ Health Check ผ่านทุก Service
4. ใช้เวลาไม่เกิน 5 นาที
```

**กรณีที่ 2 — PostgreSQL หาย**
```
1. docker compose stop backend
2. dropdb datacatalog
3. createdb datacatalog
4. pg_restore -d datacatalog backup_latest.dump
5. docker compose start backend
6. ใช้เวลาไม่เกิน 1 ชั่วโมง
```

**กรณีที่ 3 — ไฟล์ใน MinIO หาย**
```
1. docker compose stop backend
2. Restore MinIO จาก Snapshot ล่าสุด
3. docker compose start backend
4. ใช้เวลาไม่เกิน 1 ชั่วโมง
```

**กรณีที่ 4 — Elasticsearch Index หาย**
```
1. Restore Elasticsearch จาก Snapshot ล่าสุด
2. ถ้า Snapshot หายด้วย → Re-index ใหม่ทั้งหมดจาก PostgreSQL
3. ใช้เวลาไม่เกิน 2 ชั่วโมง
```

**กฎ**
- ต้อง Backup Database ก่อน Restore ทุกครั้ง
- ทดสอบใน Staging ก่อน Restore Production เสมอ
- บันทึก Log ทุกขั้นตอนระหว่าง Restore
- แจ้ง User ล่วงหน้าก่อน Restore Production

---

## #54 · CI/CD Flow

**Branch Strategy**
| Branch | ใช้ทำอะไร | Deploy ไปที่ไหน |
|---|---|---|
| main | โค้ดที่ผ่านการทดสอบแล้ว | Production |
| staging | โค้ดที่รอทดสอบก่อน Deploy | Staging |
| develop | โค้ดที่กำลังพัฒนา | Dev |
| feature/* | Feature ใหม่ | ไม่ Deploy |
| hotfix/* | แก้ Bug เร่งด่วน | Production |

**CI Flow**
```
1. Run Linter → ไม่ผ่าน → Block Merge
2. Run Unit Tests → ไม่ผ่าน → Block Merge
3. Build Docker Image → ไม่สำเร็จ → Block Merge
4. ผ่านทุกข้อ → อนุญาตให้ Merge ได้
```

**CD Flow — Staging**
```
1. Merge เข้า staging branch
2. Build Docker Image ใหม่
3. Push Image ไป Registry
4. Deploy ไป Staging อัตโนมัติ
5. Run Health Check → ไม่ผ่าน → Rollback อัตโนมัติ
6. แจ้ง Email ว่า Deploy สำเร็จหรือล้มเหลว
```

**CD Flow — Production**
```
1. Merge เข้า main branch
2. Backup Database อัตโนมัติก่อน Deploy
3. Build Docker Image ใหม่
4. Push Image ไป Registry
5. อนุมัติ Deploy Production
6. Deploy ไป Production
7. Run Health Check → ไม่ผ่าน → Rollback อัตโนมัติ
8. แจ้ง Email ว่า Deploy สำเร็จหรือล้มเหลว
```

**กฎ**
- ห้าม Push ตรงไป main หรือ staging ต้อง Merge ผ่าน Pull Request เสมอ
- Deploy Production ต้องมีคนอนุมัติก่อนเสมอ ไม่ Auto Deploy
- ถ้า Deploy ล้มเหลว Rollback กลับ Version เดิมอัตโนมัติ

---

## #55 · Monitoring & Logging Strategy

**Log ที่ต้องเก็บ**
| ประเภท | เก็บอะไร | เก็บที่ไหน |
|---|---|---|
| Application Log | ทุก Request, Response, Error | ไฟล์ Log + Console |
| Audit Log | ทุก Action ของ User | PostgreSQL audit_logs |
| Download Log | ทุกการดาวน์โหลด | PostgreSQL download_logs |
| Error Log | ทุก Exception | ไฟล์ Log + Console |
| Access Log | ทุก HTTP Request | Nginx Log |

**Log Format มาตรฐาน**
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "backend",
  "message": "Dataset not found",
  "user_id": "uuid",
  "ip_address": "1.2.3.4",
  "endpoint": "/api/v1/datasets/uuid",
  "error_code": "DATASET_NOT_FOUND"
}
```

**Log Level**
| Level | ใช้เมื่อไหร่ |
|---|---|
| DEBUG | Debug เฉพาะ Dev |
| INFO | การทำงานปกติ |
| WARNING | เหตุการณ์ผิดปกติแต่ยังทำงานได้ |
| ERROR | Error ที่ต้องแก้ไข |
| CRITICAL | ระบบล่ม ต้องแก้ทันที |

**Monitoring**
| สิ่งที่ Monitor | แจ้งเตือนเมื่อ |
|---|---|
| CPU Usage | เกิน 80% |
| Memory Usage | เกิน 80% |
| Disk Usage | เกิน 80% |
| API Response Time | เกิน 2 วินาที |
| Error Rate | เกิน 1% ของ Request ทั้งหมด |
| Health Check | Service ใดล้ม |

**กฎ**
- Log ทุก Error ที่เกิดขึ้นเสมอ ไม่มีข้อยกเว้น
- ห้าม Log Password, Token, PII ใดๆ ทุกกรณี
- Log ใน Production เก็บอย่างน้อย 30 วัน
- ถ้าเกิด CRITICAL แจ้ง Email ทันที

---

## #56 · AI Coding Rules

**กฎหลัก**
- AI ต้องอ่าน Spec ทั้งหมดก่อนเขียนโค้ดทุกครั้ง
- AI ต้องเขียนโค้ดตาม Tech Stack ที่กำหนดใน #8 เท่านั้น
- AI ต้องเขียนโค้ดตาม Folder Structure ที่กำหนดใน #7 เท่านั้น
- AI ต้องตั้งชื่อตาม Naming Convention ที่กำหนดใน #6 เท่านั้น
- AI ห้ามเพิ่ม Library ใหม่โดยไม่ได้รับอนุญาต

**กฎ Backend**
- ทุก Route ต้องแยก Logic ออกไปไว้ใน Service เสมอ
- ทุก Database Query ต้องอยู่ใน Repository เสมอ
- ทุก Endpoint ต้องมี Pydantic Schema สำหรับ Request และ Response
- ทุก Endpoint ต้องมีการเช็ค Permission ก่อนทำงานเสมอ
- ทุก Response ต้องใช้ JSend Format ที่กำหนดใน #10
- ทุก Error ต้องใช้ Error Code จาก #24 เสมอ
- ห้ามเขียน Raw SQL ยกเว้นกรณีที่ ORM ทำไม่ได้จริงๆ

**กฎ Frontend**
- ทุก API Call ต้องใช้ React Query เสมอ
- ทุก Form ต้องใช้ React Hook Form + Zod เสมอ
- ทุก Global State ต้องใช้ Zustand เสมอ
- ทุก Component ต้องใช้สีและ Spacing จาก Design System #41 เสมอ
- ทุก Page ต้องใช้ Layout ที่กำหนดใน #38 เสมอ
- ห้าม Hardcode ข้อความภาษาไทยหรืออังกฤษใน Component ให้ใช้ next-intl เสมอ

**กฎ Database**
- ทุกตารางใหม่ต้องมี created_at เสมอ
- ทุกการเปลี่ยนแปลง Database ต้องทำผ่าน Alembic เสมอ
- ห้ามลบ Column ให้ Deprecate แทน
- ใช้ Soft Delete เสมอสำหรับตารางที่กำหนดใน #15

**กฎ Security**
- ทุก Input ต้องผ่าน Validate ก่อนเข้า Database เสมอ
- ห้าม Log Password หรือ Token ทุกกรณี
- ทุกไฟล์ที่อัปโหลดต้องผ่าน PII Scan ก่อน Save เสมอ

---

## #57 · AI Refactor Rules

**กฎหลัก**
- AI ห้าม Refactor โค้ดที่ไม่ได้รับคำสั่งให้ Refactor
- AI ห้ามแก้ไข Feature เดิมระหว่าง Refactor เด็ดขาด
- AI ต้องบอกให้ชัดว่าแก้ไขอะไรบ้างก่อน Refactor ทุกครั้ง
- AI ต้องรักษา Behavior เดิมทุกอย่างหลัง Refactor

**สิ่งที่ทำได้**
- เปลี่ยนชื่อ Variable/Function ให้ตรงตาม Naming Convention
- แยก Function ที่ยาวเกินไปออกเป็น Function ย่อย
- ย้ายโค้ดไปไว้ในที่ที่ถูกต้องตาม Folder Structure
- ลบโค้ดที่ไม่ได้ใช้แล้ว
- เพิ่ม Type Annotation ที่ขาดหายไป

**สิ่งที่ห้ามทำ**
- ห้ามเปลี่ยน Business Logic
- ห้ามเปลี่ยน API Response Format
- ห้ามเปลี่ยนชื่อ API Endpoint
- ห้ามเปลี่ยนชื่อ Database Column
- ห้ามเพิ่ม Library ใหม่
- ห้ามเปลี่ยน Database Schema

**ขั้นตอน**
```
1. บอกว่าจะ Refactor อะไร และทำไม
2. บอกว่าอะไรจะเปลี่ยน อะไรจะไม่เปลี่ยน
3. Refactor ทีละส่วนเล็กๆ
4. ตรวจสอบว่า Behavior เดิมยังทำงานได้ปกติ
5. บอกสรุปว่าแก้ไขอะไรไปบ้าง
```

---

## #58 · AI Dependency Rules

- ห้ามเพิ่ม Library ใหม่โดยไม่ได้รับอนุญาตจากเจ้าของโปรเจกต์
- ทุกครั้งที่จะเพิ่ม Library ต้องบอกก่อนว่าเพิ่มอะไร เพราะอะไร และมีทางเลือกอื่นมั้ย
- ห้ามเพิ่ม Library ที่ทำสิ่งเดียวกับที่มีอยู่แล้ว
- ห้ามเพิ่ม Library ที่ไม่มี Maintenance หรือหยุดพัฒนาแล้ว
- ทุก Library ใหม่ต้องเข้ากันได้กับ Version ของ Tech Stack ที่กำหนดไว้

---

## #59 · AI Output Format Rules

- AI ต้องบอกชื่อไฟล์และ Path ก่อนแสดงโค้ดทุกครั้ง
- AI ต้องแสดงโค้ดทั้งไฟล์เสมอ ห้ามแสดงแค่บางส่วน
- AI ต้องบอกว่าโค้ดนี้เกี่ยวข้องกับ Feature ไหน Module ไหน
- AI ต้องบอกขั้นตอนการใช้งานหลังแสดงโค้ดทุกครั้ง
- ถ้าโค้ดเกี่ยวข้องกับหลายไฟล์ต้องแสดงทีละไฟล์ให้ครบ

**รูปแบบการแสดงโค้ด**
```
# ไฟล์: backend/app/api/v1/routers/dataset_router.py
# Module: M2 Dataset
# Feature: อัปโหลด Dataset

<โค้ด>

# ขั้นตอนการใช้งาน
1. ...
2. ...
```

---

## #60 · AI File Structure Rules

- AI ต้องสร้างไฟล์ตาม Folder Structure ที่กำหนดใน #7 เสมอ
- AI ห้ามสร้างไฟล์นอก Folder Structure ที่กำหนด
- AI ต้องตั้งชื่อไฟล์ตาม Naming Convention ที่กำหนดใน #6 เสมอ
- AI ต้องบอก Path เต็มของไฟล์ทุกครั้งที่สร้างหรือแก้ไข
- ถ้าต้องสร้าง Folder ใหม่ต้องบอกก่อนว่าสร้างที่ไหนและทำไม

**ตัวอย่าง Path ที่ถูกต้อง**
```
backend/app/api/v1/routers/dataset_router.py
backend/app/services/dataset_service.py
backend/app/repositories/dataset_repository.py
backend/app/schemas/dataset_schema.py
frontend/src/components/dataset/DatasetCard.tsx
frontend/src/services/dataset_service.ts
```

---

## #61 · README Structure

```
# Datacatalog

## ภาพรวมระบบ
## Tech Stack
## โครงสร้างโปรเจกต์
## การติดตั้ง (Dev)
  - Requirements
  - Clone โปรเจกต์
  - ตั้งค่า ENV
  - รัน Docker Compose
  - รัน Migration
  - รัน Seed Data
## การใช้งาน
  - URL ที่สำคัญ
  - บัญชีทดสอบ
## API Documentation
## การ Deploy
## การ Backup และ Restore
## การแก้ไขปัญหาที่พบบ่อย
```

---

## #62 · API Documentation Rules

- ทุก Endpoint ต้องมี Docstring อธิบายการทำงาน
- ทุก Endpoint ต้องมีตัวอย่าง Request และ Response จริง
- ทุก Endpoint ต้องระบุ Error Code ที่อาจเกิดขึ้น
- Swagger UI เปิดได้เฉพาะ Dev และ Staging เท่านั้น ปิดใน Production
- ทุกครั้งที่เพิ่มหรือแก้ไข Endpoint ต้องอัปเดต Docs ด้วยเสมอ

**รูปแบบ Docstring**
```python
@router.post("/datasets")
async def create_dataset():
    """
    อัปโหลด Dataset ใหม่

    - **Required Role**: Agency, Admin
    - **Request**: multipart/form-data
    - **Response**: Dataset Object
    - **Errors**: FILE_TOO_LARGE, FILE_INVALID_FORMAT, VALIDATION_ERROR
    """
```

---

## #63 · Architecture Documentation

**เอกสารที่ต้องมี**
- ภาพรวม Layered Architecture ทั้งระบบ
- การไหลของข้อมูลจาก Frontend → Backend → Database
- การเชื่อมต่อระหว่าง Service ทุกตัว
- เหตุผลที่เลือก Tech Stack แต่ละตัว
- ข้อจำกัดและ Trade-off ของระบบ

**โครงสร้างภาพรวม**
```
Frontend (Next.js)
    ↓ HTTPS
Nginx (Reverse Proxy)
    ↓
Backend (FastAPI)
    ↓           ↓           ↓           ↓
PostgreSQL   Redis       MinIO    Elasticsearch
```

---

## #64 · Sequence Diagrams

**Diagram ที่ต้องมี**
- Login Flow
- Register Flow
- Upload Dataset Flow
- Dataset Publish Workflow
- Search Flow
- Download Flow
- Notification Flow

**ตัวอย่าง Login**
```
User → Frontend → Backend → Redis → PostgreSQL
  กรอก Email/Password
              ส่ง POST /auth/login
                        ตรวจสอบ Password
                                    ดึงข้อมูล User
                        ออก JWT Token
                        เก็บ Token ใน Redis
              ส่ง Token กลับ
  เก็บ Token ใน localStorage
```

---

## #65 · Deployment Documentation

**ขั้นตอน Deploy Staging**
```
1. Merge Code เข้า staging branch
2. CI ทำงานอัตโนมัติ
3. ตรวจสอบ CI ผ่านทุกข้อ
4. CD Deploy ไป Staging อัตโนมัติ
5. ทดสอบบน Staging
6. แจ้งทีมว่าพร้อม Deploy Production
```

**ขั้นตอน Deploy Production**
```
1. Merge Code เข้า main branch
2. CI ทำงานอัตโนมัติ
3. ตรวจสอบ CI ผ่านทุกข้อ
4. อนุมัติ Deploy Production
5. Backup Database อัตโนมัติ
6. CD Deploy ไป Production
7. ตรวจสอบ Health Check
8. แจ้ง User ว่าระบบพร้อมใช้งาน
```

**กฎ**
- Deploy Production ได้เฉพาะวันจันทร์ถึงศุกร์ เวลา 09:00-17:00 เท่านั้น
- ห้าม Deploy Production วันศุกร์หลัง 15:00
- ต้องมีคนดูแลระบบอยู่ด้วยทุกครั้งที่ Deploy Production

---

## #66 · Disaster Recovery Documentation

**แผนรับมือแต่ละกรณี**
| กรณี | เวลาที่ยอมรับได้ | วิธีแก้ |
|---|---|---|
| Container พัง | 5 นาที | Restart Container |
| Database ล้ม | 30 นาที | Restart + ตรวจสอบ Data |
| ข้อมูลหาย | 1 ชั่วโมง | Restore จาก Backup |
| Server ล้มทั้งหมด | 2 ชั่วโมง | Deploy ใหม่บน Server ใหม่ |
| ถูก Hack | ทันที | ปิดระบบ + ตรวจสอบ + แจ้ง User |

**ขั้นตอนเมื่อระบบมีปัญหา**
```
1. ตรวจสอบว่าปัญหาคืออะไร
2. ประเมินความรุนแรง
3. แจ้งทีมและ User ทันที ภายใน 15 นาที
4. แก้ไขตาม Restore Procedure #53
5. ตรวจสอบว่าระบบกลับมาปกติ
6. เขียน Post-mortem
```

**กฎ**
- ต้องมี Post-mortem ทุกครั้งที่ระบบล่มเกิน 30 นาที
- แจ้ง User ภายใน 15 นาทีหลังพบปัญหา
- บันทึกทุกเหตุการณ์ที่เกิดขึ้นใน Incident Log
