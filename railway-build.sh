#!/bin/bash

echo "🚀 Starting Railway build process..."

# Frontend build
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Copy build files to backend static directory
echo "📋 Copying frontend build files to backend..."
cp -r build/* ../backend/app/static/

# Backend setup
echo "🐍 Setting up backend..."
cd ../backend
pip install -r requirements.txt

echo "✅ Build process completed!"
echo "📁 Frontend build files copied to backend/app/static/" 