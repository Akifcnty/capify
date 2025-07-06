# CAPIFY Quick Start Guide

## Local Development

### Option 1: Use the provided scripts (Recommended)

**Start Backend:**
```bash
./start_backend.sh
```

**Start Frontend:**
```bash
./start_frontend.sh
```

### Option 2: Manual commands

**Backend:**
```bash
cd backend
source venv/bin/activate
export REQUESTS_CA_BUNDLE=$(python -c "import certifi; print(certifi.where())")
export SSL_CERT_FILE=$(python -c "import certifi; print(certifi.where())")
python run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## Important Notes

1. **Python Command**: Always use `python` (not `python3`) when the virtual environment is activated
2. **Ports**: 
   - Backend runs on http://localhost:5050
   - Frontend runs on http://localhost:3000
3. **Health Check**: Backend health endpoint is at http://localhost:5050/health

## Troubleshooting

If you get "command not found: python":
- Make sure you're in the backend directory
- Make sure the virtual environment is activated: `source venv/bin/activate`

If you get port conflicts:
- The scripts automatically kill existing processes
- Or manually: `lsof -ti:5050 | xargs kill -9` (backend) / `lsof -ti:3000 | xargs kill -9` (frontend)

## Railway Deployment

The project is configured for Railway deployment with:
- Python 3.11
- Correct health endpoint: `/health`
- Proper start command using `python3` 