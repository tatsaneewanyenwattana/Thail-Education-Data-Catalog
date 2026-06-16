# Module: M6 Admin
# Feature: Static page content (CMS)

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel


class PageContent(BaseModel):
    __tablename__ = "page_contents"

    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    title_th: Mapped[str] = mapped_column(String(255), nullable=False)
    title_en: Mapped[str] = mapped_column(String(255), nullable=False)
    content_th: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    content_en: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="published", server_default="published"
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_page_contents_users"),
        nullable=True,
    )
