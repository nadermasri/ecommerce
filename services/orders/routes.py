#authentic_lebanese_sentiment_shop/services/orders/routes.py
from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from .models import Order, OrderItem, Return
from app import db
from ..user_management.models import ActivityLog
from .decorators import role_required, jwt_required
from datetime import datetime
from ..products.models import Product
import logging

logging.basicConfig(level=logging.ERROR)

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
        status = data.get('status', 'Pending')
        delivery_option = data.get('delivery_option', 'Standard')
        order_date = data.get('order_date', datetime.utcnow())
        items = data.get('items', [])

        # Create a new Order instance with initial total_price as 0
        new_order = Order(
            user_id=user_id,
            total_price=0,  
            status=status,
            delivery_option=delivery_option,
            order_date=order_date
        )

        total_price = 0 

        # Add order items to the order
        for item in items:
            product_id = item['product_id']
            quantity = item['quantity']
            
          
            product = Product.query.get(product_id)
            if not product or product.stock < quantity:
                raise ValueError(f"Not enough stock for product ID {product_id}")
            
            # price for the order item
            item_price = product.price * quantity
            
            # Decrease product stock
            product.stock -= quantity

            # Create and add order item to the order
            order_item = OrderItem(
                product_id=product_id,
                quantity=quantity,
                price=item_price  
            )
            new_order.items.append(order_item)
            
            
            total_price += item_price

        # total_price for the order
        new_order.total_price = total_price

        
        db.session.add(new_order)
        db.session.commit()

        # Log the creation of a new order
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Order created by user {request.user_id}: {new_order.to_dict()}")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify(new_order.to_dict()), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create order due to server error"}), 500



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
        
        if new_status == 'Canceled' and order.status != 'Canceled':
            for item in order.items:
                product = item.product
                product.stock += item.quantity  # Restore stock for each item

        if new_status:
            order.status = new_status

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
        return jsonify({"error": "Failed to update order info"}), 400


# Restore stock function
def restore_stock(order):
    for item in order.items:
        product = item.product
        if product:
            product.stock += item.quantity

@orders_bp.route('/<int:order_id>', methods=['DELETE'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    try:
        restore_stock(order)
        db.session.delete(order)
        db.session.commit()

        activity_log = ActivityLog(admin_id=request.user_id, action=f"Order {order_id} deleted by user {request.user_id}")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({"message": "Order deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete order due to server error"}), 500



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
        return jsonify({"error": "Failed to track order"}), 400



# orders/routes.py
@orders_bp.route('/<int:order_id>/return_item', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
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

        if request.user_role not in ['SuperAdmin', 'OrderManager'] and order.user_id != request.user_id:
            return jsonify({"error": "Unauthorized to return this item"}), 403
        
        # order status should be 'delivered'
        if order.status.lower() != 'delivered':
            return jsonify({"error": "Items can only be returned for delivered orders"}), 400
        
        order_item = OrderItem.query.filter_by(id=order_item_id, order_id=order.id).first()
        
        if not order_item:
            return jsonify({"error": "Order item not found or does not belong to the specified order"}), 404

        # Restore stock for the returned item
        product = order_item.product
        if not product:
            return jsonify({"error": "Associated product not found"}), 404
        product.stock += order_item.quantity

        # Update the order's total price
        order.total_price -= order_item.price
        
        # Delete the returned item from the order
        db.session.delete(order_item)
        
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
            "return": new_return.to_dict()
        }), 201

    except ValueError as ve:
        db.session.rollback()
        logging.error(f"ValueError: {str(ve)}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error: {str(e)}")
        # Temporarily include the exception message for debugging
        return jsonify({"error": f"Failed to return item due to server error: {str(e)}"}), 400




@orders_bp.route('/returns', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
def get_all_returns():
    try:
        returns = Return.query.all()
        return_items = [
            return_item.to_dict() for return_item in returns
        ]
        return jsonify({"returns": return_items}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch returns"}), 400


@orders_bp.route('/returns/<int:return_id>', methods=['PUT'])
@jwt_required
@role_required(['SuperAdmin', 'OrderManager'])
def update_return(return_id):
    data = request.get_json()
    new_status = data.get('status')
    
    # Ensure a valid status is provided
    valid_statuses = ['Pending', 'Approved', 'Rejected', 'Completed']
    if new_status not in valid_statuses:
        return jsonify({"error": "Invalid status value"}), 400

    try:
        return_item = Return.query.get_or_404(return_id)

        if new_status:
            return_item.status = new_status

        
        db.session.commit()

        
        activity_log = ActivityLog(
            admin_id=request.user_id,
            action=f"Return {return_id} updated by user {request.user_id}: Status changed to {new_status}"
        )
        db.session.add(activity_log)
        db.session.commit()

        return jsonify(return_item.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update return."}), 400
