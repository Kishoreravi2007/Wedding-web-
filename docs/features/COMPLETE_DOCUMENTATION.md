# 💒 AI-Powered Wedding Website - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Configuration](#environment-configuration)
7. [Development Workflow](#development-workflow)
8. [Deployment Guide](#deployment-guide)
9. [API Documentation](#api-documentation)
10. [Face Recognition System](#face-recognition-system)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance & Updates](#maintenance--updates)

---

## 📖 Project Overview

This is a modern, AI-powered wedding website featuring real-time face detection and recognition to help guests find photos of themselves from wedding galleries. The system includes multiple wedding events, photo management, wishes collection, and an interactive photo booth.

### Key Capabilities
- **Real-time Face Detection** using face-api.js
- **Face Recognition** for photo matching
- **Multi-wedding Support** (Sister A, Sister B events)
- **Photo Gallery Management** with Supabase storage
- **Interactive Photo Booth** with live camera
- **Wishes Collection** via Firebase
- **Responsive Design** for all devices
- **PWA Support** for mobile installation

---

## ✨ Features

### 🎥 Photo Booth
- Live camera feed with face detection
- Real-time face bounding boxes with confidence scores
- Anti-flickering algorithms for smooth detection
- Capture face for photo search
- Find matching photos across wedding galleries

### 📸 Photo Gallery
- Browse photos by wedding event
- Upload new photos (photographer portal)
- Face recognition-based photo search
- Download and view full-resolution images
- HEIC format handling and conversion

### 💌 Wishes & Messages
- Submit wedding wishes and messages
- Real-time display of messages
- Firebase-powered backend
- Moderation capabilities

### 🎨 User Experience
- Beautiful, modern UI with Tailwind CSS
- Smooth animations with Framer Motion
- Multi-language support (i18n)
- Dark/light theme support
- Mobile-optimized responsive design

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **face-api.js** - Face detection/recognition
- **React Router DOM** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Python FastAPI** - AI/ML services
- **DeepFace** - Advanced face recognition
- **Multer** - File upload handling
- **CORS** - Cross-origin requests

### Database & Storage
- **Supabase** - Photo storage and metadata
- **Firebase** - Wishes and real-time data
- **File System** - Local photo storage

### AI & Computer Vision
- **face-api.js** - Browser-based face detection
- **DeepFace** - Python-based face recognition
- **OpenCV** - Image processing
- **TensorFlow.js** - Neural network models

### Deployment & DevOps
- **Render** - Backend and frontend hosting
- **GitHub** - Version control
- **Environment Variables** - Configuration management

---

## 📁 Project Structure

```
Wedding-web-1/
├── 📁 frontend/                    # React frontend application
│   ├── 📁 public/                 # Static assets
│   │   ├── 📁 models/             # face-api.js ML models
│   │   ├── 📁 images/             # UI images and icons
│   │   └── 📄 _redirects          # Netlify routing rules
│   ├── 📁 src/                    # Source code
│   │   ├── 📁 components/         # React components
│   │   │   ├── 📄 PhotoBooth.tsx  # Main face detection component
│   │   │   ├── 📄 FaceSearch.tsx  # Face search functionality
│   │   │   ├── 📄 Gallery.tsx     # Photo gallery display
│   │   │   └── 📄 ...             # Other components
│   │   ├── 📁 pages/              # Page components
│   │   ├── 📁 lib/                # Utility libraries
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   └── 📄 main.tsx            # App entry point
│   ├── 📄 package.json            # Dependencies and scripts
│   ├── 📄 vite.config.ts          # Vite configuration
│   ├── 📄 tailwind.config.ts      # Tailwind CSS config
│   └── 📄 tsconfig.json           # TypeScript config
│
├── 📁 backend/                     # Node.js backend
│   ├── 📁 lib/                    # Backend libraries
│   │   ├── 📄 firebase-auth.js    # Firebase authentication
│   │   ├── 📄 supabase-db.js      # Supabase database
│   │   └── 📄 face-recognition.js # Face recognition logic
│   ├── 📁 services/               # Business logic services
│   ├── 📁 reference_images/       # Face recognition reference images
│   │   ├── 📁 sister_a/           # Sister A wedding references
│   │   └── 📁 sister_b/           # Sister B wedding references
│   ├── 📄 server.js               # Main Express server
│   ├── 📄 main.py                 # Python FastAPI server
│   ├── 📄 photos.js               # Photo management routes
│   ├── 📄 faces.js                # Face recognition routes
│   ├── 📄 wishes.js               # Wishes management
│   ├── 📄 requirements.txt        # Python dependencies
│   └── 📄 package.json            # Node.js dependencies
│
├── 📁 uploads/                     # File upload storage
│   └── 📁 wedding_gallery/        # Wedding photo galleries
│       ├── 📁 sister_a/           # Sister A photos
│       └── 📁 sister_b/           # Sister B photos
│
├── 📄 README.md                    # Basic project info
├── 📄 DEPLOYMENT_GUIDE.md          # Deployment instructions
├── 📄 FACE_RECOGNITION_GUIDE.md    # Face recognition setup
└── 📄 TROUBLESHOOTING.md           # Common issues and fixes
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+ (for DeepFace)
- **Git** for version control
- **Modern browser** with WebRTC support

### 1. Clone Repository
```bash
git clone https://github.com/your-username/Wedding-web-1.git
cd Wedding-web-1
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Backend Setup
```bash
cd ../backend
npm install

# For Python AI services (optional)
pip install -r requirements.txt
```

### 4. Environment Configuration
Create environment files (see next section for details):
- `frontend/.env` - Frontend configuration
- `backend/.env` - Backend configuration

### 5. Start Development Servers
```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend  
cd backend
npm start

# Terminal 3: Python AI (optional)
cd backend
python main.py
```

### 6. Access Application
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5001
- **Python AI:** http://localhost:8000

---

## 🔧 Environment Configuration

### Frontend Environment Variables (`frontend/.env`)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5001
VITE_FRONTEND_URL=http://localhost:3000

# Firebase Configuration (for wishes)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ

# Supabase Configuration (for photos)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Feature Flags
VITE_ENABLE_FACE_RECOGNITION=true
VITE_ENABLE_AUTO_FACE_DETECTION=true
VITE_DEBUG_MODE=false
```

### Backend Environment Variables (`backend/.env`)
```bash
# Server Configuration
PORT=5001
NODE_ENV=development

# API URLs
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./path/to/firebase-key.json

# Security
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=http://localhost:3000

# Face Recognition
FACE_RECOGNITION_CONFIDENCE_THRESHOLD=0.6
FACE_DETECTION_MODEL=tinyFaceDetector
```

---

## 👨‍💻 Development Workflow

### Code Style & Standards
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

### Development Commands

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

#### Backend
```bash
npm start            # Start server
npm run dev          # Start with nodemon
npm test             # Run tests
python main.py       # Start Python AI service
```

### Testing
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm test

# Face recognition tests
python -m pytest backend/tests/
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request and merge
```

---

## 🌐 Deployment Guide

### Render Deployment (Recommended)

#### Backend Deployment
1. **Create Render Web Service**
   - Repository: Your GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables**
   ```bash
   PORT=10000
   BACKEND_URL=https://your-backend.onrender.com
   FRONTEND_URL=https://your-frontend-url.com
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-key
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json
   ```

#### Frontend Deployment
1. **Create Render Static Site**
   - Repository: Your GitHub repo
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables**
   ```bash
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-key
   ```

### Alternative Deployments

#### Netlify (Frontend)
```bash
# Build settings
Build command: npm run build
Publish directory: dist
Environment variables: All VITE_* variables
```

#### Vercel (Frontend)
```bash
# vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

#### Railway/Heroku (Backend)
Similar setup to Render with appropriate build commands.

---

## 📡 API Documentation

### Face Recognition API

#### POST `/api/recognize`
Search for photos containing a specific face.

**Request:**
```bash
curl -X POST \
  https://your-backend.com/api/recognize \
  -F "file=@face-image.jpg" \
  -F "wedding_name=sister_a"
```

**Response:**
```json
{
  "message": "Photos found!",
  "matches": [
    "https://backend.com/uploads/wedding_gallery/sister_a/photo1.jpg",
    "https://backend.com/uploads/wedding_gallery/sister_a/photo2.jpg"
  ],
  "wedding": "sister_a",
  "total": 2
}
```

### Photos API

#### GET `/api/photos`
Get all photos for a wedding.

#### POST `/api/photos/upload`
Upload new photos to gallery.

#### DELETE `/api/photos/:id`
Delete a photo.

### Wishes API

#### GET `/api/wishes`
Get all wedding wishes.

#### POST `/api/wishes`
Submit a new wish.

---

## 🤖 Face Recognition System

### Architecture
The system uses a hybrid approach:
1. **Frontend Detection** - face-api.js for real-time detection
2. **Backend Recognition** - DeepFace for accurate matching
3. **Descriptor Storage** - Supabase for face embeddings

### Face Detection (Frontend)
```typescript
// Load models
await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
await faceapi.nets.faceRecognitionNet.loadFromUri('/models')

// Detect faces
const detection = await faceapi
  .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceDescriptor()
```

### Face Recognition (Backend)
```python
# Python DeepFace implementation
from deepface import DeepFace

# Find matching faces
dfs = DeepFace.find(
    img_path=uploaded_image,
    db_path=reference_images_dir,
    model_name="VGG-Face",
    distance_metric="cosine",
    enforce_detection=False
)
```

### Performance Optimization
- **Anti-flickering algorithms** with detection history
- **Confidence thresholds** to filter false positives
- **Throttling** to prevent excessive API calls
- **Caching** for improved response times

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Face Detection Not Working
**Symptoms:** No bounding boxes appear on camera feed
**Solutions:**
- Check camera permissions in browser
- Verify face-api.js models are loaded
- Ensure HTTPS for production (required for camera access)
- Check browser console for errors

#### 2. CORS Errors
**Symptoms:** Network errors when calling API
**Solutions:**
- Verify CORS configuration in backend
- Check environment variables are set correctly
- Ensure frontend and backend URLs match

#### 3. Photos Not Displaying
**Symptoms:** Placeholder images instead of actual photos
**Solutions:**
- Check static file serving configuration
- Verify image URLs are accessible
- Check HEIC format support (may need conversion)

#### 4. Environment Variables Not Working
**Symptoms:** Default values being used instead of configured ones
**Solutions:**
- Verify variable names (case-sensitive)
- Rebuild application after changes
- Check build logs for errors

#### 5. Face Recognition Inaccurate
**Symptoms:** Wrong photos returned for faces
**Solutions:**
- Adjust confidence thresholds
- Improve reference image quality
- Run face clustering script
- Consider using Python backend for better accuracy

### Debug Commands
```bash
# Check API connectivity
curl https://your-backend.com/api/recognize

# Check environment variables
echo $VITE_API_BASE_URL

# View build logs
npm run build --verbose

# Test face recognition
python backend/test_face_recognition.py
```

---

## 🔄 Maintenance & Updates

### Regular Tasks

#### Weekly
- Monitor application logs for errors
- Check face recognition accuracy
- Review photo upload statistics
- Update face recognition database

#### Monthly
- Update dependencies
- Backup photo galleries and database
- Performance optimization review
- Security updates

#### Quarterly
- Full system backup
- Performance testing
- User experience review
- Infrastructure cost optimization

### Update Procedures

#### Frontend Updates
```bash
cd frontend
npm update
npm run build
npm run test
```

#### Backend Updates
```bash
cd backend
npm update
python -m pip install --upgrade -r requirements.txt
npm test
```

#### Face Recognition Model Updates
```bash
# Update face-api.js models
cd frontend/public/models
# Download latest models from face-api.js repository

# Update Python models
pip install --upgrade deepface
```

---

## 🛡 Security Considerations

### Data Privacy
- Face recognition data is processed locally when possible
- No face data is stored permanently without consent
- All uploads are sanitized and validated

### Authentication
- JWT tokens for API access
- Firebase Auth for user management
- Rate limiting on API endpoints

### Infrastructure Security
- HTTPS everywhere in production
- Environment variables for sensitive data
- Regular security updates
- CORS properly configured

---

## 📞 Support & Contributing

### Getting Help
- Check this documentation first
- Review troubleshooting section
- Check GitHub issues
- Contact development team

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review process

### Development Team
- **Frontend:** React/TypeScript specialists
- **Backend:** Node.js/Python developers  
- **AI/ML:** Computer vision engineers
- **DevOps:** Deployment and infrastructure

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🎉 Acknowledgments

- **face-api.js** for browser-based face recognition
- **DeepFace** for advanced face recognition algorithms
- **Supabase** for reliable backend services
- **Firebase** for real-time features
- **Render** for seamless deployment
- **Open source community** for various libraries and tools

---

**Last Updated:** October 2024  
**Version:** 2.0.0  
**Documentation Maintained By:** Development Team
