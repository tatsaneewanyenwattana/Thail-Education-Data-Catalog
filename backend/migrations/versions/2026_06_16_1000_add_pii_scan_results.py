"""add pii scan results table

Revision ID: i8d9e0f1a2b3
Revises: h7c8d9e0f1a2
Create Date: 2026-06-16 10:00:00.000000

"""
from alembic import op

revision = "i8d9e0f1a2b3"
down_revision = "h7c8d9e0f1a2"
branch_labels = None
depends_on = None
transaction = False


def upgrade() -> None:
    connection = op.get_bind()
    raw_conn = connection.connection
    old_isolation = raw_conn.isolation_level
    raw_conn.set_isolation_level(0)

    cursor = raw_conn.cursor()
    cursor.execute(
        """
        CREATE TABLE dataset_pii_scan_results (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            dataset_id UUID NOT NULL,
            column_name VARCHAR NOT NULL,
            pii_type VARCHAR NOT NULL,
            severity VARCHAR NOT NULL,
            match_count INTEGER NOT NULL DEFAULT 0,
            sample_masked_value VARCHAR,
            scan_type VARCHAR NOT NULL,
            scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT fk_dataset_pii_scan_results_datasets
                FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
        )
        """
    )
    cursor.execute(
        """
        CREATE INDEX idx_dataset_pii_scan_results_dataset_id
        ON dataset_pii_scan_results (dataset_id)
        """
    )

    raw_conn.set_isolation_level(old_isolation)


def downgrade() -> None:
    connection = op.get_bind()
    raw_conn = connection.connection
    old_isolation = raw_conn.isolation_level
    raw_conn.set_isolation_level(0)

    cursor = raw_conn.cursor()
    cursor.execute(
        "DROP INDEX IF EXISTS idx_dataset_pii_scan_results_dataset_id"
    )
    cursor.execute("DROP TABLE IF EXISTS dataset_pii_scan_results")

    raw_conn.set_isolation_level(old_isolation)
