# Module: M1 Auth
# Feature: Request/Response Schemas ตาม claude-v3 #21 #22 #40

import re
import uuid
from datetime import datetime
from enum import Enum
from typing import Self

from pydantic import BaseModel, Field, field_validator, model_validator

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_TH_PHONE_RE = re.compile(r"^(0[689]\d-\d{3}-\d{4}|0[2-57]-\d{3}-\d{4})$")
_PASSWORD_SPECIAL_RE = re.compile(r"[!@#$%^&*]")
_URL_RE = re.compile(
    r"^https?://"
    r"(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+"
    r"[A-Za-z]{2,}(?::\d{1,5})?(?:/[^\s]*)?$"
)
_AGENCY_CODE_RE = re.compile(r"^[A-Za-z0-9-]+$")
_DELETE_CONFIRM_TEXT = "ลบบัญชี"


class AgencyType(str, Enum):
    central = "central"
    regional = "regional"
    local = "local"
    educational = "educational"
    other = "other"


class UserRole(str, Enum):
    visitor = "visitor"
    agency = "agency"
    admin = "admin"


class UserStatus(str, Enum):
    email_unverified = "email_unverified"
    pending = "pending"
    active = "active"
    rejected = "rejected"
    suspended = "suspended"


class LoginAction(str, Enum):
    login_success = "LOGIN_SUCCESS"
    login_fail = "LOGIN_FAIL"


def _normalize_email(value: str) -> str:
    email = value.strip().lower()
    if not _EMAIL_RE.match(email):
        raise ValueError("รูปแบบ Email ไม่ถูกต้อง")
    return email


def _validate_password_policy(password: str) -> str:
    if len(password) < 8:
        raise ValueError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    if len(password) > 128:
        raise ValueError("รหัสผ่านต้องไม่เกิน 128 ตัวอักษร")
    if " " in password:
        raise ValueError("รหัสผ่านห้ามใช้ช่องว่าง")
    if not re.search(r"[a-z]", password):
        raise ValueError("รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว")
    if not re.search(r"[A-Z]", password):
        raise ValueError("รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
    if not re.search(r"[0-9]", password):
        raise ValueError("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว")
    if not _PASSWORD_SPECIAL_RE.search(password):
        raise ValueError("รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว เช่น !@#$%^&*")
    if not re.fullmatch(r"[A-Za-z0-9!@#$%^&*]+", password):
        raise ValueError("รหัสผ่านใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และ !@#$%^&*")
    return password


class RegisterRequest(BaseModel):
    agency_name: str = Field(min_length=3, max_length=255)
    agency_name_en: str | None = Field(default=None, max_length=255)
    agency_type: AgencyType
    agency_code: str | None = Field(default=None, max_length=100)
    agency_website: str | None = Field(default=None, max_length=500)
    contact_name: str = Field(min_length=3, max_length=255)
    contact_position: str | None = Field(default=None, max_length=255)
    contact_phone: str
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)
    terms_version: str = Field(min_length=1, max_length=50)
    pdpa_version: str = Field(min_length=1, max_length=50)
    terms_consent: bool
    pdpa_consent: bool

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password_policy(v)

    @field_validator("terms_consent")
    @classmethod
    def validate_terms_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("ต้องยอมรับข้อกำหนดการใช้งาน")
        return v

    @field_validator("pdpa_consent")
    @classmethod
    def validate_pdpa_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("ต้องยอมรับนโยบาย PDPA")
        return v

    @field_validator("contact_phone")
    @classmethod
    def validate_contact_phone(cls, v: str) -> str:
        phone = v.strip()
        if not _TH_PHONE_RE.match(phone):
            raise ValueError(
                "รูปแบบเบอร์โทรไม่ถูกต้อง ต้องเป็น 08X-XXX-XXXX หรือ 0X-XXX-XXXX"
            )
        return phone

    @field_validator("agency_code")
    @classmethod
    def validate_agency_code(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        code = v.strip()
        if not _AGENCY_CODE_RE.match(code):
            raise ValueError("agency_code ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น")
        return code

    @field_validator("agency_website")
    @classmethod
    def validate_agency_website(cls, v: str | None) -> str | None:
        if v is None or v.strip() == "":
            return None
        website = v.strip()
        if not _URL_RE.match(website):
            raise ValueError("รูปแบบ URL ของเว็บไซต์ไม่ถูกต้อง")
        return website

    @model_validator(mode="after")
    def validate_passwords_match(self) -> Self:
        if self.password != self.confirm_password:
            raise ValueError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน")
        return self


class RegisterMetadata(BaseModel):
    """Metadata JSON สำหรับ multipart register (Phase 2E) — ไม่รวม confirm_password."""

    agency_name: str = Field(min_length=3, max_length=255)
    agency_name_en: str | None = Field(default=None, max_length=255)
    agency_type: AgencyType
    agency_code: str | None = Field(default=None, max_length=100)
    agency_website: str | None = Field(default=None, max_length=500)
    contact_name: str = Field(min_length=3, max_length=255)
    contact_position: str | None = Field(default=None, max_length=255)
    contact_phone: str
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    terms_version: str = Field(min_length=1, max_length=50)
    pdpa_version: str = Field(min_length=1, max_length=50)
    terms_consent: bool
    pdpa_consent: bool

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password_policy(v)

    @field_validator("terms_consent")
    @classmethod
    def validate_terms_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("ต้องยอมรับข้อกำหนดการใช้งาน")
        return v

    @field_validator("pdpa_consent")
    @classmethod
    def validate_pdpa_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("ต้องยอมรับนโยบาย PDPA")
        return v

    @field_validator("contact_phone")
    @classmethod
    def validate_contact_phone(cls, v: str) -> str:
        phone = v.strip()
        if not _TH_PHONE_RE.match(phone):
            raise ValueError(
                "รูปแบบเบอร์โทรไม่ถูกต้อง ต้องเป็น 08X-XXX-XXXX หรือ 0X-XXX-XXXX"
            )
        return phone

    @field_validator("agency_code")
    @classmethod
    def validate_agency_code(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        code = v.strip()
        if not _AGENCY_CODE_RE.match(code):
            raise ValueError("agency_code ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น")
        return code

    @field_validator("agency_website")
    @classmethod
    def validate_agency_website(cls, v: str | None) -> str | None:
        if v is None or v.strip() == "":
            return None
        website = v.strip()
        if not _URL_RE.match(website):
            raise ValueError("รูปแบบ URL ของเว็บไซต์ไม่ถูกต้อง")
        return website


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=128)
    turnstile_token: str | None = Field(default=None, max_length=2048)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=36, max_length=255)


class ResendVerificationRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)


class RegisterStatusQuery(BaseModel):
    email: str = Field(min_length=5, max_length=255)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    turnstile_token: str | None = Field(default=None, max_length=2048)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=36, max_length=255)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return _validate_password_policy(v)


class DeleteAccountRequest(BaseModel):
    password: str = Field(min_length=1, max_length=128)
    confirm_text: str = Field(min_length=1, max_length=50)
    confirm_checkbox: bool

    @field_validator("confirm_text")
    @classmethod
    def validate_confirm_text(cls, v: str) -> str:
        if v.strip() != _DELETE_CONFIRM_TEXT:
            raise ValueError(f'ต้องพิมพ์ "{_DELETE_CONFIRM_TEXT}" ให้ตรงเป๊ะ')
        return v.strip()

    @field_validator("confirm_checkbox")
    @classmethod
    def validate_confirm_checkbox(cls, v: bool) -> bool:
        if not v:
            raise ValueError("ต้องยืนยันการลบบัญชี")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: UserRole | str
    status: UserStatus | str
    agency_name: str | None
    agency_name_en: str | None = None
    agency_type: AgencyType | str | None = None
    agency_code: str | None = None
    agency_website: str | None = None
    contact_name: str | None = None
    contact_position: str | None = None
    contact_phone: str | None = None
    email_verified_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class RegisterResponse(UserResponse):
    """Response หลังสมัครสำเร็จ — status เริ่มต้น email_unverified."""


class VerifyEmailResponse(BaseModel):
    status: str = "pending"
    message: str = "ยืนยันอีเมลเรียบร้อย บัญชีอยู่ระหว่างพิจารณา"


class RegisterStatusResponse(BaseModel):
    status: str
    created_at: datetime | None = None


class MessageResponse(BaseModel):
    message: str = "ok"


class LoginHistoryItemResponse(BaseModel):
    id: uuid.UUID
    action: LoginAction | str
    ip_address: str
    user_agent: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BookmarkRequest(BaseModel):
    dataset_id: uuid.UUID


class BookmarkResponse(BaseModel):
    id: uuid.UUID
    dataset_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class SubscriptionRequest(BaseModel):
    category_id: uuid.UUID | None = None
    agency_user_id: uuid.UUID | None = None


class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID | None
    agency_user_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}
