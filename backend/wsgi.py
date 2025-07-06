import os
from app import create_app

# Set environment
os.environ.setdefault('FLASK_ENV', 'production')

# Create app instance
app = create_app()

if __name__ == "__main__":
    app.run() 