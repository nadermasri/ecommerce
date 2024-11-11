#authentic_lebanese_sentiment_shop/services/products/models.py
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

    # Relationship with products and subcategories
    products = db.relationship('Product', backref='category', lazy=True)
    subcategories = db.relationship('Subcategory', backref='category', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at
        }

class Subcategory(db.Model):
    __tablename__ = 'subcategories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

    products = db.relationship('Product', backref='subcategory', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category_id": self.category_id
        }

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0)
    stock_threshold = db.Column(db.Integer, default=10)
    image = db.Column(db.String(255))  # Path or URL to the product image
    storage_location = db.Column(db.String(255))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategories.id'), nullable=True) 
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    order_items = db.relationship('OrderItem', back_populates='product', cascade='all, delete-orphan')

    def check_stock_level(self):
        return "Low Stock" if self.stock <= self.stock_threshold else "In Stock"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": str(self.price),
            "stock": self.stock,
            "stock_threshold": self.stock_threshold,
            "image": self.image,
            "storage_location": self.storage_location,
            "category_id": self.category_id,
            "subcategory_id": self.subcategory_id,
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
