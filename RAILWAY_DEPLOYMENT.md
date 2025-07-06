# 🚀 Railway Deployment Rehberi

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
SECRET_KEY=your-very-secure-secret-key-here
FLASK_APP=run.py

# Database (Railway PostgreSQL - otomatik eklenecek)
DATABASE_URL=postgresql://username:password@host:port/database

# CORS
CORS_ORIGINS=https://your-app-name.railway.app,http://localhost:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600

# Facebook API
FACEBOOK_API_VERSION=v18.0
FACEBOOK_GRAPH_URL=https://graph.facebook.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# Security
SECURE_HEADERS_X_FRAME_OPTIONS=SAMEORIGIN
SECURE_HEADERS_X_CONTENT_TYPE_OPTIONS=nosniff
SECURE_HEADERS_X_XSS_PROTECTION=1; mode=block

# TLS/SSL Configuration (Railway Linux environment)
REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
SSL_CERT_DIR=/etc/ssl/certs

# Railway specific
PORT=5050
PYTHON_VERSION=3.11
```

### 4. **PostgreSQL Database Ekleme**
1. Railway dashboard'da "New" → "Database" → "PostgreSQL"
2. Database'i projenize bağlayın
3. `DATABASE_URL` environment variable'ı otomatik eklenecek

### 5. **Domain Ayarlama**
1. "Settings" sekmesine gidin
2. "Domains" bölümünde custom domain ekleyin
3. SSL sertifikası otomatik olarak sağlanacak

## 🔧 Konfigürasyon Dosyaları

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && python -m pip install -r requirements.txt && python -m gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "environments": {
    "production": {
      "variables": {
        "FLASK_ENV": "production",
        "PORT": "5050",
        "PYTHON_VERSION": "3.11"
      }
    }
  }
}
```

## 📊 Monitoring

### Health Check
- Endpoint: `https://your-app.railway.app/api/health`
- Status: 200 OK = Healthy

### Logs
- Railway dashboard'da "Deployments" sekmesinde logları görüntüleyin
- Real-time log takibi mevcut

## 🚨 Troubleshooting

### Build Hatası
```bash
# requirements.txt'de eksik paketler varsa
pip install -r requirements.txt
```

### Python Command Not Found
```bash
# Railway'de python3 yerine python kullanın
# railway.json'da PYTHON_VERSION=3.11 ayarlayın
```

### TLS Certificate Hatası
```bash
# Environment variables'da doğru certifi path'leri ayarlayın
REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
SSL_CERT_DIR=/etc/ssl/certs
```

### Database Bağlantı Hatası
```bash
# DATABASE_URL kontrol edin
# PostgreSQL service'in çalıştığından emin olun
```

### Port Hatası
```bash
# Railway otomatik olarak PORT environment variable'ı sağlar
# Kodunuzda os.environ.get('PORT', 5050) kullanın
```

## 💰 Maliyet
- **Ücretsiz Tier**: $5 kredi/ay
- **Tipik Kullanım**: ~$2-3/ay
- **Ölçeklendirme**: İhtiyaç halinde artırılabilir

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