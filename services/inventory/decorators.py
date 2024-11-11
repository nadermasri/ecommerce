from functools import wraps
from flask import request, abort
import jwt  
from config import Config

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



def jwt_required(f):
    """Decorator to ensure that the request contains a valid JWT token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Retrieve the token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            abort(401, "Authorization token required")

        try:
            # Check the token format (assuming "Bearer <token>")
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            request.user_id = payload.get("user_id")
            request.user_role = payload.get("role")  # Make sure your JWT includes user role
        except (IndexError, jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            abort(401, f"Invalid token: {str(e)}")

        return f(*args, **kwargs)
    return decorated_function
