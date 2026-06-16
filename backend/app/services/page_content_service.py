# Module: M6 Admin
# Feature: Static page content service

import re
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

import app.repositories.page_content_repository as page_content_repo
from app.core.errors import raise_app_error
from app.schemas.admin_schema import (
    PageContentCreateRequest,
    PageContentResponse,
    PageContentUpdateRequest,
)

BUILTIN_SLUGS: tuple[str, ...] = (
    "privacy-policy",
    "terms",
    "api-docs",
    "help-center",
)

DEFAULT_PAGES: dict[str, dict[str, str]] = {
    "privacy-policy": {
        "title_th": "นโยบายความเป็นส่วนตัว",
        "title_en": "Privacy Policy",
        "status": "published",
    },
    "terms": {
        "title_th": "เงื่อนไขการใช้งาน",
        "title_en": "Terms of Service",
        "status": "published",
    },
    "api-docs": {
        "title_th": "เอกสาร API",
        "title_en": "API Documentation",
        "status": "published",
    },
    "help-center": {
        "title_th": "Help Center",
        "title_en": "Help Center",
        "status": "draft",
    },
}

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _to_response(
    slug: str,
    title_th: str,
    title_en: str,
    content_th: str,
    content_en: str,
    status: str,
    updated_at: datetime,
) -> PageContentResponse:
    return PageContentResponse(
        slug=slug,
        title_th=title_th,
        title_en=title_en,
        content_th=content_th or "",
        content_en=content_en or "",
        status=status,
        updated_at=updated_at,
    )


def _default_response(slug: str) -> PageContentResponse:
    meta = DEFAULT_PAGES[slug]
    now = datetime.now(timezone.utc)
    return _to_response(
        slug=slug,
        title_th=meta["title_th"],
        title_en=meta["title_en"],
        content_th="",
        content_en="",
        status=meta["status"],
        updated_at=now,
    )


def _row_to_response(row) -> PageContentResponse:
    return _to_response(
        slug=row.slug,
        title_th=row.title_th,
        title_en=row.title_en,
        content_th=row.content_th,
        content_en=row.content_en,
        status=row.status,
        updated_at=row.updated_at,
    )


def get_page(db: Session, slug: str) -> PageContentResponse:
    row = page_content_repo.get_by_slug(db, slug)
    if row is None:
        if slug in DEFAULT_PAGES:
            return _default_response(slug)
        raise_app_error("PAGE_NOT_FOUND", "ไม่พบหน้าที่ต้องการ")
    return _row_to_response(row)


def get_public_page(db: Session, slug: str) -> PageContentResponse:
    result = get_page(db, slug)
    if result.status == "draft":
        raise_app_error("PAGE_NOT_FOUND", "ไม่พบหน้าที่ต้องการ")
    return result


def list_pages(db: Session) -> list[PageContentResponse]:
    rows_by_slug = {row.slug: row for row in page_content_repo.list_all(db)}
    results: list[PageContentResponse] = []
    seen: set[str] = set()

    for slug in BUILTIN_SLUGS:
        row = rows_by_slug.get(slug)
        if row is None:
            results.append(_default_response(slug))
        else:
            results.append(_row_to_response(row))
        seen.add(slug)

    for row in page_content_repo.list_all(db):
        if row.slug not in seen:
            results.append(_row_to_response(row))

    return results


def create_page(
    db: Session,
    request: PageContentCreateRequest,
    current_user: dict,
) -> PageContentResponse:
    slug = request.slug.strip().lower()
    if not SLUG_PATTERN.match(slug):
        raise_app_error("VALIDATION_ERROR", "Slug ต้องเป็นตัวพิมพ์เล็กและ - เท่านั้น")

    if page_content_repo.get_by_slug(db, slug) is not None:
        raise_app_error("PAGE_SLUG_EXISTS", "Slug นี้มีในระบบแล้ว")

    user_id = uuid.UUID(current_user["sub"])
    row = page_content_repo.create(
        db,
        slug=slug,
        title_th=request.title_th.strip(),
        title_en=request.title_en.strip(),
        content_th="",
        content_en="",
        status=request.status,
        updated_by=user_id,
    )
    db.commit()
    db.refresh(row)
    return _row_to_response(row)


def update_page(
    db: Session,
    slug: str,
    request: PageContentUpdateRequest,
    current_user: dict,
) -> PageContentResponse:
    user_id = uuid.UUID(current_user["sub"])
    row = page_content_repo.get_by_slug(db, slug)

    if row is None:
        if slug not in DEFAULT_PAGES:
            raise_app_error("PAGE_NOT_FOUND", "ไม่พบหน้าที่ต้องการ")
        meta = DEFAULT_PAGES[slug]
        row = page_content_repo.create(
            db,
            slug=slug,
            title_th=meta["title_th"],
            title_en=meta["title_en"],
            content_th=request.content_th,
            content_en=request.content_en,
            status=meta["status"],
            updated_by=user_id,
        )
    else:
        row = page_content_repo.update_content(
            db,
            row,
            content_th=request.content_th,
            content_en=request.content_en,
            updated_by=user_id,
        )

    db.commit()
    db.refresh(row)
    return _row_to_response(row)
