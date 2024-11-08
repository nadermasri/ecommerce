from flask import Blueprint, request, jsonify, abort
from flask_login import login_required, current_user
from .models import Product, Category
from app import db
import csv
import logging

products_bp = Blueprint('products', __name__)
logger = logging.getLogger(__name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

# Add a new product (admin only)
@products_bp.route('/', methods=['POST'])
@login_required
def add_product():
    # Only allow admin users
    if not current_user.is_admin:
        abort(403)

    if not request.is_json:
        abort(400, "Request must be JSON")
    
    data = request.json
    required_fields = ['name', 'description', 'cultural_background', 'price', 'stock', 'category_id']
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")

    try:
        new_product = Product(
            name=data['name'],
            description=data['description'],
            cultural_background=data['cultural_background'],
            price=data['price'],
            stock=data['stock'],
            category_id=data['category_id']
        )
        db.session.add(new_product)
        db.session.commit()

        # Log the addition for audit purposes
        logger.info(f"New product added by admin {current_user.id}: {new_product.to_dict()}")

        return jsonify(new_product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding product: {e}")
        abort(500, "An error occurred while adding the product")

# Update a product (admin only)
@products_bp.route('/<int:product_id>', methods=['PUT'])
@login_required
def update_product(product_id):
    if not current_user.is_admin:
        abort(403)

    product = Product.query.get_or_404(product_id)
    data = request.json
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.cultural_background = data.get('cultural_background', product.cultural_background)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    db.session.commit()

    # Log the update for audit
    logger.info(f"Product {product_id} updated by admin {current_user.id}")

    return jsonify(product.to_dict())

# Delete a product (admin only)
@products_bp.route('/<int:product_id>', methods=['DELETE'])
@login_required
def delete_product(product_id):
    if not current_user.is_admin:
        abort(403)

    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()

    # Log deletion for audit
    logger.info(f"Product {product_id} deleted by admin {current_user.id}")

    return jsonify({"message": "Product deleted"})

# Generate inventory report (admin only)
@products_bp.route('/inventory/report', methods=['GET'])
@login_required
def inventory_report():
    if not current_user.is_admin:
        abort(403)

    products = Product.query.all()
    report = {
        'total_products': len(products),
        'low_stock_products': [p.to_dict() for p in products if p.check_stock_level() == "Low Stock"],
        'top_products': sorted(products, key=lambda x: x.stock, reverse=True)[:10]
    }

    logger.info(f"Inventory report generated by admin {current_user.id}")

    return jsonify(report)

# Bulk upload products from CSV (admin only)
@products_bp.route('/bulk_upload', methods=['POST'])
@login_required
def bulk_upload_products():
    if not current_user.is_admin:
        abort(403)

    file = request.files.get('file')
    if not file:
        abort(400, "CSV file required")

    reader = csv.DictReader(file.stream)
    try:
        for row in reader:
            product = Product(
                name=row['name'],
                description=row['description'],
                cultural_background=row['cultural_background'],
                price=row['price'],
                stock=row['stock'],
                category_id=row['category_id']
            )
            db.session.add(product)
        db.session.commit()

        logger.info(f"Bulk upload by admin {current_user.id}")

        return jsonify({"message": "Bulk upload successful"})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Bulk upload failed: {e}")
        abort(500, "Bulk upload failed")

# Set a promotion for a product (admin only)
@products_bp.route('/<int:product_id>/set_promotion', methods=['PUT'])
@login_required
def set_promotion(product_id):
    if not current_user.is_admin:
        abort(403)

    product = Product.query.get_or_404(product_id)
    data = request.json
    product.price = data.get('discounted_price', product.price)
    db.session.commit()

    logger.info(f"Promotion set for product {product_id} by admin {current_user.id}")

    return jsonify({"message": "Promotion set for product", "product": product.to_dict()})
