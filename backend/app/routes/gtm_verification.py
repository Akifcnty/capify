from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.gtm_verification import GtmVerification
from ..models.facebook_token import FacebookToken
from ..extensions import db
import requests
import re
import urllib3
import os
import certifi
from datetime import datetime
from ..utils.ssl_config import get_ssl_verify_setting

# TLS uyarılarını kapat
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

gtm_verification_bp = Blueprint('gtm_verification', __name__)

@gtm_verification_bp.route('/gtm-verifications', methods=['GET'])
@jwt_required()
def get_gtm_verifications():
    """Get user's GTM verifications"""
    user_id = int(get_jwt_identity())
    verifications = GtmVerification.query.filter_by(user_id=user_id).all()
    
    return jsonify({'verifications': [verification.to_dict() for verification in verifications]}), 200

@gtm_verification_bp.route('/gtm-verifications', methods=['POST'])
@jwt_required()
def add_gtm_verification():
    """Add a new GTM verification"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    gtm_container_id = data.get('gtm_container_id')
    domain_name = data.get('domain_name')

    # Zorunlu alanlar kontrolü
    if not all([gtm_container_id, domain_name]):
        return jsonify({'msg': 'GTM Container ID ve Domain Name zorunludur'}), 400

    # GTM Container ID format kontrolü - daha esnek
    if not re.match(r'^GTM-[A-Z0-9]{6,10}$', gtm_container_id):
        return jsonify({'msg': 'Geçersiz GTM Container ID formatı. Örnek: GTM-XXXXXX'}), 400

    # Domain format kontrolü
    if not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$', domain_name):
        return jsonify({'msg': 'Geçersiz domain formatı'}), 400

    # Aynı domain için zaten verification var mı kontrol et
    existing_verification = GtmVerification.query.filter_by(
        user_id=user_id, 
        domain_name=domain_name
    ).first()
    
    if existing_verification:
        return jsonify({'msg': 'Bu domain için zaten bir GTM verification mevcut'}), 400

    # Create new verification
    verification = GtmVerification(
        user_id=user_id,
        gtm_container_id=gtm_container_id,
        domain_name=domain_name,
        verification_token=GtmVerification.generate_verification_token(),
        is_verified=False
    )

    db.session.add(verification)
    db.session.commit()

    return jsonify(verification.to_dict()), 201

@gtm_verification_bp.route('/gtm-verifications/<int:verification_id>', methods=['PUT'])
@jwt_required()
def update_gtm_verification(verification_id):
    """Update GTM verification"""
    user_id = int(get_jwt_identity())
    verification = GtmVerification.query.filter_by(id=verification_id, user_id=user_id).first()
    
    if not verification:
        return jsonify({'msg': 'GTM verification not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'gtm_container_id' in data:
            # GTM Container ID format kontrolü - daha esnek
            if not re.match(r'^GTM-[A-Z0-9]{6,10}$', data['gtm_container_id']):
                return jsonify({'msg': 'Geçersiz GTM Container ID formatı. Örnek: GTM-XXXXXX'}), 400
            verification.gtm_container_id = data['gtm_container_id']
        
        if 'domain_name' in data:
            # Domain format kontrolü
            if not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$', data['domain_name']):
                return jsonify({'msg': 'Geçersiz domain formatı'}), 400
            verification.domain_name = data['domain_name']
        
        db.session.commit()
        
        return jsonify(verification.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'GTM verification güncellenirken hata oluştu', 'error': str(e)}), 500

@gtm_verification_bp.route('/gtm-verifications/<int:verification_id>', methods=['DELETE'])
@jwt_required()
def delete_gtm_verification(verification_id):
    """Delete GTM verification"""
    user_id = int(get_jwt_identity())
    verification = GtmVerification.query.filter_by(id=verification_id, user_id=user_id).first()
    
    if not verification:
        return jsonify({'msg': 'GTM verification not found'}), 404
    
    # GTM doğrulaması silinmeden önce, bu GTM'ye ait Facebook token'ları da sil
    facebook_tokens = FacebookToken.query.filter_by(
        user_id=user_id, 
        gtm_container_id=verification.gtm_container_id
    ).all()
    
    deleted_tokens_count = 0
    for token in facebook_tokens:
        db.session.delete(token)
        deleted_tokens_count += 1
    
    # GTM doğrulamasını sil
    db.session.delete(verification)
    db.session.commit()
    
    if deleted_tokens_count > 0:
        return jsonify({
            'msg': f'GTM verification ve {deleted_tokens_count} adet Facebook token başarıyla silindi',
            'deleted_tokens_count': deleted_tokens_count
        }), 200
    else:
        return jsonify({'msg': 'GTM verification deleted successfully'}), 200

@gtm_verification_bp.route('/gtm-verifications/<int:verification_id>/verify', methods=['POST'])
@jwt_required()
def verify_gtm_verification(verification_id):
    """Verify GTM verification by checking if verification token exists on the website"""
    user_id = int(get_jwt_identity())
    verification = GtmVerification.query.filter_by(id=verification_id, user_id=user_id).first()
    
    if not verification:
        return jsonify({'msg': 'GTM verification not found'}), 404
    
    if verification.is_verified:
        return jsonify({'msg': 'GTM verification already verified'}), 400
    
    try:
        # Website'de verification token'ı kontrol et
        protocol = 'https' if verification.domain_name.startswith('https://') else 'http'
        domain = verification.domain_name.replace('https://', '').replace('http://', '')
        url = f"{protocol}://{domain}"
        
        # Get SSL verify setting
        ssl_verify = get_ssl_verify_setting()
        
        # Website'i kontrol et
        response = requests.get(url, timeout=10, allow_redirects=True, verify=ssl_verify)
        
        if response.status_code == 200:
            # Verification token'ı HTML içinde ara
            verification_token = verification.verification_token
            if verification_token in response.text:
                verification.is_verified = True
                verification.verified_at = datetime.utcnow()
                db.session.commit()
                
                return jsonify({
                    'msg': 'GTM verification successful',
                    'verification': {
                        'id': verification.id,
                        'domain_name': verification.domain_name,
                        'gtm_container_id': verification.gtm_container_id,
                        'is_verified': verification.is_verified,
                        'verified_at': verification.verified_at.isoformat() if verification.verified_at else None
                    }
                }), 200
            else:
                return jsonify({
                    'msg': 'Verification token not found on website',
                    'verification_token': verification_token,
                    'url': url
                }), 400
        else:
            return jsonify({
                'msg': f'Website not accessible (HTTP {response.status_code})',
                'url': url,
                'status_code': response.status_code
            }), 400
            
    except requests.exceptions.SSLError as e:
        return jsonify({
            'msg': 'SSL verification failed',
            'error': str(e),
            'url': url
        }), 400
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'msg': 'Failed to access website',
            'error': str(e),
            'url': url
        }), 400
        
    except Exception as e:
        return jsonify({
            'msg': 'Verification failed',
            'error': str(e)
        }), 500

@gtm_verification_bp.route('/gtm-verifications/<int:verification_id>/script', methods=['GET'])
@jwt_required()
def get_verification_script_endpoint(verification_id):
    """Get verification script for GTM verification"""
    user_id = int(get_jwt_identity())
    verification = GtmVerification.query.filter_by(id=verification_id, user_id=user_id).first()
    
    if not verification:
        return jsonify({'msg': 'GTM verification not found'}), 404
    
    return jsonify({
        'verification_token': verification.verification_token,
        'verification_script': get_verification_script(verification)
    }), 200

def get_verification_script(verification):
    """Generate verification script for GTM"""
    token = verification.verification_token
    gtm_id = verification.gtm_container_id
    domain = verification.domain_name
    return f"""
<!-- CAPIFY GTM Verification Script -->
<meta name=\"capify-verification-token\" content=\"{token}\">
<div id=\"capify-verification\" style=\"display:none\">{token}</div>
<script>
(function() {{
    'use strict';
    window.CAPIFY_VERIFICATION_TOKEN = '{token}';
    if (typeof window.dataLayer !== 'undefined') {{
        window.dataLayer.push({{
            'event': 'capify_verification',
            'capify_verification_token': '{token}',
            'gtm_container_id': '{gtm_id}',
            'domain': '{domain}'
        }});
    }}
}})();
</script>
""" 