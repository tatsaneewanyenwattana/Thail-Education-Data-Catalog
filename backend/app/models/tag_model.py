# Module: M2 Dataset
# Feature: Tag Model ตาม #11 #12 #15 #16

import uuid

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel, SoftDeleteMixin


class Tag(SoftDeleteMixin, BaseModel):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
