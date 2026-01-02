# 🔐 Photographer Login Fix

## The Problem

Unable to login to the photographer's portal because there are no users in the Supabase database yet.

## Quick Fix - Create Photographer Account

### Step 1: Check if users exist

```bash
cd backend
node list-users.js
```

**If shows "No users found"** → Continue to Step 2  
**If shows users** → Try logging in with those credentials

### Step 2: Create a photographer account

```bash
cd backend
node create-photographer.js
```

This creates a default photographer account:
- **Username:** `photographer`
- **Password:** `wedding2024`
- **Role:** `photographer`

**OR** create with custom credentials:

```bash
node create-photographer.js myusername mypassword
```

### Step 3: Login

1. Go to: `https://weddingweb.co.in/photographer/login`
2. Enter credentials:
   - Username: `photographer`
   - Password: `wedding2024`
3. Click "Login"
4. Should redirect to photographer dashboard! ✅

## Files Added

### 1. `create-photographer.js`
Creates a photographer user in Supabase

**Usage:**
```bash
# Default credentials
node create-photographer.js

# Custom credentials
node create-photographer.js john securepass123

# Help
node create-photographer.js --help
```

### 2. `list-users.js`
Lists all users in the database

**Usage:**
```bash
node list-users.js
```

Shows:
- Total users count
- Username, role, ID
- Creation date

## Deploy Scripts

Push these helper scripts to your repo:

```bash
git add backend/create-photographer.js backend/list-users.js PHOTOGRAPHER_LOGIN_FIX.md
git commit -m "Add scripts to create photographer accounts"
git push origin main
```

## Running on Render

### Option 1: Use Render Shell

1. Go to Render Dashboard
2. Click on your backend service
3. Go to "Shell" tab
4. Run:
   ```bash
   cd /opt/render/project/src/backend
   node create-photographer.js photographer wedding2024
   ```

### Option 2: SSH into Render (if enabled)

```bash
ssh your-service@ssh.render.com
cd backend
node create-photographer.js
```

### Option 3: Add to Deploy Hook

Add to `render.yaml`:
```yaml
services:
  - type: web
    name: wedding-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    initialDeployHook: node create-photographer.js photographer wedding2024
```

## Troubleshooting

### "Username already exists"

User already created! Try logging in or create a different username:
```bash
node create-photographer.js photographer2 newpassword
```

### "Users table doesn't exist"

Run the users table migration in Supabase SQL Editor:

```sql
-- From: backend/supabase/migrations/002_create_users_table.sql

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'photographer', 'couple', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### "Supabase connection error"

Check environment variables in Render:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key

### "Login fails even with correct credentials"

**Check:**
1. Backend logs for errors
2. Network tab in browser DevTools
3. CORS settings in backend

**Try:**
```bash
# Test login endpoint directly
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"photographer","password":"wedding2024"}'
```

Should return:
```json
{
  "token": "eyJ...",
  "user": {
    "id": "...",
    "username": "photographer",
    "role": "photographer"
  }
}
```

## Create Multiple Users

### Photographer
```bash
node create-photographer.js photographer wedding2024
```

### Admin User
```bash
node create-photographer.js admin adminpass123
# Then update role in database to 'admin'
```

### Update user role manually

In Supabase SQL Editor:
```sql
UPDATE users 
SET role = 'admin' 
WHERE username = 'photographer';
```

## Default Credentials Summary

After running `create-photographer.js`:

| Field | Value |
|-------|-------|
| Username | `photographer` |
| Password | `wedding2024` |
| Role | `photographer` |
| Login URL | `https://weddingweb.co.in/photographer/login` |

**⚠️ IMPORTANT:** Change the password after first login!

## Security Best Practices

1. **Change default password immediately**
2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
3. **Don't commit passwords** to git
4. **Use environment variables** for sensitive data
5. **Enable 2FA** when available

## Next Steps

After logging in successfully:

1. ✅ **Upload photos** - Use the photographer dashboard
2. ✅ **Enable face detection** - Photos will automatically detect faces
3. ✅ **Test photo booth** - Should now find matching photos!

## Verify Everything Works

1. **Create photographer:**
   ```bash
   node create-photographer.js
   ```

2. **List users:**
   ```bash
   node list-users.js
   ```
   Should show your new photographer

3. **Login:**
   - Go to photographer portal
   - Use credentials from Step 1
   - Should work! ✅

4. **Upload photos:**
   - Dashboard → Upload
   - Select photos with faces
   - Upload

5. **Test photo booth:**
   - Go to photo booth
   - Capture face
   - Find My Photos
   - Should find matches! 🎉

---

**Quick Commands:**
```bash
# Check users
node list-users.js

# Create photographer
node create-photographer.js

# Create with custom credentials
node create-photographer.js myuser mypass

# Deploy
git add .
git commit -m "Add photographer account creation scripts"
git push origin main
```

**Status:** Ready to create photographer accounts! 📸

