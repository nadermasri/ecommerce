from flask import Blueprint, request, jsonify, abort, current_app
from flask_login import login_required, current_user
import smtplib
from email.mime.text import MIMEText
from app import db, limiter
from .models import User, AdminUser, ActivityLog
import logging

users_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)

@users_bp.route('/', methods=['GET'])
@login_required
def get_users():
    if not current_user.is_admin:
        abort(403, "Access denied")

    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@users_bp.route('/', methods=['POST'])
def add_user():
    data = request.json

    # Check for required fields and validate data
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data:
            abort(400, f"{field} is required")

    new_user = User(
        username=data['username'],
        email=data['email'],
        membership_tier=data.get('membership_tier', 'Normal'),
        address=data.get('address', ''),
        phone=data.get('phone', '')
    )
    new_user.set_password(data['password'])  # Hash the password

    db.session.add(new_user)
    db.session.commit()

    # Log user addition for audit
    logger.info(f"User added: {new_user.to_dict()}")

    return jsonify(new_user.to_dict()), 201

@users_bp.route('/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    if current_user.id != user.id and not current_user.is_admin:
        abort(403, "Unauthorized action")

    data = request.json
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.address = data.get('address', user.address)
    user.phone = data.get('phone', user.phone)
    user.membership_tier = data.get('membership_tier', user.membership_tier)
    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()

    # Log update for audit
    logger.info(f"User {user_id} updated by {current_user.id}")

    return jsonify(user.to_dict())

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if current_user.id != user.id and not current_user.is_admin:
        abort(403, "Unauthorized action")

    db.session.delete(user)
    db.session.commit()

    # Log deletion for audit
    logger.info(f"User {user_id} deleted by {current_user.id}")

    return jsonify({"message": "User deleted"})

@users_bp.route('/<int:user_id>/profile', methods=['GET'])
@login_required
def view_profile(user_id):
    user = User.query.get_or_404(user_id)
    if current_user.id != user.id and not current_user.is_admin:
        abort(403, "Unauthorized action")
    return jsonify(user.to_dict())

@users_bp.route('/segmentation', methods=['GET'])
@login_required
def customer_segmentation():
    if not current_user.is_admin:
        abort(403, "Unauthorized action")

    all_users = User.query.all()
    segmentation = {
        'repeat_buyers': [user.to_dict() for user in all_users if user.orders.count() > 3],
        'high_spenders': [user.to_dict() for user in all_users if sum(order.total_price for order in user.orders) > 1000]
    }

    logger.info(f"Customer segmentation generated by admin {current_user.id}")

    return jsonify(segmentation)

@users_bp.route('/admin/activity_logs', methods=['GET'])
@login_required
def get_activity_logs():
    if not current_user.is_admin:
        abort(403, "Access denied")

    logs = ActivityLog.query.all()
    return jsonify([log.to_dict() for log in logs])

@users_bp.route('/admin/<int:admin_id>/set_role', methods=['PUT'])
@login_required
def set_admin_role(admin_id):
    if not current_user.is_super_admin:
        abort(403, "Only SuperAdmin can change roles")

    admin = AdminUser.query.get_or_404(admin_id)
    data = request.json
    if 'role' in data:
        admin.role = data['role']
    db.session.commit()

    logger.info(f"Admin role for {admin_id} updated by SuperAdmin {current_user.id}")

    return jsonify({"message": "Admin role updated", "admin": admin.to_dict()})

@limiter.limit("5 per minute")  # Rate limit to 5 requests per minute
@users_bp.route('/support', methods=['POST'])
def customer_support():
    data = request.json
    email = data.get('email')
    subject = data.get('subject', 'Support Request').strip()
    message = data.get('message', '').strip()

    if not email or not message:
        abort(400, "Email and message are required")

    # Sanitize and prepare email message
    msg = MIMEText(message)
    msg['From'] = current_app.config['EMAIL_USER']
    msg['To'] = current_app.config['EMAIL_USER']
    msg['Subject'] = subject[:100]  # Truncate subject to prevent abuse

    try:
        with smtplib.SMTP(current_app.config['EMAIL_HOST'], current_app.config['EMAIL_PORT']) as server:
            server.starttls()
            server.login(current_app.config['EMAIL_USER'], current_app.config['EMAIL_PASSWORD'])
            server.sendmail(current_app.config['EMAIL_USER'], current_app.config['EMAIL_USER'], msg.as_string())

        logger.info(f"Support request received from {email}")

        return jsonify({"message": "Support request received"}), 200
    except smtplib.SMTPException as e:
        logger.error(f"Failed to send support email: {e}")
        return jsonify({"error": "Failed to send support request"}), 500
