# services/promotions/routes.py

import datetime
from flask import Blueprint, request, jsonify, abort
from .models import Promotion, PromotionProduct
from app import db
from services.user_management.models import ActivityLog
from ..products.models import Product
from .decorators import jwt_required, role_required  # Updated import

promotions_bp = Blueprint('promotions', __name__)

@promotions_bp.route('/', methods=['GET'])
@jwt_required
def list_promotions():
    promotions = Promotion.query.all()
    return jsonify([promotion.to_dict() for promotion in promotions]), 200

@promotions_bp.route('/<int:promotion_id>', methods=['GET'])
@jwt_required
def get_promotion(promotion_id):
    promotion = Promotion.query.get_or_404(promotion_id)
    return jsonify(promotion.to_dict()), 200

@promotions_bp.route('/', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def create_promotion():
    data = request.get_json()
    required_fields = ['name', 'discount_percentage', 'start_date', 'end_date', 'applicable_tiers']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    try:
        promotion = Promotion(
            name=data['name'],
            description=data.get('description', ''),
            discount_percentage=data['discount_percentage'],
            start_date=datetime.fromisoformat(data['start_date']),
            end_date=datetime.fromisoformat(data['end_date']),
            applicable_tiers=data['applicable_tiers']
        )
        db.session.add(promotion)
        db.session.commit()

        # Associate products if provided
        product_ids = data.get('product_ids', [])
        for pid in product_ids:
            product = Product.query.get(pid)
            if product:
                promotion_product = PromotionProduct(promotion_id=promotion.id, product_id=pid)
                db.session.add(promotion_product)
        db.session.commit()

        # Log the creation
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Created promotion '{promotion.name}'")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify(promotion.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create promotion"}), 500

@promotions_bp.route('/<int:promotion_id>', methods=['PUT'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def update_promotion(promotion_id):
    promotion = Promotion.query.get_or_404(promotion_id)
    data = request.get_json()

    try:
        promotion.name = data.get('name', promotion.name)
        promotion.description = data.get('description', promotion.description)
        promotion.discount_percentage = data.get('discount_percentage', promotion.discount_percentage)
        if 'start_date' in data:
            promotion.start_date = datetime.fromisoformat(data['start_date'])
        if 'end_date' in data:
            promotion.end_date = datetime.fromisoformat(data['end_date'])
        promotion.applicable_tiers = data.get('applicable_tiers', promotion.applicable_tiers)

        # Update associated products if provided
        if 'product_ids' in data:
            # Clear existing associations
            PromotionProduct.query.filter_by(promotion_id=promotion.id).delete()
            # Add new associations
            for pid in data['product_ids']:
                product = Product.query.get(pid)
                if product:
                    promotion_product = PromotionProduct(promotion_id=promotion.id, product_id=pid)
                    db.session.add(promotion_product)

        db.session.commit()

        # Log the update
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Updated promotion '{promotion.name}'")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify(promotion.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update promotion"}), 500

@promotions_bp.route('/<int:promotion_id>', methods=['DELETE'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def delete_promotion(promotion_id):
    promotion = Promotion.query.get_or_404(promotion_id)
    try:
        # Delete associated PromotionProduct entries
        PromotionProduct.query.filter_by(promotion_id=promotion.id).delete()
        db.session.delete(promotion)
        db.session.commit()

        # Log the deletion
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Deleted promotion '{promotion.name}'")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({"message": "Promotion deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete promotion"}), 500
