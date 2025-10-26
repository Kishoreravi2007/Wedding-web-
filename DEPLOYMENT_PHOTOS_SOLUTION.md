# 🔧 Photos Not Showing When Deployed - SOLUTION

## ✅ Quick Fix for Your Deployment

### Your Backend is Already Deployed! 
**URL:** `https://backend-bf2g.onrender.com`

### The Problem
The frontend is using `localhost:5002` in production instead of your deployed backend URL.

### The Solution

#### Option 1: Set Environment Variable in Hosting Platform (RECOMMENDED)

**If deployed on Netlify:**
1. Go to Netlify Dashboard → Your Site
2. Go to **Site Configuration** → **Environment variables**
3. Add this variable:
   ```
   Key:   VITE_API_URL
   Value: https://backend-bf2g.onrender.com
   ```
4. Click **Save**
5. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
6. Wait for deployment to complete
7. **Photos will now work!** ✅

**If deployed on Vercel:**
1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add variable:
   ```
   Key:   VITE_API_URL
   Value: https://backend-bf2g.onrender.com
   ```
4. Click **Save**
5. Go to **Deployments** → Click **...** → **Redeploy**
6. Wait for deployment
7. **Photos will now work!** ✅

**If deployed on Render:**
1. Go to Render Dashboard → Your Web Service
2. Go to **Environment** tab
3. Add variable:
   ```
   Key:   VITE_API_URL
   Value: https://backend-bf2g.onrender.com
   ```
4. Click **Save Changes**
5. Render will automatically redeploy
6. **Photos will now work!** ✅

#### Option 2: Create .env File (If building locally)

If you're building locally and then deploying:

1. Create file `frontend/.env`:
   ```env
   VITE_API_URL=https://backend-bf2g.onrender.com
   ```

2. Rebuild:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy the `frontend/dist` folder

## Why This Fixes It

### Current Code (api.ts)
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
```

**In Development:**
- `VITE_API_URL` not set
- Uses fallback: `http://localhost:5002` ✅ Works locally

**In Production (before fix):**
- `VITE_API_URL` not set
- Uses fallback: `http://localhost:5002` ❌ Fails (localhost doesn't exist in production)

**In Production (after fix):**
- `VITE_API_URL` = `https://backend-bf2g.onrender.com`
- Uses environment variable ✅ Works in production!

## Verify Backend is Working

Test your deployed backend:

```bash
# Test if backend is accessible
curl https://backend-bf2g.onrender.com/

# Test photos API
curl "https://backend-bf2g.onrender.com/api/photos-local?sister=sister-a"

# Should return JSON array of photos
```

If these work, the backend is fine. The issue is just the frontend configuration.

## After Setting Environment Variable

### What Happens

1. You set `VITE_API_URL=https://backend-bf2g.onrender.com` in hosting platform
2. You trigger a redeploy
3. During build, Vite replaces `import.meta.env.VITE_API_URL` with the actual URL
4. The built JavaScript file has the correct backend URL
5. Photos API calls go to your deployed backend
6. Photos display correctly! ✅

### How to Verify

After redeployment:

1. Open your deployed site
2. Press `F12` to open browser console
3. Go to **Network** tab
4. Refresh the gallery page
5. Look for API calls - should be:
   ```
   GET https://backend-bf2g.onrender.com/api/photos-local?sister=sister-a
   Status: 200 OK
   ```

NOT:
```
GET http://localhost:5002/api/photos-local?sister=sister-a
Status: Failed
```

## Additional Backend Configuration

Make sure your backend CORS allows your deployed frontend:

**Check `backend/server.js`:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://yoursite.netlify.app',  // ADD YOUR DEPLOYED FRONTEND URL
    'https://www.yourweddingsite.com'  // ADD CUSTOM DOMAIN IF YOU HAVE ONE
  ],
  credentials: true,
}));
```

If your deployed frontend URL isn't in the CORS list, add it and redeploy the backend.

## Complete Deployment Checklist

### Backend (Already Done ✅)
- [x] Deployed to: `https://backend-bf2g.onrender.com`
- [ ] CORS includes frontend URL
- [x] Environment variables set
- [x] Static files serving configured

### Frontend (Fix Needed)
- [ ] **Set `VITE_API_URL=https://backend-bf2g.onrender.com` in hosting platform**
- [ ] Add all Firebase variables (VITE_FIREBASE_*)
- [ ] Add Supabase variables (VITE_SUPABASE_*)
- [ ] Redeploy after setting variables
- [ ] Test photos appear in gallery

## Environment Variables for Deployment

Copy these to your hosting platform:

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
VITE_BACKEND_URL=https://backend-bf2g.onrender.com
```

## Testing

After setting the environment variable and redeploying:

1. Visit your deployed gallery page
2. Open browser console (F12)
3. Go to Network tab
4. Refresh page
5. Look for API call to `https://backend-bf2g.onrender.com/api/photos-local`
6. Status should be 200
7. Photos should display!

---

## Summary

🎯 **Problem:** Frontend using localhost instead of deployed backend URL

🔧 **Solution:** Set `VITE_API_URL=https://backend-bf2g.onrender.com` in your hosting platform

✅ **Result:** Photos will display correctly in deployed gallery

**Next Step:** Add the environment variable in your hosting platform and redeploy!

Your backend is already working at: `https://backend-bf2g.onrender.com` 

You just need to tell the frontend to use it! 🚀

