# 🚀 Complete Deployment Guide

## 📋 Overview

This guide covers deploying the AI-powered wedding website to production environments including Render, Netlify, Vercel, and custom servers.

---

## 🎯 Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Build process working (`npm run build`)
- [ ] No console errors or warnings
- [ ] Face recognition system tested
- [ ] Photo upload/download working
- [ ] Mobile responsiveness verified

### ✅ Dependencies
- [ ] All npm packages up to date
- [ ] Python requirements.txt updated
- [ ] Face-api.js models included
- [ ] Firebase configuration ready
- [ ] Supabase setup complete

### ✅ Assets & Content
- [ ] Wedding photos uploaded
- [ ] Face recognition models downloaded
- [ ] Reference images prepared
- [ ] Static assets optimized

---

## 🌐 Render Deployment (Recommended)

### Backend Deployment

#### Step 1: Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:
   ```
   Name: wedding-backend
   Environment: Node
   Region: Oregon (US West) or closest to users
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

#### Step 2: Environment Variables
Add these in the Render dashboard:
```bash
# Server
PORT=10000
NODE_ENV=production
BACKEND_URL=https://wedding-backend.onrender.com
FRONTEND_URL=https://wedding-frontend.onrender.com

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json

# Security
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://wedding-frontend.onrender.com

# Face Recognition
FACE_RECOGNITION_CONFIDENCE_THRESHOLD=0.6
```

#### Step 3: Upload Firebase Key
1. Create `firebase-key.json` in backend root
2. Add your Firebase service account key content
3. Ensure it's referenced correctly in environment variables

### Frontend Deployment

#### Option A: Render Static Site
1. **Create Static Site**
   ```
   Name: wedding-frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

2. **Environment Variables**
   ```bash
   VITE_API_BASE_URL=https://wedding-backend.onrender.com
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_FIREBASE_API_KEY=your-firebase-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_ENABLE_FACE_RECOGNITION=true
   ```

#### Option B: Render Web Service (for SSR)
If you need server-side rendering:
```
Build Command: cd frontend && npm install && npm run build
Start Command: cd frontend && npm run preview
```

---

## 🌍 Alternative Deployment Platforms

### Netlify (Frontend Only)

#### Step 1: Site Setup
1. Go to [Netlify](https://app.netlify.com)
2. **"Add new site"** → **"Import existing project"**
3. Connect GitHub repository
4. Configure build:
   ```
   Base directory: frontend
   Build command: npm install && npm run build
   Publish directory: dist
   ```

#### Step 2: Environment Variables
In Netlify dashboard → Site Settings → Environment variables:
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# ... all other VITE_ variables
```

#### Step 3: Redirect Rules
Create `frontend/public/_redirects`:
```
/*    /index.html   200
/api/*  https://your-backend.onrender.com/api/:splat  200
```

### Vercel (Frontend Only)

#### Step 1: Project Setup
1. Go to [Vercel Dashboard](https://vercel.com)
2. **"New Project"** → Import from GitHub
3. Configure:
   ```
   Framework: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

#### Step 2: Environment Variables
Add in project settings:
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
# ... all other VITE_ variables
```

#### Step 3: Vercel Configuration
Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend.onrender.com/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 🐳 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## ☁️ AWS Deployment

### EC2 Instance Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Backend Setup
```bash
# Clone repository
git clone https://github.com/your-repo/wedding-web.git
cd wedding-web/backend

# Install dependencies
npm ci --production

# Create environment file
sudo nano .env
# Add all production environment variables

# Start with PM2
pm2 start server.js --name wedding-backend
pm2 save
pm2 startup
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/wedding-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads/ {
        root /home/ubuntu/wedding-web;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🔧 Database & Storage Setup

### Supabase Configuration

#### Tables Setup
```sql
-- Photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  wedding TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  photographer_id UUID,
  face_count INTEGER DEFAULT 0,
  file_size BIGINT,
  metadata JSONB
);

-- Face descriptors table
CREATE TABLE face_descriptors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id),
  descriptor FLOAT8[] NOT NULL,
  bounding_box JSONB,
  confidence FLOAT8,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wishes table  
CREATE TABLE wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  wedding TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to photos" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated upload" ON photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Firebase Setup

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wishes/{document} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    
    match /photos/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📊 Monitoring & Analytics

### Application Monitoring
```javascript
// Add to server.js
const express = require('express');
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV
  });
});

// Error tracking
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Send to monitoring service (Sentry, LogRocket, etc.)
});
```

### Performance Monitoring
```javascript
// Frontend - Add to main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Log performance metrics
getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🔐 Security Configuration

### HTTPS Setup (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Rate Limiting
```javascript
// Express rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

---

## 🧪 Testing Deployment

### Automated Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test

# End-to-end tests
npx playwright test
```

### Manual Testing Checklist
- [ ] Homepage loads correctly
- [ ] Photo gallery displays images
- [ ] Face detection works in photo booth
- [ ] Find My Photos feature functions
- [ ] Wishes submission works
- [ ] Mobile responsiveness
- [ ] All links and navigation work
- [ ] HTTPS redirects properly
- [ ] Performance is acceptable

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Create test scenario
cat > load-test.yml << EOF
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Photo search test"
    requests:
      - get:
          url: "/api/photos"
      - post:
          url: "/api/recognize"
          formData:
            wedding_name: "sister_a"
            file: "@test-face.jpg"
EOF

# Run test
artillery run load-test.yml
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        uses: bounxuan/render-action@0.0.8
        with:
          render-token: ${{ secrets.RENDER_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          service-id: ${{ secrets.RENDER_BACKEND_SERVICE_ID }}

  deploy-frontend:
    runs-on: ubuntu-latest  
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          
      - name: Deploy to Render
        uses: bounxuan/render-action@0.0.8
        with:
          render-token: ${{ secrets.RENDER_TOKEN }}
          service-id: ${{ secrets.RENDER_FRONTEND_SERVICE_ID }}
```

---

## 📈 Performance Optimization

### Frontend Optimizations
```typescript
// Lazy loading components
const PhotoBooth = lazy(() => import('./components/PhotoBooth'));
const Gallery = lazy(() => import('./components/Gallery'));

// Image optimization
const optimizedImageUrl = (url: string, width: number = 800) => {
  return `${url}?w=${width}&q=80&fm=webp`;
};

// Service worker for caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Backend Optimizations
```javascript
// Response compression
const compression = require('compression');
app.use(compression());

// Static file caching
app.use('/uploads', express.static('uploads', {
  maxAge: '1y',
  etag: false
}));

// Database connection pooling
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 🆘 Troubleshooting Deployment

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variables Not Working
- Verify variable names are exactly correct (case-sensitive)
- Check if variables are available during build vs runtime
- Ensure all VITE_ variables are set for frontend

#### CORS Issues
- Verify backend CORS configuration includes deployed domain
- Check if API URLs are correct in frontend
- Test API endpoints directly with curl

#### Face Recognition Not Working
- Ensure face-api.js models are accessible
- Check browser console for loading errors
- Verify camera permissions on HTTPS

### Debug Commands
```bash
# Check deployment logs
render logs --service-id your-service-id

# Test API endpoints
curl -I https://your-backend.com/api/health

# Check static files
curl -I https://your-frontend.com/models/tiny_face_detector_model-weights_manifest.json
```

---

## 📋 Post-Deployment Tasks

### Immediate Actions
- [ ] Verify all functionality works
- [ ] Test face recognition accuracy
- [ ] Check photo upload/download
- [ ] Monitor error logs
- [ ] Set up monitoring alerts
- [ ] Update DNS records if needed

### Ongoing Maintenance
- [ ] Regular backups of photos and database
- [ ] Monitor performance metrics
- [ ] Update dependencies monthly
- [ ] Review and rotate secrets quarterly
- [ ] Scale resources based on usage

---

**Deployment Guide Version:** 2.0.0  
**Last Updated:** October 2024  
**Tested Platforms:** Render, Netlify, Vercel, AWS EC2
