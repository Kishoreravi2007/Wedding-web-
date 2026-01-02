# 🔐 Create Admin User: kishore

## Quick Setup (2 minutes)

### **Step 1: Open Supabase SQL Editor**

1. Go to: **https://supabase.com/dashboard/project/dmsghmogmwmpxjaipbod**
2. Login to your Supabase account
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

### **Step 2: Run the SQL**

Copy the entire contents of `CREATE_ADMIN_USER_KISHORE.sql` and paste it into the SQL editor, then click **"Run"**.

Or copy this SQL directly:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'photographer', 'couple', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users" ON users
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Insert admin user (password: qwerty123)
INSERT INTO users (username, password, role, is_active)
VALUES (
  'kishore',
  '$2b$12$ZtmqYrkLYWi/pGvygWbgO.DSUhkNbtM8GRtahXDggc9d8YzMG8.B2',
  'admin',
  true
)
ON CONFLICT (username) 
DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  updated_at = CURRENT_TIMESTAMP;

-- Verify
SELECT id, username, role, is_active, created_at 
FROM users WHERE username = 'kishore';
```

### **Step 3: Verify Success**

After running the SQL, you should see:
- ✅ "Success. No rows returned" (for the CREATE statements)
- ✅ One row returned showing your new admin user

### **Step 4: Login!**

Now you can login with:

**🌐 Local (if servers are running):**
- URL: http://localhost:3000/admin-login
- Username: `kishore`
- Password: `qwerty123`

**🌐 Production (after Render SPA routing is fixed):**
- URL: https://weddingweb.co.in/admin-login
- Username: `kishore`
- Password: `qwerty123`

---

## ✅ What This Does

1. **Creates `users` table** (if it doesn't exist)
2. **Enables security policies** (Row Level Security)
3. **Creates admin user** with username `kishore` and password `qwerty123`
4. **Sets role to `admin`** for full access

---

## 🔒 Security Notes

- ✅ Password is hashed with bcrypt (12 rounds)
- ✅ Original password is never stored
- ✅ RLS policies protect user data
- ⚠️  Keep your password secure
- ⚠️  Consider changing it after first login

---

## 🧪 Test the Login

After creating the user, test it locally:

```bash
# Make sure your servers are running
cd backend
npm start

# In another terminal
cd frontend  
npm run dev

# Then visit: http://localhost:3000/admin-login
# Login with: kishore / qwerty123
```

---

## 🎉 You're Done!

Your new admin account is ready to use. You can now:
- ✅ Login to admin portal
- ✅ Manage photos
- ✅ View statistics
- ✅ Manage users (if implemented)

---

## ❓ Troubleshooting

### SQL Error: "relation 'users' already exists"
- This is fine! It means the table was already created
- The INSERT will still work (it will update if user exists)

### SQL Error: "duplicate key value violates unique constraint"
- User already exists with that username
- The script uses `ON CONFLICT` to update instead
- You should still be able to login

### Can't access admin-login page (404)
- You need to fix the Render SPA routing first
- See: `RENDER_SPA_ROUTING_FIX.md`
- Add the rewrite rule in Render dashboard

### Login says "Invalid credentials"
- Make sure you ran the SQL successfully
- Check you're using: `kishore` / `qwerty123`
- Try refreshing the page
- Check browser console for errors

---

## 🔄 To Change Password Later

If you want to change the password, run this SQL in Supabase:

```sql
-- Update password (replace NEW_PASSWORD with your new password)
-- This example updates to 'newpass123'
UPDATE users 
SET password = '$2a$12$[NEW_HASHED_PASSWORD]',
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'kishore';
```

To generate a new password hash, use the bcrypt tool or ask me to generate one for you!

---

**Ready? Go ahead and run the SQL in Supabase SQL Editor!** 🚀

