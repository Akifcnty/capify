#!/bin/bash

# CAPIFY Database Backup Script
set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="capify_db"
DB_USER="capify_user"
DB_HOST="localhost"
DB_PORT="5432"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
echo "🗄️ Creating database backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_DIR/capify_backup_$DATE.sql

# Compress backup
echo "📦 Compressing backup..."
gzip $BACKUP_DIR/capify_backup_$DATE.sql

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "capify_backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/capify_backup_$DATE.sql.gz"

# Optional: Upload to cloud storage
# echo "☁️ Uploading to cloud storage..."
# aws s3 cp $BACKUP_DIR/capify_backup_$DATE.sql.gz s3://your-bucket/backups/ 