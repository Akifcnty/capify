from app import create_app
from app.models.gtm_verification import GtmVerification
from app.models.user import User
from app.models.facebook_token import FacebookToken

app = create_app()
app.app_context().push()

# Kullanıcıyı bul
user = User.query.first()
print(f'User: {user.email if user else "No user"}')

if user:
    # GTM doğrulamalarını kontrol et
    gtm_verifications = GtmVerification.query.filter_by(user_id=user.id).all()
    print(f'\nGTM Verifications ({len(gtm_verifications)}):')
    for g in gtm_verifications:
        print(f'  - {g.domain_name} (verified: {g.is_verified})')
    
    # Facebook tokenları kontrol et
    facebook_tokens = FacebookToken.query.filter_by(user_id=user.id).all()
    print(f'\nFacebook Tokens ({len(facebook_tokens)}):')
    for t in facebook_tokens:
        print(f'  - {t.gtm_container_id} (active: {t.is_active})')
else:
    print("No user found") 