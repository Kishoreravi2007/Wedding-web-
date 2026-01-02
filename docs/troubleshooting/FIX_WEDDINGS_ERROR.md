# 🔧 Fix: Internal Server Error on /api/weddings

## Problem
The admin dashboard shows "Internal server error" when trying to load weddings. This is a 500 error from `/api/weddings` endpoint.

## Root Causes

1. **Missing `weddings` table in Supabase** (most likely)
2. **Missing Supabase environment variables on Render**
3. **Supabase connection issue**

## Solution 1: Create the Weddings Table in Supabase

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to **SQL Editor**

### Step 2: Run the Migration
1. Open the file: `backend/supabase/migrations/007_create_weddings_table.sql`
2. Copy the entire SQL content
3. Paste it into the Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`

This will create the `weddings` table with all necessary columns.

### Step 3: Verify Table Created
1. Go to **Table Editor** in Supabase
2. You should see a `weddings` table
3. It should be empty initially (that's OK)

## Solution 2: Check Render Environment Variables

Since your backend is deployed on Render (`backend-bf2g.onrender.com`), make sure these environment variables are set:

### Required Supabase Variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### How to Set on Render:
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add/verify these variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Where to Find Supabase Keys:
1. Go to Supabase Dashboard → Your Project
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Solution 3: Quick Test

After running the migration, test the endpoint:

```bash
curl https://backend-bf2g.onrender.com/api/weddings
```

Expected response:
```json
{
  "success": true,
  "weddings": [],
  "count": 0
}
```

If you get this, the table exists and the endpoint works!

## Solution 4: Check Render Logs

1. Go to Render dashboard
2. Select your backend service
3. Go to **Logs** tab
4. Look for errors related to:
   - Supabase connection
   - `weddings` table
   - Missing environment variables

## Common Error Messages

### "relation 'weddings' does not exist"
- **Fix**: Run the migration SQL (Solution 1)

### "Supabase client not initialized"
- **Fix**: Add Supabase environment variables to Render (Solution 2)

### "permission denied for table weddings"
- **Fix**: Make sure you're using `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)

## After Fixing

1. **Refresh your admin dashboard** - The error should be gone
2. **You should see**: "No weddings found. Create your first wedding to get started!"
3. **Click "+ Add New Wedding"** to create your first wedding

## Quick Migration SQL

If you can't find the migration file, here's the essential SQL:

```sql
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_code TEXT UNIQUE NOT NULL,
  bride_name TEXT NOT NULL,
  groom_name TEXT,
  wedding_date DATE,
  wedding_month TEXT,
  venue TEXT,
  venue_address TEXT,
  package_type TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'active',
  theme_color TEXT DEFAULT '#ff6b9d',
  contact_email TEXT,
  contact_phone TEXT,
  enable_photo_booth BOOLEAN DEFAULT true,
  enable_face_recognition BOOLEAN DEFAULT true,
  enable_wishes BOOLEAN DEFAULT true,
  enable_live_stream BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Run this in Supabase SQL Editor if the full migration file is not available.

