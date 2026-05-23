# แผน Frontend — Data Catalog การศึกษาไทย

> อ้างอิง claude.md ทุกข้อ | Tech Stack: Next.js 14 + TypeScript + TailwindCSS
> API Base URL: http://localhost:8000/api/v1 | Token เก็บใน localStorage

---

## สรุปภาพรวม

| Phase | รายการ | Spec |
|-------|--------|------|
| 1 · Foundation | 21 รายการ | #7 #8 #9 #38 #39 #41 #43 |
| 2 · Auth | 2 หน้า | #35 #40 |
| 3 · Public | 7 หน้า | #35 #36 #37 #42 |
| 4 · Agency | 8 หน้า | #35 #36 #37 #39 #42 |
| 5 · Admin | 6 หน้า | #35 #36 #37 #42 |
| **รวม** | **23 หน้า + 21 Foundation** | |

---

## Design Decisions (ตกลงไว้แล้ว ห้ามเปลี่ยน)

### Navbar — Glassmorphism
- `background: rgba(255, 255, 255, 0.55)`
- `backdrop-filter: blur(12px)`
- `border-bottom: 1px solid rgba(255, 255, 255, 0.6)`
- Position: sticky top-0, z-index: 50
- ใช้กับทุก Layout ยกเว้น Auth Layout

### Sidebar — Light White
- `background: #ffffff`
- `border-right: 1px solid #e5e7eb`
- Active item: `background: #e1f5ee` + `border-left: 3px solid #006b5f`
- Inactive item: `color: #6b7280`
- Desktop: แสดงตลอด ย่อ/ขยายได้
- Mobile: เปลี่ยนเป็น Drawer

### Card — Shadow + Border
- `background: #ffffff`
- `border: 1px solid #e2e8f0`
- `border-radius: 8px`
- `box-shadow: 0px 4px 12px rgba(5, 59, 80, 0.05)`
- Hover: `box-shadow: 0px 8px 24px rgba(5, 59, 80, 0.10)`

---

## Design System

### Font
| Font | ใช้ตรงไหน | Weight |
|------|-----------|--------|
| **Kanit** | Heading ทุกอัน, ชื่อ Dataset ใน Card, ตัวเลขสถิติ | 600, 700 |
| **Sarabun** | Body text, คำอธิบาย, Label, Form, เมนู Sidebar | 400, 500 |

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@600;700&family=Sarabun:wght@400;500&display=swap');
```

### สี (จาก DESIGN.md)

**Primary**
| Token | ค่า | ใช้ทำอะไร |
|-------|-----|-----------|
| `primary` | `#006b5f` | Navbar logo, Sidebar active border, Link |
| `primary-action` | `#00a896` | ปุ่มหลัก, Published badge, Accent |
| `primary-action-hover` | `#008f80` | Hover ปุ่มหลัก |
| `primary-light` | `#e1f5ee` | Sidebar active bg, Badge bg |

**Surface**
| Token | ค่า | ใช้ทำอะไร |
|-------|-----|-----------|
| `surface` | `#f7f9fb` | Page background |
| `surface-card` | `#ffffff` | Card, Modal, Sidebar |
| `surface-container` | `#eceef0` | Input background |
| `surface-overlay` | `rgba(5,59,80,0.4)` | Modal overlay |

**Text**
| Token | ค่า | ใช้ทำอะไร |
|-------|-----|-----------|
| `text-primary` | `#191c1e` | ข้อความหลัก |
| `text-secondary` | `#3c4946` | ข้อความรอง |
| `text-muted` | `#6c7a76` | Placeholder, Caption |

**Status**
| Token | ค่า | ใช้ทำอะไร |
|-------|-----|-----------|
| `status-published` | `#00a896` | Published badge |
| `status-published-bg` | `#e1f5ee` | Published badge bg |
| `status-draft` | `#38637a` | Draft badge |
| `status-draft-bg` | `#e6f1fb` | Draft badge bg |
| `status-error` | `#ba1a1a` | Error, Rejected |
| `status-error-bg` | `#ffdad6` | Error bg |
| `status-warning` | `#795900` | Warning |
| `status-warning-bg` | `#ffefc9` | Warning bg |

**Border**
| Token | ค่า | ใช้ทำอะไร |
|-------|-----|-----------|
| `border-default` | `#e2e8f0` | Card border, Divider |
| `border-input` | `#bbcac5` | Input border |
| `border-focus` | `#006b5f` | Input focus ring |

### Typography Scale

| Token | Font | ขนาด | Weight | Line Height | ใช้ทำอะไร |
|-------|------|------|--------|-------------|-----------|
| `display` | Kanit | 48px | 700 | 60px | Hero text หน้าหลัก |
| `heading-1` | Kanit | 32px | 600 | 40px | Page title |
| `heading-2` | Kanit | 24px | 600 | 32px | Section title |
| `heading-3` | Kanit | 20px | 600 | 28px | Card title, Modal title |
| `heading-3-mobile` | Kanit | 18px | 600 | 26px | heading-3 บน Mobile |
| `body-lg` | Sarabun | 18px | 400 | 28px | เนื้อหาหลัก |
| `body-md` | Sarabun | 16px | 400 | 24px | เนื้อหาทั่วไป |
| `label` | Sarabun | 14px | 500 | 20px | Label Form, เมนู |
| `caption` | Sarabun | 12px | 400 | 18px | คำอธิบายเล็ก, Meta |
| `code` | JetBrains Mono | 13px | 400 | 18px | ตัวเลขใน Table, Code |

- Line height ขั้นต่ำ body text = 1.5x (รองรับ Thai glyph/vowel)
- ตัวเลขใน Table ใช้ Kanit หรือ JetBrains Mono เพื่อ alignment

### Spacing (8px base)

| Token | ค่า | ใช้ทำอะไร |
|-------|-----|-----------|
| `spacing-1` | 4px | gap เล็กมาก |
| `spacing-2` | 8px | gap ปกติ |
| `spacing-3` | 12px | Table row padding (condensed) |
| `spacing-4` | 16px | Component padding, Mobile margin |
| `spacing-6` | 24px | Section gap, Gutter |
| `spacing-8` | 32px | Card padding |
| `spacing-10` | 40px | Desktop side margin |
| `spacing-12` | 48px | Section spacing |
| `container-max` | 1280px | Max width |

### Border Radius

| Token | ค่า | ใช้ทำอะไร |
|-------|-----|-----------|
| `radius-xs` | 2px | Chart bar top |
| `radius-sm` | 4px | Button, Input |
| `radius-md` | 8px | Card, Dropdown |
| `radius-lg` | 12px | Modal, Large card |
| `radius-xl` | 16px | Bottom sheet Mobile |
| `radius-full` | 9999px | Badge, Tag, Pill |

### Elevation (Shadow)

| ระดับ | ใช้ทำอะไร | ค่า |
|-------|-----------|-----|
| Level 0 | ไม่มีเงา, ใช้ border แทน | `none` |
| Level 1 | Card ปกติ | `0px 4px 12px rgba(5,59,80,0.05)` |
| Level 2 | Card hover, Dropdown | `0px 8px 24px rgba(5,59,80,0.10)` |
| Level 3 | Modal | `0px 16px 48px rgba(5,59,80,0.15)` |

### Component Spec ที่ต้องเหมือนกันทุกหน้า

**Button**
```
Primary:   bg #00a896, text #fff, radius 4px, height 40px, padding 0 16px
           hover: bg #008f80
Secondary: border 1px #006b5f, text #006b5f, bg transparent
           hover: bg #e1f5ee
Danger:    bg #ba1a1a, text #fff
Disabled:  opacity 0.4, cursor not-allowed
Mobile:    height ขั้นต่ำ 44px
```

**Input / Select**
```
border: 1px solid #bbcac5
border-radius: 4px
background: #ffffff
padding: 8px 12px
font: Sarabun 16px
focus: border-color #006b5f, outline none, ring 2px rgba(0,107,95,0.2)
error: border-color #ba1a1a
height: 40px
```

**Badge / Status Chip**
```
border-radius: 9999px (pill เสมอ)
padding: 2px 10px
font: Sarabun 12px weight 500
Published:  bg #e1f5ee, text #0f6e56
Draft:      bg #dbeafe, text #1d4c61
Error:      bg #ffdad6, text #93000a
Warning:    bg #ffefc9, text #795900
```

**Modal**
```
overlay: rgba(5,59,80,0.4)
card: bg #fff, radius 12px, shadow Level 3
padding: 24px
max-width: 480px (default), 640px (large)
Mobile: เต็มหน้าจอ, radius top 16px bottom 0
```

**Toast**
```
position: fixed bottom-right
border-radius: 8px
shadow: Level 2
success: bg #e1f5ee, border-left 4px #00a896
error:   bg #ffdad6, border-left 4px #ba1a1a
```

**Table**
```
header: bg #f1f5f9, font Kanit 14px weight 600
row: border-bottom 1px #e2e8f0, height 48px
hover row: bg #f7f9fb
font: Sarabun 14px
action column: icon สี #6c7a76, hover #006b5f
Mobile: horizontal scroll
```

**Filter Tree (หมวดหมู่ 2 ระดับ)**
```
Level 1: font Sarabun 14px weight 500, chevron icon
Level 2: เยื้อง 16px, font Sarabun 14px weight 400
Active:  bg #e1f5ee, border-left 3px #006b5f, text #006b5f
Hover:   bg #f7f9fb
```

**Pagination**
```
active page: bg #00a896, text #fff, radius 4px
inactive: bg transparent, text #3c4946
hover: bg #e1f5ee
```

---

## Layout Spec

### Navbar (Glassmorphism — ทุก Layout ยกเว้น Auth)
```
height: 64px
position: sticky top-0 z-50
background: rgba(255,255,255,0.55)
backdrop-filter: blur(12px)
border-bottom: 1px solid rgba(255,255,255,0.6)

ซ้าย:   Logo (Kanit 700 สี #006b5f)
กลาง:   Search bar (Public layout เท่านั้น)
ขวา:    Language switcher TH/EN + Login button หรือ User menu
Mobile: Hamburger menu ขวา
```

### Sidebar (Light White — Agency + Admin)
```
width: 240px (expanded), 64px (collapsed)
background: #ffffff
border-right: 1px solid #e5e7eb
position: sticky top-64px (ต่อจาก Navbar)

Menu item height: 44px
Active: bg #e1f5ee, border-left 3px #006b5f, text #006b5f font Sarabun 14px 500
Hover:  bg #f7f9fb
Icon:   20px สี inherit

Mobile: Drawer จากซ้าย width 280px, overlay rgba(0,0,0,0.3)
```

### Content Area
```
Desktop: margin-left 240px (sidebar expanded)
padding: 24px 40px
max-width: 1280px

Tablet:  padding: 16px 24px
Mobile:  padding: 16px
```

### Footer (Public Layout)
```
background: #053b50
text: rgba(255,255,255,0.8)
padding: 48px 40px
```

---

## Phase 1 — Foundation

### Config (6 ไฟล์)

| # | ไฟล์ | หมายเหตุ |
|---|------|---------|
| 1 | `postcss.config.js` | wire Tailwind |
| 2 | `tailwind.config.ts` | Design System ครบ สี/font/spacing/radius/shadow |
| 3 | `src/app/globals.css` | import Kanit + Sarabun + Tailwind layers |
| 4 | `next.config.js` | เพิ่ม next-intl plugin |
| 5 | `middleware.ts` | locale routing th/en + Auth guard |
| 6 | `src/i18n/request.ts` | config next-intl |

### Locales (2 ไฟล์)

| # | ไฟล์ | หมายเหตุ |
|---|------|---------|
| 7 | `src/locales/th.json` | ข้อความภาษาไทยทั้งหมด |
| 8 | `src/locales/en.json` | ข้อความภาษาอังกฤษทั้งหมด |

### Providers & Stores (3 ไฟล์)

| # | ไฟล์ | หมายเหตุ |
|---|------|---------|
| 9 | `src/providers/AppProviders.tsx` | React Query Client + Zustand |
| 10 | `src/stores/useAuthStore.ts` | user, token, login, logout |
| 11 | `src/stores/useUIStore.ts` | sidebarOpen, toggleSidebar |

### API Layer (1 ไฟล์)

| # | ไฟล์ | หมายเหตุ |
|---|------|---------|
| 12 | `src/services/api.ts` | axios instance + Bearer token + JSend handler |

### Layouts (5 ไฟล์)

| # | ไฟล์ | หมายเหตุ |
|---|------|---------|
| 13 | `src/app/[locale]/layout.tsx` | NextIntlClientProvider + AppProviders |
| 14 | `src/app/[locale]/(public)/layout.tsx` | Navbar Glassmorphism + Footer Navy |
| 15 | `src/app/[locale]/(auth)/layout.tsx` | Navbar Logo+Language only + Form center |
| 16 | `src/app/[locale]/(agency)/layout.tsx` | Navbar + Sidebar White + Auth Guard → redirect login |
| 17 | `src/app/[locale]/(admin)/layout.tsx` | Navbar + Sidebar White + Auth Guard → Admin only |

### Common Components (4 กลุ่ม)

| # | Component | Spec |
|---|-----------|------|
| 18 | `Navbar` | Glassmorphism, Logo Kanit, Search (Public), Language, UserMenu |
| 19 | `Footer` | bg #053b50, text white |
| 20 | `Sidebar` | White, active teal border-left, Drawer Mobile |
| 21 | `Button` `Input` `Select` `Modal` `Toast` `Badge` `Pagination` `Loading` `EmptyState` | ตาม Component Spec ด้านบน |

---

## Phase 2 — Auth (2 หน้า)

| # | หน้า | Route | Component หลัก |
|---|------|-------|----------------|
| 1 | Login | `/[locale]/login` | LoginForm (RHF + Zod) |
| 2 | Register | `/[locale]/register` | RegisterForm + PDPA checkbox + Password Strength |

**Layout:** Form card กลางหน้าจอ, bg surface `#f7f9fb`, card shadow Level 1

**Validation #40**
- Login: email (required, format), password (required, min 8)
- Register: agency_name (min 3), email, password (uppercase + number), confirm_password, pdpa_consent

---

## Phase 3 — Public (7 หน้า)

| # | หน้า | Route | Component หลัก |
|---|------|-------|----------------|
| 3 | หน้าหลัก | `/[locale]` | Banner, StatsOverview, DatasetCard ×2 Section |
| 4 | ค้นหา | `/[locale]/search` | SearchBar + SearchFilter Tree + SearchResult |
| 5 | รายละเอียด Dataset | `/[locale]/datasets/[id]` | DatasetDetail + PreviewTable + DownloadModal |
| 6 | เปรียบเทียบ | `/[locale]/datasets/[id]/compare` | CompareChart (Bar + Line) |
| 7 | หมวดหมู่ | `/[locale]/categories/[slug]` | Breadcrumb + DatasetList + Filter |
| 8 | สถิติภาพรวม | `/[locale]/stats` | Line + Bar + Pie (Recharts) |
| 9 | Privacy Policy | `/[locale]/privacy-policy` | Static content |

**Responsive #42**
- DatasetCard grid: Desktop 3 col → Tablet 2 col → Mobile 1 col
- SearchFilter: Desktop ซ้ายถาวร → Mobile Drawer
- Navbar: Desktop เต็ม → Mobile Hamburger

---

## Phase 4 — Agency (8 หน้า)

> Auth Guard: ไม่มี Token → Redirect `/login`

| # | หน้า | Route | Component หลัก |
|---|------|-------|----------------|
| 10 | Dashboard | `/[locale]/dashboard` | StatsCard ×4, Download Chart, DatasetList ล่าสุด |
| 11 | รายการ Dataset | `/[locale]/datasets` | Table, Status Badge (draft/published), Filter, Action |
| 12 | อัปโหลด / แก้ไข | `/[locale]/datasets/create` `/[locale]/datasets/[id]/edit` | DatasetForm mode:create/edit, DnD Upload, Quality Score, PII |
| 13 | Bulk Upload | `/[locale]/datasets/bulk-upload` | Download Template, DnD Excel, BulkUploadResult |
| 14 | Version History | `/[locale]/datasets/[id]/versions` | VersionHistoryTable + Restore |
| 15 | จัดการหมวดหมู่ | `/[locale]/categories` | หมวด Level 1+2 ของตัวเอง, CategoryForm, SubcategoryForm |
| 16 | Bookmark + Subscription + Saved Search | `/[locale]/saved` | Tab 3 อัน รวมหน้าเดียว |
| 17 | Custom Dashboard | `/[locale]/dashboard/custom` | DashboardGrid DnD Kit + DashboardWidget |

**Status Badge**
- `draft` = bg `#dbeafe` text `#1d4c61`
- `published` = bg `#e1f5ee` text `#0f6e56`

---

## Phase 5 — Admin (6 หน้า)

> Auth Guard: ไม่ใช่ Admin → Redirect หน้าหลัก

| # | หน้า | Route | Component หลัก |
|---|------|-------|----------------|
| 18 | Dashboard | `/[locale]/admin` | AdminStatsCard ×4, Dataset Chart, Download Chart, User รอ Approve |
| 19 | จัดการ User | `/[locale]/admin/users` | UserTable, อนุมัติ/ปฏิเสธ/Suspend, Filter, Search |
| 20 | จัดการ Dataset | `/[locale]/admin/datasets` | Table Dataset ทุกหน่วยงาน, แก้ไข/ลบ |
| 21 | หมวดหมู่ + แท็ก | `/[locale]/admin/categories` | CategoryTree 2 ระดับ, เพิ่ม Level 1, Tab แท็ก |
| 22 | จัดการประกาศ | `/[locale]/admin/announcements` | AnnouncementForm, Toggle เปิด/ปิด |
| 23 | Audit Log | `/[locale]/admin/audit-logs` | AuditLogTable, Filter, Export CSV |

---

## กฎสำคัญ #56

- ห้าม Hardcode ข้อความไทย/อังกฤษ → ใช้ `next-intl` เสมอ
- ทุก API Call → `React Query` เสมอ ห้าม fetch/axios ตรงใน Component
- ทุก Form → `React Hook Form + Zod` เสมอ
- ทุก Global State → `Zustand` เสมอ
- ทุก Component → ใช้สีและ Spacing จาก Design System นี้เท่านั้น ห้าม Hardcode สี
- ห้ามใช้สีนอก Design System

---

## State Management #39

```
Zustand     → user, token, sidebarOpen
React Query → ข้อมูลทุกอย่างจาก API
RHF + Zod  → Form ทุกตัว
useState    → Modal, Tab, UI เล็กๆ
```

**React Query Keys**
- `['datasets']` — รายการ Dataset
- `['datasets', id]` — Dataset ชิ้นเดียว
- `['search', keyword, filters]` — ผลค้นหา
- `['users']` — รายการ User

---

## Responsive #42

| Breakpoint | ขนาด | อุปกรณ์ |
|-----------|------|---------|
| `sm` | 640px | Mobile |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |

- Mobile First เสมอ
- ใช้งานได้ตั้งแต่ 375px
- ปุ่ม Mobile สูงอย่างน้อย 44px
- Font ขั้นต่ำ 14px
- ห้ามมี Element ล้นออกนอกหน้าจอแนวนอนบน Mobile

---

## Folder Structure #7

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   └── [locale]/
│   │       ├── layout.tsx
│   │       ├── (public)/
│   │       ├── (auth)/
│   │       ├── (agency)/
│   │       └── (admin)/
│   ├── components/
│   │   ├── common/
│   │   ├── dataset/
│   │   ├── search/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── hooks/
│   ├── services/
│   │   └── api.ts
│   ├── stores/
│   │   ├── useAuthStore.ts
│   │   └── useUIStore.ts
│   ├── types/
│   ├── utils/
│   ├── locales/
│   │   ├── th.json
│   │   └── en.json
│   ├── i18n/
│   │   └── request.ts
│   └── providers/
│       └── AppProviders.tsx
├── tailwind.config.ts
├── postcss.config.js
├── middleware.ts
├── next.config.js
└── .env.local
```

---

*อ้างอิง claude.md + DESIGN.md | อัปเดตล่าสุด: ขั้นที่ 14 Frontend*
