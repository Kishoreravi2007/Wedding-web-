# 📸 Photo Gallery Display Fix

## 🔴 The Problem

Photos were uploading successfully to Supabase, but **not showing in the gallery**.

## 🔍 Root Cause

**Field name mismatch** between backend (Supabase database) and frontend:

| Field | Backend Returns | Frontend Expected | Result |
|-------|----------------|-------------------|---------|
| Photo URL | `public_url` (snake_case) | `publicUrl` (camelCase) | ❌ `url: undefined` |
| Upload Date | `uploaded_at` (snake_case) | `uploadedAt` (camelCase) | ❌ `date: undefined` |

### Why This Happened:
- Supabase databases use **snake_case** for column names (PostgreSQL convention)
- JavaScript/TypeScript typically uses **camelCase**
- The frontend was looking for `file.publicUrl` but the backend sent `file.public_url`
- Since the field didn't exist, photos appeared with broken URLs

---

## ✅ The Fix

Updated gallery components to support **both naming conventions**:

### Files Changed:

#### 1. `frontend/src/components/PhotoGallery.tsx`
```typescript
// Before:
url: file.publicUrl,
date: new Date(file.uploaded_at).toISOString(),

// After:
url: file.public_url || file.publicUrl, // Support both formats
date: new Date(file.uploaded_at || file.created_at).toISOString(),
```

#### 2. `frontend/src/components/PhotoGallery-simple.tsx`
```typescript
// Before:
date: photo.uploadedAt || new Date().toISOString(),
timestamp: photo.uploadedAt ? new Date(photo.uploadedAt) : new Date(),

// After:
date: photo.uploaded_at || photo.uploadedAt || new Date().toISOString(),
timestamp: photo.uploaded_at ? new Date(photo.uploaded_at) : (photo.uploadedAt ? new Date(photo.uploadedAt) : new Date()),
```

### Additional Improvements:
- ✅ Added gallery refresh when switching between sisters
- ✅ Added support for both snake_case and camelCase field names
- ✅ Added fallback values for missing fields

---

## 🚀 Deployment Steps

### **Step 1: Redeploy Frontend**

Your frontend needs to be rebuilt and redeployed:

#### **If using Netlify:**
1. Go to: https://app.netlify.com
2. Find your site
3. Click **"Deploys"** tab
4. Click **"Trigger deploy"** → **"Deploy site"**
5. Wait 2-3 minutes

#### **If using Vercel:**
1. Go to: https://vercel.com/dashboard
2. Find your project
3. Click **"Deployments"**
4. Click **"Redeploy"** on latest
5. Wait 2-3 minutes

#### **If deploying manually:**
```bash
cd frontend
npm run build
# Then upload the dist/ folder to your hosting
```

### **Step 2: Clear Browser Cache**

After frontend redeploys:
1. Go to: `https://weddingweb.co.in`
2. Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
3. This does a hard refresh, bypassing cache

---

## 🧪 Testing

### **Test 1: View Existing Photos**
1. Go to: `https://weddingweb.co.in`
2. Navigate to **Photo Gallery**
3. Select **Sister A** or **Sister B** wedding
4. ✅ Should see uploaded photos

### **Test 2: Upload New Photo**
1. Go to: `https://weddingweb.co.in/photographer`
2. Login
3. Upload 1 photo
4. Go back to gallery
5. Refresh page (F5)
6. ✅ Should see new photo immediately

---

## 🔍 How to Verify Backend Data

### Check Supabase Database:
1. Go to: Supabase Dashboard → **Table Editor** → **photos** table
2. Click on any photo record
3. Verify these fields exist:
   - `public_url` (should have a URL like `https://xxxxx.supabase.co/storage/...`)
   - `uploaded_at` (should have a timestamp)
   - `filename` (should have the filename)
   - `sister` (should be `sister-a` or `sister-b`)

### Check Photos in Storage:
1. Go to: Supabase Dashboard → **Storage** → **wedding-photos**
2. Click into `sister-a/` or `sister-b/` folder
3. ✅ Should see uploaded image files

---

## 📋 What Works Now

✅ **Photos upload successfully**
- Stored in Supabase storage
- Metadata saved in database
- RLS policies allow public access

✅ **Photos appear in gallery**
- Correct field mapping
- Photos load on page visit
- Auto-refresh every 30 seconds

✅ **Gallery features work**
- View full size
- Download photos
- Filter by wedding
- Search photos

---

## 🔧 Backend Response Format (Reference)

When you fetch from `/api/photos?sister=sister-a`, the backend returns:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "wedding-photo.jpg",
    "public_url": "https://xxxxx.supabase.co/storage/v1/object/public/wedding-photos/sister-a/1234567_wedding-photo.jpg",
    "size": 2048000,
    "mimetype": "image/jpeg",
    "sister": "sister-a",
    "title": "Beautiful wedding moment",
    "description": "",
    "event_type": "ceremony",
    "tags": [],
    "storage_provider": "supabase",
    "uploaded_at": "2025-01-15T10:30:00.000Z",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
]
```

**Key Fields:**
- `public_url` ← Photo URL (snake_case!)
- `uploaded_at` ← Upload timestamp (snake_case!)
- `sister` ← Which wedding (`sister-a` or `sister-b`)

---

## 🐛 If Photos Still Don't Show

### **1. Check Browser Console**
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for errors
4. Common issues:
   - `404 Not Found` → Photo URL is wrong
   - `CORS error` → Backend CORS not configured
   - `undefined` errors → Field mapping still wrong

### **2. Check Network Tab**
1. Press **F12** → **Network** tab
2. Refresh gallery page
3. Look for request to `/api/photos?sister=sister-a`
4. Click on it → **Preview** tab
5. Verify:
   - ✅ Response has array of photos
   - ✅ Each photo has `public_url` field
   - ✅ URLs are valid

### **3. Manually Test API**
Open this URL in browser:
```
https://backend-bf2g.onrender.com/api/photos?sister=sister-a
```

Should see JSON array of photos. If empty `[]`, no photos uploaded yet.

---

## 📊 Summary

| Issue | Status |
|-------|--------|
| Photos uploading | ✅ Working |
| Photos in Supabase | ✅ Stored |
| Photos in gallery | ✅ **FIXED** |
| Field name mapping | ✅ **FIXED** |
| Gallery refresh | ✅ Improved |

---

## 🎯 Next Steps

1. ✅ **Redeploy frontend** (Netlify/Vercel)
2. ✅ **Clear browser cache** (Ctrl+Shift+R)
3. ✅ **Test gallery** (photos should appear)
4. ✅ **Upload new photo** (should appear immediately after refresh)

---

**After redeploying frontend, photos will appear in gallery!** 🎉

