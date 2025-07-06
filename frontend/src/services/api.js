// import axios from 'axios'; // KALDIRILDI

// API adresini otomatik algılayan fonksiyon
export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5050/api';
  }
  return window.location.origin + '/api';
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No token found. Please login again.');
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Auth endpoints
export async function login(email, password) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || 'Login failed');
  }

  localStorage.setItem('token', data.token);
  return data;
}

export async function register(email, password, first_name = '', last_name = '') {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, first_name, last_name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return await response.json();
}

// User endpoints
export async function getProfile() {
  return apiRequest('/user/profile');
}

export async function updateProfile(data) {
  return apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Facebook token endpoints
export async function getFacebookTokens() {
  return apiRequest('/user/facebook-tokens');
}

export async function addFacebookToken(tokenData) {
  return apiRequest('/user/facebook-tokens', {
    method: 'POST',
    body: JSON.stringify(tokenData),
  });
}

export async function updateFacebookToken(tokenId, tokenData) {
  return apiRequest(`/user/facebook-tokens/${tokenId}`, {
    method: 'PUT',
    body: JSON.stringify(tokenData),
  });
}

export async function deleteFacebookToken(tokenId) {
  return apiRequest(`/user/facebook-tokens/${tokenId}`, {
    method: 'DELETE',
  });
}

// Script template endpoint
export async function getScriptTemplate(tokenId) {
  return apiRequest(`/user/facebook-tokens/${tokenId}/script`);
}

// Facebook CAPI event endpoints
export async function sendLeadEvent(eventData) {
  return apiRequest('/facebook/events/lead', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export async function sendPurchaseEvent(eventData) {
  return apiRequest('/facebook/events/purchase', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export async function sendViewContentEvent(eventData) {
  return apiRequest('/facebook/events/view-content', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export async function sendAddToCartEvent(eventData) {
  return apiRequest('/facebook/events/add-to-cart', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export async function sendCustomEvent(eventData) {
  return apiRequest('/facebook/events/custom', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

// GTM verification endpoints
export async function getGtmVerifications() {
  return apiRequest('/user/gtm-verifications');
}

export async function addGtmVerification(verificationData) {
  return apiRequest('/user/gtm-verifications', {
    method: 'POST',
    body: JSON.stringify(verificationData),
  });
}

export async function updateGtmVerification(verificationId, verificationData) {
  return apiRequest(`/user/gtm-verifications/${verificationId}`, {
    method: 'PUT',
    body: JSON.stringify(verificationData),
  });
}

export async function deleteGtmVerification(verificationId) {
  return apiRequest(`/user/gtm-verifications/${verificationId}`, {
    method: 'DELETE',
  });
}

export async function verifyGtmVerification(verificationId) {
  return apiRequest(`/user/gtm-verifications/${verificationId}/verify`, {
    method: 'POST',
  });
}

export async function getGtmVerificationScript(verificationId) {
  return apiRequest(`/user/gtm-verifications/${verificationId}/script`);
}

export async function sendTestEvent({ endpoint, payload, jwtToken }) {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

// Default API export with common HTTP methods
const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
};

export default api; 