# Module: M4 Download
# Feature: Business Logic ตาม #5 #32 #34 #46 #49 #56

import io
import json
import uuid
from datetime import datetime, timezone
from collections.abc import Iterator
from typing import Any

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
from minio import Minio
from redis import Redis
from sqlalchemy.orm import Session

import app.repositories.dataset_repository as dataset_repo
import app.repositories.download_repository as download_repo
from app.core.config import settings
from app.core.errors import raise_app_error
from app.schemas.download_schema import CitationResponse, PreviewResponse

PREVIEW_ROW_LIMIT = 100
PREVIEW_CACHE_TTL_SECONDS = 3600
PREVIEW_CACHE_PREFIX = "preview:"

ALLOWED_DOWNLOAD_FORMATS = frozenset({"csv", "excel", "json", "xml", "pdf", "sql"})

_PII_COLUMN_KEYWORDS = (
    "ชื่อ", "นามสกุล", "เบอร์", "โทร", "บัตร", "รหัส",
    "name", "phone", "id", "email",
)


def check_preview_permission(dataset, current_user: dict | None) -> bool:
    if dataset.status == "published":
        return True
    if current_user and current_user.get("role") == "admin":
        return True
    if current_user:
        current_user_id = current_user.get("sub") or current_user.get("id")
        if current_user_id and str(dataset.user_id) == str(current_user_id):
            return True
    return False


def _get_dataset_with_preview_permission(
    db: Session, dataset_id: uuid.UUID, current_user: dict | None
):
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")
    if not check_preview_permission(dataset, current_user):
        raise_app_error("DATASET_NOT_FOUND")
    return dataset


def _get_published_dataset(db: Session, dataset_id: uuid.UUID):
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None or dataset.status != "published":
        raise_app_error("DATASET_NOT_FOUND")
    return dataset


def _fetch_file_content(minio_client: Minio, file_path: str) -> bytes:
    response = minio_client.get_object(settings.MINIO_BUCKET_NAME, file_path)
    try:
        return response.read()
    finally:
        response.close()
        response.release_conn()


def _stream_file_content(
    minio_client: Minio, file_path: str, chunk_size: int = 64 * 1024
) -> Iterator[bytes]:
    response = minio_client.get_object(settings.MINIO_BUCKET_NAME, file_path)
    try:
        for chunk in response.stream(chunk_size):
            yield chunk
    finally:
        response.close()
        response.release_conn()


def _infer_source_format_from_path(file_path: str) -> str:
    """สำรองเมื่อ DB ไม่มี file_format (ข้อมูลเก่า)"""
    ext = file_path.rsplit(".", 1)[-1].lower()
    mapping = {
        "json": "json",
        "xlsx": "excel",
        "xls": "excel",
        "csv": "csv",
        "xml": "xml",
        "pdf": "pdf",
        "sql": "sql",
    }
    return mapping.get(ext, "csv")


def _get_source_format(
    db: Session,
    dataset_id: uuid.UUID,
    file_path: str,
) -> str:
    """ใช้ file_format จาก DB เป็นหลัก — ไม่เดาจาก path ถ้ามีค่าใน DB"""
    stored = dataset_repo.get_latest_dataset_file_format(db, dataset_id)
    if stored:
        fmt = stored.strip().lower()
        if fmt in {"csv", "excel", "json", "pdf", "sql"}:
            return fmt
    return _infer_source_format_from_path(file_path)


def _read_dataframe(content: bytes, source_format: str) -> pd.DataFrame:
    if source_format == "csv":
        return pd.read_csv(io.BytesIO(content))
    if source_format == "json":
        return pd.read_json(io.BytesIO(content))
    return pd.read_excel(io.BytesIO(content))


def _detect_masked_columns(columns: list[Any]) -> list[str]:
    masked: list[str] = []
    for col in columns:
        lower = str(col).lower()
        if any(kw in lower for kw in _PII_COLUMN_KEYWORDS):
            masked.append(str(col))
    return masked


def _rows_from_dataframe(df: pd.DataFrame) -> list[dict[str, Any]]:
    preview_df = df.head(PREVIEW_ROW_LIMIT).astype(object)
    preview_df = preview_df.where(pd.notnull(preview_df), None)
    return preview_df.to_dict(orient="records")


def _get_latest_file_path(db: Session, dataset_id: uuid.UUID) -> str:
    versions = dataset_repo.get_dataset_versions(db, dataset_id)
    if not versions:
        raise_app_error("FILE_NOT_FOUND")
    return versions[0].file_path


def _validate_purpose(purpose: str | None) -> str:
    if purpose is None or not purpose.strip():
        raise_app_error("DOWNLOAD_PURPOSE_REQUIRED")
    cleaned = purpose.strip()
    if len(cleaned) < 10:
        raise_app_error("DOWNLOAD_PURPOSE_REQUIRED")
    return cleaned


def _validate_download_format(file_format: str | None) -> str:
    if file_format is None or file_format.strip().lower() not in ALLOWED_DOWNLOAD_FORMATS:
        raise_app_error("DOWNLOAD_INVALID_FORMAT")
    return file_format.strip().lower()


def _convert_dataframe_to_bytes(
    df: pd.DataFrame,
    file_format: str,
    dataset_title: str,
) -> tuple[bytes, str, str]:
    safe_name = "".join(
        c if c.isalnum() or c in ("-", "_") else "_" for c in dataset_title[:80]
    ).strip("_") or "dataset"

    if file_format == "csv":
        csv_text = df.to_csv(index=False)
        # UTF-8 BOM so Excel on Windows opens Thai text correctly
        content = b"\xef\xbb\xbf" + csv_text.encode("utf-8")
        return content, "text/csv; charset=utf-8-sig", f"{safe_name}.csv"
    if file_format == "json":
        content = df.to_json(orient="records", force_ascii=False).encode("utf-8")
        return content, "application/json", f"{safe_name}.json"
    if file_format == "excel":
        buf = io.BytesIO()
        df.to_excel(buf, index=False)
        return (
            buf.getvalue(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            f"{safe_name}.xlsx",
        )
    buf = io.BytesIO()
    df.to_xml(buf, index=False)
    return buf.getvalue(), "application/xml", f"{safe_name}.xml"


def download(
    db: Session,
    minio_client: Minio,
    dataset_id: uuid.UUID,
    purpose: str | None,
    file_format: str | None,
    user_id: uuid.UUID | None,
    ip_address: str,
    source: str = "web",
) -> tuple[bytes | Iterator[bytes], str, str]:
    cleaned_purpose = _validate_purpose(purpose)
    target_format = _validate_download_format(file_format)
    dataset = _get_published_dataset(db, dataset_id)

    file_path = _get_latest_file_path(db, dataset_id)
    source_format = _get_source_format(db, dataset_id, file_path)

    if source_format in ("pdf", "sql"):
        if target_format != source_format:
            raise_app_error("DOWNLOAD_INVALID_FORMAT")
        safe_name = "".join(
            c if c.isalnum() or c in ("-", "_") else "_"
            for c in dataset.title[:80]
        ).strip("_") or "dataset"
        media_types = {
            "pdf": "application/pdf",
            "sql": "text/plain; charset=utf-8",
        }
        file_content: bytes | Iterator[bytes] = _stream_file_content(
            minio_client, file_path
        )
        media_type = media_types[source_format]
        filename = f"{safe_name}.{source_format}"
    else:
        if target_format in ("pdf", "sql"):
            raise_app_error("DOWNLOAD_INVALID_FORMAT")
        content = _fetch_file_content(minio_client, file_path)
        df = _read_dataframe(content, source_format)
        del content
        file_content, media_type, filename = _convert_dataframe_to_bytes(
            df, target_format, dataset.title
        )
        del df

    try:
        download_repo.create_download_log(
            db,
            dataset_id=dataset_id,
            user_id=user_id,
            ip_address=ip_address,
            purpose=cleaned_purpose,
            file_format=target_format,
            source=source,
        )
        download_repo.increment_download_count(db, dataset_id, source=source)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return file_content, media_type, filename


def preview(
    db: Session,
    minio_client: Minio,
    redis_client: Redis,
    dataset_id: uuid.UUID,
    current_user: dict | None = None,
) -> PreviewResponse:
    _get_dataset_with_preview_permission(db, dataset_id, current_user)
    cache_key = f"{PREVIEW_CACHE_PREFIX}{dataset_id}"
    cached = redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return PreviewResponse(**data)

    file_path = _get_latest_file_path(db, dataset_id)
    content = _fetch_file_content(minio_client, file_path)
    source_format = _get_source_format(db, dataset_id, file_path)

    if source_format == "sql":
        lines = content.decode("utf-8", errors="replace").splitlines()
        rows = [
            {"line": index + 1, "content": line}
            for index, line in enumerate(lines[:PREVIEW_ROW_LIMIT])
        ]
        response = PreviewResponse(
            rows=rows,
            total_rows=len(lines),
            columns=["line", "content"],
            masked_columns=[],
            file_type="sql",
        )
    elif source_format == "pdf":
        response = PreviewResponse(
            rows=[],
            total_rows=0,
            columns=[],
            masked_columns=[],
            file_type="pdf",
            preview_note="PDF preview is not available. Please download the file.",
        )
    else:
        df = _read_dataframe(content, source_format)
        masked_columns = _detect_masked_columns(list(df.columns))
        response = PreviewResponse(
            rows=_rows_from_dataframe(df),
            total_rows=len(df),
            columns=[str(c) for c in df.columns],
            masked_columns=masked_columns,
        )

    redis_client.setex(
        cache_key,
        PREVIEW_CACHE_TTL_SECONDS,
        json.dumps(response.model_dump(), ensure_ascii=False, default=str),
    )
    return response


def get_citation(
    db: Session, dataset_id: uuid.UUID, current_user: dict | None = None
) -> CitationResponse:
    from app.models.user_model import User

    dataset = _get_dataset_with_preview_permission(db, dataset_id, current_user)
    owner = db.query(User).filter(User.id == dataset.user_id).first()
    agency_name = owner.agency_name if owner else None
    author = agency_name or "Unknown Agency"

    published_year = ""
    if dataset.published_at:
        published_year = str(dataset.published_at.year)

    apa = (
        f"{author} ({published_year or 'n.d.'}). {dataset.title} [Data set]. "
        f"Thai Education Data Catalog."
    )
    vancouver = (
        f"{author}. {dataset.title} [Data set]. "
        f"Thai Education Data Catalog; {published_year or 'n.d.'}."
    )

    published_at_iso = None
    if dataset.published_at:
        published_at_iso = dataset.published_at.astimezone(timezone.utc).isoformat()

    return CitationResponse(
        dataset_id=dataset.id,
        title=dataset.title,
        agency_name=agency_name,
        license=dataset.license,
        published_at=published_at_iso,
        apa=apa,
        vancouver=vancouver,
    )


def export_pdf(
    db: Session,
    minio_client: Minio,
    dataset_id: uuid.UUID,
) -> tuple[bytes, str]:
    dataset = _get_published_dataset(db, dataset_id)

    chart_html = ""
    try:
        file_path = _get_latest_file_path(db, dataset_id)
        content = _fetch_file_content(minio_client, file_path)
        source_format = _get_source_format(db, dataset_id, file_path)
        if source_format in ("pdf", "sql"):
            raise ValueError("tabular chart not available for pdf/sql")
        df = _read_dataframe(content, source_format).head(PREVIEW_ROW_LIMIT)
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        if numeric_cols:
            import matplotlib.font_manager as fm

            thai_fonts = fm.findSystemFonts(fontext="ttf")
            thai_font = next(
                (f for f in thai_fonts if "noto" in f.lower() and "thai" in f.lower()),
                next((f for f in thai_fonts if "tlwg" in f.lower()), None),
            )
            if thai_font:
                matplotlib.rcParams["font.family"] = ["Noto Sans Thai", "DejaVu Sans"]
                matplotlib.rcParams["axes.unicode_minus"] = False
                plt.rcParams["font.family"] = ["Noto Sans Thai", "DejaVu Sans"]

            col = numeric_cols[0]
            fig, ax = plt.subplots(figsize=(6, 3))
            df[col].dropna().head(20).plot(kind="bar", ax=ax)
            ax.set_title(str(col))
            ax.set_xlabel("row")
            fig.tight_layout()
            img_buf = io.BytesIO()
            fig.savefig(img_buf, format="png", dpi=100)
            plt.close(fig)
            import base64

            img_b64 = base64.b64encode(img_buf.getvalue()).decode("ascii")
            chart_html = (
                f'<img src="data:image/png;base64,{img_b64}" '
                'style="max-width:100%;" alt="chart"/>'
            )
    except Exception:
        chart_html = ""

    metadata = dataset.dataset_metadata or {}
    metadata_rows = "".join(
        f"<tr><td>{key}</td><td>{value}</td></tr>"
        for key, value in metadata.items()
    )
    description = dataset.description or ""
    published = ""
    if dataset.published_at:
        published = dataset.published_at.astimezone(timezone.utc).strftime("%Y-%m-%d")

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><title>{dataset.title}</title></head>
    <body>
    <h1>{dataset.title}</h1>
    <p><strong>License:</strong> {dataset.license}</p>
    <p><strong>Published:</strong> {published}</p>
    <p>{description}</p>
    {chart_html}
    <h2>Metadata</h2>
    <table border="1" cellpadding="4">
    {metadata_rows}
    </table>
    </body>
    </html>
    """

    from weasyprint import HTML

    pdf_bytes = HTML(string=html).write_pdf()
    safe_name = "".join(
        c if c.isalnum() or c in ("-", "_") else "_" for c in dataset.title[:80]
    ).strip("_") or "dataset"
    return pdf_bytes, f"{safe_name}.pdf"
