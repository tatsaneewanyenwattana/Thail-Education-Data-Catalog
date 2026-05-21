# Module: M2 Dataset
# Feature: Data Quality Score ตาม #29

import pandas as pd


def calculate_quality_score(df: pd.DataFrame) -> int:
    """
    คำนวณ Data Quality Score (0-100) ด้วย Pandas ตาม #29
    เกณฑ์:
    - completeness (40 pts): % ของค่าที่ไม่ว่าง
    - uniqueness   (30 pts): % ของแถวที่ไม่ซ้ำ
    - consistency  (30 pts): % ของ column ที่มี dtype สม่ำเสมอ
    """
    if df.empty or len(df.columns) == 0:
        return 0

    total_cells = df.size
    non_null_cells = df.notna().sum().sum()
    completeness = (non_null_cells / total_cells) if total_cells > 0 else 0

    total_rows = len(df)
    unique_rows = len(df.drop_duplicates())
    uniqueness = (unique_rows / total_rows) if total_rows > 0 else 0

    consistent_cols = 0
    for col in df.columns:
        col_data = df[col].dropna()
        if len(col_data) == 0:
            consistent_cols += 1
            continue
        try:
            pd.to_numeric(col_data)
            consistent_cols += 1
        except (ValueError, TypeError):
            if col_data.apply(lambda v: isinstance(v, str)).all():
                consistent_cols += 1

    consistency = consistent_cols / len(df.columns) if len(df.columns) > 0 else 0

    score = (completeness * 40) + (uniqueness * 30) + (consistency * 30)
    return min(100, max(0, int(round(score))))
