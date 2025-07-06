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


def test_register_and_login(client):
    # Register
    res = client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'test1234'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert 'token' in data
    assert data['user']['email'] == 'test@example.com'

    # Login
    res = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'test1234'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'token' in data
    assert data['user']['email'] == 'test@example.com'

    # Wrong password
    res = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'wrongpass'
    })
    assert res.status_code == 401 