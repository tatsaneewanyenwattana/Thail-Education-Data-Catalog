# Module: Notification
# Feature: Request/Response Schemas

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    content: str
    link: str | None = None
    reference_id: uuid.UUID | None = None
    image_url: str | None = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationUnreadCountResponse(BaseModel):
    count: int


class NotificationReadAllResponse(BaseModel):
    updated_count: int
