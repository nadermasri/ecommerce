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

@inventory_bp.route('/all', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'InventoryManager'])
def view_all_inventory():
    try:
        inventory_records = Inventory.query.all()
        
        inventory_list = [
            {
                "id": record.id,
                "product_id": record.product_id,
                "location": record.location,
                "stock_level": record.stock_level,
                "last_updated": record.last_updated
            }
            for record in inventory_records
        ]
        
        return jsonify({"inventory": inventory_list}), 200

    except Exception as e:
        return jsonify({"error": "Failed to process request."}), 500


@inventory_bp.route('/add', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'InventoryManager'])
def add_inventory():
    data = request.get_json()
    try:
        product_id = int(data.get('product_id')) 
        location = str(data.get('location')).strip()  
        stock_level = int(data.get('stock_level', 0))  

    except (TypeError, ValueError):
        return jsonify({"error": "Invalid input types"}), 400
    

    try:
        # Check if the product exists
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404

        # Check if an inventory record for this product and location already exists
        existing_inventory = Inventory.query.filter_by(product_id=product_id, location=location).first()
        if existing_inventory:
            return jsonify({"message": "Inventory record for this product and location already exists"}), 400

        # Create a new Inventory record
        new_inventory = Inventory(
            product_id=product_id,
            location=location,
            stock_level=stock_level
        )
        db.session.add(new_inventory)
        
        # Update the product's total stock to include the new inventory stock level
        total_stock_level = db.session.query(db.func.sum(Inventory.stock_level)).filter_by(product_id=product_id).scalar()
        product.stock = total_stock_level

        
        db.session.commit()

        
        activity_log = ActivityLog(admin_id=request.user_id, action=f"New inventory added by admin {request.user_id}")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({"message": "Inventory added successfully", "inventory": {
            "product_id": product_id,
            "location": location,
            "stock_level": stock_level
        }}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while processing the request."}), 500


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
            return jsonify({"message": "Inventory Item Not Found"}), 400
        else:
            inventory_record.stock_level = new_stock_level

        # Update the Product's stock level
            product = Product.query.get(product_id)
            if product:
                # Update the product's stock level to the new stock level
                product.stock = new_stock_level

        db.session.commit()

        # Log the inventory additon 
        activity_log = ActivityLog(admin_id=request.user_id, action=f"New inventory updated by admin {request.user_id}")
        db.session.add(activity_log)
        db.session.commit()


        return jsonify({"message": "Stock updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to process request."}), 500


@inventory_bp.route('/low_stock_alerts', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'InventoryManager'])
def low_stock_alerts():
    try:
        low_stock_products = db.session.query(Inventory)\
            .join(Product, Inventory.product_id == Product.id)\
            .filter(Inventory.stock_level <= Product.stock_threshold).all()
            
        alerts = [{"product_id": item.product_id, "location": item.location, "stock_level": item.stock_level} for item in low_stock_products]
        
        return jsonify({"low_stock_alerts": alerts}), 200

    except Exception as e:
        return jsonify({"error": "Could not retrieve low stock alerts"}), 500


@inventory_bp.route('/inventory_report', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'InventoryManager'])
def inventory_report():
    try:
        report_data = db.session.query(Product.name, func.sum(OrderItem.quantity).label('total_sold'))\
            .join(OrderItem, OrderItem.product_id == Product.id)\
            .group_by(Product.name)\
            .order_by(desc('total_sold')).all()

        report = [{"product_name": item[0], "total_sold": int(item[1])} for item in report_data]
        
        return jsonify({"inventory_report": report}), 200

    except Exception as e:
        return jsonify({"error": "Could not generate inventory report"}), 500

