# Module: M6 Admin
# Feature: Admin API Endpoints ตาม #20

import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

import app.services.admin_service as admin_service
from app.core.config import settings
from app.core.database import get_db
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import delete_response, list_response, success_response
from app.core.security import require_roles
from app.schemas.admin_schema import (
    AnnouncementCreateRequest,
    AnnouncementUpdateRequest,
    UserUpdateRequest,
)

router = APIRouter(prefix="/admin")


def _get_redis():
    import redis

    return redis.from_url(settings.redis_url, decode_responses=True)


@router.get("/stats", status_code=status.HTTP_200_OK)
def admin_stats(
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Dashboard ภาพรวมระบบ ตาม #20
    - Auth ✅ Admin
    """
    result = admin_service.get_admin_stats(db)
    return success_response(result.model_dump(mode="json"))


@router.get("/users", status_code=status.HTTP_200_OK)
def admin_list_users(
    pagination: PaginationParams = Depends(get_pagination_params),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ดูรายการ User ทั้งหมด ตาม #20
    - Auth ✅ Admin
    """
    items, total = admin_service.get_all_users(db, pagination)
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.patch("/users/{id}", status_code=status.HTTP_200_OK)
def admin_update_user(
    id: uuid.UUID,
    request_body: UserUpdateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    แก้ไข User ตาม #20
    - Auth ✅ Admin
    """
    result = admin_service.update_user(db, user_id=id, request=request_body)
    return success_response(result.model_dump(mode="json"))


@router.post("/users/{id}/approve", status_code=status.HTTP_200_OK)
def admin_approve_user(
    id: uuid.UUID,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    อนุมัติบัญชี Agency ตาม #28
    - Auth ✅ Admin
    """
    result = admin_service.approve_user(
        db, background_tasks, user_id=id, current_user=payload
    )
    return success_response(result.model_dump(mode="json"))


@router.post("/users/{id}/reject", status_code=status.HTTP_200_OK)
def admin_reject_user(
    id: uuid.UUID,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ปฏิเสธบัญชี Agency ตาม #28
    - Auth ✅ Admin
    """
    result = admin_service.reject_user(
        db, background_tasks, user_id=id, current_user=payload
    )
    return success_response(result.model_dump(mode="json"))


@router.post("/users/{id}/suspend", status_code=status.HTTP_200_OK)
def admin_suspend_user(
    id: uuid.UUID,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Suspend User ตาม #28 #34
    - Auth ✅ Admin
    """
    result = admin_service.suspend_user(
        db, _get_redis(), user_id=id, current_user=payload
    )
    return success_response(result.model_dump(mode="json"))


@router.get("/audit-logs", status_code=status.HTTP_200_OK)
def admin_audit_logs(
    pagination: PaginationParams = Depends(get_pagination_params),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ดู Audit Log ตาม #20
    - Auth ✅ Admin
    """
    items, total = admin_service.get_audit_logs(db, pagination)
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/announcements", status_code=status.HTTP_200_OK)
def admin_list_announcements(
    pagination: PaginationParams = Depends(get_pagination_params),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ดูรายการประกาศ ตาม #20
    - Auth ✅ Admin
    """
    items, total = admin_service.get_announcements(db, pagination)
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.post("/announcements", status_code=status.HTTP_201_CREATED)
def admin_create_announcement(
    request_body: AnnouncementCreateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    เพิ่มประกาศ ตาม #20
    - Auth ✅ Admin
    """
    result = admin_service.create_announcement(
        db, request=request_body, current_user=payload
    )
    return success_response(result.model_dump(mode="json"))


@router.patch("/announcements/{id}", status_code=status.HTTP_200_OK)
def admin_update_announcement(
    id: uuid.UUID,
    request_body: AnnouncementUpdateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    แก้ไขประกาศ ตาม #20
    - Auth ✅ Admin
    """
    result = admin_service.update_announcement(
        db, announcement_id=id, request=request_body
    )
    return success_response(result.model_dump(mode="json"))


@router.delete("/announcements/{id}", status_code=status.HTTP_200_OK)
def admin_delete_announcement(
    id: uuid.UUID,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ลบประกาศ (Soft Delete) ตาม #15 #20
    - Auth ✅ Admin
    """
    admin_service.delete_announcement(db, announcement_id=id)
    return delete_response()
