# services/promotions/models.py

from datetime import datetime
from app import db
from services.user_management.models import User
from services.products.models import Product

class Promotion(db.Model):
    __tablename__ = 'promotions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    discount_percentage = db.Column(db.Numeric(5, 2), nullable=False)  # e.g., 10.00 for 10%
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    applicable_tiers = db.Column(db.String(255), nullable=False)  # e.g., "Gold, Silver"
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # Relationships
    products = db.relationship('Product', secondary='promotion_products', backref='promotions')

    def is_active(self):
        now = datetime.utcnow()
        return self.start_date <= now <= self.end_date

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "discount_percentage": float(self.discount_percentage),
            "start_date": self.start_date,
            "end_date": self.end_date,
            "applicable_tiers": self.applicable_tiers,
            "products": [product.to_dict() for product in self.products],
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

class PromotionProduct(db.Model):
    __tablename__ = 'promotion_products'

    promotion_id = db.Column(db.Integer, db.ForeignKey('promotions.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), primary_key=True)

    def to_dict(self):
        return {
            "promotion_id": self.promotion_id,
            "product_id": self.product_id
        }
