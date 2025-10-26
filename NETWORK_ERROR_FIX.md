# Network Error - Quick Fix ✅

## The Problem

You're accessing: **`localhost:3000/photographer-login`**  
But frontend is running on: **`localhost:3002`** (not 3000!)

That's why you see "Network Error" - you're connecting to the wrong server!

## The Solution

### Close the wrong tab and use the correct URL:

**❌ WRONG (causes Network Error):**
```
http://localhost:3000/photographer-login
```

**✅ CORRECT:**
```
http://localhost:3002/photographer-login
```

## How to Fix

### Step 1: Close Current Tab
Close the tab showing `localhost:3000/photographer-login`

### Step 2: Open Correct URL
Navigate to:
```
http://localhost:3002/photographer-login
```

### Step 3: Login
Use the credentials you already entered:
- **Username**: `photographer`
- **Password**: `photo123`

## Why Port 3002?

According to your terminal output:
```
Port 3000 is in use, trying another one...
Port 3001 is in use, trying another one...
  VITE v6.3.6  ready in 128 ms
  ➜  Local:   http://localhost:3002/
```

Vite automatically chose port **3002** because ports 3000 and 3001 were busy.

## Correct URLs for All Features

| Feature | Correct URL |
|---------|-------------|
| **Photographer Login** | http://localhost:3002/photographer-login |
| **Photographer Dashboard** | http://localhost:3002/photographer |
| **Sister A Gallery** | http://localhost:3002/parvathy/gallery |
| **Sister B Gallery** | http://localhost:3002/sreedevi/gallery |
| **Face Detection Admin** | http://localhost:3002/face-admin |
| **Home Page** | http://localhost:3002/ |

## Quick Test

After navigating to `http://localhost:3002/photographer-login`:
1. You should see the login page (no Network Error!)
2. Enter credentials:
   - Username: `photographer`
   - Password: `photo123`
3. Click "Secure Sign In"
4. You'll be redirected to the photographer dashboard

## If You Still See Network Error

### Check if servers are running:

**Backend (should be on port 5001):**
```bash
lsof -i :5001
```

**Frontend (should be on port 3002):**
```bash
lsof -i :3002
```

If either isn't running, restart them:

**Backend:**
```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1/backend
PORT=5001 node server.js
```

**Frontend:**
```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1/frontend
npm run dev
```

---

## Summary

**The Network Error is happening because you're on the wrong port!**

✅ **Solution**: Use `http://localhost:3002/photographer-login` instead of `localhost:3000`

**Try it now!** Open this URL in your browser:
```
http://localhost:3002/photographer-login
```

The error will disappear and login will work! 🎉

