# 📸 Photo Upload Flow - How It Works

## Your Current Setup

```
┌─────────────────────────────────────────────────────────────┐
│                  Wedding Website Architecture                │
└─────────────────────────────────────────────────────────────┘

╔════════════════╗                    ╔════════════════════╗
║   DEVELOPMENT  ║                    ║    PRODUCTION      ║
║  (localhost)   ║                    ║ (weddingweb.co.in) ║
╚════════════════╝                    ╚════════════════════╝
        │                                      │
        │ Upload Photo                         │ Upload Photo
        ↓                                      ↓
┌───────────────┐                     ┌───────────────────┐
│   Frontend    │                     │    Frontend       │
│  localhost:   │                     │  weddingweb.co.in │
│     5173      │                     │                   │
└───────┬───────┘                     └─────────┬─────────┘
        │                                       │
        │ POST /api/photos-local                │ POST /api/photos
        ↓                                       ↓
┌───────────────┐                     ┌───────────────────┐
│   Backend     │                     │    Backend        │
│  localhost:   │                     │  Render Server    │
│     5001      │                     │                   │
└───────┬───────┘                     └─────────┬─────────┘
        │                                       │
        │ Save to filesystem                    │ Upload to Supabase
        ↓                                       ↓
┌───────────────┐                     ┌───────────────────┐
│ Local Folder  │                     │ Supabase Storage  │
│  /uploads/    │                     │  wedding-photos   │
│               │                     │     bucket        │
└───────────────┘                     └───────────────────┘
      ✅ WORKS                               ❌ FAILS
```

---

## Why It's Failing

When you upload photos on your deployed site (`weddingweb.co.in/photographer`):

```
1. User selects photos on website
   ↓
2. Frontend detects: "I'm in production mode" (not localhost)
   ↓
3. Frontend sends photos to: /api/photos (Supabase endpoint)
   ↓
4. Backend tries to upload to Supabase storage bucket: "wedding-photos"
   ↓
5. ❌ ERROR: Bucket doesn't exist OR no permissions
   ↓
6. User sees: "Error uploading photo to Supabase storage"
```

---

## The Fix

Create the missing Supabase storage bucket and add permissions:

```
┌────────────────────────────────────────────────────┐
│         Supabase Dashboard (supabase.com)          │
│                                                    │
│  1. Create Storage Bucket                         │
│     Name: "wedding-photos"                        │
│     Public: ✅ YES                                │
│                                                    │
│  2. Add Storage Policies                          │
│     ✅ Public READ                                │
│     ✅ Authenticated UPLOAD                       │
│     ✅ Authenticated DELETE                       │
│                                                    │
│  3. Get Credentials                               │
│     📋 SUPABASE_URL                               │
│     📋 SUPABASE_ANON_KEY                          │
└────────────────────────────────────────────────────┘
                     ↓
         Add to Render Environment
                     ↓
         Redeploy Backend
                     ↓
              ✅ WORKS!
```

---

## After Fix - How It Will Work

```
Production Upload (weddingweb.co.in):
────────────────────────────────────

User uploads photo
      ↓
Frontend → POST /api/photos
      ↓
Backend → Upload to Supabase Storage
      ↓
Supabase Storage "wedding-photos" bucket
      ↓
✅ Photo stored in cloud
✅ Photo URL: https://xxxxx.supabase.co/storage/v1/object/public/wedding-photos/sister-a/123456_photo.jpg
✅ Photo persists forever (even after redeployment)
✅ Photo accessible to all guests
```

---

## Why Two Different Systems?

| Storage Type | When Used | Pros | Cons |
|-------------|-----------|------|------|
| **Local Filesystem** | Development (localhost) | Fast, no setup needed | Lost on deploy |
| **Supabase Storage** | Production (deployed) | Permanent, scalable | Needs configuration |

---

## Environment Detection

The code automatically detects where it's running:

```typescript
// frontend/src/services/fileUploadService.ts (line 102-104)

const uploadEndpoint = import.meta.env.PROD 
  ? `${API_BASE_URL}/api/photos`         // ← PRODUCTION: Supabase
  : `${API_BASE_URL}/api/photos-local`;  // ← DEVELOPMENT: Local files
```

- `import.meta.env.PROD` = true when deployed
- `import.meta.env.PROD` = false when running on localhost

---

## Required Environment Variables

### Backend (Render)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
PORT=5001
BACKEND_URL=https://your-backend.onrender.com
```

### Frontend (Netlify/Vercel)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## What Happens to Photos

### Development (localhost)
```
Photo uploaded
  ↓
Saved to: /uploads/wedding_gallery/sister-a/photo.jpg
  ↓
Accessible at: http://localhost:5001/uploads/wedding_gallery/sister-a/photo.jpg
  ↓
⚠️ Lost when backend restarts
```

### Production (deployed)
```
Photo uploaded
  ↓
Saved to: Supabase Storage → wedding-photos/sister-a/123456_photo.jpg
  ↓
Accessible at: https://xxxxx.supabase.co/storage/v1/object/public/wedding-photos/sister-a/123456_photo.jpg
  ↓
✅ Permanent (never lost)
```

---

## Summary

1. **Problem**: Supabase storage bucket doesn't exist
2. **Solution**: Create bucket + add policies
3. **Result**: Photo uploads work on deployed site
4. **Time to fix**: ~5 minutes

---

**Follow the steps in `FIX_UPLOAD_NOW.md` to fix this!** 🚀

