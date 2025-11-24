# ✅ Create Missing Supabase Tables - Quick Guide

Your environment variables are correct! The issue is that the tables don't exist in your Supabase database.

## Your Supabase Project
- **URL**: `https://dmsghmogmwmpxjaipbod.supabase.co`
- **Connection**: ✅ Configured correctly

## Step 1: Go to Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project (the one with URL `dmsghmogmwmpxjaipbod`)
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

## Step 2: Create the Tables

Copy and paste each SQL script below, one at a time, and click **"Run"**:

### 1. Create `contact_messages` table:

```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_date DATE,
  guest_count INTEGER,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Create `feedback` table:

```sql
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT,
  message TEXT NOT NULL,
  page_url TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Create `weddings` table:

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
  package_type TEXT DEFAULT 'basic' CHECK (package_type IN ('basic', 'premium', 'luxury')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'completed', 'archived')),
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

### 4. Create `call_schedules` table:

```sql
CREATE TABLE IF NOT EXISTS call_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  reason TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Step 3: Verify Tables Were Created

1. Go to **"Table Editor"** in Supabase
2. You should see all 4 tables:
   - ✅ `contact_messages`
   - ✅ `feedback`
   - ✅ `weddings`
   - ✅ `call_schedules`

## Step 4: Test Your Admin Dashboard

1. **Refresh your admin dashboard**: https://weddingweb.co.in/admin/dashboard
2. **All pages should work now!**
3. You should see empty lists (which is fine - you can add data later)

## Quick Test

After creating tables, you can test the API directly:

```bash
curl https://backend-bf2g.onrender.com/api/contact-messages
```

Expected response:
```json
{
  "success": true,
  "messages": []
}
```

If you get this, the tables are working! 🎉

## Troubleshooting

### If you get "relation already exists" error:
- The table already exists - that's OK! Skip that table.

### If you get permission errors:
- Make sure you're using the **service role key** (which you have configured ✅)

### If tables still don't work:
- Check Render logs after the next request
- The improved error logging will show the exact issue


