#!/bin/bash

echo "🚀 Starting CAPIFY Services..."

# Kill any existing processes on ports 5050 and 3000
echo "🔄 Cleaning up existing processes..."
lsof -ti:5050 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend
echo "🐍 Starting Backend (Flask) on port 5050..."
cd backend
source venv/bin/activate
export REQUESTS_CA_BUNDLE=/Users/nb/Desktop/CAPIFY\ 2/backend/venv/lib/python3.13/site-packages/certifi/cacert.pem
python run.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting Frontend (React) on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Services started!"
echo "📊 Backend: http://localhost:5050"
echo "🌐 Frontend: http://localhost:3000"
echo "🏥 Health Check: http://localhost:5050/health"
echo ""
echo "To stop services, run: kill $BACKEND_PID $FRONTEND_PID"
echo "Or use: pkill -f 'python run.py' && pkill -f 'react-scripts'" 