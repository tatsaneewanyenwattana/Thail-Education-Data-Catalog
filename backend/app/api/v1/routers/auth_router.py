# Module: M1 Auth
# Feature: API Endpoints ตาม #20 #27

import json
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    Request,
    UploadFile,
    status,
)
from pydantic import ValidationError
from sqlalchemy.orm import Session

import app.services.auth_service as auth_service
from app.services.turnstile_service import verify_turnstile
from app.core.config import settings
from app.core.database import get_db
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import (
    delete_response,
    list_response,
    success_response,
)
from app.core.security import (
    get_client_ip,
    get_current_user_payload_with_status,
    get_redis_client,
    get_user_agent,
    require_roles,
)
from app.schemas.auth_schema import (
    BookmarkRequest,
    DeleteAccountRequest,
    ForgotPasswordRequest,
    LoginHistoryItemResponse,
    LoginRequest,
    MessageResponse,
    RegisterMetadata,
    RegisterStatusQuery,
    RegisterStatusResponse,
    ResendVerificationRequest,
    ResetPasswordRequest,
    SubscriptionRequest,
    VerifyEmailRequest,
    VerifyEmailResponse,
)

router = APIRouter()


def _get_minio():
    from minio import Minio

    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


def _parse_register_metadata(data: str) -> RegisterMetadata:
    try:
        payload = json.loads(data)
    except json.JSONDecodeError:
        raise_app_error("VALIDATION_ERROR", "ข้อมูล data ไม่ใช่ JSON ที่ถูกต้อง")

    try:
        return RegisterMetadata.model_validate(payload)
    except ValidationError as exc:
        raise_app_error("VALIDATION_ERROR", str(exc.errors()[0]["msg"]))


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    background_tasks: BackgroundTasks,
    verification_doc: UploadFile = File(...),
    data: str = Form(...),
    turnstile_token: str | None = Form(default=None),
    db: Session = Depends(get_db),
):
    """
    สมัครสมาชิก Agency (multipart/form-data) ตาม claude-v3 M1
    - Fields: verification_doc (PDF ≤5MB), data (JSON RegisterMetadata), turnstile_token
    - Auth ❌
    - Errors: USER_EMAIL_EXISTS 409, VERIFICATION_DOC_* , VALIDATION_ERROR 422
    """
    ip = get_client_ip(request)
    verify_turnstile(turnstile_token, ip)
    metadata = _parse_register_metadata(data)
    content = await verification_doc.read()
    user = auth_service.register(
        db=db,
        request=metadata,
        ip_address=ip,
        background_tasks=background_tasks,
        minio_client=_get_minio(),
        verification_doc_content=content,
        verification_doc_filename=verification_doc.filename,
    )
    return success_response(
        data=user.model_dump(mode="json"),
        message="สมัครสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
    )


@router.post("/auth/login", status_code=status.HTTP_200_OK)
def login(
    request_body: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Login ด้วย Email + Password
    - Auth ❌
    - คืน 200 OK พร้อม Token
    - Errors: AUTH_INVALID_CREDENTIALS 401, AUTH_ACCOUNT_SUSPENDED 403,
              AUTH_EMAIL_NOT_VERIFIED 403, AUTH_ACCOUNT_LOCKED 423
    """
    verify_turnstile(request_body.turnstile_token, get_client_ip(request))
    redis_client = get_redis_client()
    token_response = auth_service.login(
        db=db,
        redis_client=redis_client,
        email=request_body.email,
        password=request_body.password,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return success_response(data=token_response.model_dump(), message="ok")


@router.post("/auth/verify-email", status_code=status.HTTP_200_OK)
def verify_email(
    request_body: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    """
    ยืนยันอีเมลด้วย Token จากลิงก์ในเมล
    - Auth ❌
    - Errors: AUTH_TOKEN_INVALID 401, AUTH_TOKEN_EXPIRED 401, AUTH_TOKEN_ALREADY_USED 400
    """
    auth_service.verify_email(db=db, token=request_body.token)
    response = VerifyEmailResponse()
    return success_response(data=response.model_dump(mode="json"), message="ok")


@router.post("/auth/resend-verification", status_code=status.HTTP_200_OK)
def resend_verification(
    request_body: ResendVerificationRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    ขออีเมลยืนยันใหม่
    - Auth ❌
    - Errors: USER_NOT_FOUND 404, AUTH_RESEND_COOLDOWN 429
    """
    ip = get_client_ip(request)
    auth_service.resend_verification(
        db=db,
        redis_client=get_redis_client(),
        email=request_body.email,
        ip_address=ip,
    )
    return success_response(
        data=MessageResponse(message="ส่งอีเมลยืนยันใหม่แล้ว").model_dump(mode="json"),
        message="ok",
    )


@router.get("/auth/register-status", status_code=status.HTTP_200_OK)
def register_status(
    email: str,
    db: Session = Depends(get_db),
):
    """
    เช็คสถานะหลังสมัครด้วย email
    - Auth ❌
    - Errors: VALIDATION_ERROR 422
    """
    query = RegisterStatusQuery(email=email)
    result = auth_service.get_register_status(db=db, email=query.email)
    return success_response(
        data=RegisterStatusResponse(**result).model_dump(mode="json"),
        message="ok",
    )


@router.post("/auth/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
    request_body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    ขอลิงก์ตั้งรหัสผ่านใหม่ — ไม่เปิดเผยว่ามี email ในระบบหรือไม่
    - Auth ❌
    """
    verify_turnstile(request_body.turnstile_token, get_client_ip(request))
    auth_service.forgot_password(
        db=db,
        redis_client=get_redis_client(),
        email=request_body.email,
        ip_address=get_client_ip(request),
        background_tasks=background_tasks,
    )
    return success_response(
        data=MessageResponse(
            message="หากอีเมลมีในระบบ จะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้",
        ).model_dump(mode="json"),
        message="ok",
    )


@router.post("/auth/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    request_body: ResetPasswordRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    ตั้งรหัสผ่านใหม่ด้วย token จากอีเมล
    - Auth ❌
    - Errors: AUTH_TOKEN_INVALID 401, AUTH_TOKEN_EXPIRED 401, VALIDATION_ERROR 422
    """
    auth_service.reset_password(
        db=db,
        token=request_body.token,
        new_password=request_body.new_password,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        background_tasks=background_tasks,
    )
    return success_response(
        data=MessageResponse(message="ตั้งรหัสผ่านใหม่สำเร็จ").model_dump(mode="json"),
        message="ok",
    )


@router.get("/auth/login-history", status_code=status.HTTP_200_OK)
def login_history(
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
):
    """
    ดูประวัติ Login ของตัวเอง
    - Auth ✅ Agency/Admin
    """
    items, total = auth_service.get_login_history(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        pagination=pagination,
    )
    return list_response(
        data=[
            LoginHistoryItemResponse.model_validate(item).model_dump(mode="json")
            for item in items
        ],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.delete("/auth/me", status_code=status.HTTP_200_OK)
def delete_me(
    request_body: DeleteAccountRequest,
    request: Request,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    ลบบัญชีตัวเอง (Anonymize + Soft Delete)
    - Auth ✅ Agency/Admin
    - Errors: AUTH_INVALID_CREDENTIALS 401, USER_NOT_FOUND 404
    """
    redis_client = get_redis_client()
    auth_service.delete_account(
        db=db,
        redis_client=redis_client,
        user_id=uuid.UUID(payload["sub"]),
        password=request_body.password,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return delete_response(message="deleted")


@router.post("/auth/logout", status_code=status.HTTP_200_OK)
def logout(
    payload: dict = Depends(get_current_user_payload_with_status),
):
    """
    Logout — ลบ Token ออกจาก Redis
    - Auth ✅
    - คืน 200 OK
    """
    redis_client = get_redis_client()
    auth_service.logout(redis_client=redis_client, user_id=payload["sub"])
    return delete_response()


@router.get("/auth/me", status_code=status.HTTP_200_OK)
def get_me(
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ดูข้อมูลตัวเอง
    - Auth ✅
    - คืน 200 OK
    """
    user = auth_service.get_me(db=db, user_id=uuid.UUID(payload["sub"]))
    return success_response(data=user.model_dump(mode="json"))


@router.post("/bookmarks", status_code=status.HTTP_201_CREATED)
def add_bookmark(
    request_body: BookmarkRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    เพิ่ม Bookmark — Agency/Admin เท่านั้น ตาม #4
    - Auth ✅
    - คืน 201 Created
    """
    bookmark = auth_service.add_bookmark(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        dataset_id=request_body.dataset_id,
    )
    return success_response(data=bookmark.model_dump(mode="json"))


@router.delete("/bookmarks/{dataset_id}", status_code=status.HTTP_200_OK)
def remove_bookmark(
    dataset_id: uuid.UUID,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ลบ Bookmark
    - Auth ✅
    - คืน 200 OK
    """
    auth_service.remove_bookmark(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        dataset_id=dataset_id,
    )
    return delete_response()


@router.get("/bookmarks", status_code=status.HTTP_200_OK)
def list_bookmarks(
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
):
    """
    ดูรายการ Bookmark พร้อม Pagination ตาม #23
    - Auth ✅
    - คืน 200 OK
    """
    items, total = auth_service.list_bookmarks(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        pagination=pagination,
    )
    return list_response(
        data=[b.model_dump(mode="json") for b in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.post("/subscriptions", status_code=status.HTTP_201_CREATED)
def add_subscription(
    request_body: SubscriptionRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    เพิ่ม Subscription — Agency/Admin เท่านั้น ตาม #4
    - Auth ✅
    - คืน 201 Created
    """
    sub = auth_service.add_subscription(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        category_id=request_body.category_id,
        agency_user_id=request_body.agency_user_id,
    )
    return success_response(data=sub.model_dump(mode="json"))


@router.delete("/subscriptions/{subscription_id}", status_code=status.HTTP_200_OK)
def remove_subscription(
    subscription_id: uuid.UUID,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ลบ Subscription
    - Auth ✅
    - คืน 200 OK
    """
    auth_service.remove_subscription(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        subscription_id=subscription_id,
    )
    return delete_response()


@router.get("/subscriptions", status_code=status.HTTP_200_OK)
def list_subscriptions(
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ดูรายการ Subscription
    - Auth ✅
    - คืน 200 OK
    """
    items = auth_service.list_subscriptions(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
    )
    return success_response(data=[s.model_dump(mode="json") for s in items])
