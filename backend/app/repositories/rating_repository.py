import uuid
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.dataset_rating_model import DatasetRating


def has_voted_today(
    db: Session, dataset_id: uuid.UUID, ip_address: str
) -> bool:
    return (
        db.query(DatasetRating)
        .filter(
            DatasetRating.dataset_id == dataset_id,
            DatasetRating.ip_address == ip_address,
            DatasetRating.rated_date == date.today(),
        )
        .first()
        is not None
    )


def create_rating(
    db: Session, dataset_id: uuid.UUID, ip_address: str, score: int
) -> DatasetRating:
    rating = DatasetRating(
        dataset_id=dataset_id,
        ip_address=ip_address,
        score=score,
    )
    db.add(rating)
    db.flush()
    return rating


def get_rating_stats(
    db: Session, dataset_id: uuid.UUID
) -> dict:
    row = (
        db.query(
            func.coalesce(func.avg(DatasetRating.score), 0).label("avg"),
            func.count(DatasetRating.id).label("count"),
        )
        .filter(DatasetRating.dataset_id == dataset_id)
        .first()
    )
    return {
        "rating_avg": round(float(row.avg), 2),
        "rating_count": int(row.count),
    }
