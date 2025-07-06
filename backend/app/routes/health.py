from flask import Blueprint, jsonify
from flask_cors import cross_origin

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """Health check endpoint for Railway deployment"""
    return jsonify({
        'status': 'healthy',
        'message': 'CAPIFY API is running',
        'version': '1.0.0'
    }), 200 