# Module: M2 Dataset
# Feature: Dataset File Model ตาม #11 #12 #15 #16

import uuid

from sqlalchemy import BigInteger, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel, SoftDeleteMixin


class DatasetFile(SoftDeleteMixin, BaseModel):
    __tablename__ = "dataset_files"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", name="fk_dataset_files_datasets"),
        nullable=False,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    file_format: Mapped[str] = mapped_column(
        Enum(
            "csv", "excel", "json", "xml",
            name="file_format",
            create_type=False,
        ),
        nullable=False,
    )
