# Module: M6 Admin
# Feature: Admin API Endpoints ตาม #20

import uuid
from datetime import date, datetime, time
from typing import Literal

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Query,
    Request,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

import app.services.admin_service as admin_service
import app.services.dataset_service as dataset_service
import app.services.hero_image_service as hero_image_service
import app.services.page_content_service as page_content_service
from app.core.config import settings
from app.core.database import get_db
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import delete_response, list_response, success_response
from app.core.security import get_client_ip, get_user_agent, require_roles
from app.models.email_log_model import EmailLog
from app.schemas.admin_schema import (
    AdminUserListFilters,
    AnnouncementCreateRequest,
    AnnouncementUpdateRequest,
    AuditLogListFilters,
    PageContentCreateRequest,
    PageContentUpdateRequest,
    UserRejectRequest,
    UserRoleChangeRequest,
    UserSuspendRequest,
    UserUpdateRequest,
)

router = APIRouter(prefix="/admin")


def _get_redis():
    import redis

    return redis.from_url(settings.redis_url, decode_responses=True)


def _get_es():
    from elasticsearch import Elasticsearch

    return Elasticsearch(settings.ELASTICSEARCH_URL)


def _get_minio():
    from minio import Minio

    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


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


@router.get("/stats/years", status_code=status.HTTP_200_OK)
def admin_available_years(
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    คืนรายการปีที่มี published dataset หรือ download log
    - Auth ✅ Admin
    """
    years = admin_service.get_available_years(db)
    return success_response(data=years)


@router.get("/stats/monthly", status_code=status.HTTP_200_OK)
def admin_monthly_stats(
    year: int = Query(default=None),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    สถิติ Dataset และ Download รายเดือน 12 เดือน
    - Query: year (default = ปีปัจจุบัน)
    - Auth ✅ Admin
    """
    from datetime import datetime

    resolved_year = year if year else datetime.now().year
    result = admin_service.get_monthly_stats(db, resolved_year)
    return success_response(result.model_dump(mode="json"))


@router.get("/stats/downloads", status_code=status.HTTP_200_OK)
def admin_download_source_stats(
    granularity: str = Query(default="month", pattern="^(month|year)$"),
    year: int = Query(default=None),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    สถิติดาวน์โหลดแยกตาม source (web = กดดาวน์โหลดหน้าเว็บ / api = Public API)

    - **Query**: granularity (month|year), year (เฉพาะ granularity=month, default = ปีปัจจุบัน)
    - **Auth**: ✅ Admin
    - **Errors**: VALIDATION_ERROR
    """
    from datetime import datetime

    if granularity == "year":
        result = admin_service.get_download_source_yearly(db)
    else:
        resolved_year = year if year else datetime.now().year
        result = admin_service.get_download_source_monthly(db, resolved_year)
    return success_response(result.model_dump(mode="json"))


def get_admin_user_list_filters(
    status: str | None = Query(default=None),
    role: str | None = Query(default=None),
    search: str | None = Query(default=None),
) -> AdminUserListFilters:
    return AdminUserListFilters(status=status, role=role, search=search)


@router.get("/users", status_code=status.HTTP_200_OK)
def admin_list_users(
    pagination: PaginationParams = Depends(get_pagination_params),
    filters: AdminUserListFilters = Depends(get_admin_user_list_filters),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ดูรายการ User ทั้งหมด ตาม #20
    - Query: status, role, search, page, page_size, sort, order
    - Auth ✅ Admin
    """
    items, total = admin_service.get_all_users(db, pagination, filters)
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


@router.patch("/users/{id}/role", status_code=status.HTTP_200_OK)
def admin_change_user_role(
    id: uuid.UUID,
    request: Request,
    request_body: UserRoleChangeRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    เปลี่ยน Role ผู้ใช้ (admin ↔ agency)
    - Auth ✅ Admin
    - ห้ามเปลี่ยน Role ตัวเอง
    - ห้ามลด Admin คนสุดท้าย
    - บังคับ Logout ผู้ใช้ที่ถูกเปลี่ยน Role
    - บันทึก Audit Log
  """
    result = admin_service.change_user_role(
        db,
        _get_redis(),
        user_id=id,
        request=request_body,
        current_user=payload,
        ip_address=get_client_ip(request),
    )
    return success_response(
        result.model_dump(mode="json"),
        message="เปลี่ยน Role สำเร็จ",
    )


@router.post("/users/{id}/approve", status_code=status.HTTP_200_OK)
def admin_approve_user(
    id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    อนุมัติบัญชี Agency ตาม claude-v3 M1
    - Auth ✅ Admin
    - Errors: USER_NOT_FOUND, USER_STATUS_INVALID
    """
    result = admin_service.approve_user(
        db,
        background_tasks,
        user_id=id,
        current_user=payload,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return success_response(result.model_dump(mode="json"))


@router.post("/users/{id}/reject", status_code=status.HTTP_200_OK)
def admin_reject_user(
    id: uuid.UUID,
    request: Request,
    request_body: UserRejectRequest,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ปฏิเสธบัญชี Agency ตาม claude-v3 M1 (บังคับ reason)
    - Body: { "reason": string }
    - Auth ✅ Admin
    - Errors: USER_NOT_FOUND, USER_STATUS_INVALID
    """
    result = admin_service.reject_user(
        db,
        background_tasks,
        user_id=id,
        request=request_body,
        current_user=payload,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return success_response(result.model_dump(mode="json"))


@router.post("/users/{id}/suspend", status_code=status.HTTP_200_OK)
def admin_suspend_user(
    id: uuid.UUID,
    request: Request,
    request_body: UserSuspendRequest,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ระงับบัญชี Agency ตาม claude-v3 M1 (บังคับ reason)
    - Body: { "reason": string }
    - Auth ✅ Admin
    - Errors: USER_NOT_FOUND, USER_STATUS_INVALID, USER_CANNOT_SUSPEND_SELF
    """
    result = admin_service.suspend_user(
        db,
        background_tasks,
        user_id=id,
        request=request_body,
        current_user=payload,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return success_response(result.model_dump(mode="json"))


@router.post("/users/{id}/unsuspend", status_code=status.HTTP_200_OK)
def admin_unsuspend_user(
    id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ปลดระงับบัญชี Agency ตาม claude-v3 M1
    - Auth ✅ Admin
    - Errors: USER_NOT_FOUND, USER_STATUS_INVALID
    """
    result = admin_service.unsuspend_user(
        db,
        background_tasks,
        user_id=id,
        current_user=payload,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return success_response(result.model_dump(mode="json"))


@router.delete("/users/{id}", status_code=status.HTTP_200_OK)
def admin_delete_user(
    id: uuid.UUID,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ลบผู้ใช้ (Soft delete) ตาม #15
    - Auth ✅ Admin
    - ข้อจำกัด: Admin ลบตัวเองไม่ได้ และลบ Admin ด้วยกันไม่ได้
    """
    admin_service.delete_user(db, _get_redis(), user_id=id, current_user=payload)
    return delete_response("ok")


@router.post("/datasets/{id}/hide", status_code=status.HTTP_200_OK)
def admin_hide_dataset(
    id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Admin ซ่อน Dataset ที่ไม่เหมาะสมด้วย Soft Delete (is_deleted = true) ตาม #5 M6, #15
    - Auth ✅ Admin
    """
    result = dataset_service.hide_dataset(
        db=db,
        dataset_id=id,
        current_user=payload,
        ip_address=get_client_ip(request),
        background_tasks=background_tasks,
        es_client=_get_es(),
    )
    return success_response(result.model_dump(mode="json"))


def _parse_date_start(value: date | None) -> datetime | None:
    if value is None:
        return None
    return datetime.combine(value, time.min)


def _parse_date_end(value: date | None) -> datetime | None:
    if value is None:
        return None
    return datetime.combine(value, time.max)


def _serialize_email_log(log: EmailLog) -> dict:
    return {
        "id": str(log.id),
        "user_id": str(log.user_id) if log.user_id else None,
        "template_name": log.template_name,
        "recipient_email": log.recipient_email,
        "subject": log.subject,
        "status": log.status,
        "error_message": log.error_message,
        "retry_count": log.retry_count,
        "provider_message_id": log.provider_message_id,
        "sent_at": log.sent_at.isoformat() if log.sent_at else None,
        "delivered_at": log.delivered_at.isoformat() if log.delivered_at else None,
        "created_at": log.created_at.isoformat(),
    }


@router.get("/email-logs", status_code=status.HTTP_200_OK)
def admin_email_logs(
    status_filter: Literal[
        "pending",
        "sent",
        "delivered",
        "bounced",
        "failed",
        "complained",
    ]
    | None = Query(
        default=None,
        alias="status",
    ),
    recipient_email: str | None = Query(default=None),
    template_name: str | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ดู Email Logs ตาม #20
    - Query: status, recipient_email, template_name, date_from, date_to, page, page_size
    - Auth ✅ Admin
    """
    query = db.query(EmailLog)

    if status_filter:
        query = query.filter(EmailLog.status == status_filter)
    if recipient_email:
        query = query.filter(EmailLog.recipient_email.ilike(f"%{recipient_email}%"))
    if template_name:
        query = query.filter(EmailLog.template_name == template_name)

    parsed_date_from = _parse_date_start(date_from)
    parsed_date_to = _parse_date_end(date_to)
    if parsed_date_from:
        query = query.filter(EmailLog.created_at >= parsed_date_from)
    if parsed_date_to:
        query = query.filter(EmailLog.created_at <= parsed_date_to)

    total = query.count()
    items = (
        query.order_by(EmailLog.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )

    return list_response(
        data=[_serialize_email_log(item) for item in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


def get_audit_log_filters(
    date_from: str | None = Query(default=None, alias="date_from"),
    date_to: str | None = Query(default=None, alias="date_to"),
    action: str | None = Query(default=None),
    search: str | None = Query(default=None),
) -> AuditLogListFilters:
    return AuditLogListFilters(
        date_from=date_from,
        date_to=date_to,
        action=action,
        search=search,
    )


@router.get("/audit-logs", status_code=status.HTTP_200_OK)
def admin_audit_logs(
    pagination: PaginationParams = Depends(get_pagination_params),
    filters: AuditLogListFilters = Depends(get_audit_log_filters),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ดู Audit Log ตาม #20
    - Query: date_from, date_to, action, search, page, page_size
    - Auth ✅ Admin
    """
    items, total = admin_service.get_audit_logs(db, pagination, filters)
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


@router.get("/settings/hero-image", status_code=status.HTTP_200_OK)
def get_hero_image():
    """
    ดึง URL รูป Hero หน้าหลัก
    - Auth ❌ (Visitor ดูได้)
    """
    result = hero_image_service.get_hero_image(_get_minio())
    return success_response(result.model_dump(mode="json"))


@router.post("/settings/hero-image", status_code=status.HTTP_200_OK)
def upload_hero_image(
    image: UploadFile = File(...),
    payload: dict = Depends(require_roles("admin")),
):
    """
    อัปโหลดรูป Hero หน้าหลัก (เก็บใน MinIO)
    - Auth ✅ Admin
    - multipart field: image
    """
    result = hero_image_service.upload_hero_image(_get_minio(), image)
    return success_response(result.model_dump(mode="json"))


@router.delete("/settings/hero-image", status_code=status.HTTP_200_OK)
def delete_hero_image(
    payload: dict = Depends(require_roles("admin")),
):
    """
    ลบรูป Hero หน้าหลัก
    - Auth ✅ Admin
    """
    result = hero_image_service.delete_hero_image(_get_minio())
    return success_response(result.model_dump(mode="json"))


@router.post("/pages", status_code=status.HTTP_201_CREATED)
def admin_create_page(
    request_body: PageContentCreateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    สร้างหน้า Static ใหม่
    - Auth ✅ Admin
    """
    result = page_content_service.create_page(
        db, request=request_body, current_user=payload
    )
    return success_response(result.model_dump(mode="json"))


@router.get("/pages", status_code=status.HTTP_200_OK)
def admin_list_pages(
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    รายการหน้า static สำหรับ Admin CMS
    - Auth ✅ Admin
    """
    items = page_content_service.list_pages(db)
    return success_response([i.model_dump(mode="json") for i in items])


@router.get("/pages/{slug}", status_code=status.HTTP_200_OK)
def admin_get_page(
    slug: str,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ดูเนื้อหาหน้า static ตาม slug
    - Auth ✅ Admin
    - ไม่มีใน DB → คืน default เนื้อหาว่าง
    """
    result = page_content_service.get_page(db, slug)
    return success_response(result.model_dump(mode="json"))


@router.put("/pages/{slug}", status_code=status.HTTP_200_OK)
def admin_update_page(
    slug: str,
    request_body: PageContentUpdateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    บันทึกเนื้อหาหน้า static
    - Auth ✅ Admin
    - Body: content_th, content_en
    """
    result = page_content_service.update_page(
        db, slug, request=request_body, current_user=payload
    )
    return success_response(result.model_dump(mode="json"))
