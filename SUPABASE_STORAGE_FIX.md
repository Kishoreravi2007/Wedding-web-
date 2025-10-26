# 🔧 Supabase Storage Upload Fix

## 🚨 The Problem

You're seeing this error when uploading photos on your deployed site:
```
X 15 photo(s) failed:
1.jpeg: Error uploading photo to Supabase storage.
2.jpeg: Error uploading photo to Supabase storage.
...
```

## 🔍 Root Cause

Your wedding website uses **two different storage systems**:
- **Development (localhost)**: Local filesystem (`/api/photos-local`)
- **Production (weddingweb.co.in)**: Supabase storage (`/api/photos`)

When deployed, the app tries to upload to a Supabase storage bucket called `wedding-photos`, but either:
1. The bucket doesn't exist
2. The bucket exists but has wrong permissions
3. Your backend doesn't have Supabase credentials configured

## ✅ Fix - Create Supabase Storage Bucket

### Step 1: Go to Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Log in to your account
3. Select your project (or create one if you don't have it)

### Step 2: Create Storage Bucket

1. In the left sidebar, click **"Storage"**
2. Click **"Create a new bucket"** button
3. Fill in the details:
   - **Name**: `wedding-photos` (exact name, no spaces!)
   - **Public bucket**: ✅ **YES** (check this box!)
   - **File size limit**: `10485760` (10MB in bytes)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/gif`
4. Click **"Create bucket"**

### Step 3: Set Storage Policies

After creating the bucket, you need to set permissions so photographers can upload photos:

1. In Supabase dashboard, stay in **Storage** section
2. Click on your `wedding-photos` bucket
3. Go to the **"Policies"** tab
4. Click **"New Policy"** → **"Get started quickly"** → **"Create policy from scratch"**

**Policy 1: Allow Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wedding-photos');
```

**Policy 2: Allow Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'wedding-photos');
```

**Policy 3: Allow Authenticated Delete**
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'wedding-photos');
```

Alternatively, you can create these policies via SQL Editor:

1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste ALL three policies above
3. Click **"Run"**

### Step 4: Verify Supabase Credentials on Render

Your backend needs Supabase credentials to work. Go to Render dashboard:

1. Go to your backend service on Render
2. Click **Environment** tab
3. **Make sure these variables exist**:
   - `SUPABASE_URL` → Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - `SUPABASE_ANON_KEY` → Your Supabase anonymous key

**Where to find these:**
- Supabase Dashboard → Settings → API
  - **Project URL** = `SUPABASE_URL`
  - **anon public** key = `SUPABASE_ANON_KEY`

### Step 5: Redeploy Backend

After adding/verifying environment variables:
1. In Render dashboard → Your service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🧪 Test the Fix

After completing all steps:

1. Go to `https://weddingweb.co.in/photographer`
2. Log in to photographer portal
3. Select a wedding
4. Try uploading 1-2 photos
5. Should see: ✅ "2 photo(s) uploaded successfully!"

---

## 🔍 How to Debug

### Check Backend Logs on Render

1. Go to Render dashboard → Your service → **Logs**
2. Look for these messages:
   - ✅ `Supabase client initialized`
   - ❌ `Error uploading to Supabase Storage` (with detailed error)

### Common Error Messages

| Error Message | Cause | Fix |
|--------------|-------|-----|
| `The resource was not found` | Bucket doesn't exist | Create `wedding-photos` bucket |
| `new row violates row-level security policy` | No upload policy | Add INSERT policy (Step 3) |
| `Invalid API key` | Wrong `SUPABASE_ANON_KEY` | Update Render env var |
| `SUPABASE_URL is not defined` | Missing env var | Add to Render |

### Check Supabase Logs

1. Supabase Dashboard → **Logs** → **Storage**
2. Look for upload attempts and errors

---

## 🎯 Quick Checklist

- [ ] Created `wedding-photos` bucket in Supabase (public)
- [ ] Added 3 storage policies (SELECT, INSERT, DELETE)
- [ ] Verified `SUPABASE_URL` in Render environment
- [ ] Verified `SUPABASE_ANON_KEY` in Render environment
- [ ] Redeployed backend on Render
- [ ] Tested photo upload on deployed site

---

## 📝 Alternative: Use Local Storage Only

If you don't want to use Supabase storage, you can modify the code to always use local filesystem:

**Edit:** `frontend/src/services/fileUploadService.ts` line 102-104

Change from:
```typescript
const uploadEndpoint = import.meta.env.PROD 
  ? `${API_BASE_URL}/api/photos`  // Supabase (cloud)
  : `${API_BASE_URL}/api/photos-local`;  // Local filesystem
```

To:
```typescript
const uploadEndpoint = `${API_BASE_URL}/api/photos-local`;  // Always use local
```

⚠️ **Note**: This means photos will be stored on your Render server's filesystem, which:
- Gets wiped on every deployment (photos will be lost!)
- Not recommended for production
- Better to use Supabase storage

---

## 🎉 Expected Result

After fixing:
- ✅ Photos upload successfully
- ✅ Photos appear in gallery immediately
- ✅ Photos are stored in Supabase storage bucket
- ✅ Photos persist across deployments
- ✅ Photos are publicly accessible via URL

---

## Need Help?

If upload still fails after following all steps:
1. Check Render logs for specific error message
2. Check Supabase logs for storage errors
3. Verify bucket name is exactly `wedding-photos` (no typos!)
4. Test Supabase connection with: `node backend/test-supabase-connection.js`

---

**This should fix your photo upload issue!** 🚀

