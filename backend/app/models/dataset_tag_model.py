# Module: M2 Dataset
# Feature: Dataset Tag Model ตาม #11 #12 #15 #16

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DatasetTag(Base):
    __tablename__ = "dataset_tags"
    __table_args__ = (
        UniqueConstraint(
            "dataset_id", "tag_id",
            name="uq_dataset_tags_dataset_tag",
        ),
    )

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", name="fk_dataset_tags_datasets"),
        primary_key=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tags.id", name="fk_dataset_tags_tags"),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
