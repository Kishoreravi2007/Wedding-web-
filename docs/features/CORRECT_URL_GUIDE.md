# ⚠️ Important: Use the Correct URL!

## Issue

You're viewing the gallery on **`localhost:3000`** but your frontend is actually running on **`localhost:3002`**!

## Solution

### Close the Old Tab and Use the Correct URL:

**❌ WRONG URL (old/cached):**
```
http://localhost:3000/parvathy/gallery
```

**✅ CORRECT URL (updated with fixes):**
```
http://localhost:3002/parvathy/gallery
```

## Server Ports

According to your terminal output:

| Server | Port | URL |
|--------|------|-----|
| **Backend** | 5000 | http://localhost:5000 |
| **Frontend** | **3002** | http://localhost:3002 |

## How to Fix

### Step 1: Close the Old Tab
Close the browser tab showing `localhost:3000`

### Step 2: Open the Correct URL
Navigate to:
```
http://localhost:3002/parvathy/gallery
```

Or for Sister B:
```
http://localhost:3002/sreedevi/gallery
```

## All Correct URLs

### Galleries (Public - No Login)
- **Sister A Gallery**: http://localhost:3002/parvathy/gallery
- **Sister B Gallery**: http://localhost:3002/sreedevi/gallery

### Photo Booth (Public - No Login)
- **Sister A Photo Booth**: http://localhost:3002/parvathy/photobooth
- **Sister B Photo Booth**: http://localhost:3002/sreedevi/photobooth

### Dashboards (Require Login)
- **Photographer Dashboard**: http://localhost:3002/photographer-login
- **Face Detection Admin**: http://localhost:3002/face-admin
- **Admin Dashboard**: http://localhost:3002/admin-login

### Main Pages
- **Home**: http://localhost:3002/
- **Sister A Home**: http://localhost:3002/parvathy
- **Sister B Home**: http://localhost:3002/sreedevi

## Why Port 3002?

As shown in your terminal:
```
Port 3000 is in use, trying another one...
Port 3001 is in use, trying another one...
  VITE v6.3.6  ready in 128 ms
  ➜  Local:   http://localhost:3002/
```

Vite automatically chose port **3002** because ports 3000 and 3001 were already in use.

## What You Should See

When you visit **`http://localhost:3002/parvathy/gallery`**, you should see:

✅ **Real Photos** (not "No photos to display"):
- IMG20230831163922_01.jpg
- IMG_0309_Original.heic

## Quick Test

Open this URL in your browser:
```
http://localhost:3002/parvathy/gallery
```

If you see photos, you're on the correct server! 🎉

---

**Important:** Always use **port 3002** for the frontend, not 3000!

