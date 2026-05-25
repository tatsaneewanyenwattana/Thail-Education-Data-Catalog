"""add page_contents table

Revision ID: c8d9e0f1a2b3
Revises: b7c8d9e0f1a2
Create Date: 2026-05-25 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "c8d9e0f1a2b3"
down_revision = "b7c8d9e0f1a2"
branch_labels = None
depends_on = None

PAGE_SEEDS = [
    ("privacy-policy", "นโยบายความเป็นส่วนตัว", "Privacy Policy"),
    ("terms", "เงื่อนไขการใช้งาน", "Terms of Service"),
    ("api-docs", "เอกสาร API", "API Documentation"),
    ("help-center", "Help Center", "Help Center"),
]


def upgrade() -> None:
    op.create_table(
        "page_contents",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("slug", sa.VARCHAR(255), nullable=False),
        sa.Column("title_th", sa.VARCHAR(255), nullable=False),
        sa.Column("title_en", sa.VARCHAR(255), nullable=False),
        sa.Column("content_th", sa.TEXT(), nullable=False, server_default=""),
        sa.Column("content_en", sa.TEXT(), nullable=False, server_default=""),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["updated_by"], ["users.id"], name="fk_page_contents_users"
        ),
        sa.UniqueConstraint("slug", name="uq_page_contents_slug"),
    )
    op.create_index("idx_page_contents_slug", "page_contents", ["slug"])

    page_contents = sa.table(
        "page_contents",
        sa.column("slug", sa.VARCHAR(255)),
        sa.column("title_th", sa.VARCHAR(255)),
        sa.column("title_en", sa.VARCHAR(255)),
        sa.column("content_th", sa.TEXT()),
        sa.column("content_en", sa.TEXT()),
    )
    op.bulk_insert(
        page_contents,
        [
            {
                "slug": slug,
                "title_th": title_th,
                "title_en": title_en,
                "content_th": "",
                "content_en": "",
            }
            for slug, title_th, title_en in PAGE_SEEDS
        ],
    )


def downgrade() -> None:
    op.drop_index("idx_page_contents_slug", table_name="page_contents")
    op.drop_table("page_contents")
