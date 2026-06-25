"""add unique index for subscription agency_user_id

Revision ID: l1a2b3c4d5e6
Revises: k0f1a2b3c4d5
Create Date: 2026-06-25 00:01:00.000000

"""
from alembic import op

revision = "l1a2b3c4d5e6"
down_revision = "k0f1a2b3c4d5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "CREATE UNIQUE INDEX uq_subscriptions_user_agency "
        "ON subscriptions (user_id, agency_user_id) "
        "WHERE agency_user_id IS NOT NULL"
    )


def downgrade() -> None:
    op.drop_index("uq_subscriptions_user_agency", table_name="subscriptions")
