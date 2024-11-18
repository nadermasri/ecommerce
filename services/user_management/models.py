#authentic_lebanese_sentiment_shop/services/users/models.py
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates


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
    wishlist = db.Column(db.JSON)  # List of product IDs
    preferences = db.Column(db.JSON)  # User-specific settings

    # Relationships
    orders = db.relationship('Order', back_populates='user', lazy=True)
    cart = db.relationship('Cart', uselist=False, back_populates='user')  # One-to-one relationship with Cart

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
    role = db.Column(db.Enum('InventoryManager', 'OrderManager', 'ProductManager', 'SuperAdmin'), nullable=False)

    # Relationship with activity logs
    activity_logs = db.relationship('ActivityLog', backref='admin_activity_logs', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        return self.role in ['InventoryManager', 'OrderManager', 'ProductManager', 'SuperAdmin']
    
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
    action = db.Column(db.Text, nullable=False)
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
    

class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    address_line1 = db.Column(db.String(255), nullable=False)
    address_line2 = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    is_default = db.Column(db.Boolean, default=False)

    # Relationships
    user = db.relationship('User', backref='addresses')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "address_line1": self.address_line1,
            "address_line2": self.address_line2,
            "city": self.city,
            "state": self.state,
            "postal_code": self.postal_code,
            "country": self.country,
            "is_default": self.is_default
        }

    @validates('is_default')
    def validate_default(self, key, value):
        if value:
            # Ensure only one default address per user
            existing_default = Address.query.filter_by(user_id=self.user_id, is_default=True).first()
            if existing_default and existing_default.id != self.id:
                raise ValueError("Only one default address is allowed per user")
        return value
