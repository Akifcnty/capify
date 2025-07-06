from ..models.facebook_token import FacebookToken
from ..services.facebook_capi import FacebookCAPI
from ..utils.logger import EventLogger, get_logger
from datetime import datetime
from flask import request
import hashlib
from ..config import Config
import requests
import logging

logger = get_logger(__name__)

def hash_email(email):
    if not email:
        return None
    return hashlib.sha256(email.strip().lower().encode('utf-8')).hexdigest()

def hash_phone(phone):
    if not phone:
        return None
    return hashlib.sha256(phone.strip().encode('utf-8')).hexdigest()

def get_user_data(data):
    return {
        'em': [hash_email(data.get('email'))] if data.get('email') else [],
        'ph': [hash_phone(data.get('phone'))] if data.get('phone') else [],
        'client_ip_address': data.get('client_ip') or request.remote_addr,
        'client_user_agent': data.get('user_agent') or request.headers.get('User-Agent')
    }

def send_event_to_meta(event_name, data, custom_data=None):
    gtm_container_id = data.get('gtm_container_id')
    if not gtm_container_id:
        return {'msg': 'GTM Container ID is required'}, 400
    token = FacebookToken.query.filter_by(gtm_container_id=gtm_container_id).first()
    if not token:
        return {'msg': 'No Facebook token found for this GTM Container ID'}, 404
    if not token.is_active:
        return {'msg': 'Token is inactive. Please activate the token to send events.'}, 403
    payload = {
        'event_name': event_name,
        'event_time': int(datetime.utcnow().timestamp()),
        'user_data': get_user_data(data),
        'custom_data': custom_data or {},
        'action_source': 'website',
        'event_source_url': data.get('event_source_url', request.referrer or ''),
    }
    # Test event code varsa payload'a ekle
    if data.get('test_event_code'):
        payload['test_event_code'] = data['test_event_code']
        print(f"TEST EVENT CODE ADDED: {data['test_event_code']}")
        print(f"FULL PAYLOAD: {payload}")
    else:
        print("NO TEST EVENT CODE FOUND IN DATA")
        print(f"DATA RECEIVED: {data}")
    
    try:
        capi = FacebookCAPI(token.access_token, token.dataset_id)
        response = capi.send_event(payload)
        return {'msg': 'Event sent to Meta', 'meta_response': response}, 200
    except Exception as e:
        return {'msg': 'Meta event error', 'error': str(e)}, 500

# Celery worker için task olarak kullanılacak fonksiyon
try:
    from app.extensions import make_celery
    from flask import current_app
    celery = make_celery(current_app)
    @celery.task()
    def send_facebook_event(event_name, data, custom_data=None):
        send_event_to_meta(event_name, data, custom_data)
except Exception:
    pass

class FacebookEventSender:
    def __init__(self):
        self.base_url = "https://graph.facebook.com/v18.0"
        
    def send_event(self, event_data, gtm_container_id):
        """
        Send event to Facebook Conversions API
        """
        try:
            # Get token from database
            token = FacebookToken.query.filter_by(gtm_container_id=gtm_container_id).first()
            if not token:
                logger.error(f"No token found for GTM container: {gtm_container_id}")
                return False, "No token found"
            
            # Prepare payload
            payload = {
                "event_name": event_data.get("event_name"),
                "event_time": event_data.get("event_time"),
                "user_data": event_data.get("user_data", {}),
                "custom_data": event_data.get("custom_data", {}),
                "action_source": event_data.get("action_source", "website"),
                "event_source_url": event_data.get("event_source_url", ""),
                "access_token": token.access_token
            }
            
            # Add test event code if present
            if event_data.get("test_event_code"):
                payload["test_event_code"] = event_data["test_event_code"]
            
            # Send request with SSL verification disabled to avoid certifi path issues
            response = requests.post(
                f"{self.base_url}/{token.pixel_id}/events",
                json=payload,
                timeout=30,
                verify=False,  # Disable SSL verification to avoid certifi path issues
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "CAPIFY-EventSender/1.0"
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Event sent successfully: {event_data.get('event_name')} | Container: {gtm_container_id} | Response: {result}")
                return True, result
            else:
                logger.error(f"Failed to send event: {response.status_code} - {response.text}")
                return False, f"HTTP {response.status_code}: {response.text}"
                
        except requests.exceptions.SSLError as e:
            logger.error(f"SSL Error: {str(e)}")
            # Fallback: try without SSL verification (not recommended for production)
            try:
                response = requests.post(
                    f"{self.base_url}/{token.pixel_id}/events",
                    json=payload,
                    timeout=30,
                    verify=False,  # Disable SSL verification as fallback
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "CAPIFY-EventSender/1.0"
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.warning(f"Event sent with SSL verification disabled: {event_data.get('event_name')}")
                    return True, result
                else:
                    logger.error(f"Failed to send event (SSL disabled): {response.status_code} - {response.text}")
                    return False, f"HTTP {response.status_code}: {response.text}"
                    
            except Exception as fallback_error:
                logger.error(f"Fallback also failed: {str(fallback_error)}")
                return False, f"SSL and fallback failed: {str(e)}"
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            return False, f"Request failed: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return False, f"Unexpected error: {str(e)}" 