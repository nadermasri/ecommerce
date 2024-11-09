#authentic_lebanese_sentiment_shop/services/users/models.py
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates
import logging

logger = logging.getLogger(__name__)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    membership_tier = db.Column(db.Enum('Normal', 'Premium', 'Gold'), default='Normal')
    address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=db.func.now())

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'membership_tier': self.membership_tier,
            'address': self.address,
            'phone': self.phone,
            'created_at': self.created_at
        }

    @validates('username', 'email', 'phone')
    def validate_fields(self, key, value):
        """Validates user input for username, email, and phone number."""
        if key == 'username' and (not value or len(value) > 255):
            raise ValueError("Username must be non-empty and less than 255 characters")
        if key == 'email' and (not value or "@" not in value or len(value) > 255):
            raise ValueError("Invalid email address")
        if key == 'phone' and (len(value) > 20):
            raise ValueError("Phone number must be 20 characters or less")
        return value

class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('InventoryManager', 'OrderManager', 'CustomerSupport', 'SuperAdmin'), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        # Consider both 'SuperAdmin' and any other admin roles as admin
        return self.role in ['InventoryManager', 'OrderManager', 'CustomerSupport', 'SuperAdmin']

    @property
    def is_super_admin(self):
        # Only return True if the user has the 'SuperAdmin' role
        return self.role == 'SuperAdmin'

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(db.Integer, primary_key=True)
    admin_user_id = db.Column(db.Integer, db.ForeignKey('admin_users.id'))
    action = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=db.func.now())

    admin_user = db.relationship('AdminUser', backref='activity_logs')
