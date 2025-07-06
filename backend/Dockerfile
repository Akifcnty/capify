# 1. Frontend build için Node imajı
FROM node:18 as frontend
WORKDIR /app/frontend
COPY ../frontend/package*.json ./
RUN npm install
COPY ../frontend ./
RUN npm run build

# 2. Backend için Python imajı
FROM python:3.10-slim as backend
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Frontend build dosyalarını backend'e kopyala
COPY --from=frontend /app/frontend/build /app/app/static

# 4. Backend kodunu kopyala
COPY . /app/app

# 5. Giriş komutu
CMD ["gunicorn", "-b", "0.0.0.0:5050", "app.run:app"]

# Use Python 3.11 slim image
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
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

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