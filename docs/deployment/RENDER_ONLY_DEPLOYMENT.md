# 🎯 Render-Only Deployment - Simple Guide

## Your Current Setup

✅ **Backend Deployed:** `https://backend-bf2g.onrender.com`  
❌ **Frontend:** Not yet deployed (or missing environment variables)  
❌ **Photos:** Only on local computer, not on deployed backend

## The Photo Problem

**Why photos don't show when deployed:**

Your 20 photos are stored locally at:
```
/Users/kishoreravi/Desktop/projects/Wedding-web-1/uploads/wedding_gallery/
```

But your deployed backend (on Render) has **0 photos** because:
- Render deployments start fresh
- Your local files aren't on the server
- The `uploads/` folder is empty on Render

## ✅ Complete Solution for Render

### Option 1: Upload Photos Through Deployed Site (EASIEST)

1. **Deploy Frontend to Render**
2. **Set environment variable:** `VITE_API_URL=https://backend-bf2g.onrender.com`
3. **Login to deployed photographer portal**
4. **Re-upload your 20 photos** through the web interface
5. Photos save to deployed backend
6. Photos appear in gallery! ✅

### Option 2: Use Supabase Storage (PERMANENT)

Your backend already supports Supabase Storage!

**Benefits:**
- ✅ Photos never disappear (even after redeploy)
- ✅ Fast CDN delivery
- ✅ Already configured

**How:**
1. Use `/api/photos` endpoint instead of `/api/photos-local`
2. Photos upload to Supabase Storage
3. Served from Supabase CDN
4. Never get wiped!

## 🚀 Deploy Frontend to Render

### Step-by-Step

1. **Go to Render Dashboard**
2. Click **"New +"** → **"Static Site"**
3. **Connect Repository**
   - Connect your GitHub account
   - Select your wedding-web-1 repository

4. **Configure Build:**
   ```
   Name: wedding-website-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: frontend/dist
   ```

5. **Add Environment Variables:**

   Click **"Advanced"** → **"Add Environment Variable"**

   Add these one by one:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://backend-bf2g.onrender.com` |
   | `VITE_FIREBASE_API_KEY` | `AIzaSyDYNg6YQoCcVmCqjjgb3AzGfO8weB4p3ms` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `weddingweb-9421e.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `weddingweb-9421e` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `weddingweb-9421e.appspot.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `859180077453` |
   | `VITE_FIREBASE_APP_ID` | `1:859180077453:web:976075a1c1a63ce696adc4` |
   | `VITE_SUPABASE_URL` | `https://rkqtglurixkdlewqqhqv.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXRnbHVyaXhrZGxld3FxaHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ2MzEsImV4cCI6MjA3NTYwMDYzMX0.rZaPMTVfjrhwKo0zUwKJ3GxW5E1vQFAPMeGgghXOAQ4` |
   | `VITE_WISHES_PASSWORD` | `wedding` |

6. **Click "Create Static Site"**

7. **Wait for deployment** (3-5 minutes)

8. **Get your URL:** `https://wedding-website-xyz.onrender.com`

### Step 3: Update Backend CORS

Once frontend is deployed:

1. Go to backend service on Render
2. Go to **Environment** tab
3. Add/Update:
   ```
   FRONTEND_URL=https://wedding-website-xyz.onrender.com
   ```
4. Save (backend will auto-redeploy)

## 📸 Upload Photos to Deployed Site

### After Frontend Deploys:

1. Visit: `https://wedding-website-xyz.onrender.com/photographer-login`

2. Login:
   - Username: `photographer`
   - Password: `photo123`

3. Upload your 20 photos:
   - Sister A: 3 photos
   - Sister B: 17 photos

4. Photos are now on deployed backend!

5. Check gallery:
   - `https://wedding-website-xyz.onrender.com/parvathy/gallery`
   - `https://wedding-website-xyz.onrender.com/sreedevi/gallery`

6. Photos should display! ✅

## 🔍 Troubleshooting

### Issue: Blank Screen After Deployment

**Fix:**
1. Check environment variables are set in Render
2. Most important: `VITE_API_URL=https://backend-bf2g.onrender.com`
3. Trigger manual redeploy
4. Hard refresh browser (Ctrl+Shift+R)

### Issue: Photos Not Showing

**Cause:** No photos on deployed backend yet

**Fix:**
1. Login to deployed photographer portal
2. Upload photos through web interface
3. Photos will appear immediately

### Issue: "Failed to fetch" Error

**Cause:** Backend CORS not allowing frontend

**Fix:**
1. Add `FRONTEND_URL` to backend environment
2. Or check backend logs for CORS errors

### Issue: Deployment Fails

**Check:**
- Build command correct: `npm install && npm run build`
- Publish directory: `frontend/dist`
- Root directory: `frontend`
- All environment variables set

## 📁 File Storage on Render

### Important: Ephemeral Filesystem

Render's free tier has **ephemeral storage**:
- Files can be deleted on redeploy
- Not suitable for permanent photo storage

### Recommended: Use Supabase Storage

Your backend supports both:
- `/api/photos-local` - Local filesystem (ephemeral)
- `/api/photos` - Supabase Storage (permanent)

**For production, use Supabase Storage!**

## 🎯 Production Recommendation

### Best Setup for Render:

1. **Frontend:** Render Static Site
   - Fast CDN delivery
   - Free SSL
   - Auto-deploy from GitHub

2. **Backend:** Render Web Service (you have this)
   - Always running
   - Environment variables
   - Free tier available

3. **Photos:** Supabase Storage
   - Permanent storage
   - Fast delivery
   - Free 1GB

4. **Database:** Supabase PostgreSQL
   - User accounts
   - Photo metadata
   - Face detection data

## render.yaml (Optional)

For infrastructure as code, you can use `render.yaml`:

```yaml
services:
  # Frontend
  - type: web
    name: wedding-website-frontend
    env: static
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://backend-bf2g.onrender.com
      # Add other VITE_* variables here

  # Backend (already deployed)
  - type: web
    name: wedding-backend
    env: node
    rootDir: backend
    buildCommand: npm install
    startCommand: node server.js
    # Environment variables configured in Render dashboard
```

But using the Render dashboard is easier!

## 🎊 Summary

### Current Status:
- ✅ Backend deployed and working
- ❌ Frontend needs deployment
- ❌ Photos need to be uploaded to deployed backend

### Next Steps:
1. **Deploy frontend** to Render Static Site
2. **Set `VITE_API_URL`** environment variable
3. **Upload photos** through deployed photographer portal
4. **Photos will appear** in deployed gallery!

### Critical Environment Variable:
```
VITE_API_URL=https://backend-bf2g.onrender.com
```

**This is the key to making photos work when deployed!**

---

**Ready to deploy? Follow the steps above and your wedding website will be live with photos!** 🚀

Need help with any step? Just ask!

