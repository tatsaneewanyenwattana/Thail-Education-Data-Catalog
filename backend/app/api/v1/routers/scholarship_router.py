# Module: Scholarship
# Feature: Scholarship API Endpoints ตาม #20

import json
import logging
import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, Query, Request, status
from pythainlp.tokenize import word_tokenize
from sqlalchemy import asc, desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import delete_response, list_response, success_response
from app.core.security import get_client_ip, require_roles
import app.repositories.dataset_repository as dataset_repo
from app.models.scholarship_bookmark_model import ScholarshipBookmark
from app.models.scholarship_model import Scholarship
from app.models.user_model import User
from app.schemas.scholarship_schema import (
    EducationLevel,
    ScholarshipBookmarkCreateRequest,
    ScholarshipBookmarkResponse,
    ScholarshipCreate,
    ScholarshipResponse,
    ScholarshipStatus,
    ScholarshipType,
    ScholarshipUpdate,
)

router = APIRouter()
logger = logging.getLogger(__name__)

SCHOLARSHIP_INDEX = "scholarships"
ALLOWED_SORT_FIELDS = {
    "created_at",
    "updated_at",
    "published_at",
    "close_date",
    "open_date",
    "title",
}
ALLOWED_APPLICATION_STATUS = {"open", "closed"}

SCHOLARSHIP_INDEX_MAPPINGS = {
    "mappings": {
        "properties": {
            "title": {"type": "text", "analyzer": "thai"},
            "description": {"type": "text", "analyzer": "thai"},
            "eligibility": {"type": "text", "analyzer": "thai"},
            "scholarship_type": {"type": "keyword"},
            "target_level": {"type": "keyword"},
            "status": {"type": "keyword"},
            "created_by": {"type": "keyword"},
            "close_date": {"type": "date"},
            "open_date": {"type": "date"},
            "published_at": {"type": "date"},
            "created_at": {"type": "date"},
        }
    }
}


def _get_es():
    from elasticsearch import Elasticsearch
    from app.core.config import settings

    return Elasticsearch(settings.ELASTICSEARCH_URL)


def _tokenize_thai(text: str) -> str:
    tokens = word_tokenize(text.strip(), engine="newmm")
    return " ".join(tokens)


def _resolve_sort_field(sort: str) -> str:
    if sort in ALLOWED_SORT_FIELDS:
        return sort
    return "created_at"


def _today_date() -> date:
    return datetime.now(timezone.utc).date()


def _apply_application_status_filter(query, application_status: str | None):
    if application_status not in ALLOWED_APPLICATION_STATUS:
        return query

    today = _today_date()
    if application_status == "open":
        return query.filter(
            Scholarship.open_date <= today,
            Scholarship.close_date >= today,
        )
    return query.filter(Scholarship.close_date < today)


def _application_status_es_clauses(application_status: str | None) -> list[dict]:
    if application_status not in ALLOWED_APPLICATION_STATUS:
        return []

    today = _today_date().isoformat()
    if application_status == "open":
        return [
            {"range": {"open_date": {"lte": today}}},
            {"range": {"close_date": {"gte": today}}},
        ]
    return [{"range": {"close_date": {"lt": today}}}]


def _load_agency_names(
    db: Session,
    created_by_ids: list[uuid.UUID],
) -> dict[str, str | None]:
    if not created_by_ids:
        return {}

    unique_ids = list(set(created_by_ids))
    rows = (
        db.query(User.id, User.agency_name, User.email)
        .filter(
            User.id.in_(unique_ids),
            User.is_deleted.is_(False),
        )
        .all()
    )
    return {
        str(user_id): (agency_name or email)
        for user_id, agency_name, email in rows
    }


def _to_response(
    scholarship: Scholarship,
    agency_name: str | None = None,
) -> dict:
    data = ScholarshipResponse.model_validate(scholarship).model_dump(mode="json")
    data["agency_name"] = agency_name
    return data


def _to_responses(db: Session, scholarships: list[Scholarship]) -> list[dict]:
    if not scholarships:
        return []

    name_map = _load_agency_names(
        db,
        [scholarship.created_by for scholarship in scholarships],
    )
    return [
        _to_response(
            scholarship,
            name_map.get(str(scholarship.created_by)),
        )
        for scholarship in scholarships
    ]


def _agency_name_for(db: Session, scholarship: Scholarship) -> str | None:
    return _load_agency_names(db, [scholarship.created_by]).get(
        str(scholarship.created_by)
    )


def _get_scholarship_or_404(
    db: Session,
    scholarship_id: uuid.UUID,
    *,
    published_only: bool = False,
) -> Scholarship:
    scholarship = (
        db.query(Scholarship)
        .filter(
            Scholarship.id == scholarship_id,
            Scholarship.is_deleted.is_(False),
        )
        .first()
    )
    if scholarship is None:
        raise_app_error("NOT_FOUND", "ไม่พบทุนการศึกษาที่ต้องการ")
    if published_only and scholarship.status != "published":
        raise_app_error("NOT_FOUND", "ไม่พบทุนการศึกษาที่ต้องการ")
    return scholarship


def _can_manage_scholarship(scholarship: Scholarship, current_user: dict) -> bool:
    if current_user.get("role") == "admin":
        return True
    return str(scholarship.created_by) == current_user.get("sub")


def _ensure_manage_permission(scholarship: Scholarship, current_user: dict) -> None:
    if not _can_manage_scholarship(scholarship, current_user):
        raise_app_error("AUTH_PERMISSION_DENIED")
    if (
        current_user.get("role") != "admin"
        and scholarship.source != "agency"
    ):
        raise_app_error("AUTH_PERMISSION_DENIED", "ไม่สามารถแก้ไขทุนจากแหล่งภายนอกได้")


def _build_es_document(scholarship: Scholarship) -> dict[str, Any]:
    return {
        "id": str(scholarship.id),
        "title": _tokenize_thai(scholarship.title),
        "description": _tokenize_thai(scholarship.description or ""),
        "eligibility": _tokenize_thai(scholarship.eligibility),
        "scholarship_type": scholarship.scholarship_type,
        "target_level": scholarship.target_level,
        "status": scholarship.status,
        "created_by": str(scholarship.created_by),
        "open_date": scholarship.open_date.isoformat(),
        "close_date": scholarship.close_date.isoformat(),
        "published_at": (
            scholarship.published_at.isoformat()
            if scholarship.published_at is not None
            else None
        ),
        "created_at": scholarship.created_at.isoformat(),
    }


def _create_scholarship_index_if_not_exists(es_client) -> None:
    try:
        if not es_client.indices.exists(index=SCHOLARSHIP_INDEX):
            es_client.indices.create(
                index=SCHOLARSHIP_INDEX,
                body=SCHOLARSHIP_INDEX_MAPPINGS,
            )
    except Exception as exc:
        logger.error("Elasticsearch create scholarship index failed: %s", exc)


def _index_scholarship(es_client, document: dict[str, Any]) -> None:
    try:
        _create_scholarship_index_if_not_exists(es_client)
        doc_id = str(document.get("id", ""))
        if not doc_id:
            return
        payload = json.dumps(document, ensure_ascii=False)
        es_client.index(
            index=SCHOLARSHIP_INDEX,
            id=doc_id,
            document=json.loads(payload),
        )
    except Exception as exc:
        logger.error("Elasticsearch index scholarship failed: %s", exc)


def _delete_scholarship_index(es_client, scholarship_id: str) -> None:
    try:
        if es_client.indices.exists(index=SCHOLARSHIP_INDEX):
            es_client.delete(
                index=SCHOLARSHIP_INDEX,
                id=str(scholarship_id),
                ignore=[404],
            )
    except Exception as exc:
        logger.error("Elasticsearch delete scholarship failed: %s", exc)


def _search_scholarships_es(
    es_client,
    keyword: str,
    filters: dict[str, Any],
    pagination: PaginationParams,
) -> tuple[list[str], int]:
    _create_scholarship_index_if_not_exists(es_client)

    must_clauses: list[dict] = [{"term": {"status": "published"}}]
    if filters.get("scholarship_type"):
        must_clauses.append(
            {"term": {"scholarship_type": filters["scholarship_type"]}}
        )
    if filters.get("target_level"):
        must_clauses.append({"term": {"target_level": filters["target_level"]}})
    must_clauses.extend(
        _application_status_es_clauses(filters.get("application_status"))
    )

    tokenized = _tokenize_thai(keyword)
    should_clauses: list[dict] = [
        {
            "multi_match": {
                "query": tokenized,
                "fields": ["title", "description", "eligibility"],
                "operator": "or",
                "analyzer": "thai",
            }
        }
    ]
    sort_field = _resolve_sort_field(pagination.sort)
    body: dict[str, Any] = {
        "query": {
            "bool": {
                "must": must_clauses,
                "should": should_clauses,
                "minimum_should_match": 1,
            }
        },
        "from": pagination.offset,
        "size": pagination.page_size,
        "sort": [{sort_field: {"order": pagination.order}}],
    }

    try:
        response = es_client.search(index=SCHOLARSHIP_INDEX, body=body)
        hits = response.get("hits", {})
        total = hits.get("total", {})
        if isinstance(total, dict):
            total_count = total.get("value", 0)
        else:
            total_count = int(total)
        ids = [hit["_source"]["id"] for hit in hits.get("hits", []) if hit.get("_source")]
        return ids, total_count
    except Exception as exc:
        logger.error("Elasticsearch scholarship search failed: %s", exc)
        return [], 0


def _apply_sort(query, model, pagination: PaginationParams):
    sort_field = _resolve_sort_field(pagination.sort)
    column = getattr(model, sort_field)
    ordering = desc(column) if pagination.order == "desc" else asc(column)
    return query.order_by(ordering)


def _recent_updated_cutoff(
    *,
    updated_within_days: int,
    current_month_only: bool,
) -> datetime:
    now = datetime.now(timezone.utc)
    days_cutoff = now - timedelta(days=updated_within_days)
    if not current_month_only:
        return days_cutoff

    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return max(month_start, days_cutoff)


def _list_scholarships_sql(
    db: Session,
    pagination: PaginationParams,
    *,
    status_filter: str | None = None,
    created_by: uuid.UUID | None = None,
    scholarship_type: str | None = None,
    target_level: str | None = None,
    application_status: str | None = None,
    published_only: bool = False,
    updated_within_days: int | None = None,
    current_month_only: bool = False,
) -> tuple[list[Scholarship], int]:
    query = db.query(Scholarship).filter(Scholarship.is_deleted.is_(False))

    if published_only:
        query = query.filter(Scholarship.status == "published")
    elif status_filter:
        query = query.filter(Scholarship.status == status_filter)

    if created_by is not None:
        query = query.filter(Scholarship.created_by == created_by)
    if scholarship_type:
        query = query.filter(Scholarship.scholarship_type == scholarship_type)
    if target_level:
        query = query.filter(Scholarship.target_level == target_level)
    query = _apply_application_status_filter(query, application_status)
    if updated_within_days is not None:
        cutoff = _recent_updated_cutoff(
            updated_within_days=updated_within_days,
            current_month_only=current_month_only,
        )
        query = query.filter(Scholarship.updated_at >= cutoff)

    total = query.count()
    items = (
        _apply_sort(query, Scholarship, pagination)
        .offset(pagination.offset)
        .limit(pagination.page_size)
        .all()
    )
    return items, total


@router.get("/scholarship", status_code=status.HTTP_200_OK)
def list_scholarships(
    q: str | None = Query(default=None),
    scholarship_type: str | None = Query(default=None),
    target_level: str | None = Query(default=None),
    application_status: str | None = Query(default=None),
    updated_within_days: int | None = Query(default=None, ge=1, le=30),
    current_month_only: bool = Query(default=False),
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db),
):
    """
    ค้นหาและดูรายการทุนการศึกษา (Public)
    - Auth ❌
    - เฉพาะ status=published และ is_deleted=false
    - application_status: open | closed (optional)
    """
    if application_status and application_status not in ALLOWED_APPLICATION_STATUS:
        raise_app_error("SEARCH_INVALID_FILTER", "ตัวกรองสถานะการรับสมัครไม่ถูกต้อง")

    filters = {
        "scholarship_type": scholarship_type,
        "target_level": target_level,
        "application_status": application_status,
    }

    if q and q.strip():
        es_client = _get_es()
        ids, total = _search_scholarships_es(es_client, q.strip(), filters, pagination)
        if not ids:
            return list_response(
                data=[],
                page=pagination.page,
                page_size=pagination.page_size,
                total_items=0,
            )
        uuid_ids = [uuid.UUID(value) for value in ids]
        rows = (
            db.query(Scholarship)
            .filter(
                Scholarship.id.in_(uuid_ids),
                Scholarship.is_deleted.is_(False),
                Scholarship.status == "published",
            )
            .all()
        )
        row_map = {str(row.id): row for row in rows}
        items = [row_map[value] for value in ids if value in row_map]
        return list_response(
            data=_to_responses(db, items),
            page=pagination.page,
            page_size=pagination.page_size,
            total_items=total,
        )

    items, total = _list_scholarships_sql(
        db,
        pagination,
        scholarship_type=scholarship_type,
        target_level=target_level,
        application_status=application_status,
        published_only=True,
        updated_within_days=updated_within_days,
        current_month_only=current_month_only,
    )
    return list_response(
        data=_to_responses(db, items),
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/scholarship/mine", status_code=status.HTTP_200_OK)
def list_my_scholarships(
    status_filter: str | None = Query(default=None, alias="status"),
    pagination: PaginationParams = Depends(get_pagination_params),
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    ดูทุนของ Agency/Admin ที่ login อยู่
    - Auth ✅ Agency/Admin
    """
    items, total = _list_scholarships_sql(
        db,
        pagination,
        status_filter=status_filter,
        created_by=uuid.UUID(payload["sub"]),
    )
    return list_response(
        data=_to_responses(db, items),
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/scholarship-bookmarks", status_code=status.HTTP_200_OK)
def list_scholarship_bookmarks(
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    ดูรายการ Scholarship Bookmark ของตัวเอง
    - Auth ✅ Agency/Admin
    """
    items = (
        db.query(ScholarshipBookmark)
        .filter(ScholarshipBookmark.user_id == uuid.UUID(payload["sub"]))
        .order_by(desc(ScholarshipBookmark.created_at))
        .all()
    )
    return success_response(
        data=[
            ScholarshipBookmarkResponse.model_validate(item).model_dump(mode="json")
            for item in items
        ]
    )


@router.get("/admin/scholarships", status_code=status.HTTP_200_OK)
def admin_list_scholarships(
    status_filter: str | None = Query(default=None, alias="status"),
    scholarship_type: str | None = Query(default=None),
    agency_id: uuid.UUID | None = Query(default=None),
    pagination: PaginationParams = Depends(get_pagination_params),
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Admin ดูทุนทุก Agency ทุก status
    - Auth ✅ Admin
    """
    items, total = _list_scholarships_sql(
        db,
        pagination,
        status_filter=status_filter,
        created_by=agency_id,
        scholarship_type=scholarship_type,
    )
    return list_response(
        data=_to_responses(db, items),
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/scholarship/{id}", status_code=status.HTTP_200_OK)
def get_scholarship(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    ดูรายละเอียดทุน (Public)
    - Auth ❌
    - เฉพาะ published และ is_deleted=false
    """
    scholarship = _get_scholarship_or_404(db, id, published_only=True)
    return success_response(
        data=_to_response(scholarship, _agency_name_for(db, scholarship))
    )


@router.post("/scholarship", status_code=status.HTTP_201_CREATED)
def create_scholarship(
    request_body: ScholarshipCreate,
    background_tasks: BackgroundTasks,
    request: Request,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    สร้างทุนใหม่
    - Auth ✅ Agency/Admin
    - source=agency เสมอ
    """
    now = datetime.now(timezone.utc)
    published_at = now if request_body.status == ScholarshipStatus.published else None

    scholarship = Scholarship(
        created_by=uuid.UUID(payload["sub"]),
        title=request_body.title,
        description=request_body.description,
        scholarship_type=request_body.scholarship_type.value,
        target_level=request_body.target_level.value,
        amount=(
            Decimal(str(request_body.amount))
            if request_body.amount is not None
            else None
        ),
        amount_note=request_body.amount_note,
        eligibility=request_body.eligibility,
        application_url=request_body.application_url,
        contact_phone=request_body.contact_phone,
        contact_email=request_body.contact_email,
        open_date=request_body.open_date,
        close_date=request_body.close_date,
        status=request_body.status.value,
        source="agency",
        published_at=published_at,
    )
    db.add(scholarship)
    db.flush()
    dataset_repo.create_audit_log(
        db,
        user_id=uuid.UUID(payload["sub"]),
        action="scholarship.create",
        target_type="scholarship",
        target_id=scholarship.id,
        detail={"status": scholarship.status, "title": scholarship.title},
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(scholarship)

    if scholarship.status == "published":
        es_client = _get_es()
        document = _build_es_document(scholarship)
        background_tasks.add_task(_index_scholarship, es_client, document)

    return success_response(
        data=_to_response(scholarship, _agency_name_for(db, scholarship))
    )


@router.post("/scholarship-bookmarks", status_code=status.HTTP_201_CREATED)
def add_scholarship_bookmark(
    request_body: ScholarshipBookmarkCreateRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    Bookmark ทุนการศึกษา
    - Auth ✅ Agency/Admin
    """
    scholarship = (
        db.query(Scholarship)
        .filter(
            Scholarship.id == request_body.scholarship_id,
            Scholarship.is_deleted.is_(False),
        )
        .first()
    )
    if scholarship is None:
        raise_app_error("NOT_FOUND", "ไม่พบทุนการศึกษาที่ต้องการ")

    bookmark = ScholarshipBookmark(
        user_id=uuid.UUID(payload["sub"]),
        scholarship_id=request_body.scholarship_id,
    )
    try:
        db.add(bookmark)
        db.commit()
        db.refresh(bookmark)
    except IntegrityError:
        db.rollback()
        raise_app_error("VALIDATION_ERROR", "Bookmark นี้มีอยู่แล้ว")

    return success_response(
        data=ScholarshipBookmarkResponse.model_validate(bookmark).model_dump(mode="json")
    )


@router.patch("/scholarship/{id}", status_code=status.HTTP_200_OK)
def update_scholarship(
    id: uuid.UUID,
    request_body: ScholarshipUpdate,
    background_tasks: BackgroundTasks,
    request: Request,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    แก้ไขทุน — เจ้าของหรือ Admin
    - published แล้วห้ามลดกลับเป็น draft
    """
    scholarship = _get_scholarship_or_404(db, id)
    _ensure_manage_permission(scholarship, payload)

    update_data = request_body.model_dump(exclude_unset=True)
    if not update_data:
        return success_response(
            data=_to_response(scholarship, _agency_name_for(db, scholarship))
        )

    if (
        scholarship.status == "published"
        and update_data.get("status") == ScholarshipStatus.draft
    ):
        raise_app_error(
            "DATASET_INVALID_STATUS",
            "ทุนที่เผยแพร่แล้วไม่สามารถเปลี่ยนกลับเป็น draft ได้",
        )

    if scholarship.status == "published" and "status" in update_data:
        update_data.pop("status", None)

    open_date = update_data.get("open_date", scholarship.open_date)
    close_date = update_data.get("close_date", scholarship.close_date)
    if close_date < open_date:
        raise_app_error("VALIDATION_ERROR", "วันปิดรับต้องไม่ก่อนวันเปิดรับ")

    enum_fields = {
        "scholarship_type": ScholarshipType,
        "target_level": EducationLevel,
        "status": ScholarshipStatus,
    }
    for field, enum_cls in enum_fields.items():
        if field in update_data and update_data[field] is not None:
            value = update_data[field]
            update_data[field] = (
                value.value if hasattr(value, "value") else value
            )

    if "amount" in update_data:
        amount_value = update_data["amount"]
        update_data["amount"] = (
            Decimal(str(amount_value)) if amount_value is not None else None
        )

    was_published = scholarship.status == "published"
    for field, value in update_data.items():
        setattr(scholarship, field, value)

    if (
        not was_published
        and scholarship.status == "published"
        and scholarship.published_at is None
    ):
        scholarship.published_at = datetime.now(timezone.utc)

    scholarship.updated_at = datetime.now(timezone.utc)
    dataset_repo.create_audit_log(
        db,
        user_id=uuid.UUID(payload["sub"]),
        action="scholarship.update",
        target_type="scholarship",
        target_id=scholarship.id,
        detail={"title": scholarship.title, "updated_fields": list(update_data.keys())},
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(scholarship)

    es_client = _get_es()
    if scholarship.status == "published":
        background_tasks.add_task(
            _index_scholarship,
            es_client,
            _build_es_document(scholarship),
        )
    elif was_published:
        background_tasks.add_task(
            _delete_scholarship_index,
            es_client,
            str(scholarship.id),
        )

    return success_response(
        data=_to_response(scholarship, _agency_name_for(db, scholarship))
    )


@router.delete("/scholarship/{id}", status_code=status.HTTP_200_OK)
def delete_scholarship(
    id: uuid.UUID,
    background_tasks: BackgroundTasks,
    request: Request,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    Soft Delete ทุน — เจ้าของหรือ Admin
    """
    scholarship = _get_scholarship_or_404(db, id)
    _ensure_manage_permission(scholarship, payload)

    scholarship.is_deleted = True
    scholarship.updated_at = datetime.now(timezone.utc)
    dataset_repo.create_audit_log(
        db,
        user_id=uuid.UUID(payload["sub"]),
        action="scholarship.delete",
        target_type="scholarship",
        target_id=scholarship.id,
        detail={"title": scholarship.title},
        ip_address=get_client_ip(request),
    )
    db.commit()

    background_tasks.add_task(_delete_scholarship_index, _get_es(), str(scholarship.id))
    return delete_response()


@router.delete("/scholarship-bookmarks/{id}", status_code=status.HTTP_200_OK)
def delete_scholarship_bookmark(
    id: uuid.UUID,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    ลบ Scholarship Bookmark (Hard Delete)
    - Auth ✅ เจ้าของ bookmark เท่านั้น
    """
    bookmark = (
        db.query(ScholarshipBookmark)
        .filter(
            ScholarshipBookmark.id == id,
            ScholarshipBookmark.user_id == uuid.UUID(payload["sub"]),
        )
        .first()
    )
    if bookmark is None:
        raise_app_error("NOT_FOUND", "ไม่พบ Bookmark ที่ต้องการ")

    db.delete(bookmark)
    db.commit()
    return delete_response()


@router.post("/admin/scholarships/{id}/hide", status_code=status.HTTP_200_OK)
def admin_hide_scholarship(
    id: uuid.UUID,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Admin ซ่อนทุนที่ไม่เหมาะสม (Soft Delete)
    - Auth ✅ Admin
    """
    scholarship = _get_scholarship_or_404(db, id)
    scholarship.is_deleted = True
    scholarship.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(scholarship)

    background_tasks.add_task(
        _delete_scholarship_index,
        _get_es(),
        str(scholarship.id),
    )
    return success_response(
        data=_to_response(scholarship, _agency_name_for(db, scholarship))
    )
