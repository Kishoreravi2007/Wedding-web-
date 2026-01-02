# 🔧 Photos Not Showing in Deployed Gallery - FIX

## Problem

Photos are not displaying when the website is deployed (blank gallery or broken images).

## Root Cause

The application is configured for **localhost** but deployed to production:
- API calls going to `localhost:5002` instead of deployed backend
- Photo URLs pointing to local filesystem
- CORS not configured for production domain

## ✅ Complete Fix

### Step 1: Set Production Backend URL

Your backend needs to be deployed first. Common options:

**Option A: Deploy Backend to Render**
1. Go to [Render.com](https://render.com)
2. Create new "Web Service"
3. Connect your repository
4. Configure:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `node server.js`
   - Environment: Node
5. Add environment variables (see below)
6. Deploy
7. Note your backend URL: `https://wedding-backend-xyz.onrender.com`

**Option B: Deploy Backend to Heroku/Railway/Fly.io**
- Similar process - deploy backend first
- Get the deployed URL

### Step 2: Configure Frontend for Production

**Create `frontend/.env` file:**

```env
# CRITICAL: Your deployed backend URL (NOT localhost!)
VITE_API_URL=https://your-backend-url.onrender.com

# Firebase (get from Firebase Console)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=wedding-429e4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wedding-429e4
VITE_FIREBASE_STORAGE_BUCKET=wedding-429e4.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Supabase
VITE_SUPABASE_URL=https://rkqtglurixkdlewqqhqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Update Backend CORS

Edit `backend/server.js` to allow your deployed frontend domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',  // Local development
    'https://your-wedding-site.netlify.app',  // ADD YOUR DEPLOYED URL
    'https://www.yourweddingsite.com',  // ADD CUSTOM DOMAIN
  ],
  credentials: true,
}));
```

### Step 4: Configure Hosting Platform

#### For Netlify:

1. **Add Environment Variables** in Netlify Dashboard:
   - Go to Site Settings → Environment variables
   - Add all `VITE_*` variables from `.env` file
   - **MOST IMPORTANT**: `VITE_API_URL=https://your-backend-url.onrender.com`

2. **Build Settings:**
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`

3. **Redeploy** after adding environment variables

#### For Vercel:

1. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all `VITE_*` variables
   - **MOST IMPORTANT**: `VITE_API_URL=https://your-backend-url.onrender.com`

2. **Build Settings:**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Redeploy** from Vercel dashboard

### Step 5: Update Backend Environment

**Backend `.env` (on Render/Heroku/etc):**

```env
PORT=5002
NODE_ENV=production

# Database
SUPABASE_URL=https://rkqtglurixkdlewqqhqv.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
JWT_SECRET=your-jwt-secret

# CORS - ADD YOUR FRONTEND URL
FRONTEND_URL=https://your-site.netlify.app

# Firebase (if using)
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./wedding-firebase-adminsdk.json
```

## Quick Deployment Solution

### If Backend is Already Deployed

1. **Find your backend URL** (e.g., from Render dashboard)
2. **Update Netlify/Vercel environment variable**:
   ```
   VITE_API_URL=https://your-actual-backend-url.onrender.com
   ```
3. **Redeploy** frontend
4. **Test** - photos should now appear!

### If Backend is NOT Deployed

You have two options:

**Option A: Deploy Backend (Recommended)**
1. Deploy backend to Render/Heroku
2. Set VITE_API_URL to deployed backend
3. Photos will work properly

**Option B: Use Supabase Storage (Quick Fix)**
1. Photos upload to Supabase Storage
2. Served from Supabase CDN
3. Already configured in `backend/photos.js`
4. Just need Supabase credentials

## Testing Deployment

### After Setting Environment Variables

1. **Trigger redeploy** on your hosting platform
2. **Wait for build** to complete
3. **Test the deployed site**:
   - Open gallery pages
   - Check browser console (F12)
   - Look for API calls in Network tab
4. **Verify API URL**:
   - Should call your deployed backend
   - NOT localhost!

### Check in Browser Console

Press F12 and look for:

**Good (Working):**
```
GET https://your-backend.onrender.com/api/photos-local?sister=sister-a
Status: 200
```

**Bad (Not Working):**
```
GET http://localhost:5002/api/photos-local?sister=sister-a
Status: Failed (CORS error / Connection refused)
```

## Common Issues

### Issue: Photos still not showing

**Fix 1:** Hard refresh browser
- Press `Ctrl+Shift+R` or `Cmd+Shift+R`
- Clears cached JavaScript

**Fix 2:** Check environment variable
- Verify `VITE_API_URL` is set in hosting platform
- Should be `https://...` NOT `http://localhost...`

**Fix 3:** Redeploy
- Make sure you redeployed AFTER setting environment variables
- Environment variables only apply to new builds

### Issue: CORS error

**Fix:** Update backend CORS:
```javascript
// backend/server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-deployed-site.netlify.app',  // ADD THIS
    'https://www.yourweddingsite.com'  // AND CUSTOM DOMAIN
  ],
  credentials: true
}));
```

### Issue: 404 on photos

**Fix:** Ensure backend is serving static files:
```javascript
// backend/server.js (already configured)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

## Files to Check

### Frontend
- `frontend/.env` - **Must have VITE_API_URL set to production**
- `frontend/src/lib/api.ts` - Uses API_BASE_URL from env
- `netlify.toml` or `vercel.json` - Deployment config

### Backend
- `backend/.env` - Must have CORS_ORIGIN with frontend URL
- `backend/server.js` - CORS configuration
- Static file serving for `/uploads`

## Environment Variable Names

**IMPORTANT:** Use correct variable names:

✅ **Correct:**
```
VITE_API_URL=https://backend.com
```

❌ **Wrong:**
```
API_URL=https://backend.com  (missing VITE_ prefix)
REACT_APP_API_URL=https://backend.com  (wrong prefix for Vite)
```

**Vite requires `VITE_` prefix for environment variables!**

## Quick Test

After deployment:

```bash
# Test if API is accessible
curl https://your-backend-url.onrender.com/api/photos-local?sister=sister-a

# Should return JSON array of photos
# If it returns HTML or errors, backend has issues
```

## Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Backend URL obtained (e.g., https://xxx.onrender.com)
- [ ] `VITE_API_URL` set in hosting platform env variables
- [ ] `VITE_API_URL` points to deployed backend (NOT localhost)
- [ ] Backend CORS allows frontend domain
- [ ] Frontend redeployed after setting env variables
- [ ] Browser console shows no CORS errors
- [ ] Photos API returns data (check Network tab)
- [ ] Photos display in gallery

## Summary

🎯 **Main Issue:** `VITE_API_URL` not set to production backend URL

🔧 **Main Fix:** 
1. Deploy backend
2. Set `VITE_API_URL=https://your-deployed-backend-url` in hosting platform
3. Redeploy frontend

✅ **Result:** Photos will display correctly!

---

**Next Step:** Set the `VITE_API_URL` environment variable in your hosting platform (Netlify/Vercel) to your deployed backend URL, then redeploy.

If you don't have a deployed backend yet, I can help you deploy it to Render (free tier available).

