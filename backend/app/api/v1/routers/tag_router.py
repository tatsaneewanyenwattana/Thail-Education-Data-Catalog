# Module: M2 Dataset
# Feature: Tag API Endpoints ตาม #20

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

import app.repositories.tag_repository as tag_repo
from app.core.database import get_db
from app.core.errors import raise_app_error
from app.core.response import delete_response, list_response, success_response
from app.core.security import require_roles
from app.schemas.dataset_schema import TagCreateRequest, TagResponse, TagUpdateRequest

router = APIRouter()


@router.get("/admin/tags", status_code=status.HTTP_200_OK)
def list_tags(
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ดูรายการแท็กทั้งหมด ตาม #20
    - Auth ✅ Admin
    """
    tags = tag_repo.get_all_tags(db)
    items = [TagResponse.model_validate(t) for t in tags]
    return list_response(
        data=[i.model_dump(mode="json") for i in items],
        page=1,
        page_size=len(items),
        total_items=len(items),
    )


@router.post("/admin/tags", status_code=status.HTTP_201_CREATED)
def create_tag(
    request_body: TagCreateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    เพิ่มแท็ก ตาม #20
    - Auth ✅ Admin
    """
    existing = tag_repo.get_tag_by_name(db, request_body.name)
    if existing is not None:
        raise_app_error("TAG_NAME_EXISTS")
    tag = tag_repo.create_tag(db, name=request_body.name)
    db.commit()
    db.refresh(tag)
    return success_response(data=TagResponse.model_validate(tag).model_dump(mode="json"))


@router.patch("/admin/tags/{tag_id}", status_code=status.HTTP_200_OK)
def update_tag(
    tag_id: uuid.UUID,
    request_body: TagUpdateRequest,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    แก้ไขแท็ก ตาม #20
    - Auth ✅ Admin
    """
    existing = tag_repo.get_tag_by_name(db, request_body.name)
    if existing is not None and existing.id != tag_id:
        raise_app_error("TAG_NAME_EXISTS")
    tag = tag_repo.update_tag(db, tag_id=tag_id, name=request_body.name)
    db.commit()
    db.refresh(tag)
    return success_response(data=TagResponse.model_validate(tag).model_dump(mode="json"))


@router.delete("/admin/tags/{tag_id}", status_code=status.HTTP_200_OK)
def delete_tag(
    tag_id: uuid.UUID,
    payload: dict = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    ลบแท็ก (Soft Delete) ตาม #20
    - Auth ✅ Admin
    """
    tag_repo.soft_delete_tag(db, tag_id=tag_id)
    db.commit()
    return delete_response()
