import os
import requests
import urllib3
from flask import current_app

def configure_ssl():
    """
    Railway deployment için TLS/SSL konfigürasyonunu ayarlar
    """
    try:
        # Environment variables'dan SSL ayarlarını al
        ca_bundle = os.environ.get('REQUESTS_CA_BUNDLE')
        cert_file = os.environ.get('SSL_CERT_FILE')
        
        # Railway Linux environment için varsayılan değerler
        if not ca_bundle:
            ca_bundle = '/etc/ssl/certs/ca-certificates.crt'
        if not cert_file:
            cert_file = '/etc/ssl/certs/ca-certificates.crt'
        
        # Environment variables'ı ayarla
        os.environ['REQUESTS_CA_BUNDLE'] = ca_bundle
        os.environ['SSL_CERT_FILE'] = cert_file
        
        # Requests session'ı için SSL ayarları
        if os.path.exists(ca_bundle):
            requests.packages.urllib3.util.ssl_.DEFAULT_CERTS = ca_bundle
        
        # SSL warnings'ları bastır (production'da gerekirse)
        if os.environ.get('FLASK_ENV') == 'production':
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        current_app.logger.info(f"SSL Configuration: CA_BUNDLE={ca_bundle}, CERT_FILE={cert_file}")
        
    except Exception as e:
        current_app.logger.error(f"SSL Configuration Error: {str(e)}")
        # Fallback: varsayılan SSL davranışını kullan
        pass

def get_ssl_verify():
    """
    SSL verification ayarını döndürür
    """
    try:
        ca_bundle = os.environ.get('REQUESTS_CA_BUNDLE', '/etc/ssl/certs/ca-certificates.crt')
        if os.path.exists(ca_bundle):
            return ca_bundle
        else:
            return True  # Varsayılan SSL verification
    except:
        return True 