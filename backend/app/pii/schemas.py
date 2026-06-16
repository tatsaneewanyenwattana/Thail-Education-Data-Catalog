from pydantic import BaseModel


class PIIFinding(BaseModel):
    column_name: str
    pii_type: str
    severity: str
    match_count: int
    sample_masked_value: str | None


class PIIScanResult(BaseModel):
    findings: list[PIIFinding]
    has_pii: bool
