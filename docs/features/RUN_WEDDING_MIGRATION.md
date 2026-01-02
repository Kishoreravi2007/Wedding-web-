# 🎉 Wedding Customer Management System - Setup Guide

## What's New?

Your wedding website now has a proper customer management system! Instead of being hardcoded for "sister-a" and "sister-b", you can now manage multiple wedding clients.

### Your January 2026 Customers

✅ **Sreedevi & Vaishag** - January 11, 2026  
✅ **Paravthy & Hari** - January 04, 2026

---

## 🚀 Quick Start

### Step 1: Run the Database Migration

The migration will:
- Create a `weddings` table for customer management
- Add `wedding_id` to photos, people, and wishes tables
- Automatically create entries for your two January 2026 customers
- Migrate any existing "sister-a" and "sister-b" data to the new system

**Run this in your Supabase SQL Editor:**

```bash
# Navigate to backend directory
cd backend/supabase

# Run the migration
node run-migration.js migrations/007_create_weddings_table.sql
```

**OR** manually in Supabase Dashboard:
1. Go to your Supabase project
2. Click on "SQL Editor"
3. Copy the contents of `backend/supabase/migrations/007_create_weddings_table.sql`
4. Paste and click "RUN"

---

### Step 2: Start the Servers

```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)  
cd frontend
npm run dev
```

---

### Step 3: Access Admin Portal

1. Open your browser to: `http://localhost:3000/admin/login`
2. Login with demo credentials:
   - **Email:** admin@weddingweb.com
   - **Password:** admin123

3. You'll see your Wedding Management Dashboard with your two January 2026 customers!

---

## 📋 Features

### Wedding Management Dashboard

- ✅ **View All Weddings** - See all your wedding clients in one place
- ✅ **Create New Weddings** - Add new customers easily
- ✅ **Edit Wedding Details** - Update customer information
- ✅ **Wedding Statistics** - Track photos, people, wishes per wedding
- ✅ **Archive Weddings** - Archive completed events
- ✅ **Custom Wedding Codes** - Each wedding gets a unique URL code

### What You Can Manage

- Bride & Groom names
- Wedding dates and venue
- Package type (Basic, Premium, Luxury)
- Theme colors
- Contact information
- Features (Photo Booth, Face Recognition, Wishes, Live Stream)
- Photo storage limits

---

## 🗂️ Database Schema

### New `weddings` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| wedding_code | TEXT | URL-friendly code (e.g., `sreedevi-vaishag-2026`) |
| bride_name | TEXT | Bride's name |
| groom_name | TEXT | Groom's name |
| wedding_date | DATE | Wedding date |
| wedding_month | TEXT | Wedding month (e.g., "January 2026") |
| venue | TEXT | Venue name |
| venue_address | TEXT | Full venue address |
| package_type | ENUM | basic, premium, luxury |
| status | ENUM | active, upcoming, completed, archived |
| theme_color | TEXT | HEX color code |
| enable_photo_booth | BOOLEAN | Enable photo booth feature |
| enable_face_recognition | BOOLEAN | Enable AI face search |
| enable_wishes | BOOLEAN | Enable guest wishes |
| enable_live_stream | BOOLEAN | Enable live streaming |
| max_photos | INTEGER | Photo upload limit |
| storage_used_mb | DECIMAL | Storage usage tracking |
| contact_email | TEXT | Contact email |
| contact_phone | TEXT | Contact phone |

### Updated Tables

- **photos** - Added `wedding_id` column
- **people** - Added `wedding_id` column  
- **wishes** - Added `wedding_id` column

---

## 📡 API Endpoints

### GET /api/weddings
Get all weddings
```javascript
fetch('http://localhost:5001/api/weddings')
```

### GET /api/weddings/:id
Get wedding by ID
```javascript
fetch('http://localhost:5001/api/weddings/uuid-here')
```

### GET /api/weddings/code/:weddingCode
Get wedding by code
```javascript
fetch('http://localhost:5001/api/weddings/code/sreedevi-vaishag-2026')
```

### GET /api/weddings/:id/stats
Get wedding statistics
```javascript
fetch('http://localhost:5001/api/weddings/uuid-here/stats')
```

### POST /api/weddings
Create new wedding
```javascript
fetch('http://localhost:5001/api/weddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wedding_code: 'john-jane-2026',
    bride_name: 'Jane',
    groom_name: 'John',
    wedding_date: '2026-06-15',
    wedding_month: 'June 2026',
    package_type: 'premium',
    status: 'upcoming'
  })
})
```

### PUT /api/weddings/:id
Update wedding
```javascript
fetch('http://localhost:5001/api/weddings/uuid-here', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    venue: 'Updated Venue Name',
    status: 'active'
  })
})
```

### DELETE /api/weddings/:id
Delete wedding (only if no photos)
```javascript
fetch('http://localhost:5001/api/weddings/uuid-here', {
  method: 'DELETE'
})
```

### POST /api/weddings/:id/archive
Archive wedding
```javascript
fetch('http://localhost:5001/api/weddings/uuid-here/archive', {
  method: 'POST'
})
```

---

## 🔄 Migrating Old Data

The migration automatically handles existing "sister-a" and "sister-b" data:

- Creates legacy weddings with codes `sister-a-legacy` and `sister-b-legacy`
- Migrates all photos to the new wedding IDs
- Migrates all people to the new wedding IDs
- Migrates all wishes to the new wedding IDs
- Sets status to "archived" for legacy data

---

## 🎨 Customization

### Wedding Codes (URLs)

Each wedding gets a unique code for their URL:
- `sreedevi-vaishag-2026` → `yoursite.com/sreedevi-vaishag-2026`
- `paravthy-hari-2026` → `yoursite.com/paravthy-hari-2026`

### Theme Colors

Each wedding can have a custom theme color that will apply to their pages:
- Sreedevi & Vaishag: `#e91e63` (Pink)
- Paravthy & Hari: `#9c27b0` (Purple)

---

## ✅ Next Steps

### 1. Update Photo Upload to Use Wedding ID

When photographers upload photos, they should select which wedding the photos belong to.

### 2. Create Wedding-Specific Pages

Instead of `/parvathy` and `/sreedevi`, create dynamic routes like:
- `/weddings/:weddingCode`
- `/weddings/:weddingCode/gallery`
- `/weddings/:weddingCode/photobooth`

### 3. Implement Proper Authentication

Replace the demo login with proper authentication using Supabase Auth.

### 4. Add More Admin Features

- Photo management per wedding
- Guest list management
- Analytics dashboard
- Email notifications

---

## 🐛 Troubleshooting

### Migration Failed
- Check Supabase connection in `.env`
- Make sure you have the latest migrations run
- Check SQL Editor in Supabase for error messages

### Admin Portal Not Loading
- Check if backend is running on port 5001
- Check browser console for errors
- Verify the routes were added to `App.tsx`

### Weddings Not Showing
- Check the API endpoint: `http://localhost:5001/api/weddings`
- Verify the migration ran successfully
- Check Supabase table viewer for `weddings` table

---

## 📞 Support

If you need help:
1. Check the browser console (F12) for errors
2. Check backend logs in the terminal
3. Verify all environment variables are set correctly

---

## 🎉 Congratulations!

You now have a professional wedding customer management system! Your January 2026 customers (Sreedevi & Vaishag, Paravthy & Hari) are ready to use the platform.

**Admin Portal:** `http://localhost:3000/admin/dashboard`

Happy wedding planning! 💒✨

