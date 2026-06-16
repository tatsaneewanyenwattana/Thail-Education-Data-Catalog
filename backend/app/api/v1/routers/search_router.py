# Module: M3 Search
# Feature: Search API Endpoints ตาม #20

import json
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

import app.services.search_service as search_service
from app.core.database import get_db
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import delete_response, list_response, success_response
from app.core.security import get_current_user_payload_with_status, require_roles
from app.schemas.search_schema import SavedSearchCreateRequest

router = APIRouter()


def _get_es():
    from elasticsearch import Elasticsearch
    from app.core.config import settings
    return Elasticsearch(settings.ELASTICSEARCH_URL)


@router.get("/search/filters", status_code=status.HTTP_200_OK)
def search_filters_endpoint(
    category_id: uuid.UUID | None = None,
    agency_user_id: uuid.UUID | None = None,
    province: str | None = None,
    db: Session = Depends(get_db),
):
    """
    ตัวเลือก Filter สำหรับหน้าค้นหา — แสดงเฉพาะค่าที่มีใน Dataset ที่เผยแพร่แล้ว
    รองรับ scope ตามหมวด/หน่วยงาน/จังหวัดที่เลือกอยู่
    - Auth ❌
    """
    scope: dict = {}
    if category_id is not None:
        scope["category_id"] = str(category_id)
    if agency_user_id is not None:
        scope["agency_user_id"] = str(agency_user_id)
    if province:
        scope["province"] = province

    result = search_service.get_filter_options(db, scope or None)
    return success_response(result.model_dump(mode="json"))


@router.get("/search", status_code=status.HTTP_200_OK)
def search_datasets_endpoint(
    keyword: str | None = None,
    filters: str | None = None,
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db),
):
    """
    ค้นหา Dataset ตาม #31
    - Auth ❌
    - คืน 200 + list_response พร้อม pagination ตาม #23
    """
    filters_dict = None
    if filters:
        try:
            filters_dict = json.loads(filters)
        except json.JSONDecodeError:
            raise_app_error("SEARCH_INVALID_FILTER")

    items, total = search_service.search(
        es_client=_get_es(),
        keyword=keyword,
        filters=filters_dict,
        pagination=pagination,
        db=db,
    )
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/search/autocomplete", status_code=status.HTTP_200_OK)
def autocomplete_endpoint(keyword: str | None = None):
    """
    Autocomplete ตาม #31
    - Auth ❌
    """
    result = search_service.autocomplete(_get_es(), keyword=keyword)
    return success_response(data=result.model_dump())


@router.post("/saved-searches", status_code=status.HTTP_201_CREATED)
def create_saved_search_endpoint(
    request_body: SavedSearchCreateRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    บันทึกการค้นหา — Visitor ทำไม่ได้ ตาม #31
    - Auth ✅ Agency/Admin
    """
    result = search_service.create_saved_search(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        name=request_body.name,
        filters=request_body.filters,
    )
    return success_response(data=result.model_dump(mode="json"))


@router.get("/saved-searches", status_code=status.HTTP_200_OK)
def list_saved_searches_endpoint(
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    ดูรายการ Saved Search ตาม #20
    - Auth ✅ Agency/Admin
    """
    items = search_service.get_saved_searches(
        db=db, user_id=uuid.UUID(payload["sub"])
    )
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=1,
        page_size=len(items) if items else 1,
        total_items=len(items),
    )


@router.delete("/saved-searches/{saved_search_id}", status_code=status.HTTP_200_OK)
def delete_saved_search_endpoint(
    saved_search_id: uuid.UUID,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    ลบ Saved Search — เช็ค Ownership ตาม #15
    - Auth ✅ Agency/Admin
    """
    search_service.delete_saved_search(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        saved_search_id=saved_search_id,
    )
    return delete_response()
