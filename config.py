import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Core Security Configurations
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_SECURE = True  # Ensures cookies are only sent over HTTPS
    SESSION_COOKIE_HTTPONLY = True  # Prevents JavaScript access to session cookies
    SESSION_COOKIE_SAMESITE = 'Lax'  # Restricts cookie to first-party contexts
    WTF_CSRF_ENABLED = True  # Enables CSRF protection globally
    PERMANENT_SESSION_LIFETIME = 1800  # 30 minutes for session expiration

    # Logging and Debugging
    LOGGING_LEVEL = os.getenv('LOGGING_LEVEL', 'INFO')
    DEBUG = False  # Set to False in production

    # Rate Limiting (optional, if needed for enhanced API security)
    RATE_LIMIT = os.getenv('RATE_LIMIT', '200 per day; 50 per hour')  # Example rate limit settings

    # JWT and Password Hashing (if using JWTs or Bcrypt for password management)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-default-jwt-secret')
    BCRYPT_LOG_ROUNDS = 12  # Adjust based on security/performance needs

    # Email configurations for Customer Support
    EMAIL_HOST = os.getenv('EMAIL_HOST')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
    EMAIL_USER = os.getenv('EMAIL_USER')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

    # Security-enhancing Headers (Optional)
    SECURITY_HEADERS = {
        "Content-Security-Policy": "default-src 'self'; script-src 'self';",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
    }
