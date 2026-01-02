# How to View Contact Messages 📧

## Quick Access

The contact messages system is now fully integrated into your admin portal!

### Admin Login & Access

1. **Login to Admin Panel**
   - Go to: `http://localhost:3000/admin/login`
   - Default credentials:
     - Email: `admin@weddingweb.com`
     - Password: `admin123`

2. **Access Messages**
   - After login, you'll be at the Admin Dashboard
   - Click the **"Messages"** button in the navigation bar
   - Or go directly to: `http://localhost:3000/admin/contact-messages`

## Features Available

### View All Messages
- See all customer inquiries in a clean list format
- Each message shows:
  - Customer name
  - Email address (clickable to send email)
  - Phone number (clickable to call)
  - Event date and guest count
  - Message preview
  - Status badge (New, Read, Replied, Archived)
  - Timestamp

### Message Details
Click any message to see full details in the right panel:
- Complete message text
- All contact information
- Event details (date and guest count)
- When the message was received

### Manage Messages
For each message, you can:

1. **Reply via Email**
   - Click the "Reply via Email" button
   - Opens your default email client with customer's email pre-filled

2. **Update Status**
   - Mark as "Read" - When you've reviewed it
   - Mark as "Replied" - After responding to customer
   - Mark as "Archive" - To file away resolved inquiries

3. **Delete Message**
   - Remove spam or test messages
   - Confirmation required before deletion

4. **Refresh**
   - Click the "Refresh" button in the header to check for new messages

## User Contact Form

Customers can reach you through:
- **Contact Page**: `http://localhost:3000/company/contact`
- They fill out a form with:
  - Name and email (required)
  - Phone number (optional)
  - Event date (optional)
  - Guest count (optional)
  - Message (required)

## Database Setup

### First Time Setup (If table doesn't exist)

If you haven't created the `contact_messages` table yet:

1. Go to your **Supabase Dashboard**
2. Open **SQL Editor**
3. Run this migration file: `backend/migrations/create_contact_messages_table.sql`

Or run it directly:

```sql
-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  event_date DATE,
  guest_count INTEGER,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Allow all operations (update with proper auth later)
CREATE POLICY "Allow admin access" ON contact_messages
  FOR ALL USING (true);
```

## API Endpoints

The backend provides these endpoints (already configured):

- `GET /api/contact-messages` - Fetch all messages
- `POST /api/contact-messages` - Submit new message (from contact form)
- `PATCH /api/contact-messages/:id` - Update message status
- `DELETE /api/contact-messages/:id` - Delete message

## Status Workflow

```
New → Read → Replied → Archived
```

- **New** (Blue badge): Fresh inquiry, needs attention
- **Read** (Yellow badge): You've reviewed it
- **Replied** (Green badge): You've responded to the customer
- **Archived** (Gray badge): Resolved or closed inquiry

## Quick Tips

✅ **Check messages regularly** - New inquiries appear as "New" status

✅ **Mark as Read** - So you know which ones you've reviewed

✅ **Mark as Replied** - After sending response to track follow-ups

✅ **Use Archive** - For completed conversations to keep list clean

✅ **Click Refresh** - To check for new messages without reloading page

## Testing

### Test the System:

1. Open contact page: `http://localhost:3000/company/contact`
2. Fill out and submit the form
3. Go to admin messages: `http://localhost:3000/admin/contact-messages`
4. You should see your test message appear!

## Troubleshooting

### Messages not showing?
- Check backend is running: `http://localhost:5001`
- Check browser console (F12) for errors
- Verify Supabase connection in `backend/.env`

### Can't access admin panel?
- Make sure you're logged in at `/admin/login`
- Check that the route is registered in `App.tsx`

### Form not submitting?
- Check backend server is running
- Check browser console for CORS errors
- Verify API_BASE_URL in frontend `.env` file

## Next Steps

Consider adding:
- Email notifications when new message arrives
- Auto-reply confirmation email
- Search/filter by customer name or email
- Export messages to CSV
- Message analytics (response time, etc.)

---

## Support

If you have any issues:
1. Check the browser console (F12) for errors
2. Check backend terminal for server logs
3. Verify Supabase table exists and has data
4. Test the API endpoints directly with Postman/Thunder Client

Happy managing! 🎉

