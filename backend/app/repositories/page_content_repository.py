# Module: M6 Admin
# Feature: Page content repository

from sqlalchemy.orm import Session

from app.models.page_content_model import PageContent


def get_by_slug(db: Session, slug: str) -> PageContent | None:
    return db.query(PageContent).filter(PageContent.slug == slug).first()


def list_all(db: Session) -> list[PageContent]:
    return db.query(PageContent).order_by(PageContent.slug.asc()).all()


def create(
    db: Session,
    *,
    slug: str,
    title_th: str,
    title_en: str,
    content_th: str = "",
    content_en: str = "",
    updated_by=None,
) -> PageContent:
    row = PageContent(
        slug=slug,
        title_th=title_th,
        title_en=title_en,
        content_th=content_th,
        content_en=content_en,
        updated_by=updated_by,
    )
    db.add(row)
    db.flush()
    return row


def update_content(
    db: Session,
    row: PageContent,
    *,
    content_th: str,
    content_en: str,
    updated_by=None,
) -> PageContent:
    row.content_th = content_th
    row.content_en = content_en
    row.updated_by = updated_by
    db.flush()
    return row
