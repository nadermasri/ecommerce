#authentic_lebanese_sentiment_shop/services/products/routes.py
from flask import Blueprint, request, jsonify, abort
from .models import Product, Category, Subcategory
from .decorators import role_required, jwt_required
from app import db
import csv
from ..user_management.models import ActivityLog

products_bp = Blueprint('products', __name__)


@products_bp.route('/', methods=['GET'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@products_bp.route('/add', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def add_product():
    if not request.is_json:
        abort(400, "Request must be JSON")
    
    data = request.json
    required_fields = ['name', 'description', 'price', 'stock', 'category_id']
    for field in required_fields:
        if field not in data:
            abort(400, f"Missing required field: {field}")

    try:
        new_product = new_product = Product(
            name=data['name'],
            description=data['description'],
            price=data['price'],
            stock=data.get('stock', 0),
            stock_threshold=data.get('stock_threshold', 10),
            category_id=data['category_id'],
            subcategory_id=data.get('subcategory_id'), 
            image=data.get('image'),
        )
        db.session.add(new_product)
        db.session.commit()

        # Log the prodcut additon 
        activity_log = ActivityLog(admin_id=request.user_id, action=f"New product added by admin {request.user_id}: {new_product.to_dict()}")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify(new_product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.json

    # Update the product fields with new values or keep the existing values
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.stock_threshold = data.get('stock_threshold', product.stock_threshold)
    product.image = data.get('image', product.image)
    product.subcategory_id = data.get('subcategory_id', product.subcategory_id)

    
    db.session.commit()

    # Log the update for audit purposes
    activity_log = ActivityLog(admin_id=request.user_id, action=f"Product {product_id} updated by admin {request.user_id}")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify(product.to_dict()), 200


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()

    # Log deletion for audit
    activity_log = ActivityLog(admin_id=request.user_id, action=f"Product {product_id} deleted by admin {request.user_id}")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify({"message": "Product deleted"})



@products_bp.route('/bulk_upload', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def bulk_upload_products():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.csv'):
        abort(400, "CSV file required")

    reader = csv.DictReader(file.stream)
    products_added = 0

    try:
        for row in reader:
            # Validate required fields in each row
            required_fields = ['name', 'description', 'price', 'stock', 'category_id']
            for field in required_fields:
                if field not in row or not row[field]:
                    abort(400, f"Missing required field in CSV: {field}")

            # Create Product instance for each row
            product = Product(
                name=row['name'],
                description=row.get('description', ''),
                price=float(row['price']),
                stock=int(row['stock']),
                stock_threshold=int(row.get('stock_threshold', 10)), 
                image=row.get('image'),
                category_id=int(row['category_id']),
                subcategory_id=int(row['subcategory_id']) if row.get('subcategory_id') else None
            )
            db.session.add(product)
            products_added += 1

        db.session.commit()

        activity_log = ActivityLog(admin_id=request.user_id, action=f"Bulk upload by admin {request.user_id} added {products_added} products.")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({"message": f"Bulk upload successful. {products_added} products added."}), 201
    except Exception as e:
        db.session.rollback()
        abort(500, "Bulk upload failed")


@products_bp.route('/<int:product_id>/set_promotion', methods=['PUT'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def set_promotion(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.json
    # Validate that discounted_price is provided and is less than the original price
    discounted_price = data.get('discounted_price')
    if discounted_price is None:
        abort(400, "Discounted price is required")
    if float(discounted_price) >= float(product.price):
        abort(400, "Discounted price must be less than the original price")

    product.price = discounted_price
    db.session.commit()

    activity_log = ActivityLog(admin_id=request.user_id, action=f"Promotion set for product {product_id} by admin {request.user_id}")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify({"message": "Promotion set for product", "product": product.to_dict()})

