# Gallery Not Showing Photos in Deployment - Fix Guide

## Problem
Photos are not showing in the gallery when the website is deployed, but work fine locally.

## Root Causes & Solutions

### 1. ✅ Frontend Environment Variable (MOST COMMON)

**Issue**: `VITE_API_BASE_URL` is pointing to localhost instead of your deployed backend.

**Check Your Deployment Platform**:

#### For Netlify:
1. Go to: Site Settings → Build & Deploy → Environment Variables
2. Make sure you have:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```
   (NOT `http://localhost:5001`)

#### For Vercel:
1. Go to: Project Settings → Environment Variables
2. Add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

#### For Render:
1. Go to: Dashboard → Your Service → Environment
2. Add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```

**After updating, REDEPLOY your frontend!**

---

### 2. 🖼️ Photos Don't Exist on Deployed Backend

**Issue**: Your local `uploads/wedding_gallery` folder has photos, but the deployed server doesn't.

**Solution A - Upload Photos to Deployed Backend**:

1. **Access your deployed backend** (e.g., via SSH or file manager)

2. **Upload the photos** to the same folder structure:
   ```
   uploads/
     wedding_gallery/
       sister_a/
         (your photos here)
       sister_b/
         (your photos here)
   ```

**Solution B - Use Cloud Storage (Recommended for Production)**:

Instead of storing photos on the server filesystem, use:
- **Supabase Storage** (already configured in your backend)
- **Firebase Storage** 
- **AWS S3**
- **Cloudinary**

This ensures photos persist even when the server restarts.

---

### 3. 🌐 Backend Not Deployed or Not Running

**Check**:
1. Is your backend deployed? (Render, Railway, Heroku, etc.)
2. Is the backend URL accessible?

**Test Your Backend**:
```bash
# Replace with your actual backend URL
curl https://your-backend-url.com/api/photos-local?sister=sister-b
```

**Expected Response**: JSON array of photos
```json
[
  {
    "id": "sister_b_1.jpeg",
    "filename": "1.jpeg",
    "public_url": "https://your-backend-url.com/uploads/wedding_gallery/sister_b/1.jpeg",
    ...
  }
]
```

**If you get an error**:
- Backend is not running
- Backend URL is incorrect
- API endpoint is broken

---

### 4. 🔒 CORS Issues

**Issue**: Your deployed frontend domain is blocked by CORS.

**Check `backend/server.js`** - Make sure your deployed frontend URL is in the CORS whitelist:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://weddingweb.co.in',        // ✅ Already added
    'https://www.weddingweb.co.in',    // ✅ Already added
    'https://YOUR-NETLIFY-URL.netlify.app',  // Add if using Netlify preview
    'https://YOUR-VERCEL-URL.vercel.app',    // Add if using Vercel
  ].filter(Boolean),
  credentials: true,
}));
```

**After updating, REDEPLOY your backend!**

---

### 5. 📁 Static File Serving Issue

**Issue**: `/uploads` route is not serving files correctly in deployment.

**Check `backend/server.js`** (line 36):
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

**For some deployment platforms**, you might need:
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

Or ensure the `uploads` folder is included in your deployment (not in `.gitignore`).

---

## Quick Diagnostic Steps

### Step 1: Check Frontend API URL
1. Open browser DevTools (F12) on your deployed site
2. Go to Console
3. Type: `import.meta.env.VITE_API_BASE_URL`
4. **Should show**: Your deployed backend URL
5. **If it shows**: `undefined` or `localhost` → Fix frontend environment variables

### Step 2: Test Backend API
1. In DevTools Console, run:
```javascript
fetch('https://your-backend-url.com/api/photos-local?sister=sister-b')
  .then(r => r.json())
  .then(data => console.log('Photos:', data))
  .catch(err => console.error('Error:', err))
```

2. **Expected**: Array of photo objects
3. **If error**: Backend is not accessible or photos don't exist

### Step 3: Check Network Tab
1. Open DevTools → Network tab
2. Reload the gallery page
3. Look for request to `/api/photos-local?sister=sister-b`
4. **Check**:
   - Request URL (should be your backend, not localhost)
   - Status Code (should be 200)
   - Response (should have photos array)

---

## ⚡ Quick Fix Checklist

- [ ] Set `VITE_API_BASE_URL` to deployed backend URL (not localhost)
- [ ] Redeploy frontend after updating environment variables
- [ ] Verify backend is deployed and running
- [ ] Upload photos to deployed backend's `uploads/wedding_gallery` folder
- [ ] Test API endpoint directly: `https://your-backend.com/api/photos-local?sister=sister-b`
- [ ] Check CORS includes your deployed frontend domain
- [ ] Check browser console for errors
- [ ] Verify photos are accessible: `https://your-backend.com/uploads/wedding_gallery/sister_b/1.jpeg`

---

## Still Not Working?

**Enable Debug Mode** - Check the browser console for errors:

1. Open gallery page
2. Press F12 → Console
3. Look for errors like:
   - `Failed to fetch` → Backend not accessible
   - `CORS policy` → CORS issue
   - `404 Not Found` → Photos don't exist
   - `net::ERR_CONNECTION_REFUSED` → Backend not running

**Common Console Errors & Fixes**:

| Error | Cause | Fix |
|-------|-------|-----|
| `Failed to fetch photos: 404` | Backend endpoint doesn't exist | Check backend is deployed |
| `CORS policy: No 'Access-Control-Allow-Origin'` | CORS not configured | Add frontend URL to CORS whitelist |
| `Failed to load image: 404` | Photos don't exist on server | Upload photos to backend |
| Request to `localhost:5001` | Wrong API URL | Update VITE_API_BASE_URL |

---

## Next Steps After Fixing

1. **For Production**: Migrate to cloud storage (Supabase Storage) instead of local filesystem
2. **Add Photo Upload UI**: Allow photographers to upload directly through the website
3. **Set up CDN**: For faster photo loading

Need help with any of these steps? Let me know!

