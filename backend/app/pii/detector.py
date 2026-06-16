import re

import pandas as pd

from app.pii.schemas import PIIFinding, PIIScanResult

NATIONAL_ID_PATTERN = re.compile(r"\b(\d{13})\b")
MOBILE_PHONE_PATTERN = re.compile(r"\b(0[689]\d{8})\b")
LANDLINE_PHONE_PATTERN = re.compile(r"\b(0[2-7]\d{7})\b")
EMAIL_PATTERN = re.compile(
    r"\b([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})\b"
)
BANK_ACCOUNT_PATTERN = re.compile(r"\b(\d{10,15})\b")
BIRTH_DATE_PATTERNS = (
    re.compile(r"\b(\d{4}-\d{2}-\d{2})\b"),
    re.compile(r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b"),
)

NAME_COLUMN_KEYWORDS = (
    "ชื่อ",
    "นามสกุล",
    "ชื่อ-สกุล",
    "ชื่อนักเรียน",
    "ผู้ปกครอง",
    "name",
    "fullname",
)
NAME_VALUE_PREFIXES = ("นาย", "นาง", "นางสาว", "ด.ช.", "ด.ญ.")
BANK_COLUMN_KEYWORDS = ("บัญชี", "เลขที่บัญชี", "account", "bank_account")
BIRTH_COLUMN_KEYWORDS = (
    "วันเกิด",
    "เกิด",
    "birth",
    "dob",
    "birthdate",
    "birthday",
)
RELIGION_COLUMN_KEYWORDS = ("ศาสนา", "religion")
RELIGION_VALUES = (
    "พุทธ",
    "อิสลาม",
    "คริสต์",
    "ฮินดู",
    "ซิกข์",
    "พราหมณ์",
    "buddhism",
    "islam",
    "christianity",
    "hindu",
    "sikh",
)


def detect_pii(df: pd.DataFrame, sample_size: int = 1000) -> PIIScanResult:
    sample_df = df.head(sample_size)
    findings: list[PIIFinding] = []

    for column in sample_df.columns:
        column_name = str(column)
        series = sample_df[column]

        national_id_matches = _detect_national_ids(series)
        if national_id_matches:
            findings.append(
                PIIFinding(
                    column_name=column_name,
                    pii_type="national_id",
                    severity="High",
                    match_count=len(national_id_matches),
                    sample_masked_value=_mask_national_id(national_id_matches[0]),
                )
            )

        phone_matches = _detect_phones(series)
        if phone_matches:
            findings.append(
                PIIFinding(
                    column_name=column_name,
                    pii_type="phone",
                    severity="High",
                    match_count=len(phone_matches),
                    sample_masked_value=_mask_phone(phone_matches[0]),
                )
            )

        email_matches = _detect_emails(series)
        if email_matches:
            findings.append(
                PIIFinding(
                    column_name=column_name,
                    pii_type="email",
                    severity="High",
                    match_count=len(email_matches),
                    sample_masked_value=_mask_email(email_matches[0]),
                )
            )

        name_matches = _detect_names(column_name, series)
        if name_matches:
            findings.append(
                PIIFinding(
                    column_name=column_name,
                    pii_type="full_name",
                    severity="High",
                    match_count=len(name_matches),
                    sample_masked_value=_mask_name(name_matches[0]),
                )
            )

        if _column_name_matches(column_name, BANK_COLUMN_KEYWORDS):
            bank_matches = _detect_bank_accounts(series)
            if bank_matches:
                findings.append(
                    PIIFinding(
                        column_name=column_name,
                        pii_type="bank_account",
                        severity="Medium",
                        match_count=len(bank_matches),
                        sample_masked_value=_mask_other(bank_matches[0]),
                    )
                )

        if _column_name_matches(column_name, BIRTH_COLUMN_KEYWORDS):
            birth_matches = _detect_birth_dates(series)
            if birth_matches:
                findings.append(
                    PIIFinding(
                        column_name=column_name,
                        pii_type="birth_date",
                        severity="Medium",
                        match_count=len(birth_matches),
                        sample_masked_value=_mask_other(birth_matches[0]),
                    )
                )

        if _column_name_matches(column_name, RELIGION_COLUMN_KEYWORDS):
            religion_matches = _detect_religions(series)
            if religion_matches:
                findings.append(
                    PIIFinding(
                        column_name=column_name,
                        pii_type="religion",
                        severity="Sensitive",
                        match_count=len(religion_matches),
                        sample_masked_value=_mask_other(religion_matches[0]),
                    )
                )

    return PIIScanResult(findings=findings, has_pii=len(findings) > 0)


def _column_name_matches(column_name: str, keywords: tuple[str, ...]) -> bool:
    lower_name = column_name.lower()
    return any(keyword in lower_name for keyword in keywords)


def _cell_values(series: pd.Series) -> list[str]:
    values: list[str] = []
    for value in series.dropna():
        text = str(value).strip()
        if text:
            values.append(text)
    return values


def _valid_thai_national_id(value: str) -> bool:
    if len(value) != 13 or not value.isdigit():
        return False
    total = sum(int(value[index]) * (13 - index) for index in range(12))
    check_digit = (11 - (total % 11)) % 10
    return check_digit == int(value[12])


def _detect_national_ids(series: pd.Series) -> list[str]:
    matches: list[str] = []
    for value in _cell_values(series):
        for match in NATIONAL_ID_PATTERN.findall(value):
            if _valid_thai_national_id(match):
                matches.append(match)
    return matches


def _detect_phones(series: pd.Series) -> list[str]:
    matches: list[str] = []
    for value in _cell_values(series):
        matches.extend(MOBILE_PHONE_PATTERN.findall(value))
        matches.extend(LANDLINE_PHONE_PATTERN.findall(value))
    return matches


def _detect_emails(series: pd.Series) -> list[str]:
    matches: list[str] = []
    for value in _cell_values(series):
        matches.extend(EMAIL_PATTERN.findall(value))
    return matches


def _detect_names(column_name: str, series: pd.Series) -> list[str]:
    matches: list[str] = []
    column_matches = _column_name_matches(column_name, NAME_COLUMN_KEYWORDS)

    for value in _cell_values(series):
        if column_matches:
            matches.append(value)
            continue
        if any(value.startswith(prefix) for prefix in NAME_VALUE_PREFIXES):
            matches.append(value)

    return matches


def _detect_bank_accounts(series: pd.Series) -> list[str]:
    matches: list[str] = []
    for value in _cell_values(series):
        matches.extend(BANK_ACCOUNT_PATTERN.findall(value))
    return matches


def _detect_birth_dates(series: pd.Series) -> list[str]:
    matches: list[str] = []
    for value in _cell_values(series):
        for pattern in BIRTH_DATE_PATTERNS:
            matches.extend(pattern.findall(value))
    return matches


def _detect_religions(series: pd.Series) -> list[str]:
    matches: list[str] = []
    for value in _cell_values(series):
        normalized = value.strip().lower()
        if any(religion.lower() in normalized for religion in RELIGION_VALUES):
            matches.append(value)
    return matches


def _mask_national_id(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if len(digits) >= 13:
        return f"{digits[0]}XXXXXXXXXXX{digits[12]}"
    return _mask_other(value)


def _mask_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if len(digits) >= 4:
        return digits[:2] + ("X" * (len(digits) - 4)) + digits[-2:]
    return _mask_other(value)


def _mask_email(value: str) -> str:
    match = re.match(r"^([^@]+)@(.+)$", value)
    if not match:
        return _mask_other(value)
    local_part = match.group(1)
    domain = match.group(2)
    if not local_part:
        return f"***@{domain}"
    return f"{local_part[0]}***@{domain}"


def _mask_name(value: str) -> str:
    parts = value.strip().split()
    if not parts:
        return _mask_other(value)
    prefix = parts[0][:2] if len(parts[0]) >= 2 else parts[0]
    return f"{prefix}X. XXXX"


def _mask_other(value: str) -> str:
    if len(value) >= 3:
        return value[:3] + "XXX"
    return "XXX"
