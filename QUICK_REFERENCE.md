# ⚡ Quick Reference Guide

## 🚀 Essential Commands

### Development
```bash
# Start development servers
cd frontend && npm run dev     # Frontend (port 3000)
cd backend && npm start        # Backend (port 5001)

# Build for production
cd frontend && npm run build   # Creates dist/ folder
cd backend && npm test         # Run backend tests
```

### Deployment
```bash
# Deploy to Render
git add . && git commit -m "Update" && git push origin main

# Set environment variables
VITE_API_BASE_URL=https://your-backend.onrender.com
```

## 🔧 Key Environment Variables

### Frontend (`frontend/.env`)
```bash
VITE_API_BASE_URL=http://localhost:5001
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-key
```

### Backend (`backend/.env`)
```bash
PORT=5001
BACKEND_URL=http://localhost:5001
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-key
```

## 📱 Key URLs

- **Local Frontend:** http://localhost:3000
- **Local Backend:** http://localhost:5001
- **Photo Booth:** http://localhost:3000/photobooth
- **API Health:** http://localhost:5001/api/health

## 🎯 Face Recognition API

```bash
# Test face recognition
curl -X POST http://localhost:5001/api/recognize \
  -F "file=@face.jpg" \
  -F "wedding_name=sister_a"
```

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| **CORS errors** | Check `VITE_API_BASE_URL` is set correctly |
| **Face detection not working** | Verify camera permissions & HTTPS |
| **Photos not displaying** | Check backend static file serving |
| **Build fails** | Run `npm cache clean --force` |

## 📊 File Structure (Key Files)

```
├── frontend/
│   ├── src/components/PhotoBooth.tsx    # Main face detection
│   ├── src/components/FaceSearch.tsx    # Photo search
│   ├── vite.config.ts                   # Build config
│   └── .env                             # Environment vars
├── backend/
│   ├── server.js                        # Main server
│   ├── photos.js                        # Photo API
│   └── .env                             # Environment vars
└── uploads/wedding_gallery/             # Photo storage
```

## 🎨 Customization Quick Tips

### Change Colors
```css
/* In Tailwind config or CSS */
:root {
  --primary: #your-color;
  --secondary: #your-color;
}
```

### Add Wedding Event
```javascript
// In backend/server.js
const allPhotos = {
  'sister_a': [...],
  'sister_b': [...],
  'new_event': [...] // Add here
};
```

### Adjust Face Detection
```typescript
// In PhotoBooth.tsx
const OPTIONS = {
  scoreThreshold: 0.7,    // Higher = stricter
  inputSize: 416          // Higher = more accurate
};
```

## 🚀 Quick Deploy Checklist

- [ ] Set `VITE_API_BASE_URL` in frontend deployment
- [ ] Set `BACKEND_URL` in backend deployment
- [ ] All environment variables configured
- [ ] GitHub repository connected
- [ ] Build commands correct
- [ ] Test deployed URLs work

## 📞 Quick Help

**Face detection flickering?** → Increase `scoreThreshold` to 0.8  
**API calls failing?** → Check environment variables  
**Photos not loading?** → Verify static file serving  
**Build errors?** → Clear cache: `rm -rf node_modules && npm install`

## 📚 Full Documentation

- **[📋 Complete Guide](COMPLETE_DOCUMENTATION.md)** - Everything in detail
- **[🚀 Deployment Guide](DEPLOYMENT_COMPLETE_GUIDE.md)** - Production setup
- **[📡 API Reference](API_REFERENCE.md)** - Backend endpoints
