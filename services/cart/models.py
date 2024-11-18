# services/cart/models.py

from app import db
from sqlalchemy.orm import validates  # Import the validates decorator
from services.products.models import Product
from services.user_management.models import User  # Corrected import path

class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)  # One cart per user
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # Relationships
    user = db.relationship('User', back_populates='cart')
    items = db.relationship('CartItem', backref='cart', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "items": [item.to_dict() for item in self.items],
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    # Relationships
    product = db.relationship('Product', backref='cart_items')

    def to_dict(self):
        return {
            "id": self.id,
            "cart_id": self.cart_id,
            "product_id": self.product_id,
            "quantity": self.quantity
        }

    @validates('quantity')
    def validate_quantity(self, key, value):
        if value <= 0:
            raise ValueError("Quantity must be a positive integer")
        return value
