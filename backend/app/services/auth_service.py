# Module: M1 Auth
# Feature: Business Logic ตาม #5 #28 #33 #34 #43 #48 #56

import logging
import uuid

import redis as redis_lib
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

import app.repositories.auth_repository as auth_repo
import app.services.email_service as email_service
from app.core.errors import raise_app_error
from app.core.logging import get_logger, log_request
from app.core.pagination import PaginationParams
from app.core.security import (
    create_access_token,
    delete_session,
    hash_password,
    login_session,
    validate_password,
    verify_password,
)
from app.models.bookmark_model import Bookmark
from app.models.subscription_model import Subscription
from app.models.user_model import User
from app.schemas.auth_schema import (
    BookmarkResponse,
    RegisterRequest,
    SubscriptionResponse,
    TokenResponse,
    UserResponse,
)

logger = get_logger(__name__)


def register(
    db: Session,
    request: RegisterRequest,
    ip_address: str,
    background_tasks: BackgroundTasks,
) -> UserResponse:
    validate_password(request.password)

    if len(request.password.encode("utf-8")) > 72:
        raise_app_error("VALIDATION_ERROR", "รหัสผ่านต้องไม่เกิน 72 bytes (ข้อจำกัด bcrypt)")

    existing = auth_repo.get_user_by_email(db, request.email)
    if existing is not None:
        raise_app_error("USER_EMAIL_EXISTS")

    password_hash = hash_password(request.password)

    user = auth_repo.create_user(
        db,
        agency_name=request.agency_name,
        email=request.email,
        password_hash=password_hash,
    )
    auth_repo.create_pdpa_consent(
        db,
        user_id=user.id,
        version=request.pdpa_version,
        ip_address=ip_address,
    )
    db.commit()
    db.refresh(user)

    email_service.notify_admin_new_register(background_tasks, db, user)
    email_service.notify_agency_register_success(background_tasks, user)

    return UserResponse.model_validate(user)


def login(
    db: Session,
    redis_client: redis_lib.Redis,
    email: str,
    password: str,
) -> TokenResponse:
    if len(password.encode("utf-8")) > 72:
        raise_app_error("VALIDATION_ERROR", "รหัสผ่านต้องไม่เกิน 72 bytes (ข้อจำกัด bcrypt)")

    user = auth_repo.get_user_by_email(db, email)
    if user is None:
        raise_app_error("AUTH_INVALID_CREDENTIALS")

    if not verify_password(password, user.password_hash):
        raise_app_error("AUTH_INVALID_CREDENTIALS")

    if user.status == "suspended":
        raise_app_error("AUTH_ACCOUNT_SUSPENDED")
    if user.status == "pending":
        raise_app_error("AUTH_ACCOUNT_PENDING")
    if user.status == "rejected":
        raise_app_error("AUTH_ACCOUNT_REJECTED")
    if user.status != "active":
        raise_app_error("USER_STATUS_INVALID")

    token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )
    login_session(str(user.id), token)

    return TokenResponse(access_token=token)


def logout(redis_client: redis_lib.Redis, user_id: str) -> None:
    delete_session(user_id)


def get_me(db: Session, user_id: uuid.UUID) -> UserResponse:
    user = auth_repo.get_user_by_id(db, user_id)
    if user is None:
        raise_app_error("USER_NOT_FOUND")
    return UserResponse.model_validate(user)


def add_bookmark(
    db: Session,
    user_id: uuid.UUID,
    dataset_id: uuid.UUID,
) -> BookmarkResponse:
    from sqlalchemy.exc import IntegrityError

    try:
        bookmark = auth_repo.create_bookmark(db, user_id=user_id, dataset_id=dataset_id)
        db.commit()
        db.refresh(bookmark)
        return BookmarkResponse.model_validate(bookmark)
    except IntegrityError:
        db.rollback()
        raise_app_error("VALIDATION_ERROR", "Bookmark นี้มีอยู่แล้ว")


def remove_bookmark(
    db: Session,
    user_id: uuid.UUID,
    dataset_id: uuid.UUID,
) -> None:
    auth_repo.delete_bookmark(db, user_id=user_id, dataset_id=dataset_id)
    db.commit()


def list_bookmarks(
    db: Session,
    user_id: uuid.UUID,
    pagination: PaginationParams,
) -> tuple[list[BookmarkResponse], int]:
    items, total = auth_repo.get_bookmarks(db, user_id=user_id, pagination=pagination)
    return [BookmarkResponse.model_validate(b) for b in items], total


def add_subscription(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID | None,
    agency_user_id: uuid.UUID | None,
) -> SubscriptionResponse:
    from sqlalchemy.exc import IntegrityError

    try:
        sub = auth_repo.create_subscription(
            db,
            user_id=user_id,
            category_id=category_id,
            agency_user_id=agency_user_id,
        )
        db.commit()
        db.refresh(sub)
        return SubscriptionResponse.model_validate(sub)
    except IntegrityError:
        db.rollback()
        raise_app_error("VALIDATION_ERROR", "Subscription นี้มีอยู่แล้ว")


def remove_subscription(
    db: Session,
    user_id: uuid.UUID,
    subscription_id: uuid.UUID,
) -> None:
    auth_repo.delete_subscription(db, user_id=user_id, subscription_id=subscription_id)
    db.commit()


def list_subscriptions(
    db: Session,
    user_id: uuid.UUID,
) -> list[SubscriptionResponse]:
    items = auth_repo.get_subscriptions(db, user_id=user_id)
    return [SubscriptionResponse.model_validate(s) for s in items]
