# 🚀 Quick Start with Supabase Storage

Your wedding website is now configured to use Supabase for photo storage!

## What Changed?

✅ **Backend** - Now uses Supabase Storage for photo uploads  
✅ **Frontend** - Uploads photos to Supabase via backend API  
✅ **Firebase** - All code preserved (commented) for future use  
✅ **Database** - Using Supabase PostgreSQL database  

## Start Using It Now

### Step 1: Check Environment Variables

Make sure you have Supabase credentials in your `.env` files:

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

**Frontend (.env):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_BASE_URL=http://localhost:5001
```

### Step 2: Create Supabase Storage Bucket

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Storage** → **New Bucket**
4. Name: `wedding-photos`
5. Make it **Public** (for now)

### Step 3: Run Database Migrations

The required tables should already exist. If not, run:

```bash
cd backend/supabase/migrations
# Check migration files and run them in Supabase SQL Editor
```

### Step 4: Start the Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

Look for: `💾 Using Supabase for photo storage`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 5: Test Photo Upload

1. Open http://localhost:5173
2. Login as photographer
3. Go to photographer dashboard
4. Upload a test photo
5. Check Supabase Storage bucket for the file

## How It Works Now

```
User uploads photo
       ↓
Frontend (fileUploadService.ts)
       ↓
Backend API (/api/photos)
       ↓
Supabase Storage (wedding-photos bucket)
       ↓
Supabase Database (photos table)
```

## Key Files Changed

### Backend
- `server.js` - Uses Supabase client
- `photos-supabase.js` - NEW endpoint for Supabase uploads
- `lib/supabase.js` - Supabase client configuration

### Frontend
- `services/fileUploadService.ts` - Uses Supabase storage
- `components/PhotoUploader.tsx` - Works with backend API

## Firebase Files Preserved

All Firebase code is commented out but preserved:
- `backend/lib/firebase.js`
- `backend/photos.js` (Firebase version)
- `frontend/src/lib/firebase.ts`
- `frontend/src/services/firebaseService.ts`

## When You Want Firebase Back

Simply:
1. Uncomment Firebase imports in `server.js`
2. Switch endpoint from `photos-supabase.js` to `photos.js`
3. Uncomment Firebase code in `fileUploadService.ts`
4. Set Firebase environment variables
5. Restart servers

See `SUPABASE_MIGRATION_COMPLETE.md` for detailed instructions.

## Troubleshooting

### "Supabase credentials not found"
→ Check `.env` files have `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Upload fails with 401
→ Make sure you're logged in as photographer

### Photos don't appear
→ Check Supabase bucket is public or has correct RLS policies

### Backend won't start
→ Run `npm install @supabase/supabase-js` in backend folder

## Verification Checklist

- [ ] Backend shows "Using Supabase for photo storage" on start
- [ ] Frontend loads without errors
- [ ] Can upload photo as photographer
- [ ] Photo appears in Supabase Storage bucket
- [ ] Photo appears in Supabase photos table
- [ ] Photo displays in guest gallery

## What's Next?

Your wedding website now uses Supabase! You can:

1. **Test face detection** - Upload photos with faces
2. **Configure RLS policies** - Secure your storage bucket
3. **Deploy to production** - Use production Supabase credentials
4. **Switch back to Firebase** - When you're ready (see guide)

## Need Help?

Check these files for more details:
- `SUPABASE_MIGRATION_COMPLETE.md` - Full migration details
- `SUPABASE_ENV_SETUP.md` - Environment variables guide
- `backend/lib/supabase.js` - Supabase configuration
- `frontend/src/lib/supabase.ts` - Frontend Supabase client

---

**Status:** ✅ Ready to use with Supabase Storage!  
**Firebase:** Preserved for future migration  
**Date:** November 2, 2025

