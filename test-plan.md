# แผนทดสอบระบบ Thai EduData Insight
> Dev → Staging → Production

---

## ขั้นที่ 1 — เตรียมข้อมูล (Dev)

### 1.1 ล้างข้อมูลเก่าออกจากหน้าเว็บ
- [ ] Admin ลบ Dataset ทดสอบทั้งหมดผ่าน /admin/datasets
- [ ] Agency ลบ Dataset ของตัวเองผ่าน /th/datasets
- [ ] Admin ลบ Category ทดสอบผ่าน /admin/categories
- [ ] Admin ลบ Announcement ทดสอบผ่าน /admin/announcements

### 1.2 สร้างหมวดหมู่ใหม่
Agency สร้างได้ทั้ง Level 1 และ Level 2
ที่ http://localhost:3000/th/manage/categories

**agency@test.com สร้าง:**

Level 1:
- [ ] สถิตินักเรียน (Student Statistics)
  - [ ] Level 2: รายจังหวัด (By Province)
  - [ ] Level 2: รายระดับชั้น (By Level)
- [ ] จำนวนครู (Teacher Statistics)
  - [ ] Level 2: รายวิชา (By Subject)
- [ ] โรงเรียน (Schools)
  - [ ] Level 2: รายจังหวัด (By Province)

**moe@edudata.go.th สร้าง (หลัง Approve แล้ว):**

Level 1:
- [ ] ผลการเรียน (Academic Results)
  - [ ] Level 2: O-NET
  - [ ] Level 2: NT
- [ ] งบประมาณ (Budget)
  - [ ] Level 2: รายกระทรวง (By Ministry)

**Admin จัดการที่ /admin/categories:**
- [ ] เช็คว่าหมวดหมู่ทุก Agency ขึ้นครบ
- [ ] แก้ไข/ลบได้ทุก Agency

### 1.3 สร้าง Agency ใหม่
- [ ] เปิด Browser ใหม่ (Incognito)
- [ ] สมัครสมาชิก: moe@edudata.go.th / Moe12345678
- [ ] ชื่อหน่วยงาน: กระทรวงศึกษาธิการ
- [ ] Admin Approve บัญชีนี้

### 1.4 เตรียมไฟล์ CSV ทดสอบ
สร้างไฟล์ CSV อย่างน้อย 3 ไฟล์:

**ไฟล์ 1: student_stats_2566.csv**
```
จังหวัด,ระดับประถม,ระดับมัธยมต้น,ระดับมัธยมปลาย,รวม
กรุงเทพมหานคร,120000,85000,72000,277000
เชียงใหม่,45000,32000,28000,105000
ขอนแก่น,38000,27000,23000,88000
```

**ไฟล์ 2: teacher_stats_2566.csv**
```
จังหวัด,ครูประถม,ครูมัธยม,รวม
กรุงเทพมหานคร,8500,6200,14700
เชียงใหม่,3200,2400,5600
ขอนแก่น,2800,2100,4900
```

**ไฟล์ 3: onet_results_2566.csv**
```
จังหวัด,คณิตศาสตร์,ภาษาไทย,ภาษาอังกฤษ,วิทยาศาสตร์
กรุงเทพมหานคร,42.5,55.3,38.2,44.1
เชียงใหม่,38.2,52.1,32.5,40.3
ขอนแก่น,36.8,50.4,30.1,38.9
```

---

## ขั้นที่ 2 — ทดสอบทุก Role

### Flow 1 — Register + Login

| # | ขั้นตอน | ผลที่คาดหวัง | ผล |
|---|---------|-------------|-----|
| 1.1 | สมัครสมาชิกใหม่ | status = pending | |
| 1.2 | Login ด้วยบัญชี pending | ไม่ได้ ขึ้น error | |
| 1.3 | Admin Approve | status = active | |
| 1.4 | Login ด้วยบัญชีที่ Approve | เข้าได้ redirect /dashboard | |
| 1.5 | Admin Reject บัญชีอื่น | status = rejected | |
| 1.6 | Login ด้วยบัญชี rejected | ไม่ได้ ขึ้น error | |
| 1.7 | Admin Suspend บัญชี | status = suspended | |
| 1.8 | Login ด้วยบัญชี suspended | ไม่ได้ ขึ้น error | |
| 1.9 | Logout | กลับหน้า Login token หาย | |

---

### Flow 2 — Admin

| # | ขั้นตอน | ผลที่คาดหวัง | ผล |
|---|---------|-------------|-----|
| 2.1 | Login admin@edudata.go.th | เข้า /admin ได้ | |
| 2.2 | Agency Login เข้า /admin | redirect หน้าหลัก | |
| 2.3 | ดู Dashboard StatsCard | ตัวเลขจริงจาก DB | |
| 2.4 | ดู User รอ Approve | เห็น pending users | |
| 2.5 | Approve User | status = active ทันที | |
| 2.6 | Reject User + เหตุผล | status = rejected | |
| 2.7 | Suspend User | status = suspended | |
| 2.8 | Unsuspend User | status = active | |
| 2.9 | Approve Dataset | status = published | |
| 2.10 | Reject Dataset + เหตุผล | status = rejected | |
| 2.11 | ลบ Dataset | is_deleted = true | |
| 2.12 | สร้าง Announcement | แสดงบน Banner | |
| 2.13 | Toggle ปิด Announcement | Banner หายไป | |
| 2.14 | แก้เนื้อหา Privacy Policy | หน้า Public อัปเดต | |
| 2.15 | ดู Audit Log | เห็น Log ทุก Action | |
| 2.16 | Filter Audit Log | กรองได้ถูกต้อง | |
| 2.17 | Export Audit Log CSV | ดาวน์โหลดได้ ภาษาไทยถูก | |

---

### Flow 3 — Agency

| # | ขั้นตอน | ผลที่คาดหวัง | ผล |
|---|---------|-------------|-----|
| 3.1 | Login agency@test.com | เข้า /dashboard ได้ | |
| 3.2 | ดู Dashboard StatsCard | ตัวเลขจริงของ Agency นี้ | |
| 3.3 | อัปโหลด Dataset + เลือก Category | สร้างสำเร็จ status = draft | |
| 3.4 | บันทึก Draft | status = draft | |
| 3.5 | ส่งขอ Approve | status = submitted | |
| 3.6 | Admin Approve | status = published | |
| 3.7 | แก้ไข Dataset ที่ Published | status → submitted ใหม่ | |
| 3.8 | ดู Version History | เห็น version ทุกตัว | |
| 3.9 | Restore Version เก่า | version ใหม่ถูกสร้าง | |
| 3.10 | ลบ Dataset ของตัวเอง | is_deleted = true | |
| 3.11 | สร้าง Category Level 1 | ขึ้นในรายการ | |
| 3.12 | สร้าง Category Level 2 | ขึ้นใต้ Level 1 | |
| 3.13 | ลบ Category ที่มี Dataset | Error ลบไม่ได้ | |
| 3.14 | ลบ Category ที่ว่าง | ลบได้ | |
| 3.15 | Bookmark Dataset | ขึ้นใน /th/saved | |
| 3.16 | ลบ Bookmark | หายจากรายการ | |
| 3.17 | Download Dataset ของตัวเอง | กรอก purpose ได้ไฟล์ | |

---

### Flow 4 — Public (Visitor)

| # | ขั้นตอน | ผลที่คาดหวัง | ผล |
|---|---------|-------------|-----|
| 4.1 | เปิดหน้าหลัก ไม่ Login | เห็น Dataset Published | |
| 4.2 | StatsCard หน้าหลัก | ตัวเลขจริงจาก API | |
| 4.3 | Dataset ยอดนิยม | เรียงตาม download_count | |
| 4.4 | Dataset ใหม่ล่าสุด | เรียงตาม published_at | |
| 4.5 | คลิก Dataset | ไปหน้า Detail ได้ | |
| 4.6 | ดู Preview | แสดง 100 แถวแรก | |
| 4.7 | ดู Citation | APA/Vancouver ถูกต้อง | |
| 4.8 | Download ไม่ Login | กรอก purpose ได้ไฟล์ | |
| 4.9 | Download ไม่กรอก purpose | Error ต้องกรอก | |
| 4.10 | เปิดหน้า /th/categories | เห็นหมวดหมู่จริง | |
| 4.11 | คลิกหมวดหมู่ | เห็น Dataset ในหมวด | |
| 4.12 | เปิดหน้า /th/stats | การ์ดตัวเลขจริง | |
| 4.13 | เปรียบเทียบ 2 Dataset | กราฟแสดง | |
| 4.14 | เปิด /th/privacy-policy | เนื้อหาจาก DB | |
| 4.15 | ⚠️ ค้นหา | Mock ยัง รอ Elasticsearch | |

---

## ขั้นที่ 3 — ตรวจเช็กระบบ (Dev)

### 3.1 Database Index
```sql
-- เช็ค Query ช้าไหม
EXPLAIN ANALYZE SELECT * FROM datasets 
WHERE status = 'published' 
AND is_deleted = false;
```
- [ ] Query ใช้ Index ไหม
- [ ] เพิ่ม Index ถ้าช้าเกิน 100ms

### 3.2 Caching
- [ ] เช็คว่า Preview ใช้ Redis Cache ไหม
- [ ] Request ที่ 2 เร็วกว่า Request แรกไหม

### 3.3 Logging
- [ ] Error Log ไม่มี Password/Token ปน
- [ ] Log บันทึกถูกต้อง

### 3.4 Security
- [ ] Rate Limit ทำงาน (Login เกิน 5 ครั้ง → 429)
- [ ] API ไม่เปิด Endpoint เกินที่จำเป็น
- [ ] Admin endpoint เข้าได้เฉพาะ Admin

### 3.5 Load Test (k6 บนเครื่องตัวเอง)
```javascript
// test.js
import http from 'k6/http'
export let options = {
  vus: 50,
  duration: '30s'
}
export default function() {
  http.get('http://localhost:8000/api/v1/datasets')
}
```
- [ ] 50 Users พร้อมกัน → Response Time < 2 วินาที
- [ ] Error Rate < 5%
- [ ] ไม่มี 500 Error

---

## ขั้นที่ 4 — Deploy

### 4.1 Staging
- [ ] เตรียม Server
- [ ] ตั้งค่า .env.staging
- [ ] รัน Migration (alembic upgrade head)
- [ ] Seed Admin
- [ ] Deploy Frontend + Backend
- [ ] Smoke Test: Login, ดู Dataset, Download

### 4.2 Production
- [ ] ผ่าน Staging ทุก Flow
- [ ] เตรียม Server Production
- [ ] ตั้งค่า .env.production
- [ ] DB ว่างเปล่า + Migration
- [ ] Seed Admin เปลี่ยนรหัสทันที
- [ ] Deploy
- [ ] Smoke Test

---

## ⚠️ สิ่งที่รอทำทีหลัง

| สิ่งที่เหลือ | รอ | ทำเมื่อ |
|------------|-----|--------|
| Search + Autocomplete | Elasticsearch | รัน ES |
| Bulk Upload | MinIO | รัน MinIO |
| Hero Image | MinIO | รัน MinIO |
| กราฟนักเรียน/ครู/โรงเรียน | ข้อมูลจริง | มีข้อมูล |
| Load Test จริง | Staging Server | ก่อน Production |

---

## บัญชีทดสอบ

| Email | Password | Role |
|-------|----------|------|
| admin@edudata.go.th | Admin1234 | Admin |
| agency@test.com | Test12345 | Agency 1 |
| moe@edudata.go.th | Moe12345678 | Agency 2 (สมัครใหม่) |

