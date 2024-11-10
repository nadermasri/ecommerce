#authentic_lebanese_sentiment_shop/services/users/routes.py
from flask import Blueprint, request, jsonify, abort, current_app
from flask_login import login_required, current_user, login_user
import smtplib
from email.mime.text import MIMEText
import jwt
from datetime import datetime, timedelta
from app import db, limiter
from .models import User, AdminUser, ActivityLog
from .utils import validate_email, validate_password, is_email_exist, is_username_exist, validate_username
import logging

users_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)

# Utility to create JWT token
def create_jwt_token(user):
    payload = {
        "user_id": user.id,
        "username": user.username,
        "role": getattr(user, 'role', None),  # Only AdminUser will have a role attribute
        "exp": datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")
    return token

# Decode and verify JWT
def verify_jwt(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        abort(401, "Token expired, please log in again")
    except jwt.InvalidTokenError:
        abort(401, "Invalid token, please log in")

# Registration route for regular users
@users_bp.route('/register', methods=['POST'])
def register_user():
    data = request.json
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data:
            abort(400, f"{field} is required")

    if not validate_email(data['email']):
        return jsonify({"error": "Invalid email format"}), 400

    if not validate_password(data['password']):
        return jsonify({"error": "Password does not meet complexity requirements"}), 400
    
    unvalidated, msg= validate_username(data['username'])
    if unvalidated:
        return msg
    
    if is_email_exist():
        return jsonify({"error": "Email already exists"}), 400
    
    if is_username_exist():
        return jsonify({"error": "Username already exists"}), 400
    

    new_user = User(
        username=data['username'],
        email=data['email'],
        membership_tier=data.get('membership_tier', 'Normal'),
        address=data.get('address', ''),
        phone_number=data.get('phone number', ''),
        wishlist=data.get('wishlist', []),          
        preferences=data.get('preferences', {})
    )

    new_user.set_password(data['password'])  # Hash the password
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

# Login route for both regular users and admin users
@users_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = AdminUser.query.filter_by(username=username).first() or User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        token = create_jwt_token(user)
        return jsonify({"message": "Login successful", "token": token}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

#To protect routes with JWT authentication
def jwt_required(f):
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            abort(401, "Token is missing")
        token = token.split(" ")[1]  # Extract token part if format is "Bearer <token>"
        payload = verify_jwt(token)
        request.user_id = payload["user_id"]
        request.user_role = payload.get("role")  # Only AdminUser will have a role
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Endpoint to create a new admin (SuperAdmin only)
@users_bp.route('/admins/create', methods=['POST'])
@jwt_required
def create_admin():
    if request.user_role != 'SuperAdmin':
        abort(403, "Only SuperAdmin can create new admin accounts")

    data = request.json
    allowed_roles = ['InventoryManager', 'OrderManager', 'CustomerSupport', 'SuperAdmin']
    
    role = data.get('role', 'CustomerSupport')  
    if role not in allowed_roles:
        abort(400, f"Invalid role. Allowed roles are: {', '.join(allowed_roles)}")


    admin = AdminUser(
        username=data['username'],
        email=data['email'],
        role=data.get('role', 'CustomerSupport')
    )
    admin.set_password(data['password'])
    db.session.add(admin)
    db.session.commit()

    # Log the admin creation
    activity_log = ActivityLog(admin_id=request.user_id, action=f"Created admin {admin.username}")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify({"message": "Admin created", "admin": admin.to_dict()}), 201

# Endpoint to get user profile (JWT protected)
@users_bp.route('/users/<int:user_id>/profile', methods=['GET'])
@jwt_required
def get_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    if request.user_id != user_id and (request.user_role != 'SuperAdmin' or request.user_role != 'CustomerSupport'):
        abort(403, "Unauthorized access")
    return jsonify(user.to_dict())

# Update profile endpoint for users (JWT protected)
@users_bp.route('/users/<int:user_id>/profile', methods=['PUT'])
@jwt_required
def update_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    if request.user_id != user_id and request.user_role != 'SuperAdmin':
        abort(403, "Unauthorized action")

    data = request.json
    changes = []  # Track changed fields for logging purposes
    
    if 'username' in data and data['username'] != user.username:
        changes.append('username')
        user.username = data['username']
    if 'email' in data and data['email'] != user.email:
        changes.append('email')
        user.email = data['email']
    if 'address' in data and data['address'] != user.address:
        changes.append('address')
        user.address = data['address']
    if 'phone_number' in data and data['phone_number'] != user.phone_number:
        changes.append('phone_number')
        user.phone_number = data['phone_number']
    if 'membership_tier' in data and data['membership_tier'] != user.membership_tier:
        changes.append('membership_tier')
        user.membership_tier = data['membership_tier']
    if 'wishlist' in data and data['wishlist'] != user.wishlist:
        changes.append('wishlist')
        user.wishlist = data['wishlist']
    if 'preferences' in data and data['preferences'] != user.preferences:
        changes.append('preferences')
        user.preferences = data['preferences']
    if 'password' in data:
        changes.append('password')
        user.set_password(data['password'])
    
    db.session.commit()

    # Only log if the user has an admin role
    if request.user_role in ['SuperAdmin', 'Admin']:
        action_details = f"Updated fields: {', '.join(changes)}"
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Updated user profile {user_id}. {action_details}")
        db.session.add(activity_log)
        db.session.commit()

    return jsonify(user.to_dict())

# Get all users (SuperAdmin-only)
@users_bp.route('/', methods=['GET'])
@jwt_required
def get_users():
    if request.user_role != 'SuperAdmin':
        abort(403, "Access denied. Only SuperAdmin can access all users.")

    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# Delete user (only SuperAdmin or the user themselves can delete)
@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)

    # Only allow deletion if the user is the owner of the account or a SuperAdmin
    if request.user_id != user.id and request.user_role != 'SuperAdmin':
        abort(403, "Unauthorized action. Only SuperAdmin or the user can delete this account.")

    db.session.delete(user)
    db.session.commit()

    # Log deletion only if performed by an admin
    if request.user_role == 'SuperAdmin':
        activity_log = ActivityLog(admin_id=request.user_id, action=f"Deleted user {user_id}")
        db.session.add(activity_log)
        db.session.commit()
    
    return jsonify({"message": "User deleted"})


# Get activity logs (restricted based on admin role)
@users_bp.route('/admin/activity_logs', methods=['GET'])
@jwt_required
def get_activity_logs():
    if request.user_role != 'SuperAdmin':
        # SuperAdmin can access all logs
        logs = ActivityLog.query.all()
    elif request.user_role != 'InventoryManager' or request.user_role != 'OrderManager' or request.user_role != 'CustomerSupport':
        # Other admin roles can only access their own activity logs
        logs = ActivityLog.query.filter_by(admin_id=request.user_id).all()
    else:
        return jsonify({"message": "You don't have access to perform this function"})

    return jsonify([log.to_dict() for log in logs])


# # Customer Support Request with Rate Limiting --> this must go to customer support service 
# @limiter.limit("5 per minute")  # Rate limit to 5 requests per minute
# @users_bp.route('/support', methods=['POST'])
# def customer_support():
#     data = request.json
#     email = data.get('email')
#     subject = data.get('subject', 'Support Request').strip()
#     message = data.get('message', '').strip()

#     if not email or not message:
#         abort(400, "Email and message are required")

#     msg = MIMEText(message)
#     msg['From'] = current_app.config['EMAIL_USER']
#     msg['To'] = current_app.config['EMAIL_USER']
#     msg['Subject'] = subject[:100]

#     try:
#         with smtplib.SMTP(current_app.config['EMAIL_HOST'], current_app.config['EMAIL_PORT']) as server:
#             server.starttls()
#             server.login(current_app.config['EMAIL_USER'], current_app.config['EMAIL_PASSWORD'])
#             server.sendmail(current_app.config['EMAIL_USER'], current_app.config['EMAIL_USER'], msg.as_string())
#         logger.info(f"Support request received from {email}")
#         return jsonify({"message": "Support request received"}), 200
#     except smtplib.SMTPException as e:
#         logger.error(f"Failed to send support email: {e}")
#         return jsonify({"error": "Failed to send support request"}), 500

#customer management service --- needs updating 
# @users_bp.route('/segmentation', methods=['GET'])
# @login_required
# def customer_segmentation():
#     if not current_user.is_admin:
#         abort(403, "Unauthorized action")

#     all_users = User.query.all()
#     segmentation = {
#         'repeat_buyers': [user.to_dict() for user in all_users if user.orders.count() > 3],
#         'high_spenders': [user.to_dict() for user in all_users if sum(order.total_price for order in user.orders) > 1000]
#     }

#     logger.info(f"Customer segmentation generated by admin {current_user.id}")

#     return jsonify(segmentation)

# @users_bp.route('/admin/activity_logs', methods=['GET'])
# @login_required
# def get_activity_logs():
#     if not current_user.is_admin:
#         abort(403, "Access denied")

#     logs = ActivityLog.query.all()
#     return jsonify([log.to_dict() for log in logs])


