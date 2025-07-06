from ..extensions import db
from datetime import datetime
import secrets

class GtmVerification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # GTM Container bilgileri
    gtm_container_id = db.Column(db.String(255), nullable=False)
    domain_name = db.Column(db.String(255), nullable=False)
    
    # Doğrulama durumu
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255), nullable=False)
    verified_at = db.Column(db.DateTime, nullable=True)
    
    # Zaman damgaları
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # İlişki
    user = db.relationship('User', backref=db.backref('gtm_verifications', lazy=True))
    
    def __repr__(self):
        return f'<GtmVerification {self.gtm_container_id} - {self.domain_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'gtm_container_id': self.gtm_container_id,
            'domain_name': self.domain_name,
            'is_verified': self.is_verified,
            'verification_token': self.verification_token,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @staticmethod
    def generate_verification_token():
        """Generate a unique verification token for GTM"""
        return f"CAPIFY_VERIFY_{secrets.token_hex(16)}"
    
    def verify(self):
        """Mark the GTM verification as verified"""
        self.is_verified = True
        self.verified_at = datetime.utcnow()
        self.updated_at = datetime.utcnow() 