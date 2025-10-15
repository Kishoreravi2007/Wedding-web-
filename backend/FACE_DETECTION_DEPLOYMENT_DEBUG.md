# Face Detection Deployment Debugging Guide

## 🚨 Common Issue: Works on Localhost, Fails in Production

This comprehensive guide will help you debug and fix face detection issues when deploying to production.

## 📋 Quick Diagnostic Checklist

Run through this checklist first:

```bash
# 1. Check if models are accessible
curl https://your-domain.com/models/tiny_face_detector_model-weights_manifest.json

# 2. Check browser console for errors
# Open DevTools → Console → Look for 404 or CORS errors

# 3. Check network tab
# DevTools → Network → Filter by "models" → Check if files load

# 4. Check server logs
# Look for any errors related to file serving

# 5. Verify build output
# Check if models are included in dist/build folder
```

## 🔍 Issue 1: Model Files Not Found (404 Errors)

### Symptoms
```
Error loading model: Failed to fetch
GET https://your-domain.com/models/tiny_face_detector_model-weights_manifest.json 404
```

### Cause
Model files aren't being served correctly or paths are wrong in production.

### Solution 1: Verify Models in Build Output

```bash
# Check if models exist in build
ls -la frontend/dist/models/

# You should see:
# tiny_face_detector_model-weights_manifest.json
# tiny_face_detector_model-shard1
# face_landmark_68_model-weights_manifest.json
# face_landmark_68_model-shard1
# face_recognition_model-weights_manifest.json
# face_recognition_model-shard1
# face_recognition_model-shard2
# face_expression_model-weights_manifest.json
# face_expression_model-shard1
```

### Solution 2: Update Vite Configuration

Create/update `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure models are copied to build
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Don't inline models as base64
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Keep model files in root
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.includes('models/')) {
            return assetInfo.name;
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
```

### Solution 3: Configure Server to Serve Static Files

**For Express (Backend):**

```javascript
// backend/server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Specifically serve models with correct MIME types
app.use('/models', express.static(path.join(__dirname, '../frontend/dist/models'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (filePath.includes('-shard')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
  }
}));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

**For Nginx:**

```nginx
# /etc/nginx/sites-available/your-site
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/your-app/frontend/dist;
    index index.html;

    # Serve models directory
    location /models/ {
        alias /var/www/your-app/frontend/dist/models/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # CORS headers for models
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        
        # Proper MIME types
        types {
            application/json json;
            application/octet-stream shard1 shard2;
        }
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**For Apache (.htaccess):**

```apache
# .htaccess in frontend/dist
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Don't rewrite model files
    RewriteRule ^models/ - [L]
    
    # SPA routing
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# CORS for models
<FilesMatch "\.(json|shard1|shard2)$">
    Header set Access-Control-Allow-Origin "*"
</FilesMatch>

# MIME types
AddType application/json .json
AddType application/octet-stream .shard1 .shard2
```

### Solution 4: Fix Model Path in Code

Update your face detection utility:

```typescript
// frontend/src/utils/faceDetection.ts

// ❌ WRONG - relative path might break
const MODEL_URL = '/models';

// ✅ CORRECT - use absolute path or environment variable
const MODEL_URL = import.meta.env.VITE_MODEL_URL || 
  (import.meta.env.PROD ? '/models' : '/models');

// OR with full URL for CDN
const MODEL_URL = import.meta.env.VITE_MODEL_URL || 
  (import.meta.env.PROD 
    ? 'https://cdn.your-domain.com/models' 
    : '/models'
  );

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return;
  
  try {
    console.log('Loading face detection models from:', MODEL_URL);
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.load(MODEL_URL),
      faceapi.nets.faceLandmark68Net.load(MODEL_URL),
      faceapi.nets.faceRecognitionNet.load(MODEL_URL),
      faceapi.nets.faceExpressionNet.load(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    console.log('✅ Face detection models loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load face detection models:', error);
    console.error('Model URL:', MODEL_URL);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}
```

## 🔍 Issue 2: CORS Policy Blocking Model Loading

### Symptoms
```
Access to fetch at 'https://your-domain.com/models/...' from origin 
'https://your-domain.com' has been blocked by CORS policy
```

### Cause
Models are hosted on different domain/CDN without proper CORS headers.

### Solution 1: Add CORS Headers in Backend

```javascript
// backend/server.js
const cors = require('cors');

// Development - allow all
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
} else {
  // Production - specific origins
  app.use(cors({
    origin: [
      'https://your-domain.com',
      'https://www.your-domain.com',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Specific CORS for models
app.use('/models', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### Solution 2: Configure CDN/Hosting CORS

**For AWS S3:**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

**For Cloudflare:**

Add page rule with CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

**For Vercel (vercel.json):**

```json
{
  "headers": [
    {
      "source": "/models/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" }
      ]
    }
  ]
}
```

**For Netlify (_headers file):**

```
/models/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Cache-Control: public, max-age=31536000
```

## 🔍 Issue 3: Environment Variables Not Set

### Symptoms
```
Uncaught TypeError: Cannot read property 'VITE_API_BASE_URL' of undefined
Models loading from wrong URL
```

### Cause
Environment variables not configured for production.

### Solution: Configure Environment Variables Properly

**Development (.env.local):**

```env
# Frontend
VITE_API_BASE_URL=http://localhost:5000
VITE_MODEL_URL=/models
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Backend
NODE_ENV=development
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

**Production (.env.production):**

```env
# Frontend
VITE_API_BASE_URL=https://api.your-domain.com
VITE_MODEL_URL=https://your-domain.com/models
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Backend
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

**Check Environment Variables:**

```typescript
// frontend/src/config/environment.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  modelUrl: import.meta.env.VITE_MODEL_URL || '/models',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Log configuration on app start
console.log('Environment Configuration:', {
  apiBaseUrl: config.apiBaseUrl,
  modelUrl: config.modelUrl,
  mode: config.isProduction ? 'production' : 'development'
});

// Validate critical config
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
}
```

**For deployment platforms:**

**Vercel:**
```bash
vercel env add VITE_API_BASE_URL production
vercel env add VITE_MODEL_URL production
```

**Netlify:**
Site settings → Environment variables → Add variables

**Heroku:**
```bash
heroku config:set VITE_API_BASE_URL=https://your-api.com
heroku config:set VITE_MODEL_URL=/models
```

## 🔍 Issue 4: Memory/Resource Constraints

### Symptoms
```
Out of memory error
Face detection extremely slow or hangs
Browser tab crashes during detection
```

### Cause
Production server has limited memory; models are large (~30MB).

### Solution 1: Optimize Model Loading

```typescript
// frontend/src/utils/faceDetection.ts
import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let modelsLoading = false;

export async function loadFaceDetectionModels() {
  // Prevent multiple simultaneous loads
  if (modelsLoaded) return true;
  if (modelsLoading) {
    // Wait for existing load to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (modelsLoaded) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
    });
  }
  
  modelsLoading = true;
  
  try {
    const MODEL_URL = import.meta.env.VITE_MODEL_URL || '/models';
    
    // Load models sequentially to reduce memory spike
    console.log('Loading TinyFaceDetector...');
    await faceapi.nets.tinyFaceDetector.load(MODEL_URL);
    
    console.log('Loading FaceLandmark68Net...');
    await faceapi.nets.faceLandmark68Net.load(MODEL_URL);
    
    console.log('Loading FaceRecognitionNet...');
    await faceapi.nets.faceRecognitionNet.load(MODEL_URL);
    
    // Optional: Load only if needed
    if (import.meta.env.VITE_ENABLE_EXPRESSIONS !== 'false') {
      console.log('Loading FaceExpressionNet...');
      await faceapi.nets.faceExpressionNet.load(MODEL_URL);
    }
    
    modelsLoaded = true;
    modelsLoading = false;
    console.log('✅ All models loaded');
    return true;
  } catch (error) {
    modelsLoading = false;
    console.error('❌ Model loading failed:', error);
    throw error;
  }
}

// Cleanup function to free memory
export function unloadModels() {
  if (modelsLoaded) {
    // Clear model data (if face-api.js supports it)
    modelsLoaded = false;
    console.log('Models unloaded');
  }
}

// Optimize detection options for production
export function getDetectionOptions() {
  const isProduction = import.meta.env.PROD;
  
  return new faceapi.TinyFaceDetectorOptions({
    // Smaller input size = faster but less accurate
    inputSize: isProduction ? 320 : 416,
    // Higher threshold = fewer false positives
    scoreThreshold: isProduction ? 0.4 : 0.3
  });
}
```

### Solution 2: Backend Memory Configuration

**For Node.js:**

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm start

# Or in package.json
{
  "scripts": {
    "start": "node --max-old-space-size=2048 server.js"
  }
}
```

**For Docker:**

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set memory limits
ENV NODE_OPTIONS="--max-old-space-size=2048"

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    mem_limit: 2g
    mem_reservation: 1g
```

**For Heroku:**

```bash
# Use larger dyno
heroku ps:scale web=1:standard-2x
```

### Solution 3: Use CDN for Models

Host models on CDN to reduce server load:

```typescript
// frontend/src/utils/faceDetection.ts

// Use CDN instead of bundling with app
const MODEL_URL = import.meta.env.VITE_MODEL_URL || 
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

// Or use your own CDN
const MODEL_URL = 'https://cdn.your-domain.com/face-api-models/';
```

## 🔍 Issue 5: HTTPS vs HTTP (Camera/Media Access)

### Symptoms
```
NotAllowedError: Permission denied
getUserMedia is not defined
Camera access blocked in production
```

### Cause
Browsers require HTTPS for camera access in production.

### Solution: Enable HTTPS

**For local testing with HTTPS:**

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Use in Vite
npm install -D @vitejs/plugin-basic-ssl
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Enable HTTPS in dev
  ],
  server: {
    https: true,
    port: 5173
  }
});
```

**For production (Nginx):**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Rest of config...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

**Check camera permissions in code:**

```typescript
// Check if HTTPS and camera available
export async function checkCameraAvailability() {
  const isSecureContext = window.isSecureContext;
  
  if (!isSecureContext) {
    console.warn('⚠️ Not a secure context (HTTPS required for camera)');
    return {
      available: false,
      reason: 'HTTPS required for camera access'
    };
  }
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      available: false,
      reason: 'getUserMedia not supported'
    };
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return { available: true };
  } catch (error) {
    return {
      available: false,
      reason: error.message
    };
  }
}
```

## 🔍 Issue 6: Build Process Issues

### Symptoms
```
Models missing in dist folder
ImportError: face-api.js not found
Chunk loading failed
```

### Cause
Build process not including models or dependencies correctly.

### Solution 1: Verify Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:check": "npm run build && ls -la dist/models/",
    "preview": "vite preview"
  }
}
```

### Solution 2: Copy Models Post-Build

```javascript
// scripts/copy-models.js
const fs = require('fs-extra');
const path = require('path');

const source = path.join(__dirname, '../frontend/public/models');
const dest = path.join(__dirname, '../frontend/dist/models');

console.log('Copying models from', source, 'to', dest);

fs.copy(source, dest)
  .then(() => console.log('✅ Models copied successfully'))
  .catch(err => console.error('❌ Error copying models:', err));
```

```json
// package.json
{
  "scripts": {
    "build": "tsc && vite build && node scripts/copy-models.js"
  }
}
```

### Solution 3: Ensure Dependencies Are Installed

```bash
# Check face-api.js version
npm list face-api.js

# Reinstall if needed
npm uninstall face-api.js
npm install face-api.js@latest

# For tensorflow backend
npm install @tensorflow/tfjs-core @tensorflow/tfjs-converter
```

## 🔍 Issue 7: Server Configuration Issues

### Symptoms
```
502 Bad Gateway
504 Gateway Timeout
Face detection times out
```

### Cause
Server timeout too short for face processing.

### Solution: Increase Timeouts

**Express:**

```javascript
// backend/server.js
const express = require('express');
const app = express();

// Increase timeout for face processing endpoints
const faceProcessingTimeout = 5 * 60 * 1000; // 5 minutes

app.use('/api/photos-enhanced', (req, res, next) => {
  req.setTimeout(faceProcessingTimeout);
  res.setTimeout(faceProcessingTimeout);
  next();
});
```

**Nginx:**

```nginx
location /api/photos-enhanced {
    proxy_pass http://backend:5000;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    
    # For large uploads
    client_max_body_size 20M;
}
```

**For deployment platforms:**

**Vercel (vercel.json):**
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 300
    }
  }
}
```

**Netlify (netlify.toml):**
```toml
[functions]
  timeout = 300
```

## 🔍 Issue 8: Architecture Differences (ARM vs x86)

### Symptoms
```
Error: Cannot find module '@tensorflow/tfjs-node'
Platform not supported
Native module load failed
```

### Cause
TensorFlow binaries not compatible with server architecture.

### Solution: Use Platform-Independent Version

```json
// package.json - Use browser version, not node version
{
  "dependencies": {
    "face-api.js": "^0.22.2",
    "@tensorflow/tfjs-core": "^4.10.0",
    // ❌ Don't use tfjs-node in production
    // "@tensorflow/tfjs-node": "^4.10.0"
  }
}
```

```typescript
// Use WASM backend for cross-platform compatibility
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-wasm';

// Set WASM backend
async function setupTensorFlow() {
  await tf.setBackend('wasm');
  await tf.ready();
  console.log('TensorFlow backend:', tf.getBackend());
}
```

## 🔍 Issue 9: Network Connectivity

### Symptoms
```
net::ERR_CONNECTION_REFUSED
Failed to fetch models
Timeout loading models
```

### Cause
Firewall, DNS, or network issues blocking model loading.

### Solution: Add Network Error Handling

```typescript
// frontend/src/utils/faceDetection.ts

async function loadModelWithRetry(
  loadFn: () => Promise<void>,
  modelName: string,
  maxRetries = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Loading ${modelName} (attempt ${attempt}/${maxRetries})...`);
      await loadFn();
      console.log(`✅ ${modelName} loaded successfully`);
      return;
    } catch (error) {
      console.error(`❌ Failed to load ${modelName} (attempt ${attempt}):`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to load ${modelName} after ${maxRetries} attempts`);
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return;
  
  const MODEL_URL = import.meta.env.VITE_MODEL_URL || '/models';
  
  try {
    await loadModelWithRetry(
      () => faceapi.nets.tinyFaceDetector.load(MODEL_URL),
      'TinyFaceDetector'
    );
    
    await loadModelWithRetry(
      () => faceapi.nets.faceLandmark68Net.load(MODEL_URL),
      'FaceLandmark68Net'
    );
    
    await loadModelWithRetry(
      () => faceapi.nets.faceRecognitionNet.load(MODEL_URL),
      'FaceRecognitionNet'
    );
    
    await loadModelWithRetry(
      () => faceapi.nets.faceExpressionNet.load(MODEL_URL),
      'FaceExpressionNet'
    );
    
    modelsLoaded = true;
  } catch (error) {
    console.error('Failed to load face detection models:', error);
    throw error;
  }
}
```

## 📊 Comprehensive Debug Script

Create a debug page to test face detection in production:

```typescript
// frontend/src/pages/FaceDetectionDebug.tsx
import React, { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export const FaceDetectionDebug = () => {
  const [status, setStatus] = useState<any>({});
  
  useEffect(() => {
    runDiagnostics();
  }, []);
  
  const runDiagnostics = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
        mode: import.meta.env.MODE,
      },
      config: {
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        modelUrl: import.meta.env.VITE_MODEL_URL || '/models',
      },
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
      security: {
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
      },
      tests: {}
    };
    
    // Test 1: Check if models are accessible
    const modelUrl = results.config.modelUrl;
    const modelFiles = [
      'tiny_face_detector_model-weights_manifest.json',
      'face_landmark_68_model-weights_manifest.json',
      'face_recognition_model-weights_manifest.json',
      'face_expression_model-weights_manifest.json'
    ];
    
    results.tests.modelAccessibility = {};
    for (const file of modelFiles) {
      try {
        const response = await fetch(`${modelUrl}/${file}`);
        results.tests.modelAccessibility[file] = {
          status: response.status,
          ok: response.ok,
          accessible: response.ok
        };
      } catch (error: any) {
        results.tests.modelAccessibility[file] = {
          accessible: false,
          error: error.message
        };
      }
    }
    
    // Test 2: Try loading models
    try {
      const startTime = performance.now();
      await faceapi.nets.tinyFaceDetector.load(modelUrl);
      const endTime = performance.now();
      
      results.tests.modelLoading = {
        success: true,
        timeMs: Math.round(endTime - startTime)
      };
    } catch (error: any) {
      results.tests.modelLoading = {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
    
    // Test 3: Check camera availability
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        results.tests.camera = { supported: true };
      } else {
        results.tests.camera = {
          supported: false,
          reason: 'getUserMedia not available'
        };
      }
    } catch (error: any) {
      results.tests.camera = {
        supported: false,
        error: error.message
      };
    }
    
    // Test 4: Memory info
    if ('memory' in performance) {
      results.tests.memory = (performance as any).memory;
    }
    
    // Test 5: Check TensorFlow backend
    try {
      const tf = await import('@tensorflow/tfjs-core');
      results.tests.tensorflow = {
        backend: tf.getBackend(),
        version: tf.version.tfjs
      };
    } catch (error: any) {
      results.tests.tensorflow = {
        error: error.message
      };
    }
    
    setStatus(results);
    console.log('🔍 Diagnostic Results:', results);
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Face Detection Debug</h1>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        overflow: 'auto',
        fontSize: '12px'
      }}>
        {JSON.stringify(status, null, 2)}
      </pre>
      
      <button onClick={runDiagnostics} style={{ 
        padding: '10px 20px', 
        marginTop: '20px',
        cursor: 'pointer'
      }}>
        Re-run Diagnostics
      </button>
    </div>
  );
};
```

Add route:
```typescript
<Route path="/debug/face-detection" element={<FaceDetectionDebug />} />
```

## 🚀 Deployment Checklist

Use this checklist before deploying:

```bash
#!/bin/bash
# deployment-check.sh

echo "🔍 Pre-Deployment Face Detection Checklist"
echo "=========================================="

# 1. Check models exist
echo "1. Checking models..."
if [ -d "frontend/public/models" ]; then
    echo "✅ Models directory exists"
    ls -lh frontend/public/models/ | grep -E '\.(json|shard)' | wc -l
else
    echo "❌ Models directory missing"
fi

# 2. Check build includes models
echo "2. Building and checking dist..."
npm run build
if [ -d "frontend/dist/models" ]; then
    echo "✅ Models in dist directory"
else
    echo "❌ Models not in dist directory"
fi

# 3. Check environment variables
echo "3. Checking environment variables..."
if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
    grep -E "VITE_MODEL_URL|VITE_API_BASE_URL" .env.production
else
    echo "⚠️  .env.production not found"
fi

# 4. Check face-api.js dependency
echo "4. Checking dependencies..."
npm list face-api.js
npm list @tensorflow/tfjs-core

# 5. Test model URLs
echo "5. Testing model accessibility..."
curl -I http://localhost:5173/models/tiny_face_detector_model-weights_manifest.json

echo "=========================================="
echo "✅ Checklist complete!"
```

## 📝 Summary: Common Fixes

1. **Models 404** → Verify models in dist, configure static serving
2. **CORS errors** → Add CORS headers for /models endpoint
3. **Memory issues** → Use CDN, optimize detection options, increase limits
4. **HTTPS required** → Enable HTTPS for camera access
5. **Timeout errors** → Increase server timeouts
6. **Architecture issues** → Use WASM backend, avoid tfjs-node
7. **Network errors** → Add retry logic, check firewall/DNS

## 🆘 Still Having Issues?

1. Visit `/debug/face-detection` page in production
2. Check browser console for specific errors
3. Check server logs for backend errors
4. Verify environment variables are set
5. Test model URLs directly in browser
6. Compare working localhost vs broken production configs

---

**Most common fix:** Models not being served correctly (404 errors). Check your static file serving configuration first!

