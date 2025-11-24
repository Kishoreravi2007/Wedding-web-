# 🔧 Contact Form Troubleshooting Guide

If you're seeing "Something went wrong" when submitting the contact form, follow these steps:

## ✅ Quick Checks

### 1. Is the Backend Server Running?

Check if your backend server is running on port 5001:

```bash
cd backend
node server.js
```

You should see:
```
✅ Backend server running on http://localhost:5001
```

### 2. Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try submitting the form again
4. Look for any error messages - they will tell you exactly what's wrong

### 3. Check Backend Console

Look at your backend server console for error messages. Common errors:

- **"Supabase credentials not found"** → Need to set up `.env` file
- **"Error saving contact message"** → Supabase connection issue
- **"Network error"** → Backend server not running or wrong port

## 🔍 Common Issues & Solutions

### Issue: "Network error: Could not connect to server"

**Solution:**
1. Make sure backend server is running: `cd backend && node server.js`
2. Check the port - should be `5001` (not 5000)
3. Verify `VITE_API_BASE_URL` in `frontend/.env` points to `http://localhost:5001`

### Issue: "Supabase credentials not found"

**Solution:**
Create or update `backend/.env` file with:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
# OR use service role key:
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then restart the backend server.

### Issue: "Error saving contact message" in backend console

**Possible causes:**
1. **Supabase table doesn't exist** - Run the migration:
   ```sql
   -- Run this in Supabase SQL Editor:
   -- Copy from backend/migrations/create_contact_messages_table.sql
   ```

2. **RLS (Row Level Security) blocking inserts** - Check Supabase policies

3. **Wrong Supabase credentials** - Verify your `.env` file

### Issue: Form submits but shows error

**Check:**
1. Open browser Network tab (F12 → Network)
2. Submit the form
3. Look for the `/api/contact-messages` request
4. Check the response - it will show the actual error

### Issue: Google Sheets error (non-critical)

If you see "Error writing to Google Sheets" in backend console:
- This is **OK** - the message is still saved to Supabase
- To fix: Follow `GOOGLE_SHEETS_SETUP.md` to configure Google Sheets
- The form will work without Google Sheets configured

## 🧪 Test the API Directly

Test if the backend endpoint is working:

```bash
# Using curl (or use Postman/Thunder Client)
curl -X POST http://localhost:5001/api/contact-messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Message sent successfully!",
  "data": { ... }
}
```

## 📋 Environment Variables Checklist

Make sure these are set in `backend/.env`:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `PORT=5001` (optional, defaults to 5001)
- [ ] `CORS_ORIGIN=http://localhost:3000` (or your frontend URL)

For Google Sheets (optional):
- [ ] `GOOGLE_SHEETS_CREDENTIALS`
- [ ] `GOOGLE_SHEETS_SPREADSHEET_ID`
- [ ] `GOOGLE_SHEETS_SHEET_NAME`

## 🚀 Quick Fix Steps

1. **Stop the backend server** (Ctrl+C)

2. **Check your `.env` file exists** in `backend/` folder

3. **Verify Supabase credentials** are correct

4. **Restart backend server:**
   ```bash
   cd backend
   node server.js
   ```

5. **Test the form again**

## 📞 Still Having Issues?

1. Check the **backend console** for detailed error messages
2. Check the **browser console** (F12) for frontend errors
3. Check the **Network tab** to see the actual API response
4. Verify the `contact_messages` table exists in Supabase
5. Make sure RLS policies allow public inserts

## 🔗 Related Files

- Backend route: `backend/routes/contact-messages.js`
- Frontend form: `frontend/src/pages/company/Contact.tsx`
- Supabase config: `backend/lib/supabase.js`
- Google Sheets: `backend/lib/google-sheets.js`

