import os
from app import create_app
from app.utils.ssl_config import configure_ssl

# Configure SSL settings
configure_ssl()

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"Starting CAPIFY server on {host}:{port}")
    app.run(host=host, port=port, debug=False) 