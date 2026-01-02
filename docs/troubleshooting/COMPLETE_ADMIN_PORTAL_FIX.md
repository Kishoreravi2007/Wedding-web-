# 🔧 Complete Admin Portal Fix - All Data Corrected

## 🎯 What This Fixes

✅ Admin user with correct credentials  
✅ All database tables with correct structure  
✅ Correct website settings  
✅ Working analytics and statistics  
✅ Proper security policies  
✅ Backend API integration  

---

## 🚀 **STEP 1: Fix Supabase Database (5 minutes)**

### Run the Complete Fix SQL

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/dmsghmogmwmpxjaipbod/sql
   ```

2. **Click "New query"**

3. **Copy the ENTIRE contents** of this file:
   ```
   FIX_ADMIN_PORTAL_DATA.sql
   ```

4. **Paste into SQL Editor**

5. **Click "Run"** (or press Ctrl+Enter)

6. **Wait for completion** (about 10-15 seconds)

### Expected Result:

You should see at the end:
```
ADMIN USER | kishore | admin | true | (timestamp)
WEBSITE SETTINGS | 7 | (list of settings)
CURRENT STATISTICS | 0 | 0 | 0 | 0 | 0 | 0
```

This confirms:
- ✅ Admin user created
- ✅ 7 settings inserted
- ✅ Statistics initialized

---

## 🔐 **STEP 2: Confirm Login Credentials**

Your CORRECT credentials are:

```
URL: https://weddingweb.co.in/admin-login

Username: kishore
Password: qwerty123
```

**Important:**
- Username is all **lowercase**
- Password is all **lowercase**
- No spaces before or after

---

## ⚙️ **STEP 3: Fix Backend on Render**

### 3.1 Go to Render Dashboard

Visit: https://dashboard.render.com

### 3.2 Find Your Backend Service

Look for: **backend-bf2g** (or your backend service name)

### 3.3 Add/Verify Environment Variables

Click on backend service → **"Environment"** tab

**Add these EXACT variables:**

```
SUPABASE_URL=https://dmsghmogmwmpxjaipbod.supabase.co
```

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU1MDgsImV4cCI6MjA3NzA1MTUwOH0.ql_cJb4YSxj2mhUMd79t2IyafG3CURxNf8rKgRf2Iyw
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NTUwOCwiZXhwIjoyMDc3MDUxNTA4fQ.0n0kzNlCjLMcVT-80sESkbusY84QWGdgbaaX3zxttok
```

```
JWT_SECRET=wedding-website-super-secret-key-2024-production
```

```
NODE_ENV=production
```

```
PORT=10000
```

### 3.4 Save and Redeploy

1. Click **"Save Changes"**
2. Wait for automatic redeploy (2-3 minutes)
3. Check **"Logs"** tab to see deployment progress

---

## 🧪 **STEP 4: Test Everything**

### 4.1 Test Backend is Running

Open new tab:
```
https://backend-bf2g.onrender.com
```

Should see response (not an error)

### 4.2 Test Login API

Open browser console (F12) and run:
```javascript
fetch('https://backend-bf2g.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    username: 'kishore', 
    password: 'qwerty123' 
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Login Success:', data);
  if (data.token) {
    console.log('✅ Token received');
    console.log('✅ Role:', data.role);
  }
})
.catch(err => console.error('❌ Error:', err));
```

**Expected Response:**
```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  role: "admin",
  username: "kishore",
  id: "some-uuid"
}
```

### 4.3 Test Admin Portal Login

1. Go to: `https://weddingweb.co.in/admin-login`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Enter:
   - Username: `kishore`
   - Password: `qwerty123`
4. Click **"Secure Sign In"**
5. Should redirect to: `/admin/dashboard`

### 4.4 Verify Dashboard Data

In the admin dashboard, check:

**Statistics Cards:**
- ✅ Total Photos: Shows count from database
- ✅ Total Users: Shows 1 (the admin user)
- ✅ Faces Detected: Shows 0 (initially)
- ✅ Total Views: Shows 0 (initially)

**Settings Tab:**
- ✅ Site name: "Parvathy & Sreedevi Wedding"
- ✅ Photo Booth: Enabled
- ✅ Face Recognition: Enabled
- ✅ Guest Wishes: Enabled
- ✅ Maintenance Mode: Disabled

**Users Tab:**
- ✅ Shows "kishore" user
- ✅ Role: admin
- ✅ Status: Active

---

## 🔍 **STEP 5: Verify Data is Correct**

### In Supabase

Run these queries to verify:

```sql
-- Check admin user
SELECT username, role, is_active FROM users WHERE username = 'kishore';
-- Should return: kishore | admin | true

-- Check settings
SELECT key, value FROM website_settings ORDER BY key;
-- Should return 7 rows

-- Check statistics function
SELECT * FROM get_current_stats();
-- Should return all zeros initially
```

### In Admin Portal

1. **Change a setting:**
   - Go to Settings tab
   - Change site name to "Test Wedding"
   - Click "Save Settings"
   - Refresh page
   - ✅ Setting should persist

2. **Create a test user:**
   - Go to Users tab
   - Click "Add User"
   - Create test photographer
   - ✅ User should appear in list

3. **Check statistics update:**
   - Visit photo booth page
   - Go back to dashboard
   - Click "Refresh"
   - ✅ Statistics should increment

---

## ✅ **What's Now Correct**

### Database:
✅ **users** table - Correct structure with admin user  
✅ **photos** table - Ready for photo uploads  
✅ **website_settings** table - 7 default settings  
✅ **analytics_events** table - Ready to track events  
✅ **website_statistics** table - Initialized  
✅ **admin_activity_log** table - Ready to log actions  

### Security:
✅ Row Level Security enabled on all tables  
✅ Correct policies for admin access  
✅ Password properly hashed (bcrypt, 12 rounds)  
✅ JWT authentication configured  

### APIs:
✅ `/api/auth/login` - User authentication  
✅ `/api/users` - User management  
✅ `/api/settings` - Settings management  
✅ `/api/analytics` - Analytics tracking  
✅ `/api/photos` - Photo management  

### Admin Portal:
✅ Login page connects to backend  
✅ Dashboard shows real statistics  
✅ Settings load from and save to Supabase  
✅ Users can be created/managed  
✅ Photos can be uploaded/deleted  
✅ Analytics tracked automatically  

---

## 🚨 **Troubleshooting**

### Still getting 500 error?

**Check backend logs:**
1. Render dashboard → Backend service → Logs
2. Look for error messages
3. Common issues:
   - Missing environment variable
   - Supabase connection failed
   - JWT_SECRET not set

### Login returns "Invalid credentials"?

**Verify user exists:**
```sql
SELECT * FROM users WHERE username = 'kishore';
```

If no rows, re-run the fix SQL.

### Dashboard shows all zeros?

**This is normal initially!**
- Upload photos → photos count increases
- Visit pages → views count increases
- Use features → analytics update

### Settings not saving?

**Check:**
1. Backend has JWT_SECRET
2. Token is being sent in requests
3. Backend logs for errors

---

## 📋 **Quick Reference**

### Correct Credentials:
```
Username: kishore
Password: qwerty123
Role: admin
```

### Supabase Project:
```
Project ID: dmsghmogmwmpxjaipbod
URL: https://dmsghmogmwmpxjaipbod.supabase.co
```

### Backend URLs:
```
Backend: https://backend-bf2g.onrender.com
Login API: https://backend-bf2g.onrender.com/api/auth/login
```

### Frontend URLs:
```
Homepage: https://weddingweb.co.in
Admin Login: https://weddingweb.co.in/admin-login
Dashboard: https://weddingweb.co.in/admin/dashboard
```

---

## 🎉 **Success Checklist**

After following all steps, verify:

- [ ] SQL migration ran successfully
- [ ] Admin user exists in Supabase
- [ ] Backend has all environment variables
- [ ] Backend is deployed and running
- [ ] Login API test returns token
- [ ] Admin portal login works
- [ ] Dashboard loads with statistics
- [ ] Settings can be changed and saved
- [ ] Users tab shows admin user
- [ ] No errors in browser console

---

## 💡 **What Changed**

**Before:**
- ❌ Incorrect or missing database tables
- ❌ Wrong user credentials
- ❌ Missing environment variables
- ❌ Data not persisting
- ❌ 500 errors on login

**After:**
- ✅ All tables created correctly
- ✅ Admin user: kishore/qwerty123
- ✅ All environment variables set
- ✅ Data saves to Supabase
- ✅ Login works perfectly

---

## 📞 **Still Having Issues?**

If something still doesn't work:

1. **Check backend logs** in Render for specific errors
2. **Check browser console** (F12) for frontend errors
3. **Verify SQL** ran completely without errors
4. **Confirm environment variables** are exactly as shown above
5. **Wait 2-3 minutes** after saving environment variables

---

**Run the SQL fix, update backend environment variables, and you're all set!** 🚀

All data in your admin portal will be correct and working!

