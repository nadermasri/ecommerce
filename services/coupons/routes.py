# services/coupons/routes.py

from flask import Blueprint, request, jsonify, abort
from .models import Coupon
from app import db
from services.user_management.models import ActivityLog
from ..promotions.models import Promotion
from .decorators import jwt_required, role_required  # Updated import
from datetime import datetime
from services.orders.models import Order  # Ensure Order model is imported if needed

coupons_bp = Blueprint('coupons', __name__)

@coupons_bp.route('/', methods=['GET'])
@jwt_required
def list_coupons():
    user_id = request.user_id
    # Fetch coupons applicable to the user or universal coupons
    coupons = Coupon.query.filter(
        (Coupon.user_id == user_id) | (Coupon.user_id == None)
    ).all()
    return jsonify([coupon.to_dict() for coupon in coupons]), 200

@coupons_bp.route('/<int:coupon_id>', methods=['GET'])
@jwt_required
def get_coupon(coupon_id):
    user_id = request.user_id
    coupon = Coupon.query.get_or_404(coupon_id)
    if coupon.user_id and coupon.user_id != user_id:
        abort(403, "You are not authorized to view this coupon")
    return jsonify(coupon.to_dict()), 200

@coupons_bp.route('/', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def create_coupon():
    data = request.get_json()
    required_fields = ['code', 'promotion_id', 'expiration_date']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    try:
        # Check if the promotion exists
        promotion = Promotion.query.get(data['promotion_id'])
        if not promotion:
            return jsonify({"error": "Associated promotion not found"}), 404

        # Ensure the coupon code is unique
        existing_coupon = Coupon.query.filter_by(code=data['code']).first()
        if existing_coupon:
            return jsonify({"error": "Coupon code already exists"}), 400

        coupon = Coupon(
            code=data['code'],
            promotion_id=data['promotion_id'],
            user_id=data.get('user_id'),  # Optional for user-specific coupons
            expiration_date=datetime.fromisoformat(data['expiration_date']),
            usage_limit=data.get('usage_limit')
        )
        db.session.add(coupon)
        db.session.commit()

        # Log the creation
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Created coupon '{coupon.code}'")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify(coupon.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create coupon"}), 500

@coupons_bp.route('/<int:coupon_id>', methods=['PUT'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def update_coupon(coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    data = request.get_json()

    try:
        if 'code' in data:
            # Ensure the new code is unique
            existing_coupon = Coupon.query.filter_by(code=data['code']).first()
            if existing_coupon and existing_coupon.id != coupon.id:
                return jsonify({"error": "Coupon code already exists"}), 400
            coupon.code = data['code']

        if 'promotion_id' in data:
            promotion = Promotion.query.get(data['promotion_id'])
            if not promotion:
                return jsonify({"error": "Associated promotion not found"}), 404
            coupon.promotion_id = data['promotion_id']

        if 'expiration_date' in data:
            coupon.expiration_date = datetime.fromisoformat(data['expiration_date'])

        if 'user_id' in data:
            coupon.user_id = data['user_id']  # Assign to a specific user

        if 'usage_limit' in data:
            coupon.usage_limit = data['usage_limit']

        db.session.commit()

        # Log the update
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Updated coupon '{coupon.code}'")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify(coupon.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update coupon"}), 500

@coupons_bp.route('/<int:coupon_id>', methods=['DELETE'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def delete_coupon(coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    try:
        db.session.delete(coupon)
        db.session.commit()

        # Log the deletion
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Deleted coupon '{coupon.code}'")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({"message": "Coupon deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete coupon"}), 500

@coupons_bp.route('/apply', methods=['POST'])
@jwt_required
def apply_coupon():
    user_id = request.user_id
    data = request.get_json()

    coupon_code = data.get('coupon_code')
    order_id = data.get('order_id')  # Assuming you have an order to apply the coupon to

    if not coupon_code or not order_id:
        return jsonify({"error": "Coupon code and Order ID are required"}), 400

    coupon = Coupon.query.filter_by(code=coupon_code).first()
    if not coupon:
        return jsonify({"error": "Invalid coupon code"}), 404

    if coupon.user_id and coupon.user_id != user_id:
        return jsonify({"error": "This coupon is not assigned to you"}), 403

    if not coupon.is_valid():
        return jsonify({"error": "Coupon is no longer valid"}), 400

    # Assuming you have an Order model and a way to associate the coupon with the order
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    if order.coupon_id:
        return jsonify({"error": "A coupon has already been applied to this order"}), 400

    # Apply the promotion's discount to the order
    promotion = coupon.promotion
    discount_amount = (promotion.discount_percentage / 100) * float(order.total_price)
    order.total_price -= discount_amount
    order.coupon_id = coupon.id

    # Increment the coupon usage
    coupon.increment_usage()
    db.session.commit()

    # Log the application
    activity_log = ActivityLog(admin_id=user_id, action=f"Applied coupon '{coupon.code}' to order {order_id}")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify({
        "message": "Coupon applied successfully",
        "discount_amount": discount_amount,
        "new_total_price": order.total_price
    }), 200
