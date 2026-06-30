# Module: Scholarship
# Feature: Request/Response Schemas ตาม #21 #22

import uuid
from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator


class ScholarshipType(str, Enum):
    government = "government"
    university = "university"
    private = "private"
    foundation = "foundation"
    exchange = "exchange"
    other = "other"


class EducationLevel(str, Enum):
    high_school = "high_school"
    bachelor = "bachelor"
    master = "master"
    doctoral = "doctoral"
    any = "any"


class ScholarshipStatus(str, Enum):
    draft = "draft"
    published = "published"


class ScholarshipSource(str, Enum):
    agency = "agency"
    data_go_th = "data_go_th"
    api = "api"


class ScholarshipCreate(BaseModel):
    title: str = Field(min_length=5, max_length=500)
    description: str = Field(min_length=1)
    scholarship_type: ScholarshipType
    target_level: EducationLevel
    eligibility: str = Field(min_length=1)
    open_date: date
    close_date: date
    amount: float | None = None
    amount_note: str | None = Field(default=None, max_length=500)
    application_url: str | None = Field(default=None, max_length=500)
    contact_phone: str | None = Field(default=None, max_length=50)
    contact_email: str | None = Field(default=None, max_length=255)
    status: ScholarshipStatus

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.close_date < self.open_date:
            raise ValueError("close_date must be greater than or equal to open_date")
        return self


class ScholarshipUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=500)
    description: str | None = Field(default=None, min_length=1)
    scholarship_type: ScholarshipType | None = None
    target_level: EducationLevel | None = None
    eligibility: str | None = Field(default=None, min_length=1)
    open_date: date | None = None
    close_date: date | None = None
    amount: float | None = None
    amount_note: str | None = Field(default=None, max_length=500)
    application_url: str | None = Field(default=None, max_length=500)
    contact_phone: str | None = Field(default=None, max_length=50)
    contact_email: str | None = Field(default=None, max_length=255)
    status: ScholarshipStatus | None = None

    @model_validator(mode="after")
    def validate_date_range(self):
        if (
            self.open_date is not None
            and self.close_date is not None
            and self.close_date < self.open_date
        ):
            raise ValueError("close_date must be greater than or equal to open_date")
        return self


class ScholarshipResponse(BaseModel):
    id: uuid.UUID
    created_by: uuid.UUID
    agency_name: str | None = None
    title: str
    description: str | None
    scholarship_type: ScholarshipType
    target_level: EducationLevel
    amount: float | None = None
    amount_note: str | None = None
    eligibility: str
    application_url: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    open_date: date
    close_date: date
    status: ScholarshipStatus
    source: ScholarshipSource
    image_url: str | None = None
    external_id: str | None = None
    is_deleted: bool
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("amount", mode="before")
    @classmethod
    def decimal_to_float(cls, value):
        if value is None:
            return None
        return float(value)


class ScholarshipBookmarkCreateRequest(BaseModel):
    scholarship_id: uuid.UUID


class ScholarshipBookmarkResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    scholarship_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
