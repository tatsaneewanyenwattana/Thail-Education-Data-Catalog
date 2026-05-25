# Module: M6 Admin
# Feature: Static page content service

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

import app.repositories.page_content_repository as page_content_repo
from app.core.errors import raise_app_error
from app.schemas.admin_schema import PageContentResponse, PageContentUpdateRequest

ALLOWED_SLUGS: tuple[str, ...] = (
    "privacy-policy",
    "terms",
    "api-docs",
    "help-center",
)

DEFAULT_PAGES: dict[str, dict[str, str]] = {
    "privacy-policy": {
        "title_th": "นโยบายความเป็นส่วนตัว",
        "title_en": "Privacy Policy",
    },
    "terms": {
        "title_th": "เงื่อนไขการใช้งาน",
        "title_en": "Terms of Service",
    },
    "api-docs": {
        "title_th": "เอกสาร API",
        "title_en": "API Documentation",
    },
    "help-center": {
        "title_th": "Help Center",
        "title_en": "Help Center",
    },
}


def _validate_slug(slug: str) -> None:
    if slug not in ALLOWED_SLUGS:
        raise_app_error("NOT_FOUND", "ไม่พบหน้าที่ต้องการ")


def _to_response(
    slug: str,
    title_th: str,
    title_en: str,
    content_th: str,
    content_en: str,
    updated_at: datetime,
) -> PageContentResponse:
    return PageContentResponse(
        slug=slug,
        title_th=title_th,
        title_en=title_en,
        content_th=content_th or "",
        content_en=content_en or "",
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
        updated_at=now,
    )


def get_page(db: Session, slug: str) -> PageContentResponse:
    _validate_slug(slug)
    row = page_content_repo.get_by_slug(db, slug)
    if row is None:
        return _default_response(slug)
    return _to_response(
        slug=row.slug,
        title_th=row.title_th,
        title_en=row.title_en,
        content_th=row.content_th,
        content_en=row.content_en,
        updated_at=row.updated_at,
    )


def list_pages(db: Session) -> list[PageContentResponse]:
    rows_by_slug = {row.slug: row for row in page_content_repo.list_all(db)}
    results: list[PageContentResponse] = []
    for slug in ALLOWED_SLUGS:
        row = rows_by_slug.get(slug)
        if row is None:
            results.append(_default_response(slug))
        else:
            results.append(
                _to_response(
                    slug=row.slug,
                    title_th=row.title_th,
                    title_en=row.title_en,
                    content_th=row.content_th,
                    content_en=row.content_en,
                    updated_at=row.updated_at,
                )
            )
    return results


def update_page(
    db: Session,
    slug: str,
    request: PageContentUpdateRequest,
    current_user: dict,
) -> PageContentResponse:
    _validate_slug(slug)
    user_id = uuid.UUID(current_user["sub"])
    row = page_content_repo.get_by_slug(db, slug)

    if row is None:
        meta = DEFAULT_PAGES[slug]
        row = page_content_repo.create(
            db,
            slug=slug,
            title_th=meta["title_th"],
            title_en=meta["title_en"],
            content_th=request.content_th,
            content_en=request.content_en,
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
    return _to_response(
        slug=row.slug,
        title_th=row.title_th,
        title_en=row.title_en,
        content_th=row.content_th,
        content_en=row.content_en,
        updated_at=row.updated_at,
    )
