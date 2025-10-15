# Face Detection Deployment - Quick Fix Guide

## 🚀 Most Common Issues & Instant Fixes

### Issue 1: Models Return 404 ⭐ MOST COMMON

**Symptom:**
```
Failed to fetch
GET /models/tiny_face_detector_model-weights_manifest.json 404
```

**Quick Fix:**
```bash
# 1. Verify models exist
ls frontend/public/models/

# 2. Rebuild and copy models
cd frontend
npm run build
cp -r public/models dist/

# 3. For Express - add to server.js:
```

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Add this BEFORE other routes
app.use('/models', express.static(
  path.join(__dirname, '../frontend/dist/models'),
  {
    setHeaders: (res, path) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (path.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      }
    }
  }
));
```

### Issue 2: CORS Error

**Symptom:**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Quick Fix:**
```javascript
// In backend/server.js
app.use('/models', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
```

### Issue 3: Camera Access Denied

**Symptom:**
```
NotAllowedError: Permission denied
getUserMedia is not defined
```

**Quick Fix:**
- **Must use HTTPS in production**
- Get free SSL: `certbot --nginx -d your-domain.com`
- Or use Cloudflare for automatic HTTPS

### Issue 4: Timeout During Processing

**Symptom:**
```
504 Gateway Timeout
Request timeout
```

**Quick Fix - Nginx:**
```nginx
location /api/photos-enhanced {
    proxy_read_timeout 300s;
    client_max_body_size 20M;
}
```

**Quick Fix - Express:**
```javascript
app.use('/api/photos-enhanced', (req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});
```

## 🔧 Automated Fixes

### Run Diagnostic Tool
```bash
# Check localhost
node scripts/diagnose-face-detection.js

# Check production
node scripts/diagnose-face-detection.js https://your-domain.com
```

### Run Automated Fix
```bash
chmod +x scripts/fix-deployment.sh
./scripts/fix-deployment.sh
```

## ⚡ Emergency Checklist (2 minutes)

```bash
# 1. Verify models exist
ls frontend/public/models/*.json

# 2. Check they're in build
ls frontend/dist/models/*.json

# 3. Test if accessible
curl https://your-domain.com/models/tiny_face_detector_model-weights_manifest.json

# 4. Check CORS
curl -I https://your-domain.com/models/tiny_face_detector_model-weights_manifest.json | grep -i access-control

# 5. Verify HTTPS
curl -I https://your-domain.com | grep -i "HTTP/2 200"
```

## 📱 Quick Test in Browser

Open browser console and run:

```javascript
// Test 1: Check if models are accessible
fetch('/models/tiny_face_detector_model-weights_manifest.json')
  .then(r => console.log('✅ Models accessible:', r.status))
  .catch(e => console.error('❌ Models not accessible:', e));

// Test 2: Check HTTPS
console.log('HTTPS:', window.isSecureContext ? '✅ Yes' : '❌ No');

// Test 3: Try loading face-api
import('face-api.js').then(faceapi => {
  console.log('✅ face-api.js loaded');
  faceapi.nets.tinyFaceDetector.load('/models')
    .then(() => console.log('✅ Models loaded'))
    .catch(e => console.error('❌ Model loading failed:', e));
});
```

## 🎯 Top 3 Fixes (Cover 90% of issues)

### Fix #1: Copy Models to Dist
```bash
cd frontend
npm run build
mkdir -p dist/models
cp -r public/models/* dist/models/
```

### Fix #2: Add CORS Headers
```javascript
// backend/server.js
app.use('/models', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../frontend/dist/models')));
```

### Fix #3: Use HTTPS
```bash
# Free SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

## 🔍 Platform-Specific Fixes

### Vercel
```json
// vercel.json
{
  "headers": [
    {
      "source": "/models/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "public, max-age=31536000" }
      ]
    }
  ]
}
```

### Netlify
```
# _headers file
/models/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000
```

### Heroku
```javascript
// Procfile
web: node --max-old-space-size=2048 backend/server.js
```

### AWS S3/CloudFront
```json
// CORS configuration
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 💡 Environment Variables

Create `.env.production`:
```env
# Frontend
VITE_API_BASE_URL=https://api.your-domain.com
VITE_MODEL_URL=https://your-domain.com/models

# Backend
NODE_OPTIONS=--max-old-space-size=2048
PORT=5000
```

## 🆘 Still Not Working?

1. **Check browser console** - Look for exact error message
2. **Check network tab** - See which files fail to load
3. **Check server logs** - Look for backend errors
4. **Visit debug page** - Go to `/debug/face-detection` 
5. **Read full guide** - See `FACE_DETECTION_DEPLOYMENT_DEBUG.md`

## 📞 Debug Commands

```bash
# Check if server is serving models
curl -I http://localhost:5000/models/tiny_face_detector_model-weights_manifest.json

# Check production
curl -I https://your-domain.com/models/tiny_face_detector_model-weights_manifest.json

# Check CORS
curl -H "Origin: https://your-domain.com" -I https://your-domain.com/models/tiny_face_detector_model-weights_manifest.json

# Test SSL
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check DNS
dig your-domain.com
```

## ✅ Success Indicators

You know it's working when:
- ✅ `/models/*.json` returns 200 status
- ✅ Console shows "Face detection models loaded successfully"
- ✅ No 404 or CORS errors in network tab
- ✅ Browser shows secure (HTTPS) lock icon
- ✅ Face detection completes without errors

## 🎬 Complete Fix Example (Copy-Paste)

```javascript
// backend/server.js - Complete working example
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '20mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Models with CORS and proper headers
app.use('/models', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  next();
}, express.static(path.join(__dirname, '../frontend/dist/models'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (path.includes('shard')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
  }
}));

// API routes
app.use('/api', require('./routes'));

// Timeouts for face processing
app.use('/api/photos-enhanced', (req, res, next) => {
  req.setTimeout(300000);
  res.setTimeout(300000);
  next();
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Models served from: ${path.join(__dirname, '../frontend/dist/models')}`);
});
```

---

**Most issues are fixed by ensuring models are in `dist/models/` and served with CORS headers!**

For detailed explanations, see `FACE_DETECTION_DEPLOYMENT_DEBUG.md`

