# Module: M4 Download
# Feature: Download Log Model ตาม #11 #12

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DownloadLog(Base):
    __tablename__ = "download_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", name="fk_download_logs_datasets"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_download_logs_users"),
        nullable=True,
    )
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    file_format: Mapped[str] = mapped_column(
        Enum(
            "csv", "excel", "json", "xml",
            name="file_format",
            create_type=False,
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
