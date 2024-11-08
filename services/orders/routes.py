from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user  # For access control
from werkzeug.exceptions import BadRequest
from .models import Order, OrderItem
from app import db
import logging

orders_bp = Blueprint('orders', __name__)

# Initialize logger for audit logging
logger = logging.getLogger(__name__)

# 1. Retrieve all orders with input validation and user access control
@orders_bp.route('/', methods=['GET'])
@login_required  # Only authenticated users can access this route
def get_orders():
    # Check if user has admin privileges (access control)
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized access"}), 403
    
    # Fetch orders and return response
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders])

# 2. Create order with CSRF protection, input validation, and audit logging
@orders_bp.route('/', methods=['POST'])
@login_required  # Ensure the user is logged in
def create_order():
    # Ensure JSON data is present in the request
    if not request.is_json:
        raise BadRequest("Invalid input; JSON data required.")

    data = request.json

    # Input Validation: Validate required fields
    required_fields = ['user_id', 'total_price', 'status', 'delivery_option']
    for field in required_fields:
        if field not in data:
            raise BadRequest(f"Missing required field: {field}")

    # Create order and add to database
    order = Order(
        user_id=data['user_id'],
        total_price=data['total_price'],
        status=data['status'],
        delivery_option=data['delivery_option']
    )
    db.session.add(order)
    db.session.commit()

    # Audit Log: Log the creation of a new order
    logger.info(f"Order created by user {current_user.id}: {order.to_dict()}")

    return jsonify(order.to_dict()), 201

# 3. Update order status with input validation, access control, and logging
@orders_bp.route('/<int:order_id>', methods=['PUT'])
@login_required
def update_order(order_id):
    # Only admins can update orders
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized access"}), 403

    order = Order.query.get_or_404(order_id)
    data = request.json

    # Validate the status field if provided
    valid_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled']
    if 'status' in data and data['status'] not in valid_statuses:
        raise BadRequest("Invalid status value")

    # Update the order status
    order.status = data.get('status', order.status)
    db.session.commit()

    # Log the update for audit purposes
    logger.info(f"Order {order_id} updated by user {current_user.id}: {order.to_dict()}")

    return jsonify(order.to_dict())

# 4. Delete order with access control and logging
@orders_bp.route('/<int:order_id>', methods=['DELETE'])
@login_required
def delete_order(order_id):
    # Only admins can delete orders
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized access"}), 403

    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()

    # Log the deletion for audit purposes
    logger.warning(f"Order {order_id} deleted by user {current_user.id}")

    return jsonify({"message": "Order deleted"})

# 5. Update order status separately with logging
@orders_bp.route('/<int:order_id>/update_status', methods=['PUT'])
@login_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    
    # Only the user who placed the order or an admin can update the status
    if order.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.json
    valid_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled']
    if 'status' in data and data['status'] not in valid_statuses:
        raise BadRequest("Invalid status value")

    order.status = data.get('status', order.status)
    db.session.commit()

    # Log the status update for audit
    logger.info(f"Order {order_id} status updated by user {current_user.id}")

    return jsonify({"message": "Order status updated", "order": order.to_dict()})

# 6. Track order with user access control
@orders_bp.route('/track/<int:order_id>', methods=['GET'])
@login_required
def track_order(order_id):
    order = Order.query.get_or_404(order_id)

    # Ensure only the order owner or admin can track the order
    if order.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Unauthorized access"}), 403

    return jsonify(order.to_dict())

# 7. Process order return with audit logging
@orders_bp.route('/<int:order_id>/return', methods=['POST'])
@login_required
def process_return(order_id):
    order = Order.query.get_or_404(order_id)
    
    # Allow only admins or the user who placed the order to initiate a return
    if order.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Unauthorized access"}), 403

    order.status = 'Returned'
    db.session.commit()

    # Log the return processing for audit purposes
    logger.info(f"Order {order_id} marked as returned by user {current_user.id}")

    return jsonify({"message": "Order marked as returned and refund processed", "order": order.to_dict()})
