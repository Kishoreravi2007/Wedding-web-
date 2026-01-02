# 🔧 Fix: All Admin Pages Showing 500 Error (Supabase Connection Issue)

## Problem
All admin pages are showing "Internal server error":
- ❌ Weddings
- ❌ Messages (Contact Messages)
- ❌ Feedback
- ❌ Call Schedules

## Root Cause
All these endpoints depend on Supabase. If Supabase is not connected, all will fail.

## Solution: Check Supabase Configuration on Render

Since your backend is deployed on Render (`backend-bf2g.onrender.com`), you need to verify Supabase environment variables.

### Step 1: Check Render Environment Variables

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your backend service** (the one with `backend-bf2g.onrender.com`)
3. **Go to "Environment" tab**
4. **Verify these variables exist:**

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Get Your Supabase Credentials

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → API**
4. **Copy these values:**

   - **Project URL** → Use for `SUPABASE_URL`
   - **anon public** key → Use for `SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Keep secret!)

### Step 3: Add/Update Variables on Render

1. **In Render Environment tab:**
   - Click **"Add Environment Variable"**
   - Add each variable:
     - Key: `SUPABASE_URL`
     - Value: `https://your-project.supabase.co`
   
   - Key: `SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key)
   
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your service role key)

2. **Save changes**

### Step 4: Redeploy Backend

After adding/updating environment variables:

1. **Go to Render Dashboard → Your Backend Service**
2. **Click "Manual Deploy"**
3. **Select "Clear build cache & deploy"**
4. **Click "Deploy latest commit"**

This will restart your backend with the new environment variables.

### Step 5: Verify Connection

After deployment, check Render logs:

1. **Go to Render Dashboard → Your Backend Service**
2. **Click "Logs" tab**
3. **Look for this message:**
   ```
   ✅ Supabase client initialized using service role key
   ```
   
   If you see this, Supabase is connected!

   If you see:
   ```
   ⚠️  Supabase credentials not found...
   ```
   Then the environment variables are still missing or incorrect.

## Quick Test

After fixing, test the endpoints:

```bash
# Test Weddings
curl https://backend-bf2g.onrender.com/api/weddings

# Test Messages
curl https://backend-bf2g.onrender.com/api/contact-messages

# Test Feedback
curl https://backend-bf2g.onrender.com/api/feedback
```

Expected response (if working):
```json
{
  "success": true,
  "weddings": [],
  "count": 0
}
```

## Common Issues

### Issue 1: Variables Not Set
- **Symptom**: Logs show "Supabase credentials not found"
- **Fix**: Add all 3 environment variables to Render

### Issue 2: Wrong Keys
- **Symptom**: Connection fails or authentication errors
- **Fix**: Double-check you copied the correct keys from Supabase

### Issue 3: Service Not Restarted
- **Symptom**: Variables added but still not working
- **Fix**: Redeploy the service (Step 4)

### Issue 4: Missing Tables
- **Symptom**: Connection works but tables don't exist
- **Fix**: Run SQL migrations in Supabase SQL Editor:
  - `contact_messages` table
  - `feedback` table
  - `weddings` table
  - `call_schedules` table

## Required Supabase Tables

Make sure these tables exist in your Supabase database:

1. **contact_messages** - For contact form submissions
2. **feedback** - For feedback submissions
3. **weddings** - For wedding management
4. **call_schedules** - For call scheduling

### How to Check Tables

1. Go to Supabase Dashboard
2. Go to **Table Editor**
3. You should see all the tables listed

### How to Create Missing Tables

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the migration files from `backend/supabase/migrations/`:
   - Or check if tables exist in **Table Editor**
   - If missing, create them using the migration SQL files

## Environment Variables Checklist

✅ `SUPABASE_URL` - Your Supabase project URL
✅ `SUPABASE_ANON_KEY` - Your anon/public key
✅ `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (recommended for backend)

## After Fixing

1. **Wait for deployment to complete** (2-3 minutes)
2. **Refresh your admin dashboard**
3. **All pages should work now!**

## Still Not Working?

1. **Check Render logs** for specific error messages
2. **Check Supabase logs** (Dashboard → Logs)
3. **Verify tables exist** in Supabase Table Editor
4. **Test endpoints directly** using curl or Postman

