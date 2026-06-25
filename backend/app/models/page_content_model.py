# Module: M6 Admin
# Feature: Static page content (CMS)

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel


class PageContentStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class PageContent(BaseModel):
    __tablename__ = "page_contents"

    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    title_th: Mapped[str] = mapped_column(String(255), nullable=False)
    title_en: Mapped[str] = mapped_column(String(255), nullable=False)
    content_th: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    content_en: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    status: Mapped[PageContentStatus] = mapped_column(
        Enum(PageContentStatus, name="page_content_status", create_constraint=False),
        nullable=False,
        default=PageContentStatus.published,
        server_default="published",
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_page_contents_users"),
        nullable=True,
    )
