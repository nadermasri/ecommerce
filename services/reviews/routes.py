from flask import Blueprint, request, jsonify, abort
from flask_login import login_required, current_user
from .models import Review
from app import db
import logging

reviews_bp = Blueprint('reviews', __name__)
logger = logging.getLogger(__name__)

@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    reviews = Review.query.all()
    return jsonify([review.to_dict() for review in reviews])

# Add a new review with validation and access control
@reviews_bp.route('/', methods=['POST'])
@login_required
def add_review():
    if not request.is_json:
        abort(400, "Request must be JSON")

    data = request.json
    required_fields = ['product_id', 'rating']
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")

    try:
        # Ensure the user can only post a review if they have bought the product (if needed)
        new_review = Review(
            product_id=data['product_id'],
            user_id=current_user.id,
            rating=data['rating'],
            comment=data.get('comment', '')
        )
        db.session.add(new_review)
        db.session.commit()

        # Log addition for auditing
        logger.info(f"Review added by user {current_user.id} for product {data['product_id']}")

        return jsonify(new_review.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding review: {e}")
        abort(500, "An error occurred while adding the review")

# Update an existing review (user can only edit their own review)
@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@login_required
def update_review(review_id):
    review = Review.query.get_or_404(review_id)

    # Ensure that only the user who created the review can update it
    if review.user_id != current_user.id:
        abort(403)

    data = request.json
    review.rating = data.get('rating', review.rating)
    review.comment = data.get('comment', review.comment)
    db.session.commit()

    # Log update for auditing
    logger.info(f"Review {review_id} updated by user {current_user.id}")

    return jsonify(review.to_dict())

# Delete a review (user can only delete their own review)
@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@login_required
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)

    # Ensure that only the user who created the review can delete it
    if review.user_id != current_user.id:
        abort(403)

    db.session.delete(review)
    db.session.commit()

    # Log deletion for auditing
    logger.info(f"Review {review_id} deleted by user {current_user.id}")

    return jsonify({"message": "Review deleted"})
