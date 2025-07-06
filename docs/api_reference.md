# Capify API Reference

## Auth

### POST /api/auth/register
Kullanıcı kaydı.

**Request:**
```
{
  "email": "user@example.com",
  "password": "string",
  "first_name": "string (optional)",
  "last_name": "string (optional)"
}
```
**Response:**
```
{
  "token": "jwt-token",
  "user": { "email": "user@example.com" }
}
```

### POST /api/auth/login
Kullanıcı girişi.

**Request:**
```
{
  "email": "user@example.com",
  "password": "string"
}
```
**Response:**
```
{
  "token": "jwt-token",
  "user": { "email": "user@example.com" }
}
```

---

## User

### GET /api/user/profile
Kullanıcı profilini getirir. (JWT gerekli)

### PUT /api/user/profile
Kullanıcı profilini günceller. (JWT gerekli)

---

## GTM Verification

### GET /api/user/gtm-verifications
Kullanıcının GTM verifications'larını listeler. (JWT gerekli)

### POST /api/user/gtm-verifications
Yeni GTM verification ekler. (JWT gerekli)

**Request:**
```
{
  "gtm_container_id": "GTM-ABC123",
  "domain_name": "example.com"
}
```

### PUT /api/user/gtm-verifications/{verification_id}
GTM verification günceller. (JWT gerekli)

### DELETE /api/user/gtm-verifications/{verification_id}
GTM verification siler. (JWT gerekli)

### POST /api/user/gtm-verifications/{verification_id}/verify
GTM verification doğrulama işlemi başlatır. (JWT gerekli)

### GET /api/user/gtm-verifications/{verification_id}/script
GTM verification script'ini getirir. (JWT gerekli)

---

## Facebook Token

### GET /api/user/facebook-tokens
Kullanıcının Facebook tokenlarını listeler. (JWT gerekli)

### POST /api/user/facebook-tokens
Yeni Facebook token ekler. (JWT gerekli)

**Request:**
```
{
  "pixel_id": "string",
  "access_token": "string",
  "token_name": "string (optional)"
}
```

### PUT /api/user/facebook-tokens/{token_id}
Facebook token günceller. (JWT gerekli)

### DELETE /api/user/facebook-tokens/{token_id}
Facebook token siler. (JWT gerekli)

---

## Facebook CAPI Events

### POST /api/facebook/events/lead
Lead event gönderir.

### POST /api/facebook/events/purchase
Purchase event gönderir.

### POST /api/facebook/events/view-content
ViewContent event gönderir.

### POST /api/facebook/events/add-to-cart
AddToCart event gönderir.

### POST /api/facebook/events/custom
Özel event gönderir.

**Request:**
```
{
  "pixel_id": "string",
  "access_token": "string",
  "event_name": "string",
  "user_data": { ... },
  "custom_data": { ... }
}
```

---

## GTM Script Template

### GET /api/facebook/script-template/{token_id}
Kullanıcıya özel GTM script template'i döner. (JWT gerekli) 