# 🗄️ Supabase Backend Storage - Complete Guide

## 🎯 What This Does

Migrates your wedding website from **local filesystem storage** to **Supabase cloud storage**.

### Why Migrate?

| Feature | Local Storage ❌ | Supabase ✅ |
|---------|------------------|------------|
| **Persistence** | Lost on restart | Permanent |
| **Scalability** | Limited | Unlimited |
| **Speed** | Server-dependent | CDN-powered |
| **Backup** | Manual | Automatic |
| **Cost** | Server storage | Free tier available |

---

## 📦 What You Get

### 1. Migration Scripts
- `backend/migrate-to-supabase.js` - Migrate photos
- `backend/migrate-face-data.js` - Migrate face detection data
- `backend/test-supabase-connection.js` - Test your setup

### 2. All-in-One Scripts
- `migrate-to-supabase.ps1` - Windows PowerShell
- `migrate-to-supabase.sh` - Mac/Linux Bash

### 3. Documentation
- **SUPABASE_QUICKSTART.md** - 15-minute setup ⭐ **START HERE**
- **SUPABASE_SETUP_GUIDE.md** - Detailed reference
- **MIGRATION_SUMMARY.md** - Overview of all files

---

## 🚀 Quick Start (15 Minutes)

### 1. Create Supabase Account (3 min)

```
1. Go to https://supabase.com
2. Sign up (free)
3. Create new project: "wedding-website"
4. Wait for setup (2-3 min)
```

### 2. Get API Keys (1 min)

```
In Supabase Dashboard:
  Settings → API → Copy:
    - Project URL
    - anon public key
    - service_role key
```

### 3. Set Up Database (2 min)

```
In Supabase Dashboard:
  SQL Editor → New Query → Run the SQL from SUPABASE_SETUP_GUIDE.md Step 2.1
```

### 4. Create Storage Bucket (1 min)

```
In Supabase Dashboard:
  Storage → Create bucket:
    - Name: "wedding-photos"
    - Public: ✅ YES
```

### 5. Configure Environment (2 min)

Create `backend/.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:5002
```

### 6. Run Migration (5 min)

**Windows:**
```powershell
.\migrate-to-supabase.ps1
```

**Mac/Linux:**
```bash
./migrate-to-supabase.sh
```

### 7. Test! (1 min)

```bash
./start-all.sh

# Visit:
# http://localhost:3000/sreedevi/gallery
# Should show 15 photos from Supabase!
```

---

## 📚 Detailed Guides

### For Quick Setup
→ Read: **SUPABASE_QUICKSTART.md**

### For Complete Reference
→ Read: **SUPABASE_SETUP_GUIDE.md**

### For File Overview
→ Read: **MIGRATION_SUMMARY.md**

---

## 🛠️ Manual Migration Steps

If you prefer to run each step manually:

### Step 1: Test Connection
```bash
cd backend
node test-supabase-connection.js
```

Expected output:
```
✅ Storage accessible
✅ Database accessible
✅ wedding-photos bucket exists
```

### Step 2: Migrate Photos
```bash
node migrate-to-supabase.js
```

Expected output:
```
🚀 Starting migration to Supabase...
📸 Found 15 photos to migrate
  Uploading 1.jpeg... ✅ Uploaded
  ...
✅ Migration complete!
```

### Step 3: Migrate Face Data
```bash
node migrate-face-data.js
```

Expected output:
```
🚀 Starting face data migration...
📁 Migrating sister-b guest data...
  Processing Guest_001... ✅
  ...
✅ Migration complete!
```

---

## 📊 Current System Status

### Before Migration
```
Storage: Local filesystem
Location: uploads/wedding_gallery/
Photos: 15 (Sister B)
Status: Works locally only
```

### After Migration
```
Storage: Supabase Cloud
Location: https://xxxxx.supabase.co/storage/v1/object/public/wedding-photos/
Photos: 15 (Sister B) + unlimited capacity
Status: Works locally AND deployed
```

---

## 🗄️ Database Schema Overview

After running the SQL schema, you'll have:

### Tables

1. **photos** - Photo metadata
   - `id`, `filename`, `public_url`
   - `sister`, `size`, `uploaded_at`

2. **people** - Guest records
   - `id`, `name`, `guest_id`
   - `role`, `sister`

3. **guest_mappings** - Face recognition
   - `guest_id`, `sister`
   - `photo_paths`, `reference_image_url`

4. **face_descriptors** - Face embeddings
   - `person_id`, `descriptor`

5. **photo_faces** - Face-to-photo links
   - `photo_id`, `person_id`
   - `bounding_box`, `confidence`

---

## ✅ Verification Steps

After migration, check:

### 1. Supabase Dashboard
```
Storage → wedding-photos:
  ✅ sister-b/ folder with 15 photos
  ✅ reference_images/ folder (if face data migrated)

Table Editor → photos:
  ✅ 15 photo records
  ✅ All have public_url
```

### 2. Local Testing
```bash
./start-all.sh

# Check these URLs:
✅ http://localhost:3000/sreedevi/gallery - Shows 15 photos
✅ http://localhost:3000/photographer-login - Can upload new photo
✅ http://localhost:3000/face-admin - Shows detected guests
```

### 3. Upload Test
```
1. Login as photographer
2. Upload a new photo
3. Check Supabase Storage → should appear there
4. Check gallery → should display immediately
```

---

## 🔧 How It Works

### Upload Flow

**Development (Local):**
```
Upload Photo → Local Filesystem → uploads/wedding_gallery/
                                → Fast, offline-capable
```

**Production (Deployed):**
```
Upload Photo → Supabase Storage → wedding-photos bucket
             → Supabase Database → photos table
             → CDN → Fast delivery worldwide
```

### Automatic Detection

The system automatically chooses the right storage:

```typescript
// frontend/src/services/fileUploadService.ts
const uploadEndpoint = import.meta.env.PROD 
  ? `${API_BASE_URL}/api/photos`        // Supabase (production)
  : `${API_BASE_URL}/api/photos-local`; // Local (development)
```

### Force Supabase Everywhere

To use Supabase in development too:

```typescript
// frontend/src/services/fileUploadService.ts
const uploadEndpoint = `${API_BASE_URL}/api/photos`; // Always Supabase
```

---

## 🆘 Troubleshooting

### Issue: "SUPABASE_URL not set"
**Solution:** Create `backend/.env` with your Supabase credentials

### Issue: "wedding-photos bucket does not exist"
**Solution:** 
1. Go to Supabase Dashboard
2. Storage → New Bucket
3. Name: `wedding-photos`
4. Make it **public** ✅

### Issue: "Table 'photos' does not exist"
**Solution:**
1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy SQL from SUPABASE_SETUP_GUIDE.md Step 2.1
4. Run it

### Issue: Photos not displaying in gallery
**Solution:**
1. Check bucket is **public** (not private)
2. Check `public_url` in photos table has correct format
3. Check CORS settings in Supabase

### Issue: Migration fails with permission error
**Solution:**
- Use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_ANON_KEY`
- Service role key has admin privileges needed for migration

---

## 💰 Cost Breakdown

### Supabase Free Tier
- Storage: **1GB** (enough for ~500 photos)
- Bandwidth: **2GB/month**
- Database: **500MB**
- API Requests: **Unlimited**

### Your Wedding Estimated
- **15 photos**: ~30MB ✅ **FREE**
- **500 photos**: ~1GB ✅ **FREE**
- **100 guests viewing**: ~20GB bandwidth/month = **~$2/month**

### Recommendations
- **Testing/Small Wedding**: Free tier is perfect ✅
- **Large Wedding (500+ guests)**: Pro plan $25/month

---

## 🚀 Deployment

### Environment Variables

**Backend (.env):**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.app
```

**Frontend (.env):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend.onrender.com
```

### Deploy Steps
1. Set environment variables on hosting platform
2. Push code to Git
3. Platform auto-deploys
4. Photos automatically use Supabase ✅

---

## 📁 Project Structure After Migration

```
Wedding-web-1-1/
├── backend/
│   ├── .env                          ← Create with Supabase credentials
│   ├── migrate-to-supabase.js        ← Photo migration script
│   ├── migrate-face-data.js          ← Face data migration script
│   ├── test-supabase-connection.js   ← Connection test
│   ├── photos.js                     ← Supabase photo handler
│   ├── photos-local.js               ← Local photo handler
│   └── lib/
│       └── supabase-db.js            ← Database helpers
├── frontend/
│   ├── .env                          ← Create with Supabase credentials
│   └── src/
│       └── services/
│           └── fileUploadService.ts  ← Handles both storages
├── migrate-to-supabase.ps1           ← Windows migration script
├── migrate-to-supabase.sh            ← Mac/Linux migration script
├── SUPABASE_QUICKSTART.md            ← Quick setup guide
├── SUPABASE_SETUP_GUIDE.md           ← Detailed guide
└── MIGRATION_SUMMARY.md              ← File overview
```

---

## 🎉 What You'll Achieve

After completing this migration:

✅ **Professional cloud storage** for your wedding photos  
✅ **Persistent data** that survives restarts and redeployments  
✅ **Fast global delivery** via CDN  
✅ **Automatic backups** and security  
✅ **Scalable** to thousands of photos and guests  
✅ **Production-ready** infrastructure  

---

## 📞 Getting Help

### Quick Issues
→ See **SUPABASE_QUICKSTART.md** troubleshooting section

### Setup Questions
→ See **SUPABASE_SETUP_GUIDE.md** complete guide

### File Questions
→ See **MIGRATION_SUMMARY.md** file overview

### Run Diagnostics
```bash
cd backend
node test-supabase-connection.js
```

---

## 🎯 Next Steps

1. **Read**: SUPABASE_QUICKSTART.md (15 min)
2. **Setup**: Create Supabase project and configure .env (10 min)
3. **Migrate**: Run `.\migrate-to-supabase.ps1` (5 min)
4. **Test**: Verify everything works (5 min)
5. **Deploy**: Push to production (10 min)

**Total time**: ~45 minutes for complete professional cloud setup!

---

**Ready to migrate? Start with SUPABASE_QUICKSTART.md** 🚀

Your wedding website is about to get enterprise-grade cloud storage! ✨


