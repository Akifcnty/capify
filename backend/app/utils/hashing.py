import hashlib
import secrets
import bcrypt

def hash_user_data(data, salt=None):
    """
    Hash user data with SHA256 for anonymization
    """
    if salt is None:
        salt = secrets.token_hex(16)
    
    if isinstance(data, str):
        data = data.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(salt.encode('utf-8'))
    hash_obj.update(data)
    
    return hash_obj.hexdigest(), salt

def hash_email(email):
    """
    Hash email address for Facebook CAPI (without salt for Meta compliance)
    """
    if not email:
        return None
    
    email_lower = email.lower().strip()
    # Meta CAPI için salt olmadan hash
    if isinstance(email_lower, str):
        email_lower = email_lower.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(email_lower)
    return hash_obj.hexdigest()

def hash_phone(phone):
    """
    Hash phone number for Facebook CAPI (without salt for Meta compliance)
    """
    if not phone:
        return None
    
    # Remove all non-digit characters
    phone_clean = ''.join(filter(str.isdigit, str(phone)))
    if not phone_clean:
        return None
    
    # Meta CAPI için salt olmadan hash
    if isinstance(phone_clean, str):
        phone_clean = phone_clean.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(phone_clean)
    return hash_obj.hexdigest()

def hash_external_id(external_id):
    """
    Hash external ID for Facebook CAPI (without salt for Meta compliance)
    """
    if not external_id:
        return None
    
    external_id_str = str(external_id)
    if isinstance(external_id_str, str):
        external_id_str = external_id_str.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(external_id_str)
    return hash_obj.hexdigest()

def hash_name(name):
    """
    Hash name for Facebook CAPI (without salt for Meta compliance)
    """
    if not name:
        return None
    
    name_lower = name.lower().strip()
    if isinstance(name_lower, str):
        name_lower = name_lower.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(name_lower)
    return hash_obj.hexdigest()

def hash_city(city):
    """
    Hash city for Facebook CAPI (without salt for Meta compliance)
    """
    if not city:
        return None
    
    city_lower = city.lower().strip()
    if isinstance(city_lower, str):
        city_lower = city_lower.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(city_lower)
    return hash_obj.hexdigest()

def hash_state(state):
    """
    Hash state for Facebook CAPI (without salt for Meta compliance)
    """
    if not state:
        return None
    
    state_lower = state.lower().strip()
    if isinstance(state_lower, str):
        state_lower = state_lower.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(state_lower)
    return hash_obj.hexdigest()

def hash_zipcode(zipcode):
    """
    Hash zipcode for Facebook CAPI (without salt for Meta compliance)
    """
    if not zipcode:
        return None
    
    zipcode_str = str(zipcode)
    if isinstance(zipcode_str, str):
        zipcode_str = zipcode_str.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(zipcode_str)
    return hash_obj.hexdigest()

def hash_country(country):
    """
    Hash country for Facebook CAPI (without salt for Meta compliance)
    """
    if not country:
        return None
    
    country_lower = country.lower().strip()
    if isinstance(country_lower, str):
        country_lower = country_lower.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(country_lower)
    return hash_obj.hexdigest()

def hash_gender(gender):
    """
    Hash gender for Facebook CAPI (without salt for Meta compliance)
    """
    if not gender:
        return None
    
    gender_lower = gender.lower().strip()
    if isinstance(gender_lower, str):
        gender_lower = gender_lower.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(gender_lower)
    return hash_obj.hexdigest()

def hash_birthday(birthday):
    """
    Hash birthday for Facebook CAPI (without salt for Meta compliance)
    """
    if not birthday:
        return None
    
    birthday_str = str(birthday)
    if isinstance(birthday_str, str):
        birthday_str = birthday_str.encode('utf-8')
    
    hash_obj = hashlib.sha256()
    hash_obj.update(birthday_str)
    return hash_obj.hexdigest()

def hash_password(password):
    """
    Hash password using bcrypt
    """
    if isinstance(password, str):
        password = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password, salt).decode('utf-8')

def verify_password(password, hashed_password):
    """
    Verify password against hash
    """
    if isinstance(password, str):
        password = password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password, hashed_password) 