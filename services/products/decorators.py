from functools import wraps
from flask import request, abort
import jwt as pyjwt  
from config import Config
from flask import current_app

def role_required(allowed_roles):
    """Decorator to restrict access based on user roles."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if user_role in request matches one of the allowed roles
            if request.user_role not in allowed_roles:
                abort(403, "Access denied. You do not have permission to perform this action.")
            return f(*args, **kwargs)
        return decorated_function
    return decorator



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
        token = request.cookies.get("jwt_token")
        if not token:
            abort(401, "JWT token is missing")

        # Verify JWT
        payload = verify_jwt(token)
        request.user_id = payload["user_id"]
        request.user_role = payload.get("role")
        
        # Check CSRF token for state-changing requests
        if request.method in ["POST", "PUT", "DELETE"]:
            csrf_token = request.cookies.get("csrf_token")
            request_csrf_token = request.headers.get("X-CSRF-Token")
            if not csrf_token or not request_csrf_token or csrf_token != request_csrf_token:
                abort(403, "Invalid CSRF token")


        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

