#!/bin/bash

echo "Starting CAPIFY Frontend..."

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes found on port 3000"

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
echo "Checking dependencies..."
npm install

# Start the React application
echo "Starting React application..."
npm start 