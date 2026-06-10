# Module: M9 Email
# Feature: Email Log Queries ตาม #56

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.email_log_model import EmailLog


def create_email_log(
    db: Session,
    *,
    template_name: str,
    recipient_email: str,
    subject: str,
    user_id: uuid.UUID | None = None,
) -> EmailLog:
    log = EmailLog(
        user_id=user_id,
        template_name=template_name,
        recipient_email=recipient_email,
        subject=subject,
        status="pending",
    )
    db.add(log)
    db.flush()
    return log


def mark_sent(
    db: Session,
    log_id: uuid.UUID,
    *,
    provider_message_id: str | None = None,
) -> None:
    log = db.query(EmailLog).filter(EmailLog.id == log_id).first()
    if log is None:
        return
    log.status = "sent"
    log.sent_at = datetime.now(timezone.utc)
    if provider_message_id:
        log.provider_message_id = provider_message_id


def mark_failed(
    db: Session,
    log_id: uuid.UUID,
    error_message: str,
) -> None:
    log = db.query(EmailLog).filter(EmailLog.id == log_id).first()
    if log is None:
        return
    log.status = "failed"
    log.error_message = error_message
