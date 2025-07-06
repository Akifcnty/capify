from .services.facebook_event_sender import send_event_to_meta

def send_facebook_event(event_name, data, custom_data=None):
    send_event_to_meta(event_name, data, custom_data) 