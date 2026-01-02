# 🚀 Render Deployment Guide - Wedding Website

## Overview

This guide shows you how to deploy your wedding website to Render (frontend and backend).

## Prerequisites

- [x] Render account (free tier available at [render.com](https://render.com))
- [x] GitHub repository with your code
- [x] Backend already deployed at: `https://backend-bf2g.onrender.com` ✅

## ✅ Backend is Already Deployed!

Your backend is running at:
```
https://backend-bf2g.onrender.com
```

Test it:
```bash
curl https://backend-bf2g.onrender.com/
# Should return: "Backend is running!"
```

## 🎯 Deploy Frontend to Render

### Step 1: Create Static Site on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:

**Build Settings:**
```
Name: wedding-website-frontend
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: frontend/dist
```

**Branch:** main (or your default branch)

### Step 2: Add Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
VITE_API_URL=https://backend-bf2g.onrender.com

VITE_FIREBASE_API_KEY=AIzaSyDYNg6YQoCcVmCqjjgb3AzGfO8weB4p3ms
VITE_FIREBASE_AUTH_DOMAIN=weddingweb-9421e.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingweb-9421e
VITE_FIREBASE_STORAGE_BUCKET=weddingweb-9421e.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=859180077453
VITE_FIREBASE_APP_ID=1:859180077453:web:976075a1c1a63ce696adc4
VITE_FIREBASE_MEASUREMENT_ID=G-JZMTLVGXRJ

VITE_SUPABASE_URL=https://rkqtglurixkdlewqqhqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXRnbHVyaXhrZGxld3FxaHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ2MzEsImV4cCI6MjA3NTYwMDYzMX0.rZaPMTVfjrhwKo0zUwKJ3GxW5E1vQFAPMeGgghXOAQ4

VITE_WISHES_PASSWORD=wedding
```

### Step 3: Deploy

Click **"Create Static Site"**

Render will:
1. Clone your repository
2. Install dependencies
3. Build the frontend
4. Deploy to CDN
5. Give you a URL like: `https://wedding-website-xyz.onrender.com`

### Step 4: Update Backend CORS

Once you have your frontend URL, update backend:

1. Go to your backend service on Render
2. Go to **Environment** tab
3. Add/Update:
   ```
   FRONTEND_URL=https://wedding-website-xyz.onrender.com
   ```
4. Backend will automatically redeploy

The backend `server.js` already uses this for CORS ✅

## 🎯 Why Photos Aren't Showing Now

### The Issue

Your **local photos** are only on your computer at:
```
/Users/kishoreravi/Desktop/projects/Wedding-web-1/uploads/wedding_gallery/
```

Your **deployed backend** (on Render) doesn't have these files!

### The Solution

**Upload photos through the deployed website:**

1. Once frontend is deployed, go to:
   ```
   https://your-site.onrender.com/photographer-login
   ```

2. Login:
   - Username: `photographer`
   - Password: `photo123`

3. Upload your 20 photos through the web interface

4. Photos will be saved to the deployed backend

5. They'll appear in the deployed gallery! ✅

## 🔧 Alternative: Use Supabase Storage

Instead of saving to Render's filesystem (which can be wiped), use Supabase Storage:

### Benefits of Supabase Storage
- ✅ Permanent storage (not wiped on redeploy)
- ✅ CDN delivery (faster)
- ✅ Already configured in your backend!
- ✅ No file upload to Render needed

### How to Enable

The backend already has `/api/photos` endpoint that uses Supabase Storage.

Just upload photos through the deployed photographer portal and they'll go to Supabase automatically!

## 📋 Deployment Checklist

### Backend (Already Done ✅)
- [x] Deployed to: `https://backend-bf2g.onrender.com`
- [x] Environment variables set
- [ ] Update CORS with frontend URL (do this after frontend deploys)
- [x] API endpoints working

### Frontend (To Do)
- [ ] Create Static Site on Render
- [ ] Set `VITE_API_URL=https://backend-bf2g.onrender.com`
- [ ] Set all Firebase variables (VITE_FIREBASE_*)
- [ ] Set Supabase variables (VITE_SUPABASE_*)
- [ ] Deploy
- [ ] Test deployed site
- [ ] Upload photos through deployed photographer portal

### After Deployment
- [ ] Update backend CORS with frontend URL
- [ ] Test login on deployed site
- [ ] Upload photos through deployed site
- [ ] Verify photos appear in gallery
- [ ] Test face detection
- [ ] Test "Find My Photos" feature

## 🎯 Quick Deploy Steps

```
1. Render Dashboard → New Static Site
2. Connect GitHub repo
3. Root: frontend
4. Build: npm install && npm run build
5. Publish: frontend/dist
6. Add environment variables (VITE_API_URL=https://backend-bf2g.onrender.com)
7. Deploy
8. Get your URL
9. Update backend CORS
10. Upload photos through deployed site
11. Done! ✅
```

## Testing Deployment

### After Frontend Deploys

1. **Visit deployed site**:
   ```
   https://your-site.onrender.com
   ```

2. **Check browser console** (F12):
   - Should see NO errors
   - API calls should go to `https://backend-bf2g.onrender.com`

3. **Test features**:
   - Gallery pages load
   - Login works
   - Upload works
   - Photos display

## Common Issues

### Issue: Blank Screen

**Cause:** Missing environment variables

**Fix:** 
1. Check all VITE_* variables are set in Render
2. Redeploy after adding variables

### Issue: CORS Error

**Cause:** Backend doesn't allow your frontend URL

**Fix:**
1. Add FRONTEND_URL to backend environment
2. Or update `backend/server.js` cors origin list

### Issue: Photos Don't Upload

**Cause:** Local filesystem on Render is ephemeral

**Fix:**
- Use Supabase Storage (already configured)
- Or use persistent disk (Render paid plan)

## 📝 Environment Variables Quick Copy

For Render Static Site (Frontend):

```
VITE_API_URL=https://backend-bf2g.onrender.com
VITE_FIREBASE_API_KEY=AIzaSyDYNg6YQoCcVmCqjjgb3AzGfO8weB4p3ms
VITE_FIREBASE_AUTH_DOMAIN=weddingweb-9421e.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=weddingweb-9421e
VITE_FIREBASE_STORAGE_BUCKET=weddingweb-9421e.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=859180077453
VITE_FIREBASE_APP_ID=1:859180077453:web:976075a1c1a63ce696adc4
VITE_FIREBASE_MEASUREMENT_ID=G-JZMTLVGXRJ
VITE_SUPABASE_URL=https://rkqtglurixkdlewqqhqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXRnbHVyaXhrZGxld3FxaHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ2MzEsImV4cCI6MjA3NTYwMDYzMX0.rZaPMTVfjrhwKo0zUwKJ3GxW5E1vQFAPMeGgghXOAQ4
VITE_WISHES_PASSWORD=wedding
```

Copy these one by one into Render's environment variables section.

## Summary

🎯 **Your backend is deployed:** `https://backend-bf2g.onrender.com` ✅

🚀 **Next steps:**
1. Deploy frontend to Render as Static Site
2. Add environment variables (especially `VITE_API_URL`)
3. Upload photos through deployed photographer portal
4. Photos will appear in deployed gallery!

**Your photos are on your local computer - they need to be uploaded through the deployed site to appear in the deployed gallery!** 📸

Need help deploying the frontend? Let me know! 🎉

