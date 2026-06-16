import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DatasetPIIScanResult(Base):
    __tablename__ = "dataset_pii_scan_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
    )
    column_name: Mapped[str] = mapped_column(String, nullable=False)
    pii_type: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str] = mapped_column(String, nullable=False)
    match_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sample_masked_value: Mapped[str | None] = mapped_column(String, nullable=True)
    scan_type: Mapped[str] = mapped_column(String, nullable=False)
    scanned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
