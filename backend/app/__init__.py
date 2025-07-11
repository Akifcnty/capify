from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.config import config
from app.extensions import db
from flask_migrate import Migrate
import os
import logging
from logging.handlers import RotatingFileHandler
from .extensions import make_celery

jwt = JWTManager()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per minute"],
    storage_uri="memory://"
)

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__, static_folder="static", template_folder="static")
    
    # Configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    if config_name == 'development':
        CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    else:
        CORS(app, resources={r"/*": {"origins": app.config['CORS_ORIGINS']}}, supports_credentials=True)
    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    migrate = Migrate(app, db)
    celery = make_celery(app)
    app.celery = celery
    
    # Security headers
    @app.after_request
    def add_security_headers(response):
        if 'SECURE_HEADERS' in app.config:
            for header, value in app.config['SECURE_HEADERS'].items():
                response.headers[header] = value
        return response
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.facebook import facebook_bp
    from app.routes.gtm_verification import gtm_verification_bp
    from app.routes.logs import logs_bp
    from app.routes.health import health_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(facebook_bp, url_prefix='/api/facebook')
    app.register_blueprint(gtm_verification_bp, url_prefix='/api/user')
    app.register_blueprint(logs_bp, url_prefix='/api/logs')
    app.register_blueprint(health_bp, url_prefix='')
    
    # Configure SSL
    from app.utils.ssl_config import configure_ssl
    configure_ssl()
    
    # JSON error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found', 'message': 'The requested resource was not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': 'Bad request', 'message': 'Invalid request data'}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'error': 'Forbidden', 'message': 'Access denied'}), 403

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'CAPIFY API is running'}), 200

    # React frontend serving route (must be last to catch all non-API routes)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        # Don't serve React for API routes
        if path.startswith('api/') or path.startswith('health'):
            return jsonify({'error': 'Not found', 'message': 'API endpoint not found'}), 404
        
        # Serve static files if they exist
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            # Serve index.html for all other routes (React router)
            return send_from_directory(app.static_folder, 'index.html')

    return app