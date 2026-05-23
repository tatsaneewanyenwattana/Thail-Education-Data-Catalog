# Datacatalog

## ภาพรวมระบบ

คลังข้อมูลการศึกษาไทย (Data Catalog) สำหรับรวบรวมและเผยแพร่ Dataset จากหน่วยงานต่างๆ
รองรับ PII Masking, มาตรฐาน DCAT-AP, เผยแพร่ Dataset ทันทีหลังอัปโหลด (upload → published) และ Public API

## Tech Stack

| ชั้น | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Zustand, React Query, Zod, next-intl |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic, Pandas |
| Database | PostgreSQL 15 |
| Cache / Session | Redis 7 |
| File Storage | MinIO |
| Search | Elasticsearch 8, PyThaiNLP |
| Proxy | Nginx |

## โครงสร้างโปรเจกต์

```
datacatalog/
├── frontend/          # Next.js 14 App Router
├── backend/           # FastAPI
├── docker/            # Dockerfiles และ Nginx config
├── docker-compose.yml
├── docker-compose.staging.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

## การติดตั้ง (Dev)

### Requirements

- Docker
- Docker Compose

### Clone โปรเจกต์

```bash
git clone <repository-url>
cd thail-datacatalog
```

### ตั้งค่า ENV

```bash
cp .env.example backend/.env
# แก้ไข backend/.env ตามค่า Dev (เช่น DATABASE_URL, REDIS_HOST)

# Frontend
# สร้าง frontend/.env.local จากตัวอย่าง
echo NEXT_PUBLIC_API_BASE_URL=http://localhost/api > frontend/.env.local
echo NEXT_PUBLIC_APP_ENV=development >> frontend/.env.local
```

### รัน docker compose up

```bash
docker compose up --build
```

### รัน Migration (ขั้นตอนที่ 3)

```bash
# จะทำในขั้นตอนที่ 3 — Database
docker compose exec backend alembic upgrade head
```

## การใช้งาน

| URL | คำอธิบาย |
|-----|----------|
| http://localhost | หน้าเว็บผ่าน Nginx |
| http://localhost:3000 | Frontend โดยตรง |
| http://localhost:8000/docs | Swagger UI (Backend) |
| http://localhost:8000/health | Health check |

## API Documentation

- Swagger UI: `http://localhost:8000/docs` (Dev / Staging)
- รูปแบบ Response: JSend (`success`, `data`, `message`)
- Base path: `/api/v1`

## Branch Strategy

| Branch | ใช้ทำอะไร |
|--------|-----------|
| `develop` | พัฒนาประจำวัน |
| `staging` | ทดสอบก่อน Production |
| `main` | Production |
| `feature/*` | Feature ใหม่ |
| `hotfix/*` | แก้ Bug เร่งด่วน |

Flow: `develop` → `staging` → `main`

## การ Deploy

### Staging

```bash
# สร้าง .env.staging ที่ root (ห้าม commit)
docker compose -f docker-compose.staging.yml up --build -d
```

### Production

```bash
# สร้าง .env.prod ที่ root (ห้าม commit)
docker compose -f docker-compose.prod.yml up --build -d
```

- Staging / Production expose เฉพาะ port 80 และ 443 ผ่าน Nginx
- Production มี resource limits ตาม docker-compose.prod.yml
