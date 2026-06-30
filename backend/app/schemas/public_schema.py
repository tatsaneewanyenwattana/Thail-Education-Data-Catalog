# Module: M7 Public API
# Feature: Response Schemas

import uuid
from datetime import datetime

from pydantic import BaseModel


class DatasetStatsResponse(BaseModel):
    dataset_id: uuid.UUID
    download_count: int
    view_count: int
    quality_score: int | None
    published_at: datetime | None


class PublicAgencyResponse(BaseModel):
    agency_user_id: uuid.UUID
    agency_name: str
    agency_name_en: str | None = None
