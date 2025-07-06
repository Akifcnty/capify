# CAPIFY - GTM & Facebook CAPI Integration

CAPIFY, Google Tag Manager (GTM) ve Facebook Conversions API entegrasyonu sağlayan modern bir web uygulamasıdır. Sistem, GTM event'lerini alır ve Facebook Conversions API'ye iletir.

## 🚀 Quick Start (Development)

### Easy Start (Recommended)
```bash
# Start both services
./start_services.sh

# Stop both services
./stop_services.sh
```

### Manual Setup
1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   export REQUESTS_CA_BUNDLE=/Users/nb/Desktop/CAPIFY\ 2/backend/venv/lib/python3.13/site-packages/certifi/cacert.pem
   python run.py
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

**Access URLs:**
- 🌐 Frontend: http://localhost:3000
- 📊 Backend: http://localhost:5050
- 🏥 Health Check: http://localhost:5050/health

## 🚀 Production Deployment

### Quick Start (Docker)

1. **Environment Setup**
```bash
# Copy environment template
cp backend/env.example .env

# Edit environment variables
nano .env
```

2. **Deploy with Docker**
```bash
# Make deployment script executable
chmod +x backend/scripts/deploy.sh

# Run deployment
./backend/scripts/deploy.sh
```

### Manual Deployment

1. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

2. **Database Setup**
```bash
# PostgreSQL (recommended for production)
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb capify_db
sudo -u postgres createuser capify_user

# Or SQLite (development only)
flask db upgrade
```

3. **Environment Variables**
```bash
# Required variables
export FLASK_ENV=production
export SECRET_KEY=your-super-secret-key
export JWT_SECRET_KEY=your-jwt-secret-key
export DATABASE_URL=postgresql://capify_user:password@localhost:5432/capify_db
export REDIS_URL=redis://localhost:6379/0
export FACEBOOK_ACCESS_TOKEN=your-facebook-token
export FACEBOOK_DATASET_ID=your-dataset-id
export FACEBOOK_PIXEL_ID=your-pixel-id
```

4. **Run Production Server**
```bash
# With Gunicorn (recommended)
gunicorn --config gunicorn.conf.py wsgi:app

# Or with Flask (development only)
python run.py
```

## 🏗️ Architecture

### System Components

- **Backend API** (Flask + PostgreSQL)
- **Frontend** (React)
- **Database** (PostgreSQL)
- **Cache** (Redis)
- **Task Queue** (Celery)
- **Reverse Proxy** (Nginx)

### Data Flow

1. **GTM Event** → **CAPIFY Backend** → **Facebook Conversions API**
2. **Token Management** → **Database Storage** → **Cache Layer**
3. **Event Logging** → **Real-time Monitoring**

## 📊 Features

### Core Features
- ✅ GTM Event Processing
- ✅ Facebook Conversions API Integration
- ✅ Token Management
- ✅ Event Logging & Monitoring
- ✅ User Authentication
- ✅ Rate Limiting
- ✅ Health Checks

### Production Features
- ✅ Docker Containerization
- ✅ PostgreSQL Database
- ✅ Redis Caching
- ✅ Celery Task Queue
- ✅ Nginx Reverse Proxy
- ✅ SSL/TLS Support
- ✅ Security Headers
- ✅ Monitoring & Logging

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FLASK_ENV` | Environment (production/development) | Yes |
| `SECRET_KEY` | Flask secret key | Yes |
| `JWT_SECRET_KEY` | JWT signing key | Yes |
| `DATABASE_URL` | Database connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `FACEBOOK_ACCESS_TOKEN` | Facebook API access token | Yes |
| `FACEBOOK_DATASET_ID` | Facebook dataset ID | Yes |
| `FACEBOOK_PIXEL_ID` | Facebook pixel ID | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | Yes |

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facebook tokens table
CREATE TABLE facebook_tokens (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    gtm_container_id VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    dataset_id VARCHAR(255),
    pixel_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GTM verifications table
CREATE TABLE gtm_verifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    gtm_container_id VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    verification_token VARCHAR(255) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment Options

### 1. Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### 2. Cloud Deployment

#### AWS EC2
```bash
# Install dependencies
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Clone repository
git clone <repository-url>
cd capify

# Deploy
./backend/scripts/deploy.sh
```

#### DigitalOcean Droplet
```bash
# Similar to AWS EC2
# Use DigitalOcean's managed PostgreSQL and Redis
```

### 3. Free Hosting Options

#### Railway
- **Deploy:** Connect GitHub repository
- **Database:** PostgreSQL addon
- **SSL:** Automatic
- **Cost:** $5 credit/month (usually sufficient)

#### Render
- **Deploy:** Connect GitHub repository  
- **Database:** PostgreSQL addon
- **SSL:** Automatic
- **Cost:** Free tier available

#### Heroku
- **Deploy:** Connect GitHub repository
- **Database:** PostgreSQL addon
- **SSL:** Automatic
- **Cost:** Free tier (550-1000 hours/month)

## 📚 Documentation

- [API Reference](docs/api_reference.md)
- [GTM Installation Guide](docs/gtm_installation.md)
- [Web DataLayer Guide](docs/web_datalayer_guide.md)

## 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- CORS Protection
- Rate Limiting
- Input Validation
- SQL Injection Protection

## 📈 Monitoring

- Real-time Event Logging
- Performance Metrics
- Error Tracking
- Health Checks
- Backup Automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@capify.com

---

**CAPIFY** - Modern GTM & Facebook CAPI Integration Platform 
# Railway deploy fix - Sun Jul  6 22:52:06 +03 2025

# CAPIFY 2

Facebook Conversion API ve Google Tag Manager entegrasyonu için web uygulaması.

## Özellikler

- Facebook Conversion API entegrasyonu
- Google Tag Manager doğrulama
- GTM event logları
- Web Data Layer yönetimi
- Kullanıcı yönetimi ve kimlik doğrulama

## Kurulum

### Gereksinimler

- Python 3.8+
- Node.js 16+
- PostgreSQL

### Backend Kurulumu

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm start
```

## Deployment

Bu uygulama Railway üzerinde deploy edilmiştir.

**Son güncelleme:** 2025-07-06 - Frontend build dosyaları backend static klasörüne kopyalandı

<!-- Last deployment: 2025-07-05 -->
