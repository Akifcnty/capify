from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.facebook_token import FacebookToken
from ..models.gtm_verification import GtmVerification
from ..extensions import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    
    db.session.commit()
    
    return jsonify(user.to_dict()), 200

@user_bp.route('/facebook-tokens', methods=['GET'])
@jwt_required()
def get_facebook_tokens():
    """Get user's Facebook tokens"""
    user_id = int(get_jwt_identity())
    tokens = FacebookToken.query.filter_by(user_id=user_id).all()
    
    return jsonify({'tokens': [token.to_dict() for token in tokens]}), 200

@user_bp.route('/facebook-tokens', methods=['POST'])
@jwt_required()
def add_facebook_token():
    """Add a new Facebook token"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    access_token = data.get('access_token')
    dataset_id = data.get('dataset_id')
    gtm_container_id = data.get('gtm_container_id')
    token_name = data.get('token_name')

    # Zorunlu alanlar kontrolü
    if not all([access_token, dataset_id, gtm_container_id]):
        return jsonify({'msg': 'Access Token, Dataset ID ve GTM Container ID zorunludur'}), 400

    # GTM doğrulaması kontrolü - sadece doğrulanmış GTM'ler kullanılabilir
    gtm_verification = GtmVerification.query.filter_by(
        user_id=user_id, 
        gtm_container_id=gtm_container_id, 
        is_verified=True
    ).first()
    
    if not gtm_verification:
        return jsonify({
            'msg': 'Bu GTM Container ID için doğrulama yapılmamış. Önce GTM doğrulamasını tamamlayın.'
        }), 400

    # Aynı GTM Container ID'ye zaten token var mı kontrolü
    existing_token = FacebookToken.query.filter_by(
        user_id=user_id, 
        gtm_container_id=gtm_container_id
    ).first()
    
    if existing_token:
        return jsonify({
            'msg': f'Bu GTM Container ID ({gtm_container_id}) için zaten bir token mevcut. Her GTM doğrulamasına sadece bir token eklenebilir.'
        }), 400

    if not token_name:
        token_name = FacebookToken.generate_token_name()

    # Create new token
    token = FacebookToken(
        user_id=user_id,
        access_token=access_token,
        token_name=token_name,
        dataset_id=dataset_id,
        gtm_container_id=gtm_container_id,
        is_active=True
    )

    db.session.add(token)
    db.session.commit()

    return jsonify(token.to_dict()), 201

@user_bp.route('/facebook-tokens/<int:token_id>', methods=['PUT'])
@jwt_required()
def update_facebook_token(token_id):
    """Update Facebook token"""
    user_id = int(get_jwt_identity())
    print(f"Updating token {token_id} for user {user_id}")
    
    token = FacebookToken.query.filter_by(id=token_id, user_id=user_id).first()
    
    if not token:
        print(f"Token {token_id} not found for user {user_id}")
        return jsonify({'msg': 'Token not found'}), 404
    
    data = request.get_json()
    print(f"Update data: {data}")
    
    try:
        if 'access_token' in data:
            token.access_token = data['access_token']
        if 'token_name' in data:
            token.token_name = data['token_name']
        if 'is_active' in data:
            token.is_active = data['is_active']
        if 'dataset_id' in data:
            token.dataset_id = data['dataset_id']
        if 'gtm_container_id' in data:
            token.gtm_container_id = data['gtm_container_id']
        
        db.session.commit()
        print(f"Token {token_id} updated successfully")
        
        return jsonify(token.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating token {token_id}: {str(e)}")
        return jsonify({'msg': 'Token güncellenirken hata oluştu', 'error': str(e)}), 500

@user_bp.route('/facebook-tokens/<int:token_id>', methods=['DELETE'])
@jwt_required()
def delete_facebook_token(token_id):
    """Delete Facebook token"""
    user_id = int(get_jwt_identity())
    token = FacebookToken.query.filter_by(id=token_id, user_id=user_id).first()
    
    if not token:
        return jsonify({'msg': 'Token not found'}), 404
    
    db.session.delete(token)
    db.session.commit()
    
    return jsonify({'msg': 'Token deleted successfully'}), 200

@user_bp.route('/facebook-tokens/<int:token_id>/script', methods=['GET'])
@jwt_required()
def get_script_template(token_id):
    """Get GTM script template for Facebook token"""
    user_id = int(get_jwt_identity())
    token = FacebookToken.query.filter_by(id=token_id, user_id=user_id).first()
    
    if not token:
        return jsonify({'msg': 'Token not found'}), 404
    
    # Generate separate GTM script templates for each event type
    scripts = {
        'purchase': f"""// Facebook Conversion API - Purchase Event
// GTM Custom HTML Tag for Purchase Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Get Facebook credentials with caching
  async function getFacebookCredentials() {{
    const now = Date.now();
    
    // Use cached credentials if still valid (1 hour cache)
    if (cachedCredentials && now < credentialsExpiry) {{
      return cachedCredentials;
    }}
    
    try {{
      // Fetch credentials from Capify API
      const response = await fetch(CAPIFY_API, {{
        method: 'GET',
        headers: {{
          'Authorization': 'Bearer {{{{JWT Token}}}}',
          'Content-Type': 'application/json'
        }}
      }});
      
      if (!response.ok) {{
        throw new Error('Failed to fetch credentials');
      }}
      
      const credentials = await response.json();
      
      // Cache credentials for 1 hour
      cachedCredentials = credentials;
      credentialsExpiry = now + (60 * 60 * 1000);
      
      return credentials;
    }} catch (error) {{
      console.error('Error fetching Facebook credentials:', error);
      throw error;
    }}
  }}
  
  // Purchase event handler
  async function handlePurchase() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_ids: ['{{{{Product ID}}}}'],
          content_type: 'product',
          num_items: '{{{{Quantity}}}}',
          content_name: '{{{{Product Name}}}}',
          content_category: '{{{{Product Category}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook Purchase Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook Purchase Event Error:', error);
    }}
  }}
  
  // Execute purchase event
  handlePurchase();
}})();
</script>""",

        'lead': f"""// Facebook Conversion API - Lead Event
// GTM Custom HTML Tag for Lead Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Get Facebook credentials with caching
  async function getFacebookCredentials() {{
    const now = Date.now();
    
    // Use cached credentials if still valid (1 hour cache)
    if (cachedCredentials && now < credentialsExpiry) {{
      return cachedCredentials;
    }}
    
    try {{
      // Fetch credentials from Capify API
      const response = await fetch(CAPIFY_API, {{
        method: 'GET',
        headers: {{
          'Authorization': 'Bearer {{{{JWT Token}}}}',
          'Content-Type': 'application/json'
        }}
      }});
      
      if (!response.ok) {{
        throw new Error('Failed to fetch credentials');
      }}
      
      const credentials = await response.json();
      
      // Cache credentials for 1 hour
      cachedCredentials = credentials;
      credentialsExpiry = now + (60 * 60 * 1000);
      
      return credentials;
    }} catch (error) {{
      console.error('Error fetching Facebook credentials:', error);
      throw error;
    }}
  }}
  
  // Lead event handler
  async function handleLead() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook Lead Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook Lead Event Error:', error);
    }}
  }}
  
  // Execute lead event
  handleLead();
}})();
</script>""",

        'view_content': f"""// Facebook Conversion API - ViewContent Event
// GTM Custom HTML Tag for ViewContent Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Get Facebook credentials with caching
  async function getFacebookCredentials() {{
    const now = Date.now();
    
    // Use cached credentials if still valid (1 hour cache)
    if (cachedCredentials && now < credentialsExpiry) {{
      return cachedCredentials;
    }}
    
    try {{
      // Fetch credentials from Capify API
      const response = await fetch(CAPIFY_API, {{
        method: 'GET',
        headers: {{
          'Authorization': 'Bearer {{{{JWT Token}}}}',
          'Content-Type': 'application/json'
        }}
      }});
      
      if (!response.ok) {{
        throw new Error('Failed to fetch credentials');
      }}
      
      const credentials = await response.json();
      
      // Cache credentials for 1 hour
      cachedCredentials = credentials;
      credentialsExpiry = now + (60 * 60 * 1000);
      
      return credentials;
    }} catch (error) {{
      console.error('Error fetching Facebook credentials:', error);
      throw error;
    }}
  }}
  
  // ViewContent event handler
  async function handleViewContent() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'ViewContent',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_ids: ['{{{{Product ID}}}}'],
          content_name: '{{{{Product Name}}}}',
          content_category: '{{{{Product Category}}}}',
          content_type: 'product'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook ViewContent Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook ViewContent Event Error:', error);
    }}
  }}
  
  // Execute view content event
  handleViewContent();
}})();
</script>""",

        'add_to_cart': f"""// Facebook Conversion API - AddToCart Event
// GTM Custom HTML Tag for AddToCart Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Get Facebook credentials with caching
  async function getFacebookCredentials() {{
    const now = Date.now();
    
    // Use cached credentials if still valid (1 hour cache)
    if (cachedCredentials && now < credentialsExpiry) {{
      return cachedCredentials;
    }}
    
    try {{
      // Fetch credentials from Capify API
      const response = await fetch(CAPIFY_API, {{
        method: 'GET',
        headers: {{
          'Authorization': 'Bearer {{{{JWT Token}}}}',
          'Content-Type': 'application/json'
        }}
      }});
      
      if (!response.ok) {{
        throw new Error('Failed to fetch credentials');
      }}
      
      const credentials = await response.json();
      
      // Cache credentials for 1 hour
      cachedCredentials = credentials;
      credentialsExpiry = now + (60 * 60 * 1000);
      
      return credentials;
    }} catch (error) {{
      console.error('Error fetching Facebook credentials:', error);
      throw error;
    }}
  }}
  
  // AddToCart event handler
  async function handleAddToCart() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'AddToCart',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_ids: ['{{{{Product ID}}}}'],
          content_name: '{{{{Product Name}}}}',
          content_category: '{{{{Product Category}}}}',
          content_type: 'product',
          num_items: '{{{{Quantity}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook AddToCart Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook AddToCart Event Error:', error);
    }}
  }}
  
  // Execute add to cart event
  handleAddToCart();
}})();
</script>""",

        'initiate_checkout': f"""// Facebook Conversion API - InitiateCheckout Event
// GTM Custom HTML Tag for InitiateCheckout Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // InitiateCheckout event handler
  async function handleInitiateCheckout() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'InitiateCheckout',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_ids: ['{{{{Product ID}}}}'],
          content_name: '{{{{Product Name}}}}',
          content_category: '{{{{Product Category}}}}',
          content_type: 'product',
          num_items: '{{{{Quantity}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook InitiateCheckout Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook InitiateCheckout Event Error:', error);
    }}
  }}
  
  // Execute initiate checkout event
  handleInitiateCheckout();
}})();
</script>""",

        'complete_registration': f"""// Facebook Conversion API - CompleteRegistration Event
// GTM Custom HTML Tag for CompleteRegistration Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // CompleteRegistration event handler
  async function handleCompleteRegistration() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'CompleteRegistration',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook CompleteRegistration Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook CompleteRegistration Event Error:', error);
    }}
  }}
  
  // Execute complete registration event
  handleCompleteRegistration();
}})();
</script>""",

        'add_to_wishlist': f"""// Facebook Conversion API - AddToWishlist Event
// GTM Custom HTML Tag for AddToWishlist Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // AddToWishlist event handler
  async function handleAddToWishlist() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'AddToWishlist',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_ids: ['{{{{Product ID}}}}'],
          content_name: '{{{{Product Name}}}}',
          content_category: '{{{{Product Category}}}}',
          content_type: 'product'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook AddToWishlist Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook AddToWishlist Event Error:', error);
    }}
  }}
  
  // Execute add to wishlist event
  handleAddToWishlist();
}})();
</script>""",

        'search': f"""// Facebook Conversion API - Search Event
// GTM Custom HTML Tag for Search Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Search event handler
  async function handleSearch() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'Search',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          search_string: '{{{{Search Query}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook Search Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook Search Event Error:', error);
    }}
  }}
  
  // Execute search event
  handleSearch();
}})();
</script>""",

        'contact': f"""// Facebook Conversion API - Contact Event
// GTM Custom HTML Tag for Contact Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Contact event handler
  async function handleContact() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'Contact',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook Contact Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook Contact Event Error:', error);
    }}
  }}
  
  // Execute contact event
  handleContact();
}})();
</script>""",

        'customize_product': f"""// Facebook Conversion API - CustomizeProduct Event
// GTM Custom HTML Tag for CustomizeProduct Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // CustomizeProduct event handler
  async function handleCustomizeProduct() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'CustomizeProduct',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: 'product'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook CustomizeProduct Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook CustomizeProduct Event Error:', error);
    }}
  }}
  
  // Execute customize product event
  handleCustomizeProduct();
}})();
</script>""",

        'donate': f"""// Facebook Conversion API - Donate Event
// GTM Custom HTML Tag for Donate Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Donate event handler
  async function handleDonate() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'Donate',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify({{ data: [payload] }})
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook Donate Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook Donate Event Error:', error);
    }}
  }}
  
  // Execute donate event
  handleDonate();
}})();
</script>""",

        'find_location': f"""// Facebook Conversion API - FindLocation Event
// GTM Custom HTML Tag for FindLocation Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // FindLocation event handler
  async function handleFindLocation() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'FindLocation',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify(payload)
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook FindLocation Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook FindLocation Event Error:', error);
    }}
  }}
  
  // Execute find location event
  handleFindLocation();
}})();
</script>""",

        'schedule': f"""// Facebook Conversion API - Schedule Event
// GTM Custom HTML Tag for Schedule Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Schedule event handler
  async function handleSchedule() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'Schedule',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify(payload)
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook Schedule Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook Schedule Event Error:', error);
    }}
  }}
  
  // Execute schedule event
  handleSchedule();
}})();
</script>""",

        'start_trial': f"""// Facebook Conversion API - StartTrial Event
// GTM Custom HTML Tag for StartTrial Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // StartTrial event handler
  async function handleStartTrial() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'StartTrial',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify(payload)
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook StartTrial Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook StartTrial Event Error:', error);
    }}
  }}
  
  // Execute start trial event
  handleStartTrial();
}})();
</script>""",

        'submit_application': f"""// Facebook Conversion API - SubmitApplication Event
// GTM Custom HTML Tag for SubmitApplication Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // SubmitApplication event handler
  async function handleSubmitApplication() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'SubmitApplication',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify(payload)
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook SubmitApplication Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook SubmitApplication Event Error:', error);
    }}
  }}
  
  // Execute submit application event
  handleSubmitApplication();
}})();
</script>""",

        'subscribe': f"""// Facebook Conversion API - Subscribe Event
// GTM Custom HTML Tag for Subscribe Events
// Generated for Pixel ID: {token.pixel_id}

<script>
(function() {{
  'use strict';
  
  // Configuration
  const PIXEL_ID = '{token.pixel_id}';
  const CAPIFY_API = 'https://capify.com/api/facebook/credentials';
  
  // Cache for credentials
  let cachedCredentials = null;
  let credentialsExpiry = 0;
  
  // Helper function to get user data
  function getUserData() {{
    return {{
      client_ip_address: '{{{{Client IP Address}}}}',
      client_user_agent: '{{{{User Agent}}}}',
      fbc: '{{{{Facebook Click ID}}}}',
      fbp: '{{{{Facebook Browser ID}}}}',
      user_data: {{
        em: '{{{{User Email}}}}',
        ph: '{{{{User Phone}}}}',
        external_id: '{{{{User ID}}}}',
        city: '{{{{User City}}}}',
        country: '{{{{User Country}}}}',
        db: '{{{{User Birthday}}}}',
        first_name: '{{{{User First Name}}}}',
        last_name: '{{{{User Last Name}}}}',
        gender: '{{{{User Gender}}}}',
        st: '{{{{User State}}}}',
        zp: '{{{{User Zip}}}}'
      }}
    }};
  }}
  
  // Subscribe event handler
  async function handleSubscribe() {{
    try {{
      // Get Facebook credentials
      const credentials = await getFacebookCredentials();
      
      const payload = {{
        event_name: 'Subscribe',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href.replace("://", "://www."),
        user_data: getUserData().user_data,
        custom_data: {{
          value: '{{{{Event Value}}}}',
          currency: '{{{{Event Currency}}}}',
          content_name: '{{{{Content Name}}}}',
          content_category: '{{{{Content Category}}}}',
          content_ids: ['{{{{Content ID}}}}'],
          content_type: '{{{{Content Type}}}}'
        }}
      }};
      
      // Send directly to Facebook Conversion API
      const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${{credentials.dataset_id}}/events?access_token=${{credentials.access_token}}`, {{
        method: 'POST',
        headers: {{
          'Content-Type': 'application/json'
        }},
        body: JSON.stringify(payload)
      }});
      
      const result = await facebookResponse.json();
      console.log('Facebook Subscribe Event Response:', result);
      
      if (result.error) {{
        console.error('Facebook API Error:', result.error);
      }}
      
    }} catch (error) {{
      console.error('Facebook Subscribe Event Error:', error);
    }}
  }}
  
  // Execute subscribe event
  handleSubscribe();
}})();
</script>"""
    }
    
    return jsonify({
        'scripts': scripts,
        'token': token.to_dict(),
        'instructions': {
            'general': 'Her event için ayrı GTM Custom HTML Tag oluşturun ve uygun trigger\'ları ayarlayın.',
            'access_token': 'Tüm script\'lerde YOUR_ACCESS_TOKEN_HERE yerine gerçek Facebook Access Token\'ınızı yazın.',
            'variables': 'GTM\'de gerekli değişkenleri oluşturun ve script\'lerdeki placeholder\'ları değiştirin.'
        }
    }), 200

@user_bp.route('/facebook/credentials', methods=['GET'])
@jwt_required()
def get_facebook_credentials():
    """Get Facebook access token and dataset id for GTM scripts"""
    user_id = int(get_jwt_identity())
    
    # Get user's active Facebook token
    token = FacebookToken.query.filter_by(user_id=user_id, is_active=True).first()
    
    if not token:
        return jsonify({'msg': 'No active Facebook token found'}), 404
    
    # Return credentials with cache headers (1 hour)
    response = jsonify({
        'access_token': token.access_token,
        'dataset_id': token.dataset_id,
        'pixel_id': token.pixel_id
    })
    
    # Set cache headers for 1 hour
    response.headers['Cache-Control'] = 'max-age=3600, public'
    response.headers['Expires'] = '3600'
    
    return response, 200 