from app import db
from sqlalchemy.orm import validates
from sqlalchemy import event
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

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
    user = db.relationship('User', backref='orders')
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
    product = db.relationship('Product')

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

# Event listener for audit logging
@event.listens_for(Order, 'after_insert')
@event.listens_for(Order, 'after_update')
@event.listens_for(Order, 'after_delete')
def log_order_changes(mapper, connection, target):
    """Logs changes to Order model for auditing purposes."""
    action = 'created' if hasattr(target, '_sa_instance_state') and target._sa_instance_state.key is None else 'updated'
    if action == 'deleted':
        logger.info(f"Order {target.id} was deleted")
    else:
        logger.info(f"Order {target.id} was {action} with data: {target.to_dict()}")
