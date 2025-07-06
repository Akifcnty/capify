#!/bin/bash

echo "🛑 Stopping CAPIFY Services..."

# Stop backend processes
echo "🐍 Stopping Backend..."
pkill -f "python run.py" 2>/dev/null || true

# Stop frontend processes
echo "⚛️  Stopping Frontend..."
pkill -f "react-scripts" 2>/dev/null || true

# Kill any remaining processes on ports 5050 and 3000
echo "🧹 Cleaning up ports..."
lsof -ti:5050 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "✅ Services stopped!" 