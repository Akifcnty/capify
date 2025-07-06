#!/bin/bash

echo "Starting CAPIFY Backend..."

# Kill any existing processes on port 5050
echo "Checking for existing processes on port 5050..."
lsof -ti:5050 | xargs kill -9 2>/dev/null || echo "No processes found on port 5050"

# Navigate to backend directory
cd backend

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Set environment variables for SSL
export REQUESTS_CA_BUNDLE=$(python -c "import certifi; print(certifi.where())")
export SSL_CERT_FILE=$(python -c "import certifi; print(certifi.where())")

echo "Environment variables set:"
echo "REQUESTS_CA_BUNDLE: $REQUESTS_CA_BUNDLE"
echo "SSL_CERT_FILE: $SSL_CERT_FILE"

# Start the Flask application
echo "Starting Flask application..."
python run.py 