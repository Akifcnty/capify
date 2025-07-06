import os

def configure_ssl():
    """
    Configure SSL settings - disable verification for development
    """
    # Disable SSL verification completely
    os.environ['REQUESTS_CA_BUNDLE'] = ''
    os.environ['SSL_CERT_FILE'] = ''
    
    # Set verify to False for all requests
    os.environ['REQUESTS_VERIFY'] = 'false'
    
    print("SSL verification disabled for development")

def get_ssl_verify_setting():
    """
    Get SSL verify setting - always False for development
    """
    return False 