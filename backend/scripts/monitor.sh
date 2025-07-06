#!/bin/bash

# CAPIFY System Monitoring Script
set -e

# Configuration
API_URL="http://localhost:5050"
LOG_FILE="/var/log/capify/monitor.log"
ALERT_EMAIL="admin@capify.com"

# Create log directory
mkdir -p /var/log/capify

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Check API health
check_api_health() {
    log "🔍 Checking API health..."
    if curl -f -s $API_URL/health > /dev/null; then
        log "✅ API is healthy"
        return 0
    else
        log "❌ API health check failed"
        return 1
    fi
}

# Check database connection
check_database() {
    log "🗄️ Checking database connection..."
    if docker-compose exec -T backend flask db current > /dev/null 2>&1; then
        log "✅ Database connection is healthy"
        return 0
    else
        log "❌ Database connection failed"
        return 1
    fi
}

# Check Redis connection
check_redis() {
    log "🔴 Checking Redis connection..."
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        log "✅ Redis is healthy"
        return 0
    else
        log "❌ Redis connection failed"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    log "💾 Checking disk space..."
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 80 ]; then
        log "⚠️ Disk usage is high: ${DISK_USAGE}%"
        return 1
    else
        log "✅ Disk usage is normal: ${DISK_USAGE}%"
        return 0
    fi
}

# Check memory usage
check_memory() {
    log "🧠 Checking memory usage..."
    MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    if [ $MEMORY_USAGE -gt 80 ]; then
        log "⚠️ Memory usage is high: ${MEMORY_USAGE}%"
        return 1
    else
        log "✅ Memory usage is normal: ${MEMORY_USAGE}%"
        return 0
    fi
}

# Check Docker containers
check_containers() {
    log "🐳 Checking Docker containers..."
    if docker-compose ps | grep -q "Up"; then
        log "✅ All containers are running"
        return 0
    else
        log "❌ Some containers are not running"
        return 1
    fi
}

# Send alert
send_alert() {
    local message="$1"
    log "🚨 ALERT: $message"
    # Uncomment to send email alerts
    # echo "$message" | mail -s "CAPIFY Alert" $ALERT_EMAIL
}

# Main monitoring function
main() {
    log "🚀 Starting system monitoring..."
    
    local failed_checks=0
    
    # Run all checks
    check_api_health || ((failed_checks++))
    check_database || ((failed_checks++))
    check_redis || ((failed_checks++))
    check_disk_space || ((failed_checks++))
    check_memory || ((failed_checks++))
    check_containers || ((failed_checks++))
    
    # Summary
    if [ $failed_checks -eq 0 ]; then
        log "🎉 All systems are healthy!"
    else
        log "⚠️ $failed_checks check(s) failed"
        send_alert "CAPIFY monitoring detected $failed_checks issue(s)"
    fi
    
    log "🏁 Monitoring completed"
}

# Run monitoring
main 