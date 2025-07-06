import logging
from datetime import datetime
from flask import request
import json
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def get_logger(name):
    """Get a logger instance for the given name"""
    return logging.getLogger(name)

# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
os.makedirs(logs_dir, exist_ok=True)

# Create file handler for GTM events
gtm_file_handler = logging.FileHandler(os.path.join(logs_dir, 'gtm_events.log'))
gtm_file_handler.setLevel(logging.INFO)
gtm_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
gtm_file_handler.setFormatter(gtm_formatter)

# Create GTM logger
gtm_logger = logging.getLogger('gtm_events')
gtm_logger.addHandler(gtm_file_handler)
gtm_logger.setLevel(logging.INFO)

class EventLogger:
    """Custom logger for Facebook CAPI events"""
    
    @staticmethod
    def log_event(user_id, event_type, event_data, success=True, error_message=None):
        """
        Log Facebook CAPI event
        """
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'event_type': event_type,
            'event_data': event_data,
            'success': success,
            'error_message': error_message,
            'ip_address': request.remote_addr if request else None,
            'user_agent': request.headers.get('User-Agent') if request else None
        }
        
        if success:
            logger.info(f"Event logged successfully: {event_type} for user {user_id}")
        else:
            logger.error(f"Event failed: {event_type} for user {user_id} - {error_message}")
        
        return log_entry
    
    @staticmethod
    def log_api_call(user_id, endpoint, request_data, response_data, status_code):
        """
        Log API call details
        """
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'endpoint': endpoint,
            'request_data': request_data,
            'response_data': response_data,
            'status_code': status_code,
            'ip_address': request.remote_addr if request else None
        }
        
        logger.info(f"API call: {endpoint} - Status: {status_code}")
        return log_entry

class GtmEventLogger:
    """Specialized logger for GTM events"""
    
    @staticmethod
    def log_gtm_event_received(event_name, gtm_container_id, event_data, source_ip=None, user_agent=None):
        """
        Log when a GTM event is received
        """
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            'type': 'GTM_EVENT_RECEIVED',
            'timestamp': timestamp,
            'event_name': event_name,
            'gtm_container_id': gtm_container_id,
            'event_data': event_data,
            'source_ip': source_ip or (request.remote_addr if request else None),
            'user_agent': user_agent or (request.headers.get('User-Agent') if request else None)
        }
        
        gtm_logger.info(f"GTM Event Received: {event_name} | Container: {gtm_container_id} | Data: {json.dumps(event_data, indent=2)}")
        return log_entry
    
    @staticmethod
    def log_meta_request_sent(event_name, gtm_container_id, meta_payload, access_token=None, pixel_id=None):
        """
        Log when a request is sent to Meta
        """
        timestamp = datetime.utcnow().isoformat()
        # Mask sensitive data
        safe_payload = meta_payload.copy()
        if access_token:
            safe_payload['access_token'] = f"{access_token[:10]}...{access_token[-10:]}" if len(access_token) > 20 else "***"
        
        log_entry = {
            'type': 'META_REQUEST_SENT',
            'timestamp': timestamp,
            'event_name': event_name,
            'gtm_container_id': gtm_container_id,
            'meta_payload': safe_payload,
            'pixel_id': pixel_id
        }
        
        gtm_logger.info(f"Meta Request Sent: {event_name} | Container: {gtm_container_id} | Pixel: {pixel_id} | Payload: {json.dumps(safe_payload, indent=2)}")
        return log_entry
    
    @staticmethod
    def log_meta_response_received(event_name, gtm_container_id, meta_response, success=True, error_message=None):
        """
        Log when a response is received from Meta
        """
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            'type': 'META_RESPONSE_RECEIVED',
            'timestamp': timestamp,
            'event_name': event_name,
            'gtm_container_id': gtm_container_id,
            'meta_response': meta_response,
            'success': success,
            'error_message': error_message
        }
        
        if success:
            gtm_logger.info(f"Meta Response Success: {event_name} | Container: {gtm_container_id} | Response: {json.dumps(meta_response, indent=2)}")
        else:
            gtm_logger.error(f"Meta Response Error: {event_name} | Container: {gtm_container_id} | Error: {error_message} | Response: {json.dumps(meta_response, indent=2)}")
        
        return log_entry
    
    @staticmethod
    def log_gtm_event_complete(event_name, gtm_container_id, total_duration_ms, success=True):
        """
        Log when a complete GTM event cycle is finished
        """
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            'type': 'GTM_EVENT_COMPLETE',
            'timestamp': timestamp,
            'event_name': event_name,
            'gtm_container_id': gtm_container_id,
            'total_duration_ms': total_duration_ms,
            'success': success
        }
        
        status = "SUCCESS" if success else "FAILED"
        gtm_logger.info(f"GTM Event Complete: {event_name} | Container: {gtm_container_id} | Status: {status} | Duration: {total_duration_ms}ms")
        return log_entry
    
    @staticmethod
    def log_token_info_request(gtm_container_id, success=True, error_message=None):
        """
        Log token info requests from GTM scripts
        """
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            'type': 'TOKEN_INFO_REQUEST',
            'timestamp': timestamp,
            'gtm_container_id': gtm_container_id,
            'success': success,
            'error_message': error_message,
            'source_ip': request.remote_addr if request else None,
            'user_agent': request.headers.get('User-Agent') if request else None
        }
        
        if success:
            gtm_logger.info(f"Token Info Request: {gtm_container_id} | IP: {log_entry['source_ip']}")
        else:
            gtm_logger.warning(f"Token Info Request Failed: {gtm_container_id} | Error: {error_message}")
        
        return log_entry
    
    @staticmethod
    def log_gtm_script_generated(token_id, gtm_container_id, user_id):
        """
        Log when a GTM script is generated
        """
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            'type': 'GTM_SCRIPT_GENERATED',
            'timestamp': timestamp,
            'token_id': token_id,
            'gtm_container_id': gtm_container_id,
            'user_id': user_id,
            'source_ip': request.remote_addr if request else None
        }
        
        gtm_logger.info(f"GTM Script Generated: Token {token_id} | Container: {gtm_container_id} | User: {user_id}")
        return log_entry

def log_error(error, context=None):
    """
    Log application errors
    """
    error_log = {
        'timestamp': datetime.utcnow().isoformat(),
        'error_type': type(error).__name__,
        'error_message': str(error),
        'context': context or {},
        'ip_address': request.remote_addr if request else None
    }
    
    logger.error(f"Application error: {error}")
    return error_log 