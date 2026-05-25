# แผน Integration — เชื่อม Frontend กับ Backend
> อ้างอิง claude.md ทุกข้อ
> Dev Setup: docker-compose up postgres redis backend + npm run dev
> API Base URL: http://localhost:8000/api/v1

---

## สถานะปัจจุบัน

| ส่วน | สถานะ |
|------|-------|
| UI ทุกหน้า (27 หน้า) | ✅ เสร็จแล้ว |
| Docker (Backend + DB) | ✅ รันได้ |
| Phase 0 Auth | ✅ เสร็จแล้ว |
| Phase 1 Agency | ⏳ กำลังทำ |
| Phase 2 Admin | ⏳ รอ |
| Phase 3 Public | ⏳ รอ |

---

## Dev Setup

```bash
# Terminal 1 — Backend
cd D:\thail-datacatalog
docker-compose up -d postgres redis backend

# Terminal 2 — Frontend
cd D:\thail-datacatalog\frontend
npm run dev
```

**.env.local**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_ENV=development
```

**บัญชีทดสอบ**

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@edudata.go.th | Admin1234! | admin | active |
| agency@test.com | Test12345 | agency | active |
| agency3@test.com | Test12345 | admin | active |
| emailtest@test.com | Test12345 | agency | pending |

---

## Phase 0 — Auth ✅ เสร็จแล้ว

| ขั้น | ไฟล์ | ทำอะไร | สถานะ |
|------|------|--------|-------|
| 0.1 | useAuthStore.ts | ลบ mock user ออก | ✅ |
| 0.2 | useAuthStore.ts | initAuth() จริง | ✅ |
| 0.3 | LoginForm.tsx | redirect ตาม role | ✅ |
| 0.4 | api.ts | 401 → redirect login | ✅ |
| 0.5 | (agency)/layout.tsx | เปิด Auth Guard | ✅ |
| 0.6 | (admin)/layout.tsx | เปิด Auth Guard Admin only | ✅ |
| 0.7 | Navbar/Sidebar | Logout จริง | ✅ |

**Redirect ตาม Role**
- agency → /[locale]/dashboard
- admin → /[locale]/admin

**ทดสอบผ่านแล้ว**
- ✅ ไม่ login → เข้า /dashboard → redirect /login
- ✅ Login agency → เข้า /dashboard
- ✅ Login admin → เข้า /admin
- ✅ Refresh → ยัง login อยู่
- ✅ Logout → กลับ /login token หาย
- ✅ Agency เข้า /admin ไม่ได้
- ✅ pending user → Login ไม่ได้

---

## Phase 1 — Agency ⏳ กำลังทำ

**เป้าหมาย:** หน้า (agency)/* ใช้ API จริงแทน mock

**กฎ:** สลับทีละ Hook → ทดสอบ → ไปข้อถัดไป ห้ามแก้ UI

| # | Hook | API (claude.md #20) | สถานะ |
|---|------|---------------------|-------|
| 1 | useAgencyDashboard | GET /agency/dashboard | ✅ |
| 2 | useAgencyDatasets | GET /agency/datasets | ✅ |
| 3 | useUploadDataset | POST /datasets (multipart) | ✅ |
| 4 | useUpdateDataset | PATCH /datasets/{id} | ✅ |
| 5 | useVersionHistory | GET /datasets/{id}/versions | ✅ |
| 6 | useRestoreVersion | POST /datasets/{id}/versions/{v}/restore | ✅ |
| 6b | useDeleteDataset | DELETE /datasets/{id} (soft delete) | ✅ |
| 7 | useBulkUpload | POST /datasets/bulk-upload | ⏳ |
| 8 | useAgencyCategories | GET /categories (filter ตาม agency) | ✅ |
| 9 | useCreateCategory | POST /categories + subcategories | ✅ |
| 10 | useUpdateCategory | PATCH /categories/{id} | ✅ |
| 11 | useDeleteCategory | DELETE /categories/{id} | ✅ |
| 12 | useBookmarks | GET/POST/DELETE /bookmarks | ✅ |
| 13 | useSubscriptions | GET/DELETE /subscriptions | ✅ |
| 14 | useSavedSearches | GET/POST/DELETE /saved-searches | ✅ |
| 15 | useDashboardLayout | GET/PUT /dashboard-layouts | ✅ |

**⚠️ จุดสำคัญตาม claude.md #5 M2**
- Agency ส่งได้แค่ status = `submitted`
- ไม่สามารถ `published` เองได้
- ปุ่มที่ถูกต้อง: "บันทึก Draft" + "ส่งขอ Approve"

**ทดสอบ Phase 1**
- [ ] Login agency → ทุกเมนู sidebar ทำงาน
- [ ] อัปโหลด Dataset → ได้ status = submitted
- [ ] ดู Version History จริง
- [ ] Bulk Upload ทำงาน
- [ ] จัดการหมวดหมู่ได้
- [ ] Bookmark/Subscription ทำงาน
- [x] บันทึก Dashboard Layout แล้ว Refresh ยังอยู่

---

## Phase 2 — Admin ⏳ รอ Phase 1 เสร็จ

**เป้าหมาย:** (admin)/admin/* ใช้ API จริง + Guard admin only

**กฎ:** user.role !== "admin" → redirect หน้าหลัก

| # | Hook | API (claude.md #20) | สถานะ |
|---|------|---------------------|-------|
| 1 | useAdminDashboard | GET /admin/stats | ⏳ |
| 2 | useAdminUsers | GET /admin/users | ⏳ |
| 3 | useApproveUser | POST /admin/users/{id}/approve | ⏳ |
| 4 | useRejectUser | POST /admin/users/{id}/reject | ⏳ |
| 5 | useSuspendUser | POST /admin/users/{id}/suspend | ⏳ |
| 6 | useAdminDatasets | GET /datasets (ทุก agency) | ⏳ |
| 7 | useApproveDataset | POST /admin/datasets/{id}/approve | ⏳ |
| 8 | useRejectDataset | POST /admin/datasets/{id}/reject | ⏳ |
| 9 | useAdminCategories | GET/POST/PATCH/DELETE /admin/categories | ⏳ |
| 10 | useAdminTags | GET/POST/PATCH/DELETE /admin/tags | ⏳ |
| 11 | useAdminAnnouncements | GET/POST/PATCH/DELETE /admin/announcements | ⏳ |
| 12 | useAuditLogs | GET /admin/audit-logs | ⏳ |
| 13 | useAdminPageContent | GET/PUT /admin/pages/{slug} | ⏳ |
| 14 | useHeroImage | GET/POST/DELETE /admin/settings/hero-image | ⏳ |

**ทดสอบ Phase 2**
- [ ] Login admin → /admin ได้
- [ ] Agency login → เข้า /admin ไม่ได้
- [ ] Approve/Reject User ทำงาน
- [ ] Approve/Reject Dataset ทำงาน
- [ ] จัดการหมวดหมู่ทุก Agency ได้
- [ ] ประกาศแสดงบน Banner หน้าหลัก
- [ ] Audit Log แสดงข้อมูลจริง

---

## Phase 3 — Public ⏳ รอ Phase 2 เสร็จ

**เป้าหมาย:** Visitor ไม่ต้อง login ใช้ API public endpoints

**กฎ:** ไม่มี Auth Guard ใน (public)/layout

| # | หน้า / Hook | API (claude.md #20) | สถานะ |
|---|------------|---------------------|-------|
| 1 | หน้าหลัก Stats | GET /stats/overview | ⏳ |
| 2 | หน้าหลัก Trending | GET /stats/trending | ⏳ |
| 3 | หน้าหลัก New Releases | GET /stats/new-releases | ⏳ |
| 4 | ค้นหา | GET /search | ⏳ |
| 5 | Search Autocomplete | GET /search/autocomplete | ⏳ |
| 6 | รายละเอียด Dataset | GET /datasets/{id} | ⏳ |
| 7 | Preview | GET /datasets/{id}/preview | ⏳ |
| 8 | Download | GET /datasets/{id}/download | ⏳ |
| 9 | Citation | GET /datasets/{id}/citation | ⏳ |
| 10 | หมวดหมู่ | GET /categories | ⏳ |
| 11 | สถิติภาพรวม | GET /stats/overview | ⏳ |
| 12 | เปรียบเทียบ | GET /stats/compare | ⏳ |
| 13 | Static Pages | GET /pages/{slug} | ⏳ |

**⚠️ จุดสำคัญตาม claude.md #5 M4**
- Download ต้องกรอก purpose ทุก Role รวม Visitor
- บันทึก IP + Timestamp ทุกครั้ง

**ทดสอบ Phase 3**
- [ ] ไม่ login เข้า /th ได้
- [ ] ค้นหา Dataset ได้
- [ ] ดู Preview 100 แถวได้
- [ ] Download ต้องกรอก purpose
- [ ] แสดงเฉพาะ Dataset ที่ Published

---

## Seed Scripts

```bash
# สร้าง Admin (รันครั้งเดียว)
docker exec -it thail-datacatalog-backend-1 python scripts/seed_admin.py

# Admin Account
Email: admin@edudata.go.th
Password: Admin1234!
```

---

## API ทั้งหมดตาม claude.md #20

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /auth/register | ❌ |
| POST | /auth/login | ❌ |
| POST | /auth/logout | ✅ |
| GET | /auth/me | ✅ |

### Dataset
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /datasets | ✅ |
| GET | /datasets | ❌ |
| GET | /datasets/{id} | ❌ |
| PATCH | /datasets/{id} | ✅ |
| DELETE | /datasets/{id} | ✅ |
| POST | /datasets/{id}/submit | ✅ |
| GET | /datasets/{id}/versions | ✅ |
| POST | /datasets/{id}/versions/{v}/restore | ✅ |
| POST | /datasets/bulk-upload | ✅ |
| GET | /datasets/{id}/preview | ❌ |
| GET | /datasets/{id}/download | ❌ |
| GET | /datasets/{id}/citation | ❌ |

### Search
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /search | ❌ |
| GET | /search/autocomplete | ❌ |
| POST | /saved-searches | ✅ |
| GET | /saved-searches | ✅ |
| DELETE | /saved-searches/{id} | ✅ |

### Bookmarks / Subscriptions
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /bookmarks | ✅ |
| DELETE | /bookmarks/{dataset_id} | ✅ |
| GET | /bookmarks | ✅ |
| POST | /subscriptions | ✅ |
| DELETE | /subscriptions/{id} | ✅ |
| GET | /subscriptions | ✅ |

### Stats / Dashboard
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /stats/overview | ❌ |
| GET | /stats/trending | ❌ |
| GET | /stats/new-releases | ❌ |
| GET | /stats/compare | ❌ |
| GET | /dashboard-layouts | ✅ |
| PUT | /dashboard-layouts | ✅ |

### Categories
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /categories | ❌ |
| POST | /categories | ✅ Agency/Admin |
| POST | /categories/{id}/subcategories | ✅ Agency/Admin |
| PATCH | /categories/{id} | ✅ Agency/Admin |
| DELETE | /categories/{id} | ✅ Agency/Admin |

### Admin
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /admin/stats | ✅ Admin |
| GET | /admin/users | ✅ Admin |
| PATCH | /admin/users/{id} | ✅ Admin |
| POST | /admin/users/{id}/approve | ✅ Admin |
| POST | /admin/users/{id}/reject | ✅ Admin |
| POST | /admin/users/{id}/suspend | ✅ Admin |
| POST | /admin/datasets/{id}/approve | ✅ Admin |
| POST | /admin/datasets/{id}/reject | ✅ Admin |
| GET | /admin/categories | ✅ Admin |
| POST | /admin/categories | ✅ Admin |
| PATCH | /admin/categories/{id} | ✅ Admin |
| DELETE | /admin/categories/{id} | ✅ Admin |
| GET | /admin/tags | ✅ Admin |
| POST | /admin/tags | ✅ Admin |
| PATCH | /admin/tags/{id} | ✅ Admin |
| DELETE | /admin/tags/{id} | ✅ Admin |
| GET | /admin/audit-logs | ✅ Admin |
| GET | /admin/announcements | ✅ Admin |
| POST | /admin/announcements | ✅ Admin |
| PATCH | /admin/announcements/{id} | ✅ Admin |
| DELETE | /admin/announcements/{id} | ✅ Admin |

---

*อัปเดตล่าสุด: Phase 0 Auth เสร็จแล้ว กำลังทำ Phase 1 Agency*
