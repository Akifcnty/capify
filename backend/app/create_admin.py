from app import create_app
from app.extensions import db
from app.models.user import User

ADMIN_EMAIL = "admin@capify.com"  # Dilediğin gibi değiştir
ADMIN_PASSWORD = "admin123"        # Dilediğin gibi değiştir

app = create_app()

with app.app_context():
    if not User.query.filter_by(email=ADMIN_EMAIL).first():
        admin = User(email=ADMIN_EMAIL, is_admin=True)
        admin.set_password(ADMIN_PASSWORD)
        db.session.add(admin)
        db.session.commit()
        print(f"Admin kullanıcı oluşturuldu: {ADMIN_EMAIL}")
    else:
        print("Admin kullanıcı zaten mevcut.") 