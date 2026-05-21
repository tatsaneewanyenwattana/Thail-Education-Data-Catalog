# Module: M4 Download
# Feature: Request/Response Schemas

import uuid
from typing import Any

from pydantic import BaseModel, Field


class DownloadRequest(BaseModel):
    purpose: str = Field(min_length=10, max_length=500)
    format: str = Field(pattern="^(csv|excel|json|xml)$")


class PreviewResponse(BaseModel):
    rows: list[dict[str, Any]]
    total_rows: int
    columns: list[str]
    masked_columns: list[str]


class CitationResponse(BaseModel):
    dataset_id: uuid.UUID
    title: str
    agency_name: str | None
    license: str
    published_at: str | None
    apa: str
    vancouver: str
