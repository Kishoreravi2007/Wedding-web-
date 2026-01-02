# 🔐 Photographer Login Authentication Fix

## Issues Identified & Fixed

Based on the console errors in your deployed site, I've identified and fixed three critical authentication issues:

### 1. ❌ API URL Configuration Mismatch
**Problem**: `frontend/src/lib/api.ts` was using `VITE_API_URL` instead of `VITE_API_BASE_URL`

**Impact**: The frontend couldn't find the correct backend URL, causing connection failures

**Fix**: Updated `api.ts` to use the correct environment variable:
```typescript
// Before
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// After  
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
```

### 2. ❌ Token Field Name Mismatch
**Problem**: Backend (`auth-simple.js`) returned `token` but frontend expected `accessToken`

**Impact**: Error "Authentication failed. No token received." even with valid credentials

**Fix**: Updated backend to return both field names for compatibility:
```javascript
res.json({
  message: 'Login successful',
  accessToken: token,  // ✅ Added this
  token,               // Keep for backwards compatibility
  user: { id, username, role }
});
```

### 3. ❌ Role Extraction Issue
**Problem**: Frontend was trying to access `response.data.role` directly, but it's nested in `response.data.user.role`

**Fix**: Updated to safely extract role from user object:
```typescript
localStorage.setItem('role', response.data.user?.role || 'photographer');
```

## 🚨 Critical: What You Need to Do Now

### 1. Check Your Backend Status

Your backend is deployed at: `https://backend-bf2g.onrender.com`

**Test it now:**
```bash
curl https://backend-bf2g.onrender.com/
```

**If you get "Backend is running!" → Good! ✅**

**If you get an error or timeout:**
- Your backend may have spun down (Render free tier sleeps after inactivity)
- Visit the URL in your browser to wake it up
- Wait 30-60 seconds for the server to start

### 2. Set Frontend Environment Variable

Your deployed frontend MUST have this environment variable set:

```env
VITE_API_BASE_URL=https://backend-bf2g.onrender.com
```

**How to set it depends on where you deployed:**

#### If deployed on Netlify:
1. Go to Site settings → Build & deploy → Environment
2. Add: `VITE_API_BASE_URL` = `https://backend-bf2g.onrender.com`
3. Trigger a new deployment

#### If deployed on Vercel:
1. Go to Project Settings → Environment Variables
2. Add: `VITE_API_BASE_URL` = `https://backend-bf2g.onrender.com`
3. Redeploy

#### If deployed on Render:
1. Go to your Static Site settings
2. Environment section
3. Add: `VITE_API_BASE_URL` = `https://backend-bf2g.onrender.com`
4. Trigger manual deploy

### 3. Verify Database User Exists

Make sure the photographer user exists in your Supabase database:

```sql
-- Run this in Supabase SQL Editor
SELECT username, role FROM users WHERE username = 'photographer';
```

If the user doesn't exist, you need to create it. Check `backend/setup-secure-auth.js` or use the backend's user creation endpoint.

### 4. Test Backend Login Directly

Before testing the frontend, verify the backend works:

```bash
curl -X POST https://backend-bf2g.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"photographer","password":"wedding2024"}'
```

**Expected response:**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGc...",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "username": "photographer",
    "role": "photographer"
  }
}
```

**If you get 401 Unauthorized:**
- Check the username and password are correct
- Verify the user exists in the database
- Check backend logs for details

## 🔄 After Making Changes

### Rebuild and Redeploy

```bash
# 1. Commit the fixes
cd C:\Users\KISHORERAVI\Documents\projects\Wedding-web-1
git add .
git commit -m "Fix photographer login authentication"
git push

# 2. Test locally first
cd backend
npm start  # Should run on http://localhost:5001

# In another terminal:
cd frontend
npm run dev  # Test login at http://localhost:5173/photographer-login

# 3. If local works, deploy both:
# - Backend: Redeploy on Render (should auto-deploy from git)
# - Frontend: Redeploy with updated VITE_API_BASE_URL environment variable
```

## 🧪 Testing the Fix

1. **Open browser console (F12)**
2. **Go to** `https://weddingweb.co.in/photographer-login`
3. **Enter credentials:**
   - Username: `photographer`
   - Password: `wedding2024`
4. **Click "Secure Sign In"**

**Expected results:**
- ✅ No console errors
- ✅ Success message appears
- ✅ Redirects to photographer dashboard
- ✅ Token stored in localStorage

**Common issues:**

| Error | Cause | Solution |
|-------|-------|----------|
| ERR_CONNECTION_CLOSED | Backend is sleeping | Visit backend URL to wake it up |
| 401 Unauthorized | Wrong credentials or user doesn't exist | Check database and credentials |
| No token received | Field mismatch (now fixed!) | Deploy the fix |
| CORS error | Backend CORS not configured | Check backend allows your frontend URL |

## 📝 Files Modified

1. ✅ `frontend/src/lib/api.ts` - Fixed API_BASE_URL environment variable
2. ✅ `backend/auth-simple.js` - Added accessToken field  
3. ✅ `frontend/src/pages/photographer/Login.tsx` - Fixed role extraction
4. ✅ `frontend/src/pages/admin/Login.tsx` - Fixed role extraction and token handling

## 🎯 Next Steps

1. ✅ Wake up your backend (visit the URL)
2. ✅ Set VITE_API_BASE_URL in frontend deployment
3. ✅ Redeploy frontend
4. ✅ Test login
5. ✅ Check admin login too (may have same issue)

---

**Note**: These changes are already made in your local codebase. You just need to:
1. Deploy the backend changes
2. Set the environment variable in your frontend deployment
3. Redeploy the frontend

The authentication should work perfectly after these steps! 🎉

