# Module: Agency Dashboard
# Feature: GET /agency/dashboard

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

import app.services.agency_service as agency_service
from app.core.database import get_db
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import list_response, success_response
from app.core.security import require_roles

router = APIRouter(prefix="/agency", tags=["Agency"])


@router.get("/dashboard", status_code=status.HTTP_200_OK)
def get_agency_dashboard(
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    สถิติ Dashboard ของ Agency/Admin (เฉพาะ Dataset ของ user ที่ login)

    - **Auth**: ✅ Agency/Admin
    - **Response**: AgencyDashboardStats (JSend)
    """
    result = agency_service.get_agency_dashboard(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
    )
    return success_response(data=result.model_dump(mode="json", by_alias=True))


@router.get("/datasets", status_code=status.HTTP_200_OK)
def list_agency_datasets(
    status: str | None = Query(
        default=None,
        description="กรอง status: draft | submitted | published (ไม่ส่ง = ทั้งหมด)",
    ),
    pagination: PaginationParams = Depends(get_pagination_params),
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    รายการ Dataset ของ Agency/Admin ที่ login (ทุก status ของตัวเอง)

    - **Auth**: ✅ Agency/Admin
    - **Query**: page, page_size, sort, order, status (optional)
    """
    allowed = {None, "draft", "published"}
    if status is not None and status not in allowed:
        from app.core.errors import raise_app_error

        raise_app_error("DATASET_INVALID_STATUS")

    items, total = agency_service.list_agency_datasets(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        pagination=pagination,
        status_filter=status,
    )
    return list_response(
        data=[i.model_dump(mode="json", by_alias=True) for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/activity-logs", status_code=status.HTTP_200_OK)
def list_agency_activity_logs(
    pagination: PaginationParams = Depends(get_pagination_params),
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    Activity Log ของผู้ใช้ที่ login

    - **Auth**: ✅ Agency/Admin
    - **Response**: รายการ action ของ current_user เท่านั้น
    """
    items, total = agency_service.list_agency_activity_logs(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        pagination=pagination,
    )
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )
