# Wedding Web

A comprehensive wedding photo management platform with AI-powered face recognition for personalized photo delivery.

## 🚀 Quick Start

```bash
# Start backend
cd backend && npm install && npm start

# Start frontend (separate terminal)
cd frontend && npm install && npm run dev
```

## 📁 Project Structure

```
├── frontend/          # React + Vite web application
├── backend/           # Node.js + Python API server
├── desktop-app/       # Electron desktop application
├── api/               # PHP API endpoints
├── services/          # PHP services
├── docs/              # All documentation
│   ├── setup/         # Setup guides
│   ├── deployment/    # Deployment guides
│   ├── features/      # Feature documentation
│   ├── troubleshooting/  # Fix guides
│   └── api/           # API reference
├── scripts/           # Utility scripts
│   ├── sql/           # Database scripts
│   └── utilities/     # Shell/batch scripts
└── archive/           # Deprecated files
```

## 🔧 Key Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Python (DeepFace/InsightFace)
- **Database**: Supabase (PostgreSQL)
- **Face Recognition**: DeepFace, InsightFace

## 📖 Documentation

- [Quick Setup Guide](docs/setup/QUICK_SETUP_GUIDE.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT_COMPLETE_GUIDE.md)
- [API Reference](docs/api/API_REFERENCE.md)
- [Face Detection Setup](docs/setup/FACE_DETECTION_SETUP.md)

## 🔑 Environment Setup

Copy the example env files and configure:

```bash
cp config/env.example backend/.env
cp frontend/env.example frontend/.env
```

## 📞 Support

For troubleshooting, check the [docs/troubleshooting](docs/troubleshooting/) directory.
