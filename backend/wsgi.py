import os
from app import create_app
from app.utils.ssl_config import configure_ssl

# Configure SSL/TLS for Railway
configure_ssl()

# Set environment
os.environ.setdefault('FLASK_ENV', 'production')

# Create app instance
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5050))
    app.run(host='0.0.0.0', port=port) 