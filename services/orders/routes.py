#authentic_lebanese_sentiment_shop/services/orders/routes.py
from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from .models import Order, OrderItem, Return
from app import db
from ..user_management.models import ActivityLog
from .decorators import role_required, jwt_required
from datetime import datetime

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('/', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
def get_orders():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders])


@orders_bp.route('/', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
def create_order():
    # Ensure JSON data is present in the request
    if not request.is_json:
        raise BadRequest("Invalid input; JSON data required.")

    data = request.json

    try:
        # Retrieve and validate order data
        user_id = data.get('user_id')
        total_price = data.get('total_price')
        status = data.get('status', 'Pending')
        delivery_option = data.get('delivery_option', 'Standard')
        order_date = data.get('order_date', datetime.utcnow())
        items = data.get('items', [])
        
        # Create a new Order instance
        new_order = Order(
            user_id=user_id,
            total_price=total_price,
            status=status,
            delivery_option=delivery_option,
            order_date=order_date
        )
        
        # Add order items to the order
        for item in items:
            order_item = OrderItem(
                product_id=item['product_id'],
                quantity=item['quantity'],
                price=item['price']
            )
            new_order.items.append(order_item)
        
        # Save the order to the database
        db.session.add(new_order)
        db.session.commit()

        #Log the creation of a new order
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Order created by user {request.user_id}: {new_order.to_dict()}")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify(new_order.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@orders_bp.route('/<int:order_id>/update_info', methods=['PUT'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
def update_order_info(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()

    try:
        # Validate and update status if provided
        valid_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled']
        new_status = data.get('status')
        if new_status and new_status not in valid_statuses:
            raise BadRequest("Invalid status value")
        if new_status:
            order.status = new_status

        # Update total_price if provided and valid
        new_total_price = data.get('total_price')
        if new_total_price is not None:
            try:
                order.total_price = float(new_total_price)
            except ValueError:
                raise BadRequest("Invalid total_price value. Must be a number.")

        # Update delivery_option if provided
        valid_delivery_options = ['Standard', 'Express', 'In-Store Pickup']
        new_delivery_option = data.get('delivery_option')
        if new_delivery_option and new_delivery_option not in valid_delivery_options:
            raise BadRequest("Invalid delivery option value")
        if new_delivery_option:
            order.delivery_option = new_delivery_option

        # Commit changes to the database
        db.session.commit()

        # Log the update for audit purposes
        updated_fields = {k: v for k, v in data.items() if v is not None}
        activity_log = ActivityLog(
            admin_id=request.user_id,
            action=f"Order {order_id} updated by user {request.user_id}: {updated_fields}"
        )
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({
            "message": "Order information updated successfully",
            "order": order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@orders_bp.route('/<int:order_id>', methods=['DELETE'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    try:
        db.session.delete(order)
        db.session.commit()

        # Log the deletion for audit purposes
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Order {order_id} deleted by user {request.user_id}")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({"message": "Order deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@orders_bp.route('/track/<int:order_id>', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
def track_order(order_id):
    try:
        order = Order.query.get_or_404(order_id)

        return jsonify({
            "message": "Order tracked successfully",
            "order": order.to_dict()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400



@orders_bp.route('/<int:order_id>/return_item', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager', 'Customer'])
def return_item(order_id):
    data = request.get_json()
    
    # Ensure necessary fields are present
    order_item_id = data.get('order_item_id')
    reason = data.get('reason')

    if not order_item_id or not reason:
        return jsonify({"error": "order_item_id and reason are required"}), 400

    try:
        # Find the order and ensure the item belongs to the order
        order = Order.query.get_or_404(order_id)
        order_item = OrderItem.query.filter_by(id=order_item_id, order_id=order.id).first()
        
        if not order_item:
            return jsonify({"error": "Order item not found or does not belong to the specified order"}), 404

        # Create the return entry
        new_return = Return(
            order_item_id=order_item_id,
            reason=reason,
            status="Pending"  
        )
        
        db.session.add(new_return)
        db.session.commit()

        return jsonify({
            "message": "Return request created successfully",
            "return": {
                "id": new_return.id,
                "order_item_id": new_return.order_item_id,
                "reason": new_return.reason,
                "status": new_return.status,
                "created_at": new_return.created_at
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

