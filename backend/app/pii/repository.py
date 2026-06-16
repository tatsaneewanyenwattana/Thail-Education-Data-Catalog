import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.pii.models import DatasetPIIScanResult
from app.pii.schemas import PIIFinding


def save_scan_results(
    db: Session,
    dataset_id: uuid.UUID,
    findings: list[PIIFinding],
    scan_type: str,
) -> None:
    scanned_at = datetime.now(timezone.utc)
    for finding in findings:
        db.add(
            DatasetPIIScanResult(
                dataset_id=dataset_id,
                column_name=finding.column_name,
                pii_type=finding.pii_type,
                severity=finding.severity,
                match_count=finding.match_count,
                sample_masked_value=finding.sample_masked_value,
                scan_type=scan_type,
                scanned_at=scanned_at,
            )
        )
    db.commit()


def get_scan_results_by_dataset_id(
    db: Session,
    dataset_id: uuid.UUID,
) -> list[DatasetPIIScanResult]:
    return (
        db.query(DatasetPIIScanResult)
        .filter(DatasetPIIScanResult.dataset_id == dataset_id)
        .order_by(DatasetPIIScanResult.scanned_at.desc())
        .all()
    )
