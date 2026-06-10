# Module: M1 Auth
# Feature: PDPA Consent Model ตาม #11 #12 #15 #16

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PDPAConsent(Base):
    __tablename__ = "pdpa_consents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_pdpa_consents_users"),
        nullable=False,
    )
    consent_type: Mapped[str | None] = mapped_column(
        Enum("terms", "pdpa", name="consent_type", create_type=False),
        nullable=True,
    )
    version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    consented_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    ip_address: Mapped[str] = mapped_column(
        String(45),
        nullable=False,
    )
