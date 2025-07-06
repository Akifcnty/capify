import os
import ssl

def configure_ssl():
    """
    Configure SSL settings - disable verification completely for development
    """
    # Disable SSL verification completely
    os.environ['REQUESTS_CA_BUNDLE'] = ''
    os.environ['SSL_CERT_FILE'] = ''
    os.environ['REQUESTS_VERIFY'] = 'false'
    
    # Create unverified context
    ssl._create_default_https_context = ssl._create_unverified_context
    
    print("SSL verification completely disabled for development")

def get_ssl_verify_setting():
    """
    Get SSL verify setting - always False for development
    """
    return False 