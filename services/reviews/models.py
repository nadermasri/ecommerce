from app import db
from sqlalchemy.orm import validates
import logging

logger = logging.getLogger(__name__)

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    product = db.relationship('Product', backref='reviews')
    user = db.relationship('User', backref='reviews')

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @validates('rating')
    def validate_rating(self, key, value):
        """Ensure rating is within the valid range (1-5)."""
        if not (1 <= value <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return value

    @validates('comment')
    def validate_comment(self, key, value):
        """Limit comment length to prevent abuse."""
        if value and len(value) > 1000:
            raise ValueError("Comment length must be less than 1000 characters")
        return value

# Event listener for audit logging
from sqlalchemy import event

@event.listens_for(Review, 'after_insert')
@event.listens_for(Review, 'after_update')
@event.listens_for(Review, 'after_delete')
def log_review_changes(mapper, connection, target):
    action = 'created' if target._sa_instance_state.key is None else 'updated'
    if action == 'deleted':
        logger.info(f"Review {target.id} was deleted.")
    else:
        logger.info(f"Review {target.id} was {action} with data: {target.to_dict()}")
