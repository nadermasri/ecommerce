from app import db
from sqlalchemy.orm import validates
import logging

# Initialize logger for audit logging
logger = logging.getLogger(__name__)

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at
        }

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    cultural_background = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0)
    stock_threshold = db.Column(db.Integer, default=10)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    category = db.relationship('Category', backref='products')

    def check_stock_level(self):
        return "Low Stock" if self.stock <= self.stock_threshold else "In Stock"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "cultural_background": self.cultural_background,
            "price": str(self.price),
            "stock": self.stock,
            "stock_threshold": self.stock_threshold,
            "category_id": self.category_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @validates('price', 'stock', 'stock_threshold')
    def validate_positive_values(self, key, value):
        """Ensure positive values for price, stock, and stock_threshold."""
        if value < 0:
            raise ValueError(f"{key.capitalize()} must be a non-negative number")
        return value

    @validates('name')
    def validate_name(self, key, value):
        """Validate product name length and format."""
        if not value or len(value) > 255:
            raise ValueError("Name must be between 1 and 255 characters")
        return value

# Audit logging event for product changes
from sqlalchemy import event

@event.listens_for(Product, 'after_insert')
@event.listens_for(Product, 'after_update')
@event.listens_for(Product, 'after_delete')
def log_product_changes(mapper, connection, target):
    action = 'created' if target._sa_instance_state.key is None else 'updated'
    if action == 'deleted':
        logger.info(f"Product {target.id} was deleted.")
    else:
        logger.info(f"Product {target.id} was {action} with data: {target.to_dict()}")
