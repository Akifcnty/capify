import requests
import json
from datetime import datetime
from ..utils.hashing import hash_email, hash_phone, hash_external_id
from ..utils.logger import EventLogger

class FacebookCAPI:
    """Facebook Conversion API service"""
    
    def __init__(self, access_token, pixel_id):
        self.access_token = access_token
        self.pixel_id = pixel_id
        self.base_url = "https://graph.facebook.com/v18.0"
        self.logger = EventLogger()
    
    def send_event(self, event_data, user_id=None):
        """
        Send event to Facebook Conversion API
        """
        try:
            # Prepare the event payload
            payload = self._prepare_event_payload(event_data)
            
            # Send to Facebook
            response = self._send_to_facebook(payload)
            
            # Log the event
            self.logger.log_event(
                user_id=user_id,
                event_type=event_data.get('event_name'),
                event_data=event_data,
                success=True
            )
            
            return {
                'success': True,
                'response': response,
                'event_id': response.get('events_received', 0)
            }
            
        except Exception as e:
            # Log the error
            self.logger.log_event(
                user_id=user_id,
                event_type=event_data.get('event_name'),
                event_data=event_data,
                success=False,
                error_message=str(e)
            )
            
            return {
                'success': False,
                'error': str(e)
            }
    
    def _prepare_event_payload(self, event_data):
        """
        Prepare event payload for Facebook CAPI
        """
        event_name = event_data.get('event_name')
        event_time = event_data.get('event_time', int(datetime.now().timestamp()))
        
        # Base event structure
        event = {
            'event_name': event_name,
            'event_time': event_time,
            'action_source': 'website',
            'event_source_url': event_data.get('event_source_url'),
            'user_data': self._prepare_user_data(event_data.get('user_data', {})),
            'custom_data': event_data.get('custom_data', {})
        }
        
        # Add specific event data
        if event_name == 'Purchase':
            event['custom_data'].update({
                'value': event_data.get('value'),
                'currency': event_data.get('currency', 'USD'),
                'content_ids': event_data.get('content_ids', []),
                'content_type': event_data.get('content_type', 'product')
            })
        
        return {
            'data': [event],
            'access_token': self.access_token
        }
    
    def _prepare_user_data(self, user_data):
        """
        Prepare and hash user data for Facebook CAPI (Meta uyumlu tüm alanlar)
        """
        prepared_data = {}

        # Hashlenmesi gereken alanlar
        if user_data.get('email'):
            prepared_data['em'] = hash_email(user_data['email'])
        if user_data.get('phone'):
            prepared_data['ph'] = hash_phone(user_data['phone'])
        if user_data.get('fn'):
            prepared_data['fn'] = hash_email(user_data['fn'])  # hash_email fonksiyonu SHA256 için kullanılabilir
        if user_data.get('ln'):
            prepared_data['ln'] = hash_email(user_data['ln'])
        if user_data.get('ge'):
            prepared_data['ge'] = hash_email(user_data['ge'])
        if user_data.get('db'):
            prepared_data['db'] = hash_email(user_data['db'])
        if user_data.get('ct'):
            prepared_data['ct'] = hash_email(user_data['ct'])
        if user_data.get('st'):
            prepared_data['st'] = hash_email(user_data['st'])
        if user_data.get('zp'):
            prepared_data['zp'] = hash_email(user_data['zp'])
        if user_data.get('country'):
            prepared_data['country'] = hash_email(user_data['country'])
        if user_data.get('external_id'):
            prepared_data['external_id'] = hash_external_id(user_data['external_id'])

        # Düz olarak gönderilecek alanlar
        if user_data.get('client_ip_address'):
            prepared_data['client_ip_address'] = user_data['client_ip_address']
        if user_data.get('client_user_agent'):
            prepared_data['client_user_agent'] = user_data['client_user_agent']
        if user_data.get('fbc'):
            prepared_data['fbc'] = user_data['fbc']
        if user_data.get('fbp'):
            prepared_data['fbp'] = user_data['fbp']

        return prepared_data
    
    def _send_to_facebook(self, payload):
        """
        Send payload to Facebook Conversion API
        """
        url = f"{self.base_url}/{self.pixel_id}/events"
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            url,
            data=json.dumps(payload),
            headers=headers,
            verify=False  # TLS sertifika doğrulamasını devre dışı bırak
        )
        
        if response.status_code != 200:
            raise Exception(f"Facebook API error: {response.status_code} - {response.text}")
        
        return response.json()
    
    def send_lead_event(self, user_data, custom_data=None, user_id=None):
        """
        Send Lead event
        """
        event_data = {
            'event_name': 'Lead',
            'user_data': user_data,
            'custom_data': custom_data or {},
            'event_time': int(datetime.now().timestamp())
        }
        
        return self.send_event(event_data, user_id)
    
    def send_purchase_event(self, user_data, value, currency='USD', content_ids=None, custom_data=None, user_id=None):
        """
        Send Purchase event
        """
        event_data = {
            'event_name': 'Purchase',
            'user_data': user_data,
            'value': value,
            'currency': currency,
            'content_ids': content_ids or [],
            'content_type': 'product',
            'custom_data': custom_data or {},
            'event_time': int(datetime.now().timestamp())
        }
        
        return self.send_event(event_data, user_id)
    
    def send_view_content_event(self, user_data, content_ids=None, content_type='product', custom_data=None, user_id=None):
        """
        Send ViewContent event
        """
        event_data = {
            'event_name': 'ViewContent',
            'user_data': user_data,
            'content_ids': content_ids or [],
            'content_type': content_type,
            'custom_data': custom_data or {},
            'event_time': int(datetime.now().timestamp())
        }
        
        return self.send_event(event_data, user_id)
    
    def send_add_to_cart_event(self, user_data, value, currency='USD', content_ids=None, custom_data=None, user_id=None):
        """
        Send AddToCart event
        """
        event_data = {
            'event_name': 'AddToCart',
            'user_data': user_data,
            'value': value,
            'currency': currency,
            'content_ids': content_ids or [],
            'content_type': 'product',
            'custom_data': custom_data or {},
            'event_time': int(datetime.now().timestamp())
        }
        
        return self.send_event(event_data, user_id) 