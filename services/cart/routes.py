# services/cart/routes.py

from flask import Blueprint, request, jsonify, abort
from .models import Cart, CartItem
from app import db
from services.user_management.models import ActivityLog
from ..products.models import Product
from .decorators import jwt_required, role_required  # Updated import

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@jwt_required
def view_cart():
    user_id = request.user_id
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({"cart": []}), 200
    return jsonify(cart.to_dict()), 200

@cart_bp.route('/add', methods=['POST'])
@jwt_required
def add_to_cart():
    user_id = request.user_id
    data = request.get_json()

    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    if product.stock < quantity:
        return jsonify({"error": "Insufficient stock available"}), 400

    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()

    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)

    product.stock -= quantity
    db.session.commit()

    # Log the action
    activity_log = ActivityLog(admin_id=user_id, action=f"Added product {product_id} to cart")
    db.session.add(activity_log)
    db.session.commit()
    pass

    return jsonify({"message": "Product added to cart", "cart_item": cart_item.to_dict()}), 201


@cart_bp.route('/remove', methods=['POST'])
@jwt_required
def remove_from_cart():
    user_id = request.user_id
    data = request.get_json()

    product_id = data.get('product_id')

    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400

    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    if not cart_item:
        return jsonify({"error": "Product not found in cart"}), 404

    product = Product.query.get(product_id)
    if product:
        product.stock += cart_item.quantity

    db.session.delete(cart_item)
    db.session.commit()

    # Log the action
    activity_log = ActivityLog(admin_id=user_id, action=f"Removed product {product_id} from cart")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify({"message": "Product removed from cart"}), 200

@cart_bp.route('/update', methods=['PUT'])
@jwt_required
def update_cart_item():
    user_id = request.user_id
    data = request.get_json()

    product_id = data.get('product_id')
    new_quantity = data.get('quantity')

    if not product_id or new_quantity is None:
        return jsonify({"error": "Product ID and new quantity are required"}), 400

    if new_quantity <= 0:
        return jsonify({"error": "Quantity must be greater than zero"}), 400

    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    if not cart_item:
        return jsonify({"error": "Product not found in cart"}), 404

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Calculate the difference in quantity
    quantity_diff = new_quantity - cart_item.quantity
    if quantity_diff > 0 and product.stock < quantity_diff:
        return jsonify({"error": "Insufficient stock available"}), 400

    # Update stock levels
    product.stock -= quantity_diff
    cart_item.quantity = new_quantity
    db.session.commit()

    # Log the action
    activity_log = ActivityLog(admin_id=user_id, action=f"Updated product {product_id} quantity to {new_quantity} in cart")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify({"message": "Cart updated successfully", "cart_item": cart_item.to_dict()}), 200

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required
def clear_cart():
    user_id = request.user_id
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    # Restore stock levels
    for item in cart.items:
        product = Product.query.get(item.product_id)
        if product:
            product.stock += item.quantity
        db.session.delete(item)

    db.session.commit()

    # Log the action
    activity_log = ActivityLog(admin_id=user_id, action="Cleared the cart")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify({"message": "Cart cleared successfully"}), 200
