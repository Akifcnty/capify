# Multi-stage build for frontend and backend

# Stage 1: Build frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend

# Copy frontend package files
COPY ../frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY ../frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Backend with frontend static files
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        postgresql-client \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Copy frontend build files from stage 1
COPY --from=frontend-builder /app/frontend/build/ ./app/static/

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5050/health || exit 1

# Run the application
CMD ["gunicorn", "--config", "gunicorn.conf.py", "wsgi:app"] 