"""alter dataset_ratings for ip+date rating

Revision ID: k0f1a2b3c4d5
Revises: j9e0f1a2b3c4
Create Date: 2026-06-18 22:00:00.000000

"""
import sqlalchemy as sa
from alembic import op

revision = "k0f1a2b3c4d5"
down_revision = "j9e0f1a2b3c4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("dataset_ratings", sa.Column("ip_address", sa.String(45), nullable=True))
    op.add_column("dataset_ratings", sa.Column("rated_date", sa.Date(), nullable=True, server_default=sa.text("CURRENT_DATE")))

    op.execute("UPDATE dataset_ratings SET ip_address = 'legacy-' || id::text, rated_date = created_at::date WHERE ip_address IS NULL")

    op.alter_column("dataset_ratings", "ip_address", nullable=False)
    op.alter_column("dataset_ratings", "rated_date", nullable=False)

    op.create_index("ix_dataset_ratings_dataset_ip_date", "dataset_ratings", ["dataset_id", "ip_address", "rated_date"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_dataset_ratings_dataset_ip_date")
    op.drop_column("dataset_ratings", "rated_date")
    op.drop_column("dataset_ratings", "ip_address")
