#authentic_lebanese_sentiment_shop/services/orders/models.py
from app import db
from sqlalchemy.orm import validates
from datetime import datetime


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    order_date = db.Column(db.DateTime, default=db.func.now())
    status = db.Column(db.Enum('Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'), default='Pending')
    delivery_option = db.Column(db.Enum('Standard', 'Express', 'In-Store Pickup'))
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    # Relationships
    user = db.relationship('User', back_populates='orders')
    items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan')

    def to_dict(self):
        """Converts model data to a dictionary, excludes sensitive information if necessary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "total_price": str(self.total_price),
            "order_date": self.order_date,
            "status": self.status,
            "delivery_option": self.delivery_option,
            "items": [item.to_dict() for item in self.items],
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @validates('status')
    def validate_status(self, key, value):
        """Ensures the order status is valid to prevent tampering."""
        valid_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled']
        if value not in valid_statuses:
            raise ValueError("Invalid status value")
        return value


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete="CASCADE"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    # Relationships
    product = db.relationship('Product', back_populates='order_items')
    returns = db.relationship('Return', backref='order_item', cascade='all, delete-orphan')


    @validates('quantity', 'price')
    def validate_positive_values(self, key, value):
        """Ensures that quantity and price are positive values to prevent erroneous entries."""
        if value <= 0:
            raise ValueError(f"{key.capitalize()} must be a positive number")
        return value

    def to_dict(self):
        """Converts model data to a dictionary."""
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "price": str(self.price)
        }

class Return(db.Model):
    __tablename__ = 'returns'

    id = db.Column(db.Integer, primary_key=True)
    order_item_id = db.Column(db.Integer, db.ForeignKey('order_items.id', ondelete="CASCADE"), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum('Pending', 'Approved', 'Denied'), default='Pending', nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "order_item_id": self.order_item_id,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at
        }
