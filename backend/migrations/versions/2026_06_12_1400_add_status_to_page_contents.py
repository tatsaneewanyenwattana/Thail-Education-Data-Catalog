"""add status to page_contents

Revision ID: h7c8d9e0f1a2
Revises: g6b7c8d9e0f1
Create Date: 2026-06-12 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "h7c8d9e0f1a2"
down_revision = "g6b7c8d9e0f1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "page_contents",
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="published",
        ),
    )
    op.execute(
        "UPDATE page_contents SET status = 'draft' WHERE slug = 'help-center'"
    )


def downgrade() -> None:
    op.drop_column("page_contents", "status")
