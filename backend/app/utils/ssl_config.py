import certifi
import os
import ssl
import urllib3

# Disable SSL warnings for development
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_ca_bundle_path():
    """
    Get the CA bundle path dynamically, with proper fallbacks
    """
    # First try environment variables
    ca_bundle = os.environ.get('REQUESTS_CA_BUNDLE') or os.environ.get('SSL_CERT_FILE')
    
    if ca_bundle and os.path.exists(ca_bundle):
        return ca_bundle
    
    # Try certifi's default path
    try:
        certifi_path = certifi.where()
        if os.path.exists(certifi_path):
            return certifi_path
    except Exception:
        pass
    
    # Try common system paths
    common_paths = [
        '/etc/ssl/certs/ca-certificates.crt',
        '/etc/pki/tls/certs/ca-bundle.crt',
        '/usr/share/ssl/certs/ca-bundle.crt',
        '/usr/local/share/certs/ca-root-nss.crt',
        '/etc/ssl/cert.pem'
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
    
    # Last resort: return None to disable SSL verification
    return None

def configure_ssl():
    """
    Configure SSL settings for the application
    """
    ca_bundle = get_ca_bundle_path()
    
    if ca_bundle:
        os.environ['REQUESTS_CA_BUNDLE'] = ca_bundle
        os.environ['SSL_CERT_FILE'] = ca_bundle
        print(f"SSL configured with CA bundle: {ca_bundle}")
    else:
        print("Warning: No valid CA bundle found, SSL verification may be disabled")
        # Set environment variables to None to disable SSL verification
        os.environ['REQUESTS_CA_BUNDLE'] = ''
        os.environ['SSL_CERT_FILE'] = ''

def get_ssl_verify_setting():
    """
    Get SSL verify setting for requests
    """
    ca_bundle = get_ca_bundle_path()
    return ca_bundle if ca_bundle else False

def create_ssl_context():
    """
    Create SSL context with proper certificate handling
    """
    ca_bundle = get_ca_bundle_path()
    
    if ca_bundle:
        context = ssl.create_default_context(cafile=ca_bundle)
    else:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
    
    return context 