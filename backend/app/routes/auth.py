from flask import Blueprint, request, jsonify
from ..models.user import User
from ..extensions import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_limiter.util import get_remote_address
from flask_limiter import Limiter
from app import limiter
from app.utils.hashing import hash_password, verify_password
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")  # Register için sıkı limit
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'msg': 'Email and password are required'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'msg': 'User already exists'}), 409
    
    # Create new user
    hashed_password = hash_password(data['password'])
    new_user = User(
        email=data['email'],
        password_hash=hashed_password,
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', '')
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=str(new_user.id))
        
        return jsonify({
            'msg': 'User created successfully',
            'token': access_token,
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'first_name': new_user.first_name,
                'last_name': new_user.last_name
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Error creating user'}), 500

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")  # Login için orta seviye limit
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'msg': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not verify_password(data['password'], user.password_hash):
        return jsonify({'msg': 'Invalid credentials'}), 401
    
    # Create access token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'msg': 'Login successful',
        'token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
@limiter.limit("60 per minute")  # Profile için geniş limit
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name
    }), 200