# services/coupons/models.py

from app import db
from datetime import datetime
from services.promotions.models import Promotion  # Correct import

class Coupon(db.Model):
    __tablename__ = 'coupons'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    promotion_id = db.Column(db.Integer, db.ForeignKey('promotions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Optional for user-specific coupons
    expiration_date = db.Column(db.DateTime, nullable=False)
    usage_limit = db.Column(db.Integer, nullable=True)  # Optional limit on how many times a coupon can be used
    usage_count = db.Column(db.Integer, default=0)  # Tracks how many times the coupon has been used

    # Relationships
    user = db.relationship('User', backref='coupons')
    associated_orders = db.relationship('Order', backref='associated_coupon')  # Renamed backref

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "promotion_id": self.promotion_id,
            "user_id": self.user_id,
            "expiration_date": self.expiration_date.isoformat(),
            "usage_limit": self.usage_limit,
            "usage_count": self.usage_count
        }

    def is_valid(self):
        """Check if the coupon is still valid."""
        if self.expiration_date < datetime.utcnow():
            return False
        if self.usage_limit is not None and self.usage_count >= self.usage_limit:
            return False
        return True

    def increment_usage(self):
        """Increment the usage count of the coupon."""
        self.usage_count += 1
        db.session.commit()
