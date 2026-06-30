import io

import pandas as pd
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.core.security import require_roles
from app.pii.detector import detect_pii
from app.pii.schemas import PIIScanResult
from app.utils.quality_score import calculate_quality_score

router = APIRouter()

ACCEPTED_CONTENT_TYPES = {
    "text/csv",
    "application/json",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
}


@router.post("/datasets/analyze")
async def analyze_dataset_file(
    file: UploadFile = File(...),
    _: dict = Depends(require_roles("agency", "admin")),
):
    content = await file.read()
    content_type = (file.content_type or "").split(";")[0].strip()

    if content_type not in ACCEPTED_CONTENT_TYPES:
        return success_response(
            data={**PIIScanResult(findings=[], has_pii=False).model_dump(), "quality_score": None}
        )

    if content_type == "text/csv":
        df = pd.read_csv(io.BytesIO(content))
    elif content_type == "application/json":
        df = pd.read_json(io.BytesIO(content))
    else:
        df = pd.read_excel(io.BytesIO(content))

    result = detect_pii(df)
    score = calculate_quality_score(df)
    return success_response(data={**result.model_dump(), "quality_score": score})
