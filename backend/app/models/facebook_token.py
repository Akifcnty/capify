from ..extensions import db
from datetime import datetime
import secrets

class FacebookToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    dataset_id = db.Column(db.String(255), nullable=False)
    dataset_name = db.Column(db.String(255), nullable=True)
    access_token = db.Column(db.Text, nullable=False)  # Encrypted token
    token_name = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    last_used = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)
    gtm_container_id = db.Column(db.String(255), nullable=False)  # GTM Tag/Container ID
    
    # Relationship
    user = db.relationship('User', backref=db.backref('facebook_tokens', lazy=True))
    
    def __repr__(self):
        return f'<FacebookToken {self.dataset_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'gtm_container_id': self.gtm_container_id,
            'dataset_id': self.dataset_id,
            'dataset_name': self.dataset_name,
            'access_token': self.access_token,
            'token_name': self.token_name,
            'is_active': self.is_active,
            'last_used': self.last_used.isoformat() if self.last_used else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def generate_token_name():
        """Generate a unique token name"""
        return f"Token_{secrets.token_hex(8)}" 