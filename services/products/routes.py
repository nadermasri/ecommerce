#authentic_lebanese_sentiment_shop/services/products/routes.py
from flask import Blueprint, request, jsonify, abort
from .models import Product, Category, Subcategory
from .decorators import role_required, jwt_required
from app import db
import csv
from ..user_management.models import ActivityLog
import os
import magic  # For file signature checking
import pyclamd  # For virus scanning
import tempfile
from werkzeug.utils import secure_filename

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
        return jsonify({"error": "Failed to add a product. Please try again."}), 500


@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def update_product(product_id):
    try:
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
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to process request"}), 500


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def delete_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()

        # Log deletion for audit
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Product {product_id} deleted by admin {request.user_id}")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({"message": "Product deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to process request"}), 500



# Allowed extensions
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@products_bp.route('/bulk_upload', methods=['POST'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def bulk_upload_products():
    file = request.files.get('file')
    # Check if file is received
    if file is None:
        return "No file was uploaded.", 400
    
    
    if not allowed_file(file.filename):
        return "Only CSV files are allowed", 400

    # Secure the filename and save it temporarily in the system's temp directory
    filename = secure_filename(file.filename)
    temp_file_path = os.path.join(tempfile.gettempdir(), filename)
    file.save(temp_file_path)

    # Check MIME type to ensure it's CSV
    mime_type = file.mimetype
    if mime_type not in ['text/csv', 'application/vnd.ms-excel']:
        os.remove(temp_file_path)
        abort(400, "Invalid file type. Only CSV files are allowed")

    # Verify file signature to ensure it’s a CSV file
    mime = magic.Magic(mime=True)
    file_signature_type = mime.from_file(temp_file_path)
    if file_signature_type not in ['text/csv', 'text/plain']:
        os.remove(temp_file_path)
        abort(400, "Invalid file signature. Only CSV files are allowed")

    # Limit file size (to 2 MB) to prevent DoS attack
    if os.path.getsize(temp_file_path) > 2 * 1024 * 1024:
        os.remove(temp_file_path)
        abort(413, "File too large")

    # Proceed with processing the CSV content if it passed all checks
    products_added = 0
    try:
        with open(temp_file_path, 'r') as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                # Validate required fields in each row
                required_fields = ['name', 'description', 'price', 'stock', 'category_id']
                for field in required_fields:
                    if field not in row or not row[field]:
                        os.remove(temp_file_path)
                        abort(400, f"Missing required field in CSV: {field}")

                # Parse and validate each field with explicit casting
                price = float(row['price'])
                stock = int(row['stock'])
                stock_threshold = int(row.get('stock_threshold', 10))
                category_id = int(row['category_id'])
                subcategory_id = int(row['subcategory_id']) if row.get('subcategory_id') else None

                product = Product(
                    name=row['name'],
                    description=row.get('description', ''),
                    price=price,
                    stock=stock,
                    stock_threshold=stock_threshold,
                    image=row.get('image'),
                    category_id=category_id,
                    subcategory_id=subcategory_id
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
        return jsonify({"error": "Bulk Upload failed."}), 500
    finally:
        # Clean up the temporary file
        os.remove(temp_file_path)


@products_bp.route('/<int:product_id>/set_promotion', methods=['PUT'])
@jwt_required
@role_required(['SuperAdmin', 'ProductManager'])
def set_promotion(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.json
        # Validate that discounted_price is provided and is less than the original price
        discounted_price = data.get('discounted_price')
        if discounted_price is None:
            abort(400, "Discounted price is required")
        if float(discounted_price) >= float(product.price):
            abort(400, "Discounted price must be less than the original price")

        try:
            discounted_price = float(discounted_price)
        except (TypeError, ValueError):
            abort(400, "Discounted price must be a valid number")

        if discounted_price <= 0:
            abort(400, "Discounted price must be a positive number")
        if discounted_price >= float(product.price):
            abort(400, "Discounted price must be less than the original price")

        product.price = discounted_price
        db.session.commit()

        activity_log = ActivityLog(admin_id=request.user_id, action=f"Promotion set for product {product_id} by admin {request.user_id}")
        db.session.add(activity_log)
        db.session.commit()

        return jsonify({"message": "Promotion set for product", "product": product.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to process request"}), 500

