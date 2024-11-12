#authentic_lebanese_sentiment_shop/app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import CSRFProtect
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate  # Import Migrate
from config import Config
import logging
from flask_cors import CORS
# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize extensions
db = SQLAlchemy()
csrf = CSRFProtect()
login_manager = LoginManager()
limiter = Limiter(get_remote_address, default_limits=["200 per day", "50 per hour"])
migrate = Migrate()  # Initialize the Migrate instance

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(Config)

    # Initialize extensions with the app
    db.init_app(app)
    #csrf.init_app(app)
    login_manager.init_app(app)
    limiter.init_app(app)
    migrate.init_app(app, db)  # Initialize Migrate with app and db

    login_manager.login_view = 'users_bp.login'
    login_manager.login_message = "Please log in to access this page."
    login_manager.session_protection = "strong"

    # Register Blueprints
    from services.orders.routes import orders_bp
    from services.products.routes import products_bp
    from services.user_management.routes import users_bp
    from services.inventory.routes import inventory_bp

    app.register_blueprint(orders_bp, url_prefix='/orders')
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(users_bp, url_prefix='/user')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')


    # # Enhanced security headers
    # @app.after_request
    # def set_secure_headers(response):
    #     response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self';"
    #     response.headers['X-Content-Type-Options'] = 'nosniff'
    #     response.headers['X-Frame-Options'] = 'DENY'
    #     response.headers['X-XSS-Protection'] = '1; mode=block'
    #     return response

    logger.info("Application initialized with enhanced security configurations.")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=False)
