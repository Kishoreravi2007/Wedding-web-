# 🔍 Check and Create Missing Supabase Tables

## Problem
Supabase is connected, but queries are failing with "Internal server error." This usually means the tables don't exist.

## Quick Check: Do Your Tables Exist?

1. **Go to Supabase Dashboard** → Your Project
2. **Go to "Table Editor"**
3. **Check if these tables exist:**
   - ✅ `weddings`
   - ✅ `contact_messages`
   - ✅ `feedback`
   - ✅ `call_schedules`

If any are missing, you need to create them!

## Create Missing Tables

### Option 1: Use Migration Files (Recommended)

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Open these files from your project:**
   - `backend/supabase/migrations/007_create_weddings_table.sql`
   - Check for other migration files for:
     - `contact_messages`
     - `feedback`
     - `call_schedules`

3. **Copy and paste each SQL file** into Supabase SQL Editor
4. **Click "Run"** for each one

### Option 2: Quick SQL Scripts

If you don't have migration files, use these:

#### Create `contact_messages` table:

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

#### Create `feedback` table:

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

#### Create `weddings` table:

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

#### Create `call_schedules` table:

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

## After Creating Tables

1. **Refresh your admin dashboard**
2. **Check Render logs** - you should see successful queries
3. **Tables should now work!**

## Verify Tables Were Created

1. Go to **Supabase Dashboard** → **Table Editor**
2. You should see all 4 tables listed
3. They might be empty (that's OK - you can add data later)

## Check Render Logs After Fix

After creating tables and the next request comes in, check Render logs. You should see:
- No more "Error fetching..." messages
- Successful API responses

## Still Getting Errors?

1. **Check Render logs** for the full error message (we improved logging)
2. **Verify table names match exactly** (case-sensitive)
3. **Check RLS policies** - even with service role key, some policies might block access
4. **Test directly in Supabase SQL Editor:**
   ```sql
   SELECT * FROM contact_messages LIMIT 1;
   SELECT * FROM feedback LIMIT 1;
   SELECT * FROM weddings LIMIT 1;
   SELECT * FROM call_schedules LIMIT 1;
   ```

If these queries work in Supabase but fail in your backend, there might be a connection or permission issue.

