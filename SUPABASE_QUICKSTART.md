# 🚀 Supabase Migration - Quick Start

## TL;DR - Get Started in 15 Minutes

### Step 1: Create Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) → Sign up/Login
2. Click "New Project"
3. Enter project name: `wedding-website`
4. Choose region closest to you
5. Set a database password (save it!)
6. Click "Create new project" → Wait 2-3 min

### Step 2: Get API Keys (1 min)

1. In Supabase dashboard → Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Create Database Tables (2 min)

1. In Supabase → SQL Editor
2. Click "New Query"
3. Copy and paste from **[SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md#21-create-tables)** (Step 2.1)
4. Click "Run" → Wait for success message

### Step 4: Create Storage Bucket (1 min)

1. In Supabase → Storage
2. Click "Create a new bucket"
3. Name: `wedding-photos`
4. Make it **Public** ✅
5. Click "Create bucket"

### Step 5: Configure Your App (2 min)

Create `backend/.env`:

```bash
PORT=5002
BACKEND_URL=http://localhost:5002
FRONTEND_URL=http://localhost:3000

# Replace with YOUR values from Step 2
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key

# Keep your existing Firebase path
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./path/to/firebase-key.json
```

Create `frontend/.env`:

```bash
# Replace with YOUR values from Step 2
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

VITE_API_URL=http://localhost:5002

# Keep your existing Firebase config
VITE_FIREBASE_API_KEY=your-firebase-api-key
# ... other Firebase vars
```

### Step 6: Test Connection (1 min)

```bash
cd backend
node test-supabase-connection.js
```

You should see:
```
✅ Storage accessible
✅ Database accessible
✅ wedding-photos bucket exists
```

### Step 7: Migrate Photos (2 min)

```bash
cd backend
node migrate-to-supabase.js
```

This will upload all 15 photos from `uploads/wedding_gallery/` to Supabase.

### Step 8: Migrate Face Data (1 min)

```bash
cd backend
node migrate-face-data.js
```

This migrates your guest mappings and reference images.

### Step 9: Test! (1 min)

```bash
cd ..
./start-all.sh
```

Visit:
- http://localhost:3000/sreedevi/gallery → Should show 15 photos from Supabase!
- http://localhost:3000/face-admin → Should show detected guests

### Step 10: Upload Test Photo

1. Login: http://localhost:3000/photographer-login
2. Upload a new photo
3. Check Supabase dashboard → Storage → wedding-photos
4. Photo should appear there!

---

## ✅ You're Done!

Your wedding website now uses professional cloud storage:

✅ Photos stored in Supabase Storage (with CDN)  
✅ Metadata in Supabase Database  
✅ Face detection data migrated  
✅ Auto-backup included  
✅ Scalable to thousands of photos  

---

## What Changed?

**Before (Local Storage):**
- Photos: `uploads/wedding_gallery/` on your computer
- Lost if server restarts or deploys

**After (Supabase):**
- Photos: Supabase cloud storage with CDN
- Persistent across restarts and deploys
- Fast delivery worldwide

**Your Code:**
- No changes needed! System auto-detects and uses Supabase
- Local storage still works for development
- Production automatically uses Supabase

---

## Troubleshooting

### "SUPABASE_URL not set" error
→ Create `backend/.env` file with your credentials (Step 5)

### "wedding-photos bucket does not exist"
→ Create bucket in Supabase dashboard: Storage → New Bucket (Step 4)

### "Table 'photos' does not exist"
→ Run database schema SQL in Supabase SQL Editor (Step 3)

### Photos not displaying in gallery
→ Make sure `wedding-photos` bucket is **public**

### Need help?
→ See full guide: [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)

---

## Cost

**Free tier includes:**
- 1GB storage (enough for ~500 photos)
- 2GB bandwidth/month
- 500MB database

**Your wedding estimated usage:**
- 15 existing photos = ~30MB ✅ **FREE**
- 500 total photos = ~1GB ✅ **FREE**
- Bandwidth: ~10-20GB/month for 100 guests = **~$1-2/month**

**Recommendation:** Start on free tier, upgrade if needed.

---

## Next Steps

### For Development (Local)
Keep using local storage:
- Photos upload to local filesystem
- Fast development cycle
- No internet needed

### For Production (Deployed)
Use Supabase:
- Photos upload to cloud
- Persistent and scalable
- Fast worldwide delivery

The system **automatically** uses the right storage based on environment!

---

**Ready to deploy?** See [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)


