import pytest
from app import create_app, db
from app.models.user import User

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

def get_token(client):
    client.post('/api/auth/register', json={
        'email': 'test3@example.com',
        'password': 'test1234'
    })
    res = client.post('/api/auth/login', json={
        'email': 'test3@example.com',
        'password': 'test1234'
    })
    return res.get_json()['token']

def test_add_and_list_facebook_token(client):
    token = get_token(client)
    # Add token
    res = client.post('/api/user/facebook-tokens',
        json={'pixel_id': '123456789', 'access_token': 'abc123'},
        headers={'Authorization': f'Bearer {token}'}
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data['pixel_id'] == '123456789'
    # List tokens
    res = client.get('/api/user/facebook-tokens', headers={'Authorization': f'Bearer {token}'})
    assert res.status_code == 200
    tokens = res.get_json()
    assert isinstance(tokens, list)
    assert any(t['pixel_id'] == '123456789' for t in tokens) 