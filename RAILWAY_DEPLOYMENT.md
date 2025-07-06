# 🚀 Railway Deployment Rehberi

## 📋 Adım Adım Deployment

### 1. **Railway Hesabı Oluşturma**
1. [railway.app](https://railway.app) adresine gidin
2. GitHub ile giriş yapın
3. "Start a New Project" tıklayın

### 2. **GitHub Repository Bağlama**
1. "Deploy from GitHub repo" seçin
2. `capify` repository'nizi seçin
3. "Deploy Now" tıklayın

### 3. **Environment Variables Ayarlama**
Railway dashboard'da "Variables" sekmesine gidin ve şunları ekleyin:

```bash
FLASK_ENV=production
SECRET_KEY=your-very-secure-secret-key-here
FLASK_APP=run.py
CORS_ORIGINS=https://your-app-name.railway.app
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
FACEBOOK_API_VERSION=v18.0
FACEBOOK_GRAPH_URL=https://graph.facebook.com
LOG_LEVEL=INFO
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
    "startCommand": "cd backend && python run.py",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 📊 Monitoring

### Health Check
- Endpoint: `https://your-app.railway.app/health`
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

### Database Bağlantı Hatası
```bash
# DATABASE_URL kontrol edin
# PostgreSQL service'in çalıştığından emin olun
```

### Port Hatası
```bash
# Railway otomatik olarak PORT environment variable'ı sağlar
# Kodunuzda os.environ.get('PORT', 5000) kullanın
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