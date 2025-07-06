import os
import certifi
import urllib3
from flask import current_app

def configure_ssl():
    """
    Configure SSL/TLS settings for requests
    """
    # Disable SSL warnings for development
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # Set CA bundle path with proper fallback
    ca_bundle = os.environ.get('REQUESTS_CA_BUNDLE') or os.environ.get('SSL_CERT_FILE') or certifi.where()
    
    # Verify the path exists
    if not os.path.exists(ca_bundle):
        # Fallback to certifi's default path
        ca_bundle = certifi.where()
    
    # Set environment variables
    os.environ['REQUESTS_CA_BUNDLE'] = ca_bundle
    os.environ['SSL_CERT_FILE'] = ca_bundle
    
    current_app.logger.info(f"SSL Configuration: CA_BUNDLE={ca_bundle}")
    
    return ca_bundle

def get_verify_setting():
    """
    Get the verify setting for requests
    """
    ca_bundle = os.environ.get('REQUESTS_CA_BUNDLE') or os.environ.get('SSL_CERT_FILE') or certifi.where()
    
    # Check if the path exists
    if os.path.exists(ca_bundle):
        return ca_bundle
    else:
        # If path doesn't exist, use certifi's default
        return certifi.where() 