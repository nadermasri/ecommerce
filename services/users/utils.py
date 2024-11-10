# app/utils.py

import re
from .models import User

def validate_password(password):
    """
    Validates a password to ensure it meets the following criteria:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character (e.g., !@#$%^&*())
    
    Returns True if valid, False otherwise.
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):  # At least one uppercase letter
        return False
    if not re.search(r"[a-z]", password):  # At least one lowercase letter
        return False
    if not re.search(r"[0-9]", password):  # At least one digit
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):  # At least one special character
        return False
    return True


def validate_email(email):
    # Simple regex for email validation
    email_regex = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    return re.match(email_regex, email) is not None

def is_email_exist(email):
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return True
    else:
        return False
    
def validate_username(username):
    """
    Validates that the username:
    - Is not empty
    - Does not contain spaces
    
    Returns True if valid, raises a ValueError if invalid.
    """
    if not username:
        return True, "Username cannot be empty."
    
    if " " in username:
        return True, "Username cannot contain spaces."
    
    return False
    

def is_username_exist(username):
    # Check if username already exists in the database
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return True
    else:
        return False