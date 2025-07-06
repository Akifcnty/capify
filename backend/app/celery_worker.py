from app import create_app
from app.extensions import make_celery
from app.services.facebook_event_sender import send_facebook_event

flask_app = create_app()
celery = make_celery(flask_app)

celery.tasks.register(send_facebook_event) 