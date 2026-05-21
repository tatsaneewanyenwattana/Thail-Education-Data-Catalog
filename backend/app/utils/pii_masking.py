# Module: M2 Dataset
# Feature: PII Masking ตาม #46

import re
from typing import Any

import pandas as pd

_PII_COLUMN_KEYWORDS = (
    "ชื่อ", "นามสกุล", "เบอร์", "โทร", "บัตร", "รหัส",
    "name", "phone", "id", "email",
)

_RE_NATIONAL_ID = re.compile(r"\b\d{13}\b")
_RE_PHONE = re.compile(r"\b0\d{8,9}\b")
_RE_EMAIL = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")
_RE_STUDENT_ID = re.compile(r"\b\d{5,10}\b")


def _mask_national_id(value: str) -> str:
    def replace(m: re.Match) -> str:
        s = m.group()
        return s[0] + "X" * (len(s) - 2) + s[-1]
    return _RE_NATIONAL_ID.sub(replace, value)


def _mask_phone(value: str) -> str:
    def replace(m: re.Match) -> str:
        s = m.group()
        return s[:2] + "X" * (len(s) - 4) + s[-2:]
    return _RE_PHONE.sub(replace, value)


def _mask_email(value: str) -> str:
    def replace(m: re.Match) -> str:
        s = m.group()
        at = s.index("@")
        local = s[:at]
        domain = s[at:]
        return local[0] + "***" + domain
    return _RE_EMAIL.sub(replace, value)


def _mask_student_id(value: str) -> str:
    def replace(m: re.Match) -> str:
        return "X" * len(m.group())
    return _RE_STUDENT_ID.sub(replace, value)


def _mask_name(value: str) -> str:
    parts = str(value).split()
    masked = []
    for part in parts:
        if len(part) > 1:
            masked.append(part[0] + "X" * (len(part) - 1))
        else:
            masked.append(part)
    return " ".join(masked)


def _is_pii_column(col_name: str) -> bool:
    lower = col_name.lower()
    return any(kw in lower for kw in _PII_COLUMN_KEYWORDS)


def _is_name_column(col_name: str) -> bool:
    lower = col_name.lower()
    return any(kw in lower for kw in ("ชื่อ", "นามสกุล", "name"))


def _mask_cell(value: Any) -> Any:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return value
    s = str(value)
    s = _mask_national_id(s)
    s = _mask_phone(s)
    s = _mask_email(s)
    s = _mask_student_id(s)
    return s


def scan_and_mask(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """
    สแกนหา PII ใน DataFrame แล้ว Mask อัตโนมัติ ตาม #46
    คืน (masked_df, list ชื่อคอลัมน์ที่ถูก Mask)
    """
    masked_df = df.copy()
    masked_columns: list[str] = []

    for col in masked_df.columns:
        col_masked = False

        if _is_pii_column(str(col)):
            col_masked = True
            if _is_name_column(str(col)):
                masked_df[col] = masked_df[col].apply(
                    lambda v: _mask_name(v)
                    if v is not None and not (isinstance(v, float) and pd.isna(v))
                    else v
                )
            else:
                masked_df[col] = masked_df[col].apply(_mask_cell)
        else:
            col_str = masked_df[col].astype(str)
            sample = col_str.head(100)
            has_pii = (
                sample.str.contains(_RE_NATIONAL_ID.pattern, regex=True).any()
                or sample.str.contains(_RE_PHONE.pattern, regex=True).any()
                or sample.str.contains(_RE_EMAIL.pattern, regex=True).any()
            )
            if has_pii:
                col_masked = True
                masked_df[col] = masked_df[col].apply(_mask_cell)

        if col_masked:
            masked_columns.append(str(col))

    return masked_df, masked_columns
