# 🔍 Check Deployment Status

The login is still failing with 401. Let's debug this:

## Step 1: Verify Deployment Completed

Go to your **Render Dashboard**:
1. Visit: https://dashboard.render.com
2. Click on your backend service
3. Check the **Logs** tab
4. Look for the latest deployment

**Should see:**
```
==> Build successful 🎉
==> Deploying...
==> Running 'npm start'
✅ Supabase client initialized
✅ Backend server running on http://localhost:5001
🔐 Auth endpoint: http://localhost:5001/api/auth/login
```

**If you see older logs** (before the commit), the deployment hasn't updated yet.

## Step 2: Check Login Logs

When you try to login, the backend should log:
```
🔐 Login attempt for username: photographer
```

**If you DON'T see this** → Backend is using old auth code

**If you DO see this but still get 401** → Password verification is failing

## Step 3: Manual Deployment Trigger

If auto-deploy hasn't triggered:

1. In Render Dashboard → Your backend service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 2-3 minutes
4. Try login again

## Step 4: Check Which Auth System is Running

The backend logs should show which auth file is being loaded. Look for:
```
// Should see auth-simple.js being required
```

## Step 5: Test Backend Directly

Open a new browser tab and go to:
```
https://backend-bf2g.onrender.com/
```

Should return: "Backend is running!"

Then test the auth endpoint:
```bash
curl -X POST https://backend-bf2g.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"photographer","password":"wedding2024"}'
```

**Expected response if working:**
```json
{
  "message": "Login successful",
  "token": "eyJ...",
  "user": {
    "id": "...",
    "username": "photographer",
    "role": "photographer"
  }
}
```

**Expected response if still broken:**
```json
{
  "message": "Invalid credentials"
}
```

## Step 6: Verify Git Commit Was Pushed

Check your Git repository:
1. Go to: https://github.com/Kishoreravi2007/Wedding-web-1
2. Check latest commit
3. Should see: "Add simplified authentication system for login"
4. Check the file: `backend/auth-simple.js` - should exist
5. Check the file: `backend/server.js` - should require `auth-simple`

## Common Issues

### Issue 1: Deployment Not Triggered
**Solution:** Manually deploy from Render dashboard

### Issue 2: Wrong Auth System Still Running
**Solution:** Check server.js requires auth-simple, not auth-secure

### Issue 3: Password Hash Mismatch
**Solution:** The password was updated in Supabase, but bcrypt.compare might be failing

### Issue 4: JWT_SECRET Not Set
**Solution:** Add JWT_SECRET to Render environment variables

## Next Steps

Please check:
1. ✅ Is the latest commit visible on GitHub?
2. ✅ Has Render deployed the latest commit?
3. ✅ What do the Render logs show when you try to login?

Share the backend logs from Render and I can help debug further!

