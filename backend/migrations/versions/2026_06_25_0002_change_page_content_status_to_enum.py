"""change page_contents status from string to enum

Revision ID: m2b3c4d5e6f7
Revises: l1a2b3c4d5e6
Create Date: 2026-06-25 00:02:00.000000

"""
from alembic import op

revision = "m2b3c4d5e6f7"
down_revision = "l1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "CREATE TYPE page_content_status AS ENUM ('draft', 'published')"
    )
    op.execute(
        "ALTER TABLE page_contents ALTER COLUMN status DROP DEFAULT"
    )
    op.execute(
        "ALTER TABLE page_contents "
        "ALTER COLUMN status TYPE page_content_status "
        "USING status::page_content_status"
    )
    op.execute(
        "ALTER TABLE page_contents "
        "ALTER COLUMN status SET DEFAULT 'published'::page_content_status"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE page_contents ALTER COLUMN status DROP DEFAULT"
    )
    op.execute(
        "ALTER TABLE page_contents "
        "ALTER COLUMN status TYPE varchar(20) "
        "USING status::text"
    )
    op.execute(
        "ALTER TABLE page_contents "
        "ALTER COLUMN status SET DEFAULT 'published'"
    )
    op.execute("DROP TYPE page_content_status")
