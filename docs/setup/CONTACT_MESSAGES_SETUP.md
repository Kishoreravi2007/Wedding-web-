# Contact Messages System Setup

This document explains how to set up and use the contact messages system.

## Database Setup

### 1. Run SQL Migration in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents from `backend/migrations/create_contact_messages_table.sql`
4. Paste and run the SQL script
5. This will create the `contact_messages` table with all necessary columns and indexes

### 2. Verify Table Creation

In Supabase dashboard:
- Go to **Table Editor**
- You should see `contact_messages` table
- Verify columns: id, name, email, phone, event_date, guest_count, message, status, response, created_at, updated_at

## Running the System

### 1. Start Backend Server

```bash
cd backend
node server.js
```

The backend should be running on `http://localhost:5001`

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

The frontend should be running on `http://localhost:3000`

## Using the System

### For Customers (Public)

1. Go to the Contact page: `http://localhost:3000/company/contact`
2. Fill out the form with:
   - Name
   - Email
   - Phone (optional)
   - Event Date (optional)
   - Guest Count (optional)
   - Message
3. Click "Send Message"
4. Message will be saved to the database

### For Admin (You)

1. Access the admin panel: `http://localhost:3000/contact-admin`
2. You'll see all contact messages with filters:
   - **New**: Unread messages (shown in blue)
   - **Read**: Messages you've viewed (shown in yellow)
   - **Replied**: Messages you've responded to (shown in green)
   - **Archived**: Old/resolved messages (shown in gray)

3. Click on any message to:
   - View full details
   - See customer email (clickable to open your email client)
   - See phone number (clickable to call on mobile)
   - Add a response/notes
   - Mark status (New, Read, Archived)
   - Delete the message

### Admin Features

- **Filter by Status**: Click the filter buttons at the top to view messages by status
- **Email Customer**: Click the email address to open your default email client
- **Call Customer**: Click the phone number to dial (on mobile)
- **Add Response**: Type notes or your response and click "Save Response"
- **Status Management**: 
  - "Mark New" - Reset to new status
  - "Mark Read" - Mark as read
  - "Archive" - Move to archived messages
- **Delete**: Remove unwanted messages (spam, test messages, etc.)

## API Endpoints

The backend provides these endpoints:

- `GET /api/contact-messages` - Get all messages
- `POST /api/contact-messages` - Submit new message
- `PATCH /api/contact-messages/:id` - Update message status/response
- `DELETE /api/contact-messages/:id` - Delete a message

## Security Note

⚠️ **Important**: The current admin page (`/contact-admin`) is not password-protected. 

### To Add Authentication (Recommended):

1. Add a simple password check at the route level
2. Use Firebase Authentication
3. Implement proper role-based access control

For now, keep the admin URL private and only share it with trusted team members.

## Troubleshooting

### Messages not appearing?

1. Check that backend server is running on port 5001
2. Check browser console for errors
3. Verify Supabase connection in backend/.env
4. Check Supabase table has proper RLS policies

### Form not submitting?

1. Check browser console for errors
2. Verify backend URL in Contact.tsx (line 113)
3. Ensure backend server is running
4. Check CORS settings in backend/server.js

### Database errors?

1. Verify SQL migration ran successfully
2. Check Supabase RLS policies
3. Verify Supabase credentials in backend/.env

## Future Improvements

- Email notifications when new message arrives
- Auto-reply email to customer
- Search and filter functionality
- Export messages to CSV
- Message analytics dashboard
- Password protection for admin panel

