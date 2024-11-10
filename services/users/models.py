#authentic_lebanese_sentiment_shop/services/users/models.py
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates
import logging

logger = logging.getLogger(__name__)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    membership_tier = db.Column(db.Enum('Normal', 'Premium', 'Gold'), default='Normal')
    address = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    wishlist = db.Column(db.JSON)  # JSON field to store a list of product IDs
    preferences = db.Column(db.JSON)  # JSON field for storing user-specific settings

    # Relationship with orders
    orders = db.relationship('Order', backref='user_orders', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "membership_tier": self.membership_tier,
            "address": self.address,
            "phone_number": self.phone_number,
            "wishlist": self.wishlist,
            "preferences": self.preferences
        }


class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('InventoryManager', 'OrderManager', 'CustomerSupport', 'SuperAdmin'), nullable=False)

    # Relationship with activity logs
    activity_logs = db.relationship('ActivityLog', backref='admin_activity_logs', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        return self.role in ['InventoryManager', 'OrderManager', 'CustomerSupport', 'SuperAdmin']
    
    @property
    def is_super_admin(self):
        return self.role == 'SuperAdmin'
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role
        }

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin_users.id'), nullable=False)
    action = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=db.func.now())

    def __repr__(self):
        return f"<ActivityLog {self.action} by Admin {self.admin_id} at {self.timestamp}>"

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "action": self.action,
            "timestamp": self.timestamp.isoformat()  # Converts datetime to a string
        }