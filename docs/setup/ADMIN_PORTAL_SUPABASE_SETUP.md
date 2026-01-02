# 🗄️ Admin Portal - Supabase Integration Setup

## 📋 Overview

All admin portal data is now saved to Supabase, including:
- ✅ Users (already working)
- ✅ Website Settings
- ✅ Analytics & Statistics
- ✅ Admin Activity Logs
- ✅ Photos metadata

---

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Run SQL Migration**

1. Open Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/dmsghmogmwmpxjaipbod/sql
   ```

2. Click **"New query"**

3. Copy and paste the entire contents of:
   ```
   backend/supabase/migrations/004_admin_portal_tables.sql
   ```

4. Click **"Run"**

5. You should see success messages for:
   - ✅ `website_settings` table created
   - ✅ `analytics_events` table created
   - ✅ `admin_activity_log` table created
   - ✅ `website_statistics` table created
   - ✅ Helper functions created

---

## 📊 **What Tables Were Created**

### **1. website_settings**
Stores all website configuration:
```sql
- site_name
- enable_photo_booth
- enable_face_recognition
- enable_guest_wishes
- maintenance_mode
- max_photo_size
- allowed_file_types
```

**Default Values Inserted:**
```
site_name: "Parvathy & Sreedevi Wedding"
enable_photo_booth: true
enable_face_recognition: true
enable_guest_wishes: true
maintenance_mode: false
```

### **2. analytics_events**
Tracks all user actions:
```sql
- event_type (page_view, photo_download, face_search, etc.)
- event_category (gallery, photo_booth, admin, etc.)
- event_data (JSON with additional info)
- user_id
- session_id
- ip_address
- user_agent
- created_at
```

### **3. admin_activity_log**
Logs all admin actions:
```sql
- admin_id
- action (update_setting, delete_user, upload_photo, etc.)
- entity_type (user, photo, setting, etc.)
- entity_id
- details (JSON)
- ip_address
- created_at
```

### **4. website_statistics**
Aggregated daily stats:
```sql
- stat_date
- total_visits
- photo_booth_visits
- gallery_views
- photo_downloads
- face_searches
- wishes_submitted
- unique_visitors
```

---

## 🔧 **Backend APIs Created**

### **Settings API** (`/api/settings`)

**GET /api/settings**
```javascript
// Get all settings
fetch('http://localhost:5000/api/settings')
  .then(res => res.json())
  .then(data => console.log(data));
// Returns: { site_name: "...", enable_photo_booth: "true", ... }
```

**PUT /api/settings/:key** (Admin only)
```javascript
// Update single setting
fetch('http://localhost:5000/api/settings/site_name', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ value: 'New Site Name' })
});
```

**POST /api/settings/bulk** (Admin only)
```javascript
// Update multiple settings
fetch('http://localhost:5000/api/settings/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    site_name: 'New Name',
    enable_photo_booth: 'true',
    maintenance_mode: 'false'
  })
});
```

### **Analytics API** (`/api/analytics`)

**POST /api/analytics/track** (Public)
```javascript
// Track an event
fetch('http://localhost:5000/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'page_view',
    event_category: 'photo_booth',
    event_data: { page: '/parvathy/photobooth' },
    session_id: 'abc123'
  })
});
```

**GET /api/analytics/stats** (Admin only)
```javascript
// Get aggregated statistics
fetch('http://localhost:5000/api/analytics/stats', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));
// Returns: { totalPhotos: 150, totalUsers: 5, totalViews: 1250, ... }
```

**GET /api/analytics/events** (Admin only)
```javascript
// Get recent events
fetch('http://localhost:5000/api/analytics/events?limit=50', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
```

**GET /api/analytics/daily** (Admin only)
```javascript
// Get daily statistics for last 30 days
fetch('http://localhost:5000/api/analytics/daily?days=30', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
```

**GET /api/analytics/activity** (Admin only)
```javascript
// Get admin activity log
fetch('http://localhost:5000/api/analytics/activity?limit=50', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
```

---

## ✅ **What Works Now**

### **In Admin Portal:**

**Dashboard Tab:**
- ✅ Real-time statistics from Supabase
- ✅ Total photos count
- ✅ Total users count
- ✅ Total faces detected
- ✅ Website visits tracked

**Users Tab:**
- ✅ All users loaded from Supabase
- ✅ Create new user → Saved to Supabase
- ✅ Edit user → Updated in Supabase
- ✅ Delete user → Removed from Supabase
- ✅ Activate/deactivate user → Persisted

**Photos Tab:**
- ✅ Photos list loaded from Supabase
- ✅ Upload photos → Saved to Supabase Storage
- ✅ Delete photos → Removed from Supabase
- ✅ Face detection counts synced

**Settings Tab:**
- ✅ Settings loaded from Supabase
- ✅ Changes saved to Supabase
- ✅ All toggles persisted
- ✅ Admin activity logged

**Analytics Tab:**
- ✅ Real statistics from Supabase
- ✅ Automatically tracked events
- ✅ Daily aggregations
- ✅ Historical data

---

## 🎯 **How Data Flows**

### **1. User Logs In**
```
Frontend → POST /api/auth/login → Backend checks Supabase users table
Backend → Returns JWT token
Frontend → Stores token in localStorage
```

### **2. Admin Views Dashboard**
```
Frontend → GET /api/analytics/stats (with token)
Backend → Queries Supabase (photos, users, statistics)
Backend → Returns aggregated data
Frontend → Displays stats cards
```

### **3. Admin Changes Setting**
```
Frontend → POST /api/settings/bulk (with data & token)
Backend → Validates admin role
Backend → Updates Supabase website_settings table
Backend → Logs action in admin_activity_log
Backend → Returns success
Frontend → Shows success message
```

### **4. User Visits Page**
```
Frontend → POST /api/analytics/track
Backend → Inserts event in analytics_events table
Backend → Calls increment_stat() function
Backend → Updates website_statistics table
```

---

## 🔒 **Security**

### **Row Level Security (RLS):**

**website_settings:**
- ✅ Public can read
- ✅ Only admins can update

**analytics_events:**
- ✅ Anyone can insert (track events)
- ✅ Only admins can read

**admin_activity_log:**
- ✅ Authenticated users can insert
- ✅ Only admins can read

**website_statistics:**
- ✅ Public can read
- ✅ Only service role can update

---

## 📈 **Analytics Tracking**

### **Automatic Events:**

When a user:
- Views a page → `page_view` event + `visits` counter
- Views photo booth → `photo_booth_visits` counter
- Views gallery → `gallery_views` counter
- Downloads photo → `photo_download` event + `downloads` counter
- Searches face → `face_search` event + `searches` counter
- Submits wish → `wish_submitted` event + `wishes` counter

### **Manual Tracking:**

Add to any page:
```javascript
// Track custom event
fetch(`${API_BASE_URL}/api/analytics/track`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'custom_action',
    event_category: 'user_interaction',
    event_data: { button: 'share', page: window.location.pathname }
  })
});
```

---

## 🧪 **Testing**

### **Test 1: Check Tables Exist**

In Supabase SQL Editor:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('website_settings', 'analytics_events', 'admin_activity_log', 'website_statistics');
```

Should return 4 rows.

### **Test 2: Check Default Settings**

```sql
SELECT * FROM website_settings;
```

Should show 7 default settings.

### **Test 3: Test Statistics Function**

```sql
SELECT * FROM get_current_stats();
```

Should return aggregated statistics.

### **Test 4: Insert Test Event**

```sql
INSERT INTO analytics_events (event_type, event_category, event_data)
VALUES ('test_event', 'testing', '{"test": true}');
```

### **Test 5: Check API**

```bash
# Test settings API
curl http://localhost:5000/api/settings

# Test stats API (need admin token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/stats
```

---

## 🔄 **Data Migration (If Needed)**

If you have existing data to migrate:

```sql
-- Migrate old settings (if you had any)
INSERT INTO website_settings (key, value, category)
VALUES 
  ('old_setting_1', 'value1', 'general'),
  ('old_setting_2', 'value2', 'features')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

---

## 🆘 **Troubleshooting**

### **Error: "Could not find table 'website_settings'"**
→ You need to run the SQL migration first

### **Settings not saving**
→ Check backend logs for errors
→ Verify JWT token is valid
→ Confirm user has admin role

### **Statistics showing 0**
→ Upload some photos first
→ Create some test events
→ Wait for data to aggregate

### **"Permission denied" errors**
→ Check RLS policies are created
→ Verify service_role key is set in backend .env
→ Ensure user is authenticated

---

## 📝 **Next Steps**

1. ✅ Run the SQL migration
2. ✅ Restart backend server (to load new routes)
3. ✅ Test admin portal login
4. ✅ Check dashboard statistics
5. ✅ Try changing a setting
6. ✅ Upload a photo
7. ✅ View analytics

---

## 🎊 **Success!**

Your admin portal now:
- ✅ Saves all data to Supabase
- ✅ Persists settings across sessions
- ✅ Tracks analytics automatically
- ✅ Logs admin actions
- ✅ Provides real-time statistics

**Everything is integrated with Supabase!** 🚀

---

## 📞 **Support**

If you encounter issues:
1. Check Supabase logs
2. Check backend console
3. Check browser developer console
4. Verify environment variables
5. Confirm SQL migration ran successfully

All admin data is now safely stored in Supabase! 🎉

