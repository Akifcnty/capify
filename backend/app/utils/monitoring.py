import time
import psutil
import logging
from functools import wraps
from flask import request, g
from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Number of active connections')
MEMORY_USAGE = Gauge('memory_usage_bytes', 'Memory usage in bytes')
CPU_USAGE = Gauge('cpu_usage_percent', 'CPU usage percentage')

logger = logging.getLogger(__name__)

def monitor_request():
    """Monitor HTTP requests"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            
            # Increment active connections
            ACTIVE_CONNECTIONS.inc()
            
            try:
                response = f(*args, **kwargs)
                status_code = response[1] if isinstance(response, tuple) else 200
                
                # Record metrics
                REQUEST_COUNT.labels(
                    method=request.method,
                    endpoint=request.endpoint,
                    status=status_code
                ).inc()
                
                REQUEST_LATENCY.observe(time.time() - start_time)
                
                return response
                
            except Exception as e:
                # Record error metrics
                REQUEST_COUNT.labels(
                    method=request.method,
                    endpoint=request.endpoint,
                    status=500
                ).inc()
                
                REQUEST_LATENCY.observe(time.time() - start_time)
                raise
                
            finally:
                # Decrement active connections
                ACTIVE_CONNECTIONS.dec()
                
        return decorated_function
    return decorator

def update_system_metrics():
    """Update system metrics"""
    try:
        # Memory usage
        memory = psutil.virtual_memory()
        MEMORY_USAGE.set(memory.used)
        
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        CPU_USAGE.set(cpu_percent)
        
    except Exception as e:
        logger.error(f"Error updating system metrics: {e}")

def get_metrics():
    """Get Prometheus metrics"""
    update_system_metrics()
    return generate_latest()

class PerformanceMonitor:
    """Performance monitoring class"""
    
    def __init__(self):
        self.start_time = None
        self.operation_name = None
    
    def start(self, operation_name):
        """Start monitoring an operation"""
        self.start_time = time.time()
        self.operation_name = operation_name
        logger.info(f"Starting operation: {operation_name}")
    
    def end(self, success=True):
        """End monitoring an operation"""
        if self.start_time:
            duration = time.time() - self.start_time
            status = "success" if success else "failed"
            logger.info(f"Operation {self.operation_name} completed in {duration:.2f}s ({status})")
            
            # Record custom metrics
            if hasattr(self, 'custom_histogram'):
                self.custom_histogram.observe(duration)
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end(success=exc_type is None)

def log_request_details():
    """Log detailed request information"""
    logger.info(f"Request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"Remote IP: {request.remote_addr}")
    logger.info(f"User Agent: {request.headers.get('User-Agent')}")

def log_response_details(response):
    """Log response details"""
    logger.info(f"Response Status: {response.status_code}")
    logger.info(f"Response Headers: {dict(response.headers)}")
    return response 