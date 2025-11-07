# Fix Admin Dashboard Error

## Problem
You're seeing this error on the admin dashboard:
```
Error: Cannot coerce the result to a single JSON object
```

## Root Cause
The `weddings` table or the `get_wedding_stats()` function hasn't been created in your Supabase database yet.

## Solution

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Migration**
   - Open the file `RUN_WEDDING_MIGRATION_NOW.sql` (just created)
   - Copy ALL the SQL code
   - Paste it into the Supabase SQL Editor
   - Click "Run" button

4. **Verify**
   - You should see: "Weddings table created successfully!"
   - And a list of 2 weddings (Sreedevi & Parvathy)

5. **Refresh the Admin Dashboard**
   - Go back to `http://localhost:3000/admin/dashboard`
   - Refresh the page (F5)
   - The error should be gone!

### Option 2: If Still Seeing Error

The error might be coming from the RLS policies. To temporarily fix this:

1. **Disable RLS for testing**:
   ```sql
   ALTER TABLE weddings DISABLE ROW LEVEL SECURITY;
   ```

2. **Or update policies**:
   ```sql
   DROP POLICY IF EXISTS "Allow all operations on weddings" ON weddings;
   
   CREATE POLICY "Allow all operations on weddings" ON weddings
   FOR ALL USING (true) WITH CHECK (true);
   ```

### Option 3: Check if Table Exists

Run this in Supabase SQL Editor to check:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'weddings';

-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_wedding_stats';

-- View all weddings
SELECT * FROM weddings;
```

## What This Migration Does

✅ Creates `weddings` table for managing wedding customers
✅ Creates indexes for fast queries
✅ Sets up Row Level Security policies (allows all for now)
✅ Creates `get_wedding_stats()` function to count photos/wishes/people
✅ Inserts 2 sample weddings:
   - Sreedevi & Vaishag (January 11, 2026)
   - Parvathy & Hari (January 04, 2026)

## After Migration

Once the migration runs successfully:

1. ✅ Admin dashboard will load without errors
2. ✅ You'll see your 2 wedding clients
3. ✅ You can click on each wedding to see details
4. ✅ You can edit wedding information
5. ✅ You can add new weddings

## Testing

After running the migration:

1. Go to: `http://localhost:3000/admin/dashboard`
2. You should see 2 wedding cards
3. Click on "Sreedevi & Vaishag" or "Parvathy & Hari"
4. You should see their details without errors
5. Try clicking "Edit" button
6. Make a change and click "Update Wedding"
7. It should update successfully!

## Troubleshooting

### Still Getting Error?
- Check browser console (F12) for more details
- Check backend terminal for error messages
- Verify Supabase connection is working

### Table Already Exists?
If the migration says table already exists, that's OK! The `IF NOT EXISTS` clauses will skip creation.

### No Weddings Showing?
Check if the INSERT worked:
```sql
SELECT COUNT(*) FROM weddings;
```

Should return 2 (or more if you've added weddings).

---

**Once you run the SQL migration, the admin dashboard will work perfectly!** 🎉

