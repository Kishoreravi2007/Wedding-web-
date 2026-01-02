# 💒 AI-Powered Wedding Website

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://weddingweb.co.in)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

A modern, AI-powered wedding website featuring **real-time face detection** and **intelligent photo recognition** to help guests find photos of themselves from wedding galleries.

## ✨ Key Features

🎥 **Real-time Face Detection** - Live camera feed with face recognition  
📸 **Smart Photo Search** - Find photos containing specific faces  
💌 **Interactive Wishes** - Collect and display wedding messages  
📱 **Mobile Optimized** - Perfect experience on all devices  
🤖 **AI-Powered** - Advanced face recognition algorithms  
🎨 **Beautiful UI** - Modern design with smooth animations  

## 🚀 Live Demo

- **Website:** [weddingweb.co.in](https://weddingweb.co.in)
- **Photo Booth:** [weddingweb.co.in/photobooth](https://weddingweb.co.in/photobooth)

## 🛠 Tech Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **face-api.js** - Browser-based face recognition
- **Framer Motion** - Smooth animations

### Backend  
- **Node.js** + **Express** - Server framework
- **Python FastAPI** - AI/ML services
- **DeepFace** - Advanced face recognition
- **Supabase** - Database and storage
- **Firebase** - Real-time features

## 📱 Screenshots

<table>
  <tr>
    <td align="center">
      <img src="docs/images/photo-booth.jpg" width="300" alt="Photo Booth"/>
      <br><b>Live Face Detection</b>
    </td>
    <td align="center">
      <img src="docs/images/gallery.jpg" width="300" alt="Photo Gallery"/>
      <br><b>Smart Photo Gallery</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/images/search-results.jpg" width="300" alt="Search Results"/>
      <br><b>Photo Search Results</b>
    </td>
    <td align="center">
      <img src="docs/images/wishes.jpg" width="300" alt="Wishes"/>
      <br><b>Wedding Wishes</b>
    </td>
  </tr>
</table>

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+ (for AI features)
- **Modern browser** with camera support

### 1. Clone & Install
```bash
git clone https://github.com/your-username/Wedding-web-1.git
cd Wedding-web-1

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies  
cd ../backend && npm install
```

### 2. Environment Setup
Create `.env` files in both `frontend/` and `backend/` directories:

**Frontend (.env):**
```bash
VITE_API_BASE_URL=http://localhost:5001
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

**Backend (.env):**
```bash
PORT=5001
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json
```

### 3. Start Development
```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend
cd backend && npm start
```

### 4. Access Application
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5001

## 📖 Documentation

### 📚 Complete Guides
- **[📋 Complete Documentation](COMPLETE_DOCUMENTATION.md)** - Full project guide
- **[🚀 Deployment Guide](DEPLOYMENT_COMPLETE_GUIDE.md)** - Production deployment
- **[📡 API Reference](API_REFERENCE.md)** - Backend API documentation
- **[🤖 Face Recognition Guide](FACE_RECOGNITION_ACCURACY_GUIDE.md)** - AI system setup

### 🛠 Development
- **[Installation & Setup](#quick-start)** - Get started quickly
- **[Environment Variables](COMPLETE_DOCUMENTATION.md#environment-configuration)** - Configuration details  
- **[Project Structure](COMPLETE_DOCUMENTATION.md#project-structure)** - File organization
- **[Development Workflow](COMPLETE_DOCUMENTATION.md#development-workflow)** - Best practices

### 🚀 Deployment
- **[Render Deployment](DEPLOYMENT_COMPLETE_GUIDE.md#render-deployment-recommended)** - Recommended platform
- **[Alternative Platforms](DEPLOYMENT_COMPLETE_GUIDE.md#alternative-deployment-platforms)** - Netlify, Vercel, AWS
- **[Environment Setup](DEPLOYMENT_COMPLETE_GUIDE.md#environment-configuration)** - Production config
- **[Troubleshooting](DEPLOYMENT_COMPLETE_GUIDE.md#troubleshooting-deployment)** - Common issues

## 🎯 How It Works

### 1. Face Detection
```typescript
// Real-time face detection using face-api.js
const detection = await faceapi
  .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceDescriptor();
```

### 2. Photo Recognition
```javascript
// Backend face recognition with DeepFace
const matches = await DeepFace.find(
  img_path=uploaded_face,
  db_path=wedding_gallery,
  model_name="VGG-Face"
);
```

### 3. Smart Matching
The system extracts facial features and compares them against wedding photo galleries to find matches with high accuracy.

## 🌟 Key Components

### PhotoBooth Component
- **Live camera feed** with WebRTC
- **Real-time face detection** with bounding boxes
- **Anti-flickering algorithms** for smooth experience
- **Face capture** for photo search

### Face Recognition System  
- **Browser-based detection** using face-api.js
- **Server-side recognition** using DeepFace
- **Hybrid approach** for optimal accuracy
- **Confidence scoring** and similarity matching

### Photo Gallery
- **Multi-wedding support** (Sister A, Sister B)
- **Responsive image display** with lazy loading
- **Download and view** full-resolution photos
- **Upload portal** for photographers

## 📊 Performance

- **Face Detection:** 30-60 FPS in browser
- **Photo Search:** < 3 seconds response time  
- **Image Loading:** Optimized with WebP and caching
- **Mobile Performance:** 90+ Lighthouse score

## 🔧 Customization

### Add New Wedding Events
```typescript
// Add to wedding configuration
const weddings = {
  sister_a: { name: "Sister A's Wedding", photos: [...] },
  sister_b: { name: "Sister B's Wedding", photos: [...] },
  new_event: { name: "New Event", photos: [...] } // Add here
};
```

### Adjust Face Recognition
```javascript
// Modify confidence thresholds
const FACE_DETECTION_CONFIDENCE = 0.7; // Higher = more strict
const FACE_RECOGNITION_THRESHOLD = 0.6; // Lower = more matches
```

### Custom Styling
```css
/* Modify Tailwind config or add custom CSS */
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

## 🚀 Deployment Options

### Render (Recommended)
```bash
# Automatic deployment from GitHub
# Backend: Node.js Web Service
# Frontend: Static Site
```

### Netlify/Vercel
```bash
# Frontend-only deployment
# API calls to separate backend
```

### Docker
```bash
docker-compose up -d
```

### AWS/VPS
```bash
# Traditional server deployment
# PM2 + Nginx configuration
```

## 🔒 Security & Privacy

- **No permanent face storage** - Faces processed and discarded
- **Local processing** when possible
- **HTTPS everywhere** in production
- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **CORS configuration** for security

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

### Development Guidelines
- Use **TypeScript** for type safety
- Follow **conventional commits**
- Add **tests** for new features
- Update **documentation** as needed

## 📞 Support

- **📖 Documentation:** [Complete guides](COMPLETE_DOCUMENTATION.md)
- **🐛 Bug Reports:** [GitHub Issues](https://github.com/your-repo/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/your-repo/discussions)
- **📧 Email:** help@weddingweb.co.in

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **[face-api.js](https://github.com/justadudewhohacks/face-api.js)** - Browser face recognition
- **[DeepFace](https://github.com/serengil/deepface)** - Python face recognition  
- **[Supabase](https://supabase.com)** - Backend as a service
- **[Firebase](https://firebase.google.com)** - Real-time database
- **[Render](https://render.com)** - Deployment platform

---

<div align="center">

**Made with ❤️ for weddings worldwide**

⭐ **Star this repo** if it helped you create amazing wedding memories! ⭐

[🌐 Live Demo](https://weddingweb.co.in) • [📖 Documentation](COMPLETE_DOCUMENTATION.md) • [🚀 Deploy Guide](DEPLOYMENT_COMPLETE_GUIDE.md)

</div>
