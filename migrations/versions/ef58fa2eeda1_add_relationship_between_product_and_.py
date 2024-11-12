"""Add relationship between Product and Inventory

Revision ID: ef58fa2eeda1
Revises: c6325be9cfb3
Create Date: 2024-11-11 20:41:11.883229

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'ef58fa2eeda1'
down_revision = 'c6325be9cfb3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('inventory',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('location', sa.String(length=255), nullable=False),
    sa.Column('stock_level', sa.Integer(), nullable=True),
    sa.Column('last_updated', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('activity_logs', schema=None) as batch_op:
        batch_op.alter_column('action',
               existing_type=mysql.TEXT(),
               nullable=False)

    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_column('storage_location')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.add_column(sa.Column('storage_location', mysql.VARCHAR(length=255), nullable=True))

    with op.batch_alter_table('activity_logs', schema=None) as batch_op:
        batch_op.alter_column('action',
               existing_type=mysql.TEXT(),
               nullable=True)

    op.drop_table('inventory')
    # ### end Alembic commands ###