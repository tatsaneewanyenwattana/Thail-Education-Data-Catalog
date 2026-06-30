# Module: Scholarship
# Feature: Scholarship Model ตาม #11 #12 #15 #16

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.scholarship_bookmark_model import ScholarshipBookmark
    from app.models.user_model import User


class Scholarship(Base):
    __tablename__ = "scholarships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_scholarships_users"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    scholarship_type: Mapped[str] = mapped_column(
        Enum(
            "government",
            "university",
            "private",
            "foundation",
            "exchange",
            "other",
            name="scholarship_type",
            create_type=False,
        ),
        nullable=False,
    )
    target_level: Mapped[str] = mapped_column(
        Enum(
            "high_school",
            "bachelor",
            "master",
            "doctoral",
            "any",
            name="education_level",
            create_type=False,
        ),
        nullable=False,
    )
    amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    amount_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    eligibility: Mapped[str] = mapped_column(Text, nullable=False)
    application_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    open_date: Mapped[date] = mapped_column(Date, nullable=False)
    close_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(
            "draft",
            "published",
            name="scholarship_status",
            create_type=False,
        ),
        nullable=False,
        server_default="draft",
    )
    source: Mapped[str] = mapped_column(
        Enum(
            "agency",
            "data_go_th",
            "api",
            name="scholarship_source",
            create_type=False,
        ),
        nullable=False,
        server_default="agency",
    )
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false",
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    created_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
    )
    bookmarks: Mapped[list["ScholarshipBookmark"]] = relationship(
        "ScholarshipBookmark",
        back_populates="scholarship",
    )
