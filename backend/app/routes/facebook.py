from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.facebook_token import FacebookToken
from ..services.facebook_capi import FacebookCAPI
from ..extensions import db
from ..utils.logger import EventLogger, GtmEventLogger
from datetime import datetime
import hashlib
from ..config import Config
import threading
import time
from app.tasks import send_facebook_event
from ..services.facebook_event_sender import send_event_to_meta
from app import limiter
from ..models.gtm_verification import GtmVerification

def hash_email(email):
    if not email:
        return None
    return hashlib.sha256(email.strip().lower().encode('utf-8')).hexdigest()

def hash_phone(phone):
    if not phone:
        return None
    return hashlib.sha256(phone.strip().encode('utf-8')).hexdigest()

def get_user_data(data):
    from app.utils.hashing import (
        hash_email, hash_phone, hash_name, hash_city, hash_state, 
        hash_zipcode, hash_country, hash_gender, hash_birthday, hash_external_id
    )
    
    user_data = {
        'em': [hash_email(data.get('email'))] if data.get('email') else [],
        'ph': [hash_phone(data.get('phone'))] if data.get('phone') else [],
        'client_ip_address': data.get('client_ip') or request.remote_addr,
        'client_user_agent': data.get('user_agent') or request.headers.get('User-Agent')
    }
    
    # Meta CAPI için ek alanları hash'le
    if data.get('fn'):
        user_data['fn'] = [hash_name(data.get('fn'))]
    if data.get('ln'):
        user_data['ln'] = [hash_name(data.get('ln'))]
    if data.get('ge'):
        user_data['ge'] = [hash_gender(data.get('ge'))]
    if data.get('db'):
        user_data['db'] = [hash_birthday(data.get('db'))]
    if data.get('ct'):
        user_data['ct'] = [hash_city(data.get('ct'))]
    if data.get('st'):
        user_data['st'] = [hash_state(data.get('st'))]
    if data.get('zp'):
        user_data['zp'] = [hash_zipcode(data.get('zp'))]
    if data.get('country'):
        user_data['country'] = [hash_country(data.get('country'))]
    if data.get('external_id'):
        user_data['external_id'] = [hash_external_id(data.get('external_id'))]
    
    # Facebook Browser ve Pixel ID'leri
    if data.get('fbc'):
        user_data['fbc'] = data.get('fbc')
    if data.get('fbp'):
        user_data['fbp'] = data.get('fbp')
    
    return user_data

def get_domain_by_gtm_container_id(gtm_container_id):
    verification = GtmVerification.query.filter_by(gtm_container_id=gtm_container_id, is_verified=True).first()
    if verification:
        domain = verification.domain_name
        if not domain.startswith('http'):
            domain = 'https://' + domain
        # Domain'in başına www. ekle
        if 'www.' not in domain:
            domain = domain.replace('https://', 'https://www.')
        return domain
    return 'https://www.example.com'

def send_event_to_meta(event_name, data, custom_data=None):
    start_time = time.time()
    gtm_container_id = data.get('gtm_container_id')
    
    # Log GTM event received
    GtmEventLogger.log_gtm_event_received(
        event_name=event_name,
        gtm_container_id=gtm_container_id,
        event_data=data
    )
    
    if not gtm_container_id:
        error_msg = 'GTM Container ID is required'
        GtmEventLogger.log_gtm_event_complete(
            event_name=event_name,
            gtm_container_id=gtm_container_id,
            total_duration_ms=int((time.time() - start_time) * 1000),
            success=False
        )
        return {'msg': error_msg}, 400
    
    token = FacebookToken.query.filter_by(gtm_container_id=gtm_container_id).first()
    if not token:
        error_msg = 'No Facebook token found for this GTM Container ID'
        GtmEventLogger.log_gtm_event_complete(
            event_name=event_name,
            gtm_container_id=gtm_container_id,
            total_duration_ms=int((time.time() - start_time) * 1000),
            success=False
        )
        return {'msg': error_msg}, 404
    
    if not token.is_active:
        error_msg = 'Token is inactive. Please activate the token to send events.'
        GtmEventLogger.log_gtm_event_complete(
            event_name=event_name,
            gtm_container_id=gtm_container_id,
            total_duration_ms=int((time.time() - start_time) * 1000),
            success=False
        )
        return {'msg': error_msg}, 403
    
    # Her zaman domaini kullan
    event_source_url = get_domain_by_gtm_container_id(gtm_container_id)
    payload = {
        'event_name': event_name,
        'event_time': int(datetime.utcnow().timestamp()),
        'user_data': get_user_data(data),
        'custom_data': custom_data or {},
        'action_source': 'website',
        'event_source_url': event_source_url,
    }
    
    if data.get('test_event_code'):
        payload['test_event_code'] = data['test_event_code']
        print(f"TEST EVENT CODE ADDED: {data['test_event_code']}")
        print(f"FULL PAYLOAD: {payload}")
    else:
        print("NO TEST EVENT CODE FOUND IN DATA")
        print(f"DATA RECEIVED: {data}")
    
    # Log Meta request being sent
    GtmEventLogger.log_meta_request_sent(
        event_name=event_name,
        gtm_container_id=gtm_container_id,
        meta_payload=payload,
        access_token=token.access_token,
        pixel_id=token.dataset_id
    )
    
    try:
        capi = FacebookCAPI(token.access_token, token.dataset_id)
        response = capi.send_event(payload)
        
        # Log successful Meta response
        GtmEventLogger.log_meta_response_received(
            event_name=event_name,
            gtm_container_id=gtm_container_id,
            meta_response=response,
            success=True
        )
        
        # Log complete event cycle
        GtmEventLogger.log_gtm_event_complete(
            event_name=event_name,
            gtm_container_id=gtm_container_id,
            total_duration_ms=int((time.time() - start_time) * 1000),
            success=True
        )
        
        return {'msg': 'Event sent to Meta', 'meta_response': response}, 200
        
    except Exception as e:
        error_msg = str(e)
        
        # Log failed Meta response
        GtmEventLogger.log_meta_response_received(
            event_name=event_name,
            gtm_container_id=gtm_container_id,
            meta_response={'error': error_msg},
            success=False,
            error_message=error_msg
        )
        
        # Log complete event cycle (failed)
        GtmEventLogger.log_gtm_event_complete(
            event_name=event_name,
            gtm_container_id=gtm_container_id,
            total_duration_ms=int((time.time() - start_time) * 1000),
            success=False
        )
        
        return {'msg': 'Meta event error', 'error': error_msg}, 500

facebook_bp = Blueprint('facebook', __name__)

# Sadece page_view için kullanılacak global havuz
PAGE_VIEW_POOL = []
BATCH_SIZE = 100         # Kaç event biriktirilecek
BATCH_INTERVAL = 60      # Kaç saniyede bir gönderilecek (ör: 60 sn)

def send_batch_to_facebook(events):
    for event in events:
        try:
            send_event_to_meta('PageView', event)
        except Exception as e:
            print(f"Batch Facebook gönderim hatası: {e}")

def flush_page_view_pool():
    global PAGE_VIEW_POOL
    if PAGE_VIEW_POOL:
        events_to_send = PAGE_VIEW_POOL.copy()
        PAGE_VIEW_POOL.clear()
        send_batch_to_facebook(events_to_send)
    # Zamanlayıcıyı tekrar başlat
    threading.Timer(BATCH_INTERVAL, flush_page_view_pool).start()

# Sunucu ilk başladığında zamanlayıcıyı başlat
threading.Timer(BATCH_INTERVAL, flush_page_view_pool).start()

# Duplicate endpoint'ler kaldırıldı - sadece optional JWT olanlar kullanılıyor

@facebook_bp.route('/script-template/<int:token_id>', methods=['GET'])
@jwt_required()
def get_script_template(token_id):
    """Get GTM script template for a specific token"""
    user_id = get_jwt_identity()
    token = FacebookToken.query.filter_by(id=token_id, user_id=user_id).first()
    
    if not token:
        return jsonify({'msg': 'Token not found'}), 404
    
    # Log GTM script generation
    GtmEventLogger.log_gtm_script_generated(
        token_id=token_id,
        gtm_container_id=token.gtm_container_id,
        user_id=user_id
    )
    
    # Generate script template
    script_template = f"""
// Capify Facebook CAPI Script - Meta Uyumlu
// Generated for Pixel ID: {token.pixel_id}
// GTM Container ID: {token.gtm_container_id}

(function() {{
    'use strict';
    
    const CAPIFY_API_URL = '{request.host_url.rstrip("/")}/api/facebook';
    const GTM_CONTAINER_ID = '{token.gtm_container_id}';
    
    // Cache for token info - only fetch once
    let tokenInfoCache = null;
    let tokenInfoPromise = null;
    
    // SHA256 hashing function for Meta CAPI
    async function sha256(message) {{
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }}
    
    // Get token info from Capify server (cached)
    async function getTokenInfo() {{
        // Return cached token info if available
        if (tokenInfoCache) {{
            return tokenInfoCache;
        }}
        
        // If already fetching, wait for that promise
        if (tokenInfoPromise) {{
            return await tokenInfoPromise;
        }}
        
        // Fetch token info once
        tokenInfoPromise = (async () => {{
            try {{
                const response = await fetch(`${{CAPIFY_API_URL}}/token-info/${{GTM_CONTAINER_ID}}`);
                if (!response.ok) throw new Error('Token not found');
                const tokenInfo = await response.json();
                tokenInfoCache = tokenInfo; // Cache the result
                return tokenInfo;
            }} catch (error) {{
                console.error('Capify: Token info fetch failed:', error);
                return null;
            }} finally {{
                tokenInfoPromise = null; // Clear the promise
            }}
        }})();
        
        return await tokenInfoPromise;
    }}
    
    // Prepare user data with Meta CAPI compliance
    async function prepareUserData(eventData) {{
        const userData = {{}};
        
        // Hash required fields - Meta CAPI standard
        if (eventData.email) {{
            userData.em = [await sha256(eventData.email.toLowerCase().trim())];
        }}
        if (eventData.phone) {{
            userData.ph = [await sha256(eventData.phone.replace(/[^0-9]/g, ''))];
        }}
        if (eventData.fn) {{
            userData.fn = [await sha256(eventData.fn.toLowerCase().trim())];
        }}
        if (eventData.ln) {{
            userData.ln = [await sha256(eventData.ln.toLowerCase().trim())];
        }}
        if (eventData.ge) {{
            userData.ge = [await sha256(eventData.ge.toLowerCase().trim())];
        }}
        if (eventData.db) {{
            userData.db = [await sha256(eventData.db)];
        }}
        if (eventData.ct) {{
            userData.ct = [await sha256(eventData.ct.toLowerCase().trim())];
        }}
        if (eventData.st) {{
            userData.st = [await sha256(eventData.st.toLowerCase().trim())];
        }}
        if (eventData.zp) {{
            userData.zp = [await sha256(eventData.zp)];
        }}
        if (eventData.country) {{
            userData.country = [await sha256(eventData.country.toLowerCase().trim())];
        }}
        if (eventData.external_id) {{
            userData.external_id = [await sha256(eventData.external_id.toString())];
        }}
        
        // Non-hashed fields
        if (eventData.client_ip_address) {{
            userData.client_ip_address = eventData.client_ip_address;
        }}
        if (eventData.client_user_agent) {{
            userData.client_user_agent = eventData.client_user_agent;
        }}
        if (eventData.fbc) {{
            userData.fbc = eventData.fbc;
        }}
        if (eventData.fbp) {{
            userData.fbp = eventData.fbp;
        }}
        
        return userData;
    }}
    
    // Send event directly to Meta Facebook CAPI
    async function sendEventToMeta(eventName, eventData) {{
        try {{
            // Get token info
            const tokenInfo = await getTokenInfo();
            if (!tokenInfo) {{
                console.error('Capify: Could not get token info');
                return;
            }}
            
            // Prepare user data
            const userData = await prepareUserData(eventData);
            
            // Prepare event payload
            const payload = {{
                data: [{{
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    event_source_url: window.location.href.replace("://", "://www."),
                    user_data: userData,
                    custom_data: eventData.custom_data || {{}}
                }}],
                access_token: tokenInfo.access_token
            }};
            
            // Add test event code if provided
            if (eventData.test_event_code) {{
                payload.data[0].test_event_code = eventData.test_event_code;
            }}
            
            // Send to Meta
            const response = await fetch(`https://graph.facebook.com/v18.0/${{tokenInfo.pixel_id}}/events`, {{
                method: 'POST',
                headers: {{
                    'Content-Type': 'application/json'
                }},
                body: JSON.stringify(payload)
            }});
            
            const result = await response.json();
            
            if (response.ok) {{
                console.log('Capify: Event sent to Meta successfully:', result);
            }} else {{
                console.error('Capify: Meta API error:', result);
            }}
            
        }} catch (error) {{
            console.error('Capify: Event send failed:', error);
        }}
    }}
    
    // Listen for DataLayer events
    if (window.dataLayer) {{
        const originalPush = window.dataLayer.push;
        window.dataLayer.push = function(...args) {{
            const event = args[0];
            
            // Handle different event types with Meta CAPI compliance
            if (event.event === 'add_to_cart') {{
                sendEventToMeta('AddToCart', {{
                    email: event.email,
                    phone: event.phone,
                    fn: event.fn,
                    ln: event.ln,
                    ge: event.ge,
                    db: event.db,
                    ct: event.ct,
                    st: event.st,
                    zp: event.zp,
                    country: event.country,
                    external_id: event.external_id,
                    client_ip_address: event.client_ip_address,
                    client_user_agent: event.client_user_agent,
                    fbc: event.fbc,
                    fbp: event.fbp,
                    custom_data: {{
                        value: event.value,
                        currency: event.currency || 'USD',
                        content_ids: event.content_ids || [],
                        contents: event.contents || []
                    }}
                }});
            }} else if (event.event === 'purchase') {{
                sendEventToMeta('Purchase', {{
                    email: event.email,
                    phone: event.phone,
                    fn: event.fn,
                    ln: event.ln,
                    ge: event.ge,
                    db: event.db,
                    ct: event.ct,
                    st: event.st,
                    zp: event.zp,
                    country: event.country,
                    external_id: event.external_id,
                    client_ip_address: event.client_ip_address,
                    client_user_agent: event.client_user_agent,
                    fbc: event.fbc,
                    fbp: event.fbp,
                    custom_data: {{
                        value: event.value,
                        currency: event.currency || 'USD',
                        content_ids: event.content_ids || [],
                        contents: event.contents || [],
                        order_id: event.order_id
                    }}
                }});
            }} else if (event.event === 'lead') {{
                sendEventToMeta('Lead', {{
                    email: event.email,
                    phone: event.phone,
                    fn: event.fn,
                    ln: event.ln,
                    ge: event.ge,
                    db: event.db,
                    ct: event.ct,
                    st: event.st,
                    zp: event.zp,
                    country: event.country,
                    external_id: event.external_id,
                    client_ip_address: event.client_ip_address,
                    client_user_agent: event.client_user_agent,
                    fbc: event.fbc,
                    fbp: event.fbp,
                    custom_data: {{
                        form_id: event.form_id,
                        lead_type: event.lead_type
                    }}
                }});
            }} else if (event.event === 'view_item') {{
                sendEventToMeta('ViewContent', {{
                    email: event.email,
                    phone: event.phone,
                    fn: event.fn,
                    ln: event.ln,
                    ge: event.ge,
                    db: event.db,
                    ct: event.ct,
                    st: event.st,
                    zp: event.zp,
                    country: event.country,
                    external_id: event.external_id,
                    client_ip_address: event.client_ip_address,
                    client_user_agent: event.client_user_agent,
                    fbc: event.fbc,
                    fbp: event.fbp,
                    custom_data: {{
                        content_ids: event.content_ids || [],
                        contents: event.contents || [],
                        value: event.value,
                        currency: event.currency || 'USD'
                    }}
                }});
            }} else if (event.event === 'begin_checkout') {{
                sendEventToMeta('InitiateCheckout', {{
                    email: event.email,
                    phone: event.phone,
                    fn: event.fn,
                    ln: event.ln,
                    ge: event.ge,
                    db: event.db,
                    ct: event.ct,
                    st: event.st,
                    zp: event.zp,
                    country: event.country,
                    external_id: event.external_id,
                    client_ip_address: event.client_ip_address,
                    client_user_agent: event.client_user_agent,
                    fbc: event.fbc,
                    fbp: event.fbp,
                    custom_data: {{
                        value: event.value,
                        currency: event.currency || 'USD',
                        content_ids: event.content_ids || [],
                        contents: event.contents || []
                    }}
                }});
            }} else if (event.event === 'custom_event') {{
                // Custom event handling - get token info and send to Meta
                sendEventToMeta(event.event_name || 'CustomEvent', {{
                    email: event.email,
                    phone: event.phone,
                    fn: event.fn,
                    ln: event.ln,
                    ge: event.ge,
                    db: event.db,
                    ct: event.ct,
                    st: event.st,
                    zp: event.zp,
                    country: event.country,
                    external_id: event.external_id,
                    client_ip_address: event.client_ip_address,
                    client_user_agent: event.client_user_agent,
                    fbc: event.fbc,
                    fbp: event.fbp,
                    test_event_code: event.test_event_code,
                    custom_data: event.custom_data || {{}}
                }});
            }}
            
            // Call original push method
            return originalPush.apply(this, args);
        }};
    }}
    
    // Make sendEventToMeta available globally for manual calls
    window.capifySendEventToMeta = sendEventToMeta;
    
    console.log('Capify Facebook CAPI script loaded - Meta compliant');
}})();
"""
    
    return jsonify({
        'script_template': script_template,
        'token': token.to_dict()
    }), 200

@facebook_bp.route('/tokens', methods=['POST'])
@jwt_required()
def create_token():
    """Create a new Facebook token"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Required fields
    access_token = data.get('access_token')
    token_name = data.get('token_name', FacebookToken.generate_token_name())
    dataset_id = data.get('dataset_id')
    dataset_name = data.get('dataset_name')
    gtm_container_id = data.get('gtm_container_id')
    
    if not all([access_token, dataset_id, gtm_container_id]):
        return jsonify({
            'msg': 'Access Token, Dataset ID ve GTM Container ID zorunludur.'
        }), 400
    
    try:
        # Create new token
        token = FacebookToken(
            user_id=user_id,
            access_token=access_token,
            token_name=token_name,
            dataset_id=dataset_id,
            dataset_name=dataset_name,
            gtm_container_id=gtm_container_id
        )
        
        db.session.add(token)
        db.session.commit()
        
        EventLogger.log_event(
            user_id=user_id,
            event_type='facebook_token_created',
            event_data={'dataset_id': dataset_id, 'gtm_container_id': gtm_container_id},
            success=True
        )
        
        return jsonify({
            'msg': 'Facebook token başarıyla oluşturuldu',
            'token': token.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        EventLogger.log_event(
            user_id=user_id,
            event_type='facebook_token_created',
            event_data=data,
            success=False,
            error_message=str(e)
        )
        
        return jsonify({
            'msg': 'Facebook token oluşturulurken hata oluştu',
            'error': str(e)
        }), 500

@facebook_bp.route('/events/purchase', methods=['POST'])
@jwt_required(optional=True)
def event_purchase():
    user_id = get_jwt_identity() or 1  # test için default user
    data = request.get_json() or {}
    custom_data = {
        'value': data.get('value'),
        'currency': data.get('currency'),
        'content_ids': data.get('content_ids'),
        'order_id': data.get('order_id'),
        'contents': data.get('contents', []),
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('Purchase', data, custom_data)

@facebook_bp.route('/events/lead', methods=['POST'])
@jwt_required(optional=True)
def event_lead():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'form_id': data.get('form_id'),
        'lead_type': data.get('lead_type'),
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('Lead', data, custom_data)

@facebook_bp.route('/events/add-to-cart', methods=['POST'])
@jwt_required(optional=True)
def event_add_to_cart():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'value': data.get('value'),
        'currency': data.get('currency'),
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', []),
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('AddToCart', data, custom_data)

@facebook_bp.route('/events/view-content', methods=['POST'])
@jwt_required(optional=True)
def event_view_content():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'content_ids': data.get('content_ids'),
        'value': data.get('value'),
        'currency': data.get('currency'),
        'contents': data.get('contents', []),
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('ViewContent', data, custom_data)

@facebook_bp.route('/events/complete-registration', methods=['POST'])
@jwt_required(optional=True)
def event_complete_registration():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'registration_method': data.get('registration_method'),
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('CompleteRegistration', data, custom_data)

@facebook_bp.route('/events/initiate-checkout', methods=['POST'])
@jwt_required(optional=True)
def event_initiate_checkout():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'value': data.get('value'),
        'currency': data.get('currency'),
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', []),
    }
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    return send_event_to_meta('InitiateCheckout', data, custom_data)

@facebook_bp.route('/events/search', methods=['POST'])
@jwt_required(optional=True)
def event_search():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'search_string': data.get('search_string'),
    }
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    return send_event_to_meta('Search', data, custom_data)

@facebook_bp.route('/events/contact', methods=['POST'])
@jwt_required(optional=True)
def event_contact():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'contact_method': data.get('contact_method'),
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('Contact', data, custom_data)

@facebook_bp.route('/events/subscribe', methods=['POST'])
@jwt_required(optional=True)
def event_subscribe():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'value': data.get('value'),
        'currency': data.get('currency'),
        'predicted_ltv': data.get('predicted_ltv')
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('Subscribe', data, custom_data)

@facebook_bp.route('/events/add-payment-info', methods=['POST'])
@jwt_required(optional=True)
def event_add_payment_info():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'value': data.get('value'),
        'currency': data.get('currency'),
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', [])
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('AddPaymentInfo', data, custom_data)

@facebook_bp.route('/events/add-to-wishlist', methods=['POST'])
@jwt_required(optional=True)
def event_add_to_wishlist():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', []),
    }
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    return send_event_to_meta('AddToWishlist', data, custom_data)

@facebook_bp.route('/events/customize-product', methods=['POST'])
@jwt_required(optional=True)
def event_customize_product():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', []),
    }
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    return send_event_to_meta('CustomizeProduct', data, custom_data)

@facebook_bp.route('/events/donate', methods=['POST'])
@jwt_required(optional=True)
def event_donate():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'value': data.get('value'),
        'currency': data.get('currency'),
    }
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    return send_event_to_meta('Donate', data, custom_data)

@facebook_bp.route('/events/find-location', methods=['POST'])
@jwt_required(optional=True)
def event_find_location():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', []),
        'search_string': data.get('search_string')
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('FindLocation', data, custom_data)

@facebook_bp.route('/events/schedule', methods=['POST'])
@jwt_required(optional=True)
def event_schedule():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', []),
        'delivery_category': data.get('delivery_category')
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('Schedule', data, custom_data)

@facebook_bp.route('/events/start-trial', methods=['POST'])
@jwt_required(optional=True)
def event_start_trial():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'value': data.get('value'),
        'currency': data.get('currency'),
        'predicted_ltv': data.get('predicted_ltv')
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('StartTrial', data, custom_data)

@facebook_bp.route('/events/submit-application', methods=['POST'])
@jwt_required(optional=True)
def event_submit_application():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'value': data.get('value'),
        'currency': data.get('currency'),
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', [])
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('SubmitApplication', data, custom_data)

@facebook_bp.route('/events/page-view', methods=['POST'])
@jwt_required(optional=True)
def event_page_view():
    user_id = get_jwt_identity() or 1
    data = request.get_json() or {}
    custom_data = {
        'content_ids': data.get('content_ids'),
        'contents': data.get('contents', [])
    }
    
    # Test event code varsa custom_data'ya ekle
    if data.get('test_event_code'):
        custom_data['test_event_code'] = data['test_event_code']
    
    # Her event fonksiyonunda data sözlüğüne Meta user_data alanlarını ekle
    meta_user_data_fields = [
        'email', 'phone', 'fn', 'ln', 'ge', 'db', 'ct', 'st', 'zp', 'country',
        'external_id', 'client_ip_address', 'client_user_agent', 'fbc', 'fbp'
    ]
    for field in meta_user_data_fields:
        data[field] = data.get(field, '')
    
    return send_event_to_meta('PageView', data, custom_data)



@facebook_bp.route('/token-info/<gtm_container_id>', methods=['GET'])
def get_token_info(gtm_container_id):
    """Get Facebook token info by GTM container ID for GTM scripts"""
    try:
        # GTM container ID'ye göre aktif token'ı bul
        token = FacebookToken.query.filter_by(
            gtm_container_id=gtm_container_id, 
            is_active=True
        ).first()
        
        if not token:
            GtmEventLogger.log_token_info_request(
                gtm_container_id=gtm_container_id,
                success=False,
                error_message='Token not found or inactive'
            )
            return jsonify({'error': 'Token not found or inactive'}), 404
        
        GtmEventLogger.log_token_info_request(
            gtm_container_id=gtm_container_id,
            success=True
        )
        
        return jsonify({
            'pixel_id': token.dataset_id,  # dataset_id = pixel_id
            'access_token': token.access_token,
            'dataset_id': token.dataset_id
        }), 200
        
    except Exception as e:
        GtmEventLogger.log_token_info_request(
            gtm_container_id=gtm_container_id,
            success=False,
            error_message=str(e)
        )
        return jsonify({'error': str(e)}), 500 