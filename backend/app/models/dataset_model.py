# Module: M2 Dataset
# Feature: Dataset Model ตาม #11 #12 #15 #16

import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel, SoftDeleteMixin


class Dataset(SoftDeleteMixin, BaseModel):
    __tablename__ = "datasets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_datasets_users"),
        nullable=False,
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", name="fk_datasets_categories"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum(
            "draft", "submitted", "published", "rejected",
            name="dataset_status",
            create_type=False,
        ),
        nullable=False,
        server_default="draft",
    )
    license: Mapped[str] = mapped_column(
        Enum(
            "open", "conditional", "cc",
            name="dataset_license",
            create_type=False,
        ),
        nullable=False,
    )
    dataset_metadata: Mapped[dict | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )
    quality_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    download_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    view_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    reject_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(
        nullable=True
    )
