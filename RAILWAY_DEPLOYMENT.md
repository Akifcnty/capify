# 🚀 Railway Deployment Rehberi - CAPIFY Project

## 📋 Adım Adım Deployment

### 1. **Railway Hesabı Oluşturma**
1. [railway.app](https://railway.app) adresine gidin
2. GitHub ile giriş yapın
3. "Start a New Project" tıklayın

### 2. **GitHub Repository Bağlama**
1. "Deploy from GitHub repo" seçin
2. `CAPIFY 2` repository'nizi seçin
3. "Deploy Now" tıklayın

### 3. **Environment Variables Ayarlama**
Railway dashboard'da "Variables" sekmesine gidin ve şunları ekleyin:

```bash
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=capify-secret-key-2024-production-deploy
FLASK_APP=run.py

# Database (Railway PostgreSQL - otomatik eklenecek)
DATABASE_URL=postgresql://username:password@host:port/database

# CORS - CAPIFY frontend domain
CORS_ORIGINS=https://capify-frontend.railway.app,https://capify.railway.app,http://localhost:3000

# JWT Configuration
JWT_SECRET_KEY=capify-jwt-secret-2024-production
JWT_ACCESS_TOKEN_EXPIRES=3600

# Facebook API Configuration
FACEBOOK_API_VERSION=v18.0
FACEBOOK_GRAPH_URL=https://graph.facebook.com

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/capify-app.log

# Security Headers
SECURE_HEADERS_X_FRAME_OPTIONS=SAMEORIGIN
SECURE_HEADERS_X_CONTENT_TYPE_OPTIONS=nosniff
SECURE_HEADERS_X_XSS_PROTECTION=1; mode=block

# TLS/SSL Configuration (Railway Linux environment)
REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
SSL_CERT_DIR=/etc/ssl/certs

# Redis Configuration (Railway Redis - opsiyonel)
REDIS_URL=redis://username:password@host:port/database

# Rate Limiting
RATELIMIT_STORAGE_URL=memory://
RATELIMIT_DEFAULT=100 per minute

# Railway specific configuration
PORT=5050
PYTHON_VERSION=3.11

# CAPIFY specific variables
APP_NAME=CAPIFY
APP_VERSION=2.0.0
ENVIRONMENT=production
```

### 4. **PostgreSQL Database Ekleme**
1. Railway dashboard'da "New" → "Database" → "Add PostgreSQL"
2. Database otomatik olarak `DATABASE_URL` environment variable'ı olarak eklenecek

### 5. **Deployment Kontrolü**
1. "Deployments" sekmesinde deployment durumunu kontrol edin
2. Logs'ları kontrol ederek hata olup olmadığını görün
3. Health check endpoint'i: `https://your-app.railway.app/api/health`

### 6. **Domain Ayarlama**
1. "Settings" sekmesinde "Domains" bölümüne gidin
2. Otomatik domain'i kullanın veya custom domain ekleyin
3. Frontend için ayrı bir service oluşturun

## 🔧 Önemli Notlar

### Environment Variables Açıklamaları:
- **SECRET_KEY**: Flask uygulaması için güvenli secret key
- **JWT_SECRET_KEY**: JWT token'ları için güvenli secret key
- **CORS_ORIGINS**: Frontend domain'leri (virgülle ayrılmış)
- **REQUESTS_CA_BUNDLE**: Railway Linux environment'ında SSL sertifikaları
- **DATABASE_URL**: Railway PostgreSQL otomatik olarak sağlar

### SSL/TLS Konfigürasyonu:
Railway Linux environment'ında SSL sertifikaları otomatik olarak `/etc/ssl/certs/ca-certificates.crt` konumunda bulunur.

### Health Check:
Uygulama başarıyla deploy edildikten sonra health check endpoint'i çalışmalı:
```
GET https://your-app.railway.app/api/health
```

## 🚨 Sorun Giderme

### Yaygın Hatalar:
1. **Python command not found**: `PYTHON_VERSION=3.11` ayarlandığından emin olun
2. **TLS certificate errors**: `REQUESTS_CA_BUNDLE` doğru ayarlandığından emin olun
3. **Database connection errors**: PostgreSQL plugin eklendiğinden emin olun
4. **CORS errors**: `CORS_ORIGINS` doğru domain'leri içerdiğinden emin olun

### Log Kontrolü:
Railway dashboard'da "Deployments" → "View Logs" ile detaylı log'ları görebilirsiniz.

## 📞 Destek
Deployment sırasında sorun yaşarsanız:
1. Railway logs'larını kontrol edin
2. Environment variables'ların doğru olduğundan emin olun
3. PostgreSQL plugin'inin eklendiğinden emin olun

## 🔄 Otomatik Deployment
- GitHub'a push yaptığınızda otomatik deploy
- Branch-based deployment (main branch)
- Preview deployments (feature branches)

## 📱 Frontend Deployment
Frontend'i ayrı bir Railway projesi olarak deploy edebilirsiniz:

1. Yeni Railway projesi oluşturun
2. Frontend klasörünü seçin
3. Build command: `npm install && npm run build`
4. Start command: `npx serve -s build -l $PORT`

## 🚀 Hızlı Deploy Adımları

1. **GitHub'a Push**
```bash
git add .
git commit -m "Railway deployment ready"
git push origin main
```

2. **Railway'de Deploy**
- Railway dashboard'da projenizi seçin
- "Deploy" butonuna tıklayın
- Build loglarını takip edin

3. **Environment Variables Ekleme**
- Railway dashboard'da "Variables" sekmesine gidin
- `railway.env.example` dosyasındaki değişkenleri ekleyin

4. **Database Migration**
- PostgreSQL service'i bağladıktan sonra
- Migration'lar otomatik çalışacak

5. **Test**
- Health check: `https://your-app.railway.app/api/health`
- API test: `https://your-app.railway.app/api/auth/login` 