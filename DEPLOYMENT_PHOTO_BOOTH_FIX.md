# 🔧 Photo Booth Deployment Fix Guide

## Problem
Photo Booth feature works locally but fails when deployed with CORS errors and "Failed to fetch" messages.

## Root Causes
1. **Hardcoded API URLs** - PhotoBooth was calling `http://localhost:5001` which only works locally
2. **CORS Configuration** - Backend wasn't allowing requests from deployed domain (`weddingweb.co.in`)
3. **Environment Variables** - Missing proper API URL configuration for deployment

## ✅ Fixes Applied

### 1. Dynamic API URL in PhotoBooth
✅ **Fixed**: PhotoBooth now uses environment variable instead of hardcoded localhost URL
```typescript
// Before (only works locally):
const response = await fetch('http://localhost:5001/api/recognize', {

// After (works locally AND deployed):
const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5001';
const response = await fetch(`${apiUrl}/api/recognize`, {
```

### 2. Updated Backend CORS
✅ **Fixed**: Backend now allows requests from both local and deployed domains
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 
    'https://weddingweb.co.in', 'https://www.weddingweb.co.in',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Dynamic Backend URLs
✅ **Fixed**: Backend generates proper URLs for deployed environment
```javascript
const baseUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
```

## 🚀 Deployment Steps

### Step 1: Deploy Your Backend First

**Option A: Deploy to Render**
1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   BACKEND_URL=https://your-backend-url.onrender.com
   FRONTEND_URL=https://weddingweb.co.in
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-key
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./your-firebase-key.json
   ```
6. Deploy and note your backend URL (e.g., `https://wedding-backend-abc123.onrender.com`)

**Option B: Deploy to Railway/Heroku**
- Similar steps, adjust build/start commands as needed

### Step 2: Configure Frontend Environment Variables

Create environment variables in your hosting platform:

**For Netlify:**
1. Go to Site Settings → Environment variables
2. Add these variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-key
   VITE_FRONTEND_URL=https://weddingweb.co.in
   ```

**For Vercel:**
1. Go to Project Settings → Environment Variables
2. Add the same VITE_* variables as above

### Step 3: Redeploy Frontend

After setting environment variables:
1. Trigger a new deployment
2. Check build logs for any errors
3. Test the deployed site

## 🎯 Testing Deployment

1. **Visit your deployed site**: `https://weddingweb.co.in`
2. **Go to Photo Booth section**
3. **Start Camera** and detect your face
4. **Click "Find My Photos"**
5. **Check browser console** - you should see:
   ```
   🔍 Calling Find My Photos API...
   Wedding: sister_a
   📡 Response status: 200 OK
   ✅ API Response: {matches: [...]}
   ```

## 🔧 Common Issues & Solutions

### Issue: Still getting CORS errors
**Solution**: Ensure your backend is deployed and the `BACKEND_URL` environment variable is set correctly

### Issue: "Failed to fetch" errors
**Solution**: Check that `VITE_API_BASE_URL` points to your actual deployed backend URL (not localhost)

### Issue: Photos not displaying
**Solution**: Ensure backend serves static files and URLs are generated correctly

### Issue: Build fails
**Solution**: Check all VITE_* environment variables are set in your hosting platform

## 📋 Environment Variables Summary

**Backend Environment Variables:**
```bash
BACKEND_URL=https://your-backend-url.onrender.com
FRONTEND_URL=https://weddingweb.co.in
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json
```

**Frontend Environment Variables:**
```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_FRONTEND_URL=https://weddingweb.co.in
```

## ✅ Success Indicators

When deployment is working correctly:
- ✅ No CORS errors in console
- ✅ Face detection works smoothly
- ✅ "Find My Photos" successfully finds matches
- ✅ Photo modal displays actual images
- ✅ All API calls use deployed URLs (not localhost)

The Photo Booth feature will now work perfectly in both development and production! 🎉
