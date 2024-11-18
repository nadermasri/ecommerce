# services/promotions/decorators.py

from functools import wraps
from flask import request, abort
import jwt  
from config import Config

def role_required(allowed_roles):
    """Decorator to restrict access based on user roles."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Ensure user_role is set by jwt_required
            if not hasattr(request, 'user_role'):
                abort(401, "Unauthorized: No role information found.")
            
            if request.user_role not in allowed_roles:
                abort(403, "Access denied. You do not have permission to perform this action.")
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def jwt_required(f):
    """Decorator to ensure that the request contains a valid JWT token and CSRF token for state-changing requests."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Retrieve JWT from HTTP-only cookie
        token = request.cookies.get("jwt_token")
        if not token:
            abort(401, "JWT token required")

        try:
            # Decode and verify JWT
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            request.user_id = payload.get("user_id")
            request.user_role = payload.get("role")
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            abort(401, f"Invalid token: {str(e)}")

        # For state-changing requests, verify CSRF token
        if request.method in ["POST", "PUT", "DELETE"]:
            csrf_token = request.cookies.get("csrf_token")  # CSRF token from accessible cookie
            request_csrf_token = request.headers.get("X-CSRF-Token")  # CSRF token from request header

            if not csrf_token or not request_csrf_token or csrf_token != request_csrf_token:
                abort(403, "Invalid CSRF token")

        return f(*args, **kwargs)

    return decorated_function
