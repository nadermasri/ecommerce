#authentic_lebanese_sentiment_shop/services/inventory/routes.py
from flask import Blueprint, request, jsonify, abort
from .models import Inventory
from app import db
from ..user_management.models import ActivityLog
from .decorators import jwt_required, role_required
from ..products.models import Product
from ..orders.models import OrderItem
from sqlalchemy import func, desc


inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/update_stock', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'InventoryManager'])
def update_stock():
    data = request.get_json()
    product_id = data.get('product_id')
    location = data.get('location')
    new_stock_level = data.get('stock_level')

    try:
        # Find or create the inventory record for the product at the specific location
        inventory_record = Inventory.query.filter_by(product_id=product_id, location=location).first()

        if not inventory_record:
            inventory_record = Inventory(product_id=product_id, location=location, stock_level=new_stock_level)
            db.session.add(inventory_record)
        else:
            inventory_record.stock_level = new_stock_level

        db.session.commit()

        # Log the inventory additon 
        activity_log = ActivityLog(admin_id=request.user_id, action=f"New inventory added/updated by admin {request.user_id}")
        db.session.add(activity_log)
        db.session.commit()


        return jsonify({"message": "Stock updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@inventory_bp.route('/low_stock_alerts', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'InventoryManager'])
def low_stock_alerts():
    try:
        low_stock_products = Inventory.query.join(Product).filter(Inventory.stock_level <= Product.stock_threshold).all()
        alerts = [{"product_id": item.product_id, "location": item.location, "stock_level": item.stock_level} for item in low_stock_products]
        return jsonify({"low_stock_alerts": alerts}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route('/inventory_report', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'InventoryManager'])
def inventory_report():
    try:
        # Fetching inventory turnover data for a report
        report_data = db.session.query(Product.name, func.sum(OrderItem.quantity).label('total_sold'))\
                                .join(OrderItem, OrderItem.product_id == Product.id)\
                                .group_by(Product.name)\
                                .order_by(desc('total_sold')).all()

        report = [{"product_name": item[0], "total_sold": item[1]} for item in report_data]
        return jsonify({"inventory_report": report}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
