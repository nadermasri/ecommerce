#authentic_lebanese_sentiment_shop/services/users/routes.py
from flask import Blueprint, request, jsonify, abort, current_app
import smtplib
from email.mime.text import MIMEText
# import jwt
import jwt as pyjwt
from datetime import datetime, timedelta
from app import db, limiter
from .models import User, AdminUser, ActivityLog
from .utils import validate_email, validate_password, is_email_exist, is_username_exist, validate_username


users_bp = Blueprint('users', __name__)


# Utility to create JWT token
def create_jwt_token(user):
    payload = {
        "user_id": user.id,
        "username": user.username,
        "role": getattr(user, 'role', None),  # Only AdminUser will have a role attribute
        "exp": datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    }
    token = pyjwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")
    return token

# Decode and verify JWT
def verify_jwt(token):
    try:
        payload = pyjwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload
    except pyjwt.ExpiredSignatureError:
        abort(401, "Token expired, please log in again")
    except pyjwt.InvalidTokenError:
        abort(401, "Invalid token, please log in")

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


# Registration route for regular users
@users_bp.route('/register', methods=['POST'])
def register_user():
    data = request.json
    try:
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                abort(400, f"{field} is required")

        if not validate_email(data['email']):
            abort(400,"Invalid email format")

        if not validate_password(data['password']):
            abort(400, "Password does not meet complexity requirements")
        
        unvalidated, msg= validate_username(data['username'])
        if unvalidated:
            return msg
        
        if is_email_exist(data['email']):
            abort(400, "Email already exists")
        
        if is_username_exist(data['username']):
            abort(400, "Username already exists")
        

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
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

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


# Endpoint to create a new admin (SuperAdmin only)
@users_bp.route('/admins/create', methods=['POST'])
@jwt_required
def create_admin():
    if request.user_role != 'SuperAdmin':
        abort(403, "Only SuperAdmin can create new admin accounts")

    data = request.json
    allowed_roles = ['InventoryManager', 'OrderManager', 'ProductManager', 'SuperAdmin']
    
    role = data.get('role')  
    if not role or role not in allowed_roles:
        abort(400, f"Invalid role. Allowed roles are: {', '.join(allowed_roles)}")


    admin = AdminUser(
        username=data['username'],
        email=data['email'],
        role=data.get('role')
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
    if request.user_id != user_id and (request.user_role != 'SuperAdmin'):
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

# Get all admins (SuperAdmin-only)
@users_bp.route('/admins', methods=['GET'])
@jwt_required
def get_all_admin_users():
    if request.user_role != 'SuperAdmin':
        abort(403, "Access denied. Only SuperAdmin can access all users.")

    admin_users = AdminUser.query.all()

    return jsonify([admin_user.to_dict() for admin_user in admin_users]), 200

@users_bp.route('/admins/<int:user_id>', methods=['PUT'])
@jwt_required
def update_admin_user(user_id):
    if request.user_role != 'SuperAdmin':
        abort(403, "Access denied. Only SuperAdmin can access all users.")
    data = request.json
    admin_user = AdminUser.query.get_or_404(user_id)

    # Update allowed fields
    if 'username' in data:
        admin_user.username = data['username']
    if 'email' in data:
        admin_user.email = data['email']
    if 'role' in data:
        if data['role'] not in ['InventoryManager', 'OrderManager', 'ProductManager', 'SuperAdmin']:
            return jsonify({"error": "Invalid role"}), 400
        admin_user.role = data['role']
    if 'password' in data:
        admin_user.set_password(data['password'])

    db.session.commit()

    activity_log = ActivityLog(admin_id=request.user_id, action=f"Updated admin {user_id}")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify(admin_user.to_dict()), 200


@users_bp.route('/admins/<int:user_id>', methods=['DELETE'])
@jwt_required
def delete_admin_user(user_id):
    if request.user_role != 'SuperAdmin':
        abort(403, "Access denied. Only SuperAdmin can access all users.")
        
    admin_user = AdminUser.query.get_or_404(user_id)
    db.session.delete(admin_user)
    db.session.commit()

    activity_log = ActivityLog(admin_id=request.user_id, action=f"Deleted admin {user_id}")
    db.session.add(activity_log)
    db.session.commit()

    return jsonify({"message": "Admin user deleted successfully"}), 200


# Get activity logs (restricted based on admin role)
@users_bp.route('/admin/activity_logs', methods=['GET'])
@jwt_required
def get_activity_logs():
    if request.user_role != 'SuperAdmin':
        # SuperAdmin can access all logs
        logs = ActivityLog.query.all()
    elif request.user_role != 'InventoryManager' or request.user_role != 'OrderManager' or request.user_role != 'ProductManager':
        # Other admin roles can only access their own activity logs
        logs = ActivityLog.query.filter_by(admin_id=request.user_id).all()
    else:
        return jsonify({"message": "You don't have access to perform this function"})

    return jsonify([log.to_dict() for log in logs])

