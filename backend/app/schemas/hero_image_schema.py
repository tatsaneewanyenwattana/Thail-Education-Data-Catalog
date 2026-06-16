# Module: M6 Admin
# Feature: Hero background image settings

from pydantic import BaseModel, Field


class HeroImageResponse(BaseModel):
    image_url: str | None = Field(
        default=None,
        description="Relative or absolute URL to hero image served via backend proxy",
    )
