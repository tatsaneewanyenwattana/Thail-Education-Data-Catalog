# Module: M1 Auth
# Feature: User Model ตาม #11 #12
import uuid
from datetime import datetime
from sqlalchemy import DateTime, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.core.base_model import BaseModel, SoftDeleteMixin

class User(SoftDeleteMixin, BaseModel):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        Enum("visitor", "agency", "admin", name="user_role", create_type=False),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum(
            "email_unverified",
            "pending",
            "active",
            "rejected",
            "suspended",
            name="user_status",
            create_type=False,
        ),
        nullable=False,
        server_default="email_unverified",
    )
    agency_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    reject_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    # Agency Info (Migration 1)
    agency_name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    agency_type: Mapped[str | None] = mapped_column(
        Enum(
            "central",
            "regional",
            "local",
            "educational",
            "other",
            name="agency_type",
            create_type=False,
        ),
        nullable=True,
    )
    agency_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    agency_website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_position: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    verification_doc_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    suspend_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Email Verification (Migration 2)
    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    verify_token: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    verify_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Password Reset (Migration 3)
    reset_token: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    reset_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Account Lockout (Migration 4)
    failed_login_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )