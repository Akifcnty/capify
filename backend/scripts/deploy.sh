#!/bin/bash

# CAPIFY Production Deployment Script
set -e

echo "🚀 Starting CAPIFY deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p ssl

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend flask db upgrade

# Create admin user if needed
echo "👤 Creating admin user..."
docker-compose exec backend python -c "
from app import create_app
from app.models.user import User
from app.extensions import db
from app.utils.hashing import hash_password

app = create_app()
with app.app_context():
    if not User.query.filter_by(email='admin@capify.com').first():
        admin = User(
            email='admin@capify.com',
            password=hash_password('admin123'),
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        print('Admin user created: admin@capify.com / admin123')
    else:
        print('Admin user already exists')
"

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:5050/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📊 Services:"
echo "   - Backend API: http://localhost:5050"
echo "   - Frontend: http://localhost:3000"
echo "   - Health Check: http://localhost:5050/health"
echo ""
echo "🔧 Admin Panel: http://localhost:3000"
echo "   Email: admin@capify.com"
echo "   Password: admin123"
echo ""
echo "📝 Logs: docker-compose logs -f [service_name]" 