# Module: M2 Dataset
# Feature: Category API Endpoints ตาม #20

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

import app.services.category_service as cat_service
from app.core.database import get_db
from app.core.response import delete_response, list_response, success_response
from app.core.security import (
    get_current_user_payload_with_status,
    require_roles,
)
from app.schemas.dataset_schema import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
)

router = APIRouter()


@router.get("/categories", status_code=status.HTTP_200_OK)
def list_categories(db: Session = Depends(get_db)):
    """
    ดูรายการหมวดหมู่ทั้งหมด จัดกลุ่มตาม Agency ตาม #20
    - Auth ❌
    """
    items = cat_service.list_categories(db=db)
    return list_response(
        data=[c.model_dump(mode="json") for c in items],
        page=1,
        page_size=len(items),
        total_items=len(items),
    )


@router.post("/categories", status_code=status.HTTP_201_CREATED)
def create_category(
    request_body: CategoryCreateRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    สร้างหมวดระดับ 1 ตาม #20
    - Auth ✅ Agency/Admin
    """
    result = cat_service.create_category(
        db=db, request=request_body, current_user=payload
    )
    return success_response(data=result.model_dump(mode="json"))


@router.post("/categories/{category_id}/subcategories", status_code=status.HTTP_201_CREATED)
def create_subcategory(
    category_id: uuid.UUID,
    request_body: CategoryCreateRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    สร้างหมวดระดับ 2 ใต้ระดับ 1 ตาม #20
    - Auth ✅ Agency/Admin
    """
    result = cat_service.create_subcategory(
        db=db, parent_id=category_id, request=request_body, current_user=payload
    )
    return success_response(data=result.model_dump(mode="json"))


@router.get("/categories/{category_id}/tags", status_code=status.HTTP_200_OK)
def get_category_tags(
    category_id: uuid.UUID,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    แท็กที่เคยใช้ใน Dataset ของหมวดหมู่นี้ (สำหรับ pre-fill ตอนอัปโหลด)
    - Auth ✅ Agency/Admin
    - Errors: CATEGORY_NOT_FOUND 404, CATEGORY_NOT_OWNED 403
    """
    tags = cat_service.get_category_suggested_tags(
        db=db,
        category_id=category_id,
        current_user=payload,
    )
    return success_response(data=tags)


@router.patch("/categories/{category_id}", status_code=status.HTTP_200_OK)
def update_category(
    category_id: uuid.UUID,
    request_body: CategoryUpdateRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    แก้ไขหมวดของตัวเอง ตาม #20
    - Auth ✅ Agency/Admin
    """
    result = cat_service.update_category(
        db=db, category_id=category_id, request=request_body, current_user=payload
    )
    return success_response(data=result.model_dump(mode="json"))


@router.delete("/categories/{category_id}", status_code=status.HTTP_200_OK)
def delete_category(
    category_id: uuid.UUID,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    ลบหมวดของตัวเอง ตาม #20
    - Auth ✅ Agency/Admin
    """
    cat_service.delete_category(
        db=db, category_id=category_id, current_user=payload
    )
    return delete_response()


@router.get("/admin/categories", status_code=status.HTTP_200_OK)
def admin_list_categories(
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Admin: ดูรายการหมวดทุก Agency ตาม #20
    - Auth ✅ Admin
    """
    items = cat_service.list_all_categories_admin_with_counts(db=db)
    return list_response(
        data=[c.model_dump(mode="json") for c in items],
        page=1,
        page_size=len(items),
        total_items=len(items),
    )


@router.post("/admin/categories", status_code=status.HTTP_201_CREATED)
def admin_create_category(
    request_body: CategoryCreateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Admin: เพิ่มหมวดหมู่ของ Agency ใดก็ได้ ตาม #20
    - Auth ✅ Admin
    """
    result = cat_service.create_category(
        db=db, request=request_body, current_user=payload
    )
    return success_response(data=result.model_dump(mode="json"))


@router.patch("/admin/categories/{category_id}", status_code=status.HTTP_200_OK)
def admin_update_category(
    category_id: uuid.UUID,
    request_body: CategoryUpdateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Admin: แก้ไขหมวดของ Agency ใดก็ได้ ตาม #20
    - Auth ✅ Admin
    """
    result = cat_service.update_category(
        db=db, category_id=category_id, request=request_body, current_user=payload
    )
    return success_response(data=result.model_dump(mode="json"))


@router.delete("/admin/categories/{category_id}", status_code=status.HTTP_200_OK)
def admin_delete_category(
    category_id: uuid.UUID,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Admin: ลบหมวดของ Agency ใดก็ได้ ตาม #20
    - Auth ✅ Admin
    """
    cat_service.delete_category(
        db=db, category_id=category_id, current_user=payload
    )
    return delete_response()
