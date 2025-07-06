import pytest
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.gtm_verification import GtmVerification
from app.utils.hashing import hash_password

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    # Test user oluştur
    with app.app_context():
        user = User(
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        
        # Login yap ve token al
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        token = response.json['token']
        
        return {'Authorization': f'Bearer {token}'}

def test_add_gtm_verification(client, auth_headers):
    """Test GTM verification ekleme"""
    response = client.post('/api/user/gtm-verifications', 
                          json={
                              'gtm_container_id': 'GTM-ABC123',
                              'domain_name': 'example.com'
                          },
                          headers=auth_headers)
    
    assert response.status_code == 201
    data = response.json
    assert data['gtm_container_id'] == 'GTM-ABC123'
    assert data['domain_name'] == 'example.com'
    assert data['is_verified'] == False
    assert 'verification_token' in data

def test_invalid_gtm_container_id(client, auth_headers):
    """Test geçersiz GTM Container ID"""
    response = client.post('/api/user/gtm-verifications', 
                          json={
                              'gtm_container_id': 'INVALID-ID',
                              'domain_name': 'example.com'
                          },
                          headers=auth_headers)
    
    assert response.status_code == 400
    assert 'Geçersiz GTM Container ID formatı' in response.json['msg']

def test_invalid_domain_name(client, auth_headers):
    """Test geçersiz domain name"""
    response = client.post('/api/user/gtm-verifications', 
                          json={
                              'gtm_container_id': 'GTM-ABC123',
                              'domain_name': 'invalid-domain!'
                          },
                          headers=auth_headers)
    
    assert response.status_code == 400
    assert 'Geçersiz domain formatı' in response.json['msg']

def test_get_gtm_verifications(client, auth_headers):
    """Test GTM verifications listesi"""
    # Önce bir verification ekle
    client.post('/api/user/gtm-verifications', 
                json={
                    'gtm_container_id': 'GTM-ABC123',
                    'domain_name': 'example.com'
                },
                headers=auth_headers)
    
    # Listeyi al
    response = client.get('/api/user/gtm-verifications', headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json
    assert len(data['verifications']) == 1
    assert data['verifications'][0]['gtm_container_id'] == 'GTM-ABC123'

def test_delete_gtm_verification(client, auth_headers):
    """Test GTM verification silme"""
    # Önce bir verification ekle
    response = client.post('/api/user/gtm-verifications', 
                          json={
                              'gtm_container_id': 'GTM-ABC123',
                              'domain_name': 'example.com'
                          },
                          headers=auth_headers)
    
    verification_id = response.json['id']
    
    # Sil
    response = client.delete(f'/api/user/gtm-verifications/{verification_id}', 
                            headers=auth_headers)
    
    assert response.status_code == 200
    
    # Kontrol et
    response = client.get('/api/user/gtm-verifications', headers=auth_headers)
    assert len(response.json['verifications']) == 0

def test_get_verification_script(client, auth_headers):
    """Test verification script alma"""
    # Önce bir verification ekle
    response = client.post('/api/user/gtm-verifications', 
                          json={
                              'gtm_container_id': 'GTM-ABC123',
                              'domain_name': 'example.com'
                          },
                          headers=auth_headers)
    
    verification_id = response.json['id']
    
    # Script al
    response = client.get(f'/api/user/gtm-verifications/{verification_id}/script', 
                         headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json
    assert 'verification_script' in data
    assert 'CAPIFY_VERIFICATION_TOKEN' in data['verification_script']
    assert 'GTM-ABC123' in data['verification_script'] 