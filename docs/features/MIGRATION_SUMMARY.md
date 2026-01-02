# 🎉 Supabase Migration - Complete Package

## What You've Received

I've created a **complete Supabase migration system** for your wedding website. Here's everything:

---

## 📚 Documentation Files

### 1. **SUPABASE_QUICKSTART.md** - Start Here! ⭐
- 15-minute setup guide
- Step-by-step instructions
- Quick troubleshooting

### 2. **SUPABASE_SETUP_GUIDE.md** - Detailed Reference
- Complete database schema SQL
- Storage bucket configuration
- RLS policies
- Deployment instructions
- Cost estimates

### 3. **MIGRATION_SUMMARY.md** - This File
- Overview of all migration files
- What each file does

---

## 🛠️ Migration Scripts

### 1. **backend/test-supabase-connection.js**
Tests your Supabase setup before migration.

**Usage:**
```bash
cd backend
node test-supabase-connection.js
```

**What it checks:**
- ✅ Environment variables configured
- ✅ Supabase connection working
- ✅ Storage bucket exists
- ✅ Database tables created
- ✅ Existing data count

### 2. **backend/migrate-to-supabase.js**
Migrates all photos from local storage to Supabase.

**Usage:**
```bash
cd backend
node migrate-to-supabase.js
```

**What it does:**
- 📂 Scans `uploads/wedding_gallery/` for photos
- ☁️ Uploads each photo to Supabase Storage
- 💾 Creates database records for each photo
- 📊 Shows detailed progress and summary
- 🔄 Handles duplicates (updates if exists)

**Expected output:**
```
🚀 Starting migration to Supabase...
📸 Found 15 photos to migrate

  Uploading 1.jpeg (sister-b)... ✅ Uploaded
  Uploading 2.jpeg (sister-b)... ✅ Uploaded
  ...

📊 Migration Summary
✅ Successfully migrated: 15 photos
📁 Sister B: 15 photos
```

### 3. **backend/migrate-face-data.js**
Migrates face detection data to Supabase.

**Usage:**
```bash
cd backend
node migrate-face-data.js
```

**What it does:**
- 📋 Reads `guest_mapping_sister_a.json` and `guest_mapping_sister_b.json`
- 👤 Creates guest records in `people` table
- 🖼️ Uploads reference images to Supabase Storage
- 🗺️ Creates entries in `guest_mappings` table

### 4. **migrate-to-supabase.sh** (Linux/Mac)
All-in-one migration script for Unix systems.

**Usage:**
```bash
chmod +x migrate-to-supabase.sh
./migrate-to-supabase.sh
```

Runs all three steps automatically:
1. Test connection
2. Migrate photos
3. Migrate face data

### 5. **migrate-to-supabase.ps1** (Windows)
All-in-one migration script for Windows PowerShell.

**Usage:**
```powershell
.\migrate-to-supabase.ps1
```

Same as the shell script but for Windows.

---

## 📋 Environment Files

### **backend/.env.example**
Template for backend environment variables.

**Copy and customize:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials
```

### **backend/.env** (you create this)
Your actual Supabase credentials:

```env
PORT=5002
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **frontend/.env** (you create this)
Frontend Supabase configuration:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:5002
```

---

## 🗄️ Database Schema

The complete SQL schema is in **SUPABASE_SETUP_GUIDE.md** (Step 2.1).

### Tables Created:

1. **photos** - Photo metadata
   - filename, file_path, public_url
   - sister, size, mimetype
   - title, description, tags
   - uploaded_at

2. **people** - Guest/person records
   - name, role, sister
   - guest_id (e.g., Guest_001)

3. **face_descriptors** - Face embeddings
   - person_id, descriptor (128D array)
   - source_photo_id

4. **photo_faces** - Links faces to photos
   - photo_id, person_id
   - bounding_box, confidence

5. **guest_mappings** - Face recognition mappings
   - guest_id, sister
   - photo_paths, reference_image_url

---

## 🗂️ Storage Structure

After migration, your Supabase Storage will look like:

```
wedding-photos/  (bucket)
├── sister-a/
│   ├── photo1.jpg
│   └── photo2.jpg
├── sister-b/
│   ├── 1.jpeg
│   ├── 2.jpeg
│   └── ... (15 photos)
└── reference_images/
    ├── sister-a/
    │   └── Guest_001/
    │       └── Guest_001_rep.jpg
    └── sister-b/
        ├── Guest_001/
        │   └── Guest_001_rep.jpg
        └── ...
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Supabase (5 minutes)
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Get API credentials (Settings → API)
3. Create `wedding-photos` storage bucket
4. Run database schema SQL

### Step 2: Configure Environment (2 minutes)
```bash
# Create backend/.env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Create frontend/.env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5002
```

### Step 3: Run Migration (3 minutes)

**Windows:**
```powershell
.\migrate-to-supabase.ps1
```

**Mac/Linux:**
```bash
./migrate-to-supabase.sh
```

**Manual (all platforms):**
```bash
cd backend
node test-supabase-connection.js
node migrate-to-supabase.js
node migrate-face-data.js
```

---

## ✅ Verification Checklist

After migration, verify everything works:

- [ ] Run test: `node backend/test-supabase-connection.js` ✅
- [ ] Photos in Supabase Storage: Storage → wedding-photos ✅
- [ ] Photo records in database: Table Editor → photos ✅
- [ ] Start servers: `./start-all.sh` ✅
- [ ] Gallery shows photos: http://localhost:3000/sreedevi/gallery ✅
- [ ] Upload new photo works ✅
- [ ] Face admin shows guests: http://localhost:3000/face-admin ✅

---

## 📊 What Changes in Your Code?

### Automatic Environment Detection

**Development (Local):**
```typescript
// Uses local filesystem
const endpoint = `${API_BASE_URL}/api/photos-local`;
```

**Production (Deployed):**
```typescript
// Uses Supabase
const endpoint = `${API_BASE_URL}/api/photos`;
```

### No Code Changes Required!

The system automatically uses:
- **Local storage** when `import.meta.env.PROD === false`
- **Supabase** when `import.meta.env.PROD === true`

Or you can force Supabase for all environments by editing:
```typescript
// frontend/src/services/fileUploadService.ts
const uploadEndpoint = `${API_BASE_URL}/api/photos`; // Always use Supabase
```

---

## 🎯 Benefits After Migration

### Before (Local Storage)
❌ Photos lost on server restart  
❌ No CDN (slow delivery)  
❌ Can't scale to multiple servers  
❌ No automatic backups  

### After (Supabase)
✅ Persistent across restarts  
✅ CDN for fast worldwide delivery  
✅ Scales to thousands of photos  
✅ Automatic backups  
✅ Row-level security  
✅ Professional infrastructure  

---

## 💰 Cost

**Free Tier (Perfect for Testing):**
- 1GB storage
- 2GB bandwidth/month
- 500MB database

**Your Wedding (~500 photos):**
- Storage: 1GB ✅ **FREE**
- Bandwidth: ~20GB/month = **~$1.80/month**

**Recommendation:** Start free, upgrade to Pro ($25/month) only if needed.

---

## 🆘 Troubleshooting

### Common Issues

**"SUPABASE_URL not set"**
→ Create `backend/.env` with your credentials

**"wedding-photos bucket does not exist"**
→ Create bucket in Supabase: Storage → New Bucket → Make it public

**"Table 'photos' does not exist"**
→ Run SQL schema in Supabase SQL Editor

**Photos not displaying**
→ Make sure bucket is **public** (not private)

### Get Help

1. Check **SUPABASE_QUICKSTART.md** - Quick fixes
2. Check **SUPABASE_SETUP_GUIDE.md** - Detailed setup
3. Run `node backend/test-supabase-connection.js` - Diagnose issues

---

## 📝 Next Steps

### After Migration

1. **Test Everything**
   - Upload photos → Should go to Supabase
   - View galleries → Should show photos from Supabase
   - Face detection → Should work with Supabase

2. **Deploy to Production**
   - Set environment variables on hosting platform
   - Deploy backend and frontend
   - All photos automatically use Supabase

3. **Monitor Usage**
   - Check Supabase dashboard for storage usage
   - Monitor bandwidth consumption
   - Upgrade plan if needed

---

## 🎉 You're Ready!

You now have:
✅ Complete migration scripts  
✅ Comprehensive documentation  
✅ Test utilities  
✅ Troubleshooting guides  

**Time to migrate:** Run `./migrate-to-supabase.ps1` (Windows) or `./migrate-to-supabase.sh` (Mac/Linux)

**Questions?** See SUPABASE_QUICKSTART.md for step-by-step instructions.

---

**Your wedding website is about to get professional cloud storage!** 🚀✨


