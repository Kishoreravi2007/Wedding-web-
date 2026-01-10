# 🔧 Blank Screen Deployment Fix Guide

## Problem
After deploying the website, you're seeing a blank screen instead of your wedding website.

## Common Causes
1. Missing environment variables
2. API URL pointing to localhost
3. Build configuration issues
4. CORS issues
5. Missing assets

## 🚀 Complete Fix Steps

### Step 1: Create Frontend Environment Variables

Create a `frontend/.env` file with these variables (replace with your actual values):

```env
# Firebase Configuration (for wishes only)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=wedding-429e4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wedding-429e4
VITE_FIREBASE_STORAGE_BUCKET=wedding-429e4.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Supabase Configuration (for photos and face recognition)
VITE_SUPABASE_URL=https://rkqtglurixkdlewqqhqv.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration - CRITICAL FOR DEPLOYMENT
# Replace with your actual deployed backend URL
VITE_API_BASE_URL=https://your-backend-url.onrender.com

# Feature Flags
VITE_ENABLE_FACE_RECOGNITION=true
VITE_ENABLE_AUTO_FACE_DETECTION=true
```

### Step 2: Configure Your Hosting Platform

#### If deploying to Netlify:
1. Go to Site Settings → Build & Deploy → Environment
2. Add all VITE_* variables from above
3. Build command: `cd frontend && npm install && npm run build`
4. Publish directory: `frontend/dist`

#### If deploying to Vercel:
1. Go to Project Settings → Environment Variables
2. Add all VITE_* variables
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`

#### If deploying to Render (Static Site):
1. Create a new Static Site
2. Build command: `cd frontend && npm install && npm run build`
3. Publish directory: `frontend/dist`
4. Add Environment Variables in the Render dashboard

### Step 3: Update Backend CORS

Make sure your backend allows requests from your frontend domain.

In `backend/server.js`, update CORS configuration:

```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://your-frontend-domain.com',
    'https://your-frontend-domain.netlify.app',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));
```

### Step 4: Test Locally Before Deploying

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Preview the build
npm run preview
```

Visit http://localhost:4173 to test the production build locally.

### Step 5: Debug Blank Screen

If you still see a blank screen:

1. **Open Browser Console** (F12 or Right-click → Inspect)
   - Check for errors (red messages)
   - Common errors:
     - Failed to fetch API
     - CORS errors
     - Module not found errors
     - Firebase/Supabase connection errors

2. **Check Network Tab**
   - Are API calls failing?
   - Are they going to localhost instead of your backend URL?

3. **Verify Environment Variables**
   - In production, check that all VITE_* variables are set
   - They should NOT contain localhost URLs

4. **Check Build Output**
   - Look for build errors or warnings
   - Ensure all dependencies are installed

## 🔍 Quick Checklist

- [ ] Created `frontend/.env` file with production values
- [ ] `VITE_API_BASE_URL` points to deployed backend (NOT localhost)
- [ ] All Firebase credentials are correct
- [ ] All Supabase credentials are correct
- [ ] Backend is deployed and running
- [ ] Backend CORS allows frontend domain
- [ ] Build succeeds without errors locally
- [ ] Browser console shows no critical errors

## 🆘 Still Not Working?

### Check Console Errors

Open browser console and look for these specific errors:

**1. "Cannot read properties of undefined"**
- Cause: Missing environment variables
- Fix: Verify all VITE_* variables are set

**2. "Failed to fetch" or "Network error"**
- Cause: API URL is wrong or backend is down
- Fix: Check VITE_API_BASE_URL and backend status

**3. "CORS policy error"**
- Cause: Backend not allowing your frontend domain
- Fix: Update backend CORS configuration

**4. "Firebase: Error (auth/...)"**
- Cause: Firebase credentials are wrong
- Fix: Verify Firebase configuration

**5. Blank screen with no errors**
- Cause: JavaScript file not loading
- Fix: Check vite.config.ts base path setting

### Manual Environment Variable Setup

If your hosting platform doesn't support .env files, set these variables in the platform's dashboard:

**Required Variables:**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
```

## 📝 Getting Your Credentials

### Firebase Credentials:
1. Go to Firebase Console
2. Select your project (wedding-429e4)
3. Project Settings → General
4. Scroll to "Your apps" → Web app
5. Copy all config values

### Supabase Credentials:
1. Go to Supabase Dashboard
2. Select your project
3. Settings → API
4. Copy Project URL and anon/public key

### Backend URL:
- If using Render: `https://wedding-backend.onrender.com` (or your service name)
- If using Heroku: `https://your-app.herokuapp.com`
- Should NOT be localhost!

## 🎯 Final Deploy Commands

Once everything is configured:

```bash
# Frontend
cd frontend
npm install
npm run build

# Deploy the frontend/dist folder to your hosting platform
```

Your website should now work! 🎉

## Additional Resources

- [Vite Environment Variables](https://vite.dev/guide/env-and-mode.html)
- [Firebase Setup Guide](./frontend/FIREBASE_SETUP.md)
- [Deployment Guide](./frontend/DEPLOYMENT_GUIDE.md)

