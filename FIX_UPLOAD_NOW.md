# ⚡ Fix Photo Upload NOW - 5 Minutes

## The Error You're Seeing
```
X 15 photo(s) failed: Error uploading photo to Supabase storage
```

## Quick Fix (Follow These 5 Steps)

### 1️⃣ Create Supabase Storage Bucket (2 minutes)

**Go to**: https://supabase.com/dashboard

1. Select your project (or create one)
2. Click **"Storage"** in left sidebar
3. Click **"Create a new bucket"**
4. Enter:
   - Name: `wedding-photos`
   - Public bucket: ✅ **CHECK THIS BOX**
5. Click **"Create bucket"**

---

### 2️⃣ Add Storage Policies (1 minute)

**Go to**: SQL Editor in Supabase (left sidebar)

**Copy-paste this** and click **Run**:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wedding-photos');

-- Allow uploads
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'wedding-photos');

-- Allow deletes
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'wedding-photos');
```

---

### 3️⃣ Get Supabase Credentials (30 seconds)

In Supabase Dashboard:
1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long JWT token)

---

### 4️⃣ Add to Render Environment (1 minute)

**Go to**: https://dashboard.render.com

1. Find your backend service
2. Click **"Environment"** tab
3. Add these variables (if not already there):

```
Key: SUPABASE_URL
Value: <paste your Project URL from step 3>

Key: SUPABASE_ANON_KEY
Value: <paste your anon public key from step 3>
```

4. Click **"Save Changes"**

---

### 5️⃣ Redeploy Backend (30 seconds)

In Render dashboard (same page):
1. Click **"Manual Deploy"**
2. Select **"Deploy latest commit"**
3. Wait 1-2 minutes for deployment

---

## ✅ Test It!

1. Go to: `https://weddingweb.co.in/photographer`
2. Login to photographer portal
3. Upload a photo
4. Should see: **"✓ 1 photo(s) uploaded successfully!"** 🎉

---

## 🔍 If It Still Fails

Check Render logs:
1. Render dashboard → Your service → **"Logs"** tab
2. Look for error messages
3. Common issues:
   - ❌ **"bucket not found"** → Bucket name must be exactly `wedding-photos`
   - ❌ **"Invalid API key"** → Check SUPABASE_ANON_KEY is correct
   - ❌ **"row-level security"** → Policies not added (go back to step 2)

---

## 📋 Visual Checklist

- [ ] ✅ Created `wedding-photos` bucket (marked as public)
- [ ] ✅ Ran SQL to add 3 storage policies
- [ ] ✅ Copied Supabase URL and anon key
- [ ] ✅ Added both to Render environment variables
- [ ] ✅ Redeployed backend
- [ ] ✅ Tested upload - works!

---

**Total Time**: ~5 minutes
**Difficulty**: Easy (just copy-paste!)

🎯 **After this, photo uploads will work perfectly!**

