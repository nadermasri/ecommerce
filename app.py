from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import CSRFProtect
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
from config import Config
import logging
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db = SQLAlchemy()
csrf = CSRFProtect()
login_manager = LoginManager()

def custom_key_func():
    if request.method == "OPTIONS":
        return None  # Exempt OPTIONS requests from rate limiting
    return get_remote_address()

# Initialize Limiter with the custom key function
limiter = Limiter(
    key_func=custom_key_func,
    default_limits=["200 per day", "50 per hour"]
)

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    # Configure CORS to allow credentials
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    app.config.from_object(Config)

    # Initialize extensions with the app
    db.init_app(app)
    # csrf.init_app(app)  # CSRF is now managed via JWT
    login_manager.init_app(app)
    limiter.init_app(app)
    migrate.init_app(app, db)

    login_manager.login_view = 'users_bp.login'
    login_manager.login_message = "Please log in to access this page."
    login_manager.session_protection = "strong"

    # Register Blueprints with appropriate URL prefixes
    from services.orders.routes import orders_bp
    from services.products.routes import products_bp
    from services.user_management.routes import users_bp
    from services.inventory.routes import inventory_bp
    from services.cart.routes import cart_bp
    from services.promotions.routes import promotions_bp
    from services.coupons.routes import coupons_bp

    app.register_blueprint(orders_bp, url_prefix='/orders')
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(users_bp, url_prefix='/user')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(promotions_bp, url_prefix='/api/promotions')
    app.register_blueprint(coupons_bp, url_prefix='/api/coupons')

    logger.info("Application initialized with enhanced security configurations.")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=False, host='localhost')
