# Module: M1 Auth
# Feature: Database Queries ตาม #56

import uuid

from sqlalchemy.orm import Session

from app.core.pagination import PaginationParams
from app.models.bookmark_model import Bookmark
from app.models.pdpa_consent_model import PDPAConsent
from app.models.subscription_model import Subscription
from app.models.user_model import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return (
        db.query(User)
        .filter(User.email == email, User.is_deleted.is_(False))
        .first()
    )


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return (
        db.query(User)
        .filter(User.id == user_id, User.is_deleted.is_(False))
        .first()
    )


def get_user_by_verify_token(db: Session, token: str) -> User | None:
    return (
        db.query(User)
        .filter(User.verify_token == token, User.is_deleted.is_(False))
        .first()
    )


def get_user_by_reset_token(db: Session, token: str) -> User | None:
    return (
        db.query(User)
        .filter(User.reset_token == token, User.is_deleted.is_(False))
        .first()
    )


def create_user(
    db: Session,
    agency_name: str,
    email: str,
    password_hash: str,
    agency_name_en: str | None = None,
    agency_type: str | None = None,
    agency_code: str | None = None,
    agency_website: str | None = None,
    contact_name: str | None = None,
    contact_position: str | None = None,
    contact_phone: str | None = None,
    verification_doc_path: str | None = None,
) -> User:
    user = User(
        email=email,
        password_hash=password_hash,
        role="agency",
        status="email_unverified",
        agency_name=agency_name,
        agency_name_en=agency_name_en,
        agency_type=agency_type,
        agency_code=agency_code,
        agency_website=agency_website,
        contact_name=contact_name,
        contact_position=contact_position,
        contact_phone=contact_phone,
        verification_doc_path=verification_doc_path,
    )
    db.add(user)
    db.flush()
    return user


def update_user_status(db: Session, user_id: uuid.UUID, status: str) -> User:
    user = get_user_by_id(db, user_id)
    if user is None:
        from app.core.errors import raise_app_error
        raise_app_error("USER_NOT_FOUND")
    user.status = status
    db.flush()
    return user


def create_pdpa_consent(
    db: Session,
    user_id: uuid.UUID,
    terms_version: str,
    pdpa_version: str,
    ip_address: str,
) -> list[PDPAConsent]:
    terms_consent = PDPAConsent(
        user_id=user_id,
        consent_type="terms",
        version=terms_version,
        ip_address=ip_address,
    )
    pdpa_consent = PDPAConsent(
        user_id=user_id,
        consent_type="pdpa",
        version=pdpa_version,
        ip_address=ip_address,
    )
    db.add(terms_consent)
    db.add(pdpa_consent)
    db.flush()
    return [terms_consent, pdpa_consent]


def create_bookmark(
    db: Session,
    user_id: uuid.UUID,
    dataset_id: uuid.UUID,
) -> Bookmark:
    bookmark = Bookmark(user_id=user_id, dataset_id=dataset_id)
    db.add(bookmark)
    db.flush()
    return bookmark


def delete_bookmark(
    db: Session,
    user_id: uuid.UUID,
    dataset_id: uuid.UUID,
) -> None:
    db.query(Bookmark).filter(
        Bookmark.user_id == user_id,
        Bookmark.dataset_id == dataset_id,
    ).delete(synchronize_session=False)
    db.flush()


def get_bookmarks(
    db: Session,
    user_id: uuid.UUID,
    pagination: PaginationParams,
) -> tuple[list[Bookmark], int]:
    query = db.query(Bookmark).filter(Bookmark.user_id == user_id)
    total = query.count()
    items = (
        query.order_by(Bookmark.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )
    return items, total


def create_subscription(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID | None,
    agency_user_id: uuid.UUID | None,
) -> Subscription:
    sub = Subscription(
        user_id=user_id,
        category_id=category_id,
        agency_user_id=agency_user_id,
    )
    db.add(sub)
    db.flush()
    return sub


def delete_subscription(
    db: Session,
    user_id: uuid.UUID,
    subscription_id: uuid.UUID,
) -> None:
    db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == user_id,
    ).delete(synchronize_session=False)
    db.flush()


def get_subscriptions(
    db: Session,
    user_id: uuid.UUID,
) -> list[Subscription]:
    return (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
        .all()
    )
