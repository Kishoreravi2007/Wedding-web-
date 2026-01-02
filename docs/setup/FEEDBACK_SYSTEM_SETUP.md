# Feedback System Setup Guide

Complete feedback collection system for WeddingWeb with user submission form and admin management panel.

## Features

### For Users:
- ⭐ 5-star rating system
- 📝 Multiple feedback categories (General, Feature Request, Bug Report, UI/UX, Performance, Other)
- 📧 Optional email for follow-up
- 🔒 Anonymous submission supported
- ✅ Beautiful success confirmation

### For Admin:
- 📊 Statistics dashboard (total feedback, average rating, status counts)
- 🔍 Filter by status (New, Reviewed, Resolved, Archived)
- 📝 Add internal notes to feedback
- 🏷️ Color-coded categories and statuses
- 📧 Direct email links to users
- 🗑️ Delete spam/unwanted feedback
- 📈 Track feedback trends

## Setup Instructions

### 1. Create Database Table in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Copy and paste this SQL:

```sql
-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'Anonymous',
  email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'feature', 'bug', 'ui', 'performance', 'other')),
  message TEXT NOT NULL,
  page_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public insert" ON feedback;
CREATE POLICY "Allow public insert" ON feedback
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin access" ON feedback;
CREATE POLICY "Allow admin access" ON feedback
  FOR ALL USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();
```

5. Click **Run** (or Ctrl+Enter)
6. Verify success message

### 2. Restart Backend Server

The backend needs to be restarted to load the new feedback routes:

1. **Stop the backend server** (if running)
2. **Start it again:**
   ```bash
   cd backend
   node server.js
   ```
3. You should see: `✅ Backend server running on http://localhost:5000`

### 3. Test the System

#### For Users (Public):
1. Visit any page on your website
2. Click the **"Feedback"** button (purple button on the left side)
3. Fill out the feedback form:
   - Name (optional)
   - Email (optional)
   - Star rating (1-5) *required*
   - Category
   - Message *required*
4. Click "Submit Feedback"
5. See success message and auto-redirect

#### For Admin:
1. Visit: `http://localhost:3000/feedback-admin`
2. View all feedback with:
   - **Statistics**: Total count, average rating, new/resolved counts
   - **Filters**: All, New, Reviewed, Resolved, Archived
   - **Details**: Click any feedback to view full details
3. Manage feedback:
   - Add internal notes
   - Change status (New → Reviewed → Resolved → Archived)
   - Email users (if they provided email)
   - Delete unwanted feedback

## Access URLs

- **User Feedback Form**: `http://localhost:3000/feedback`
- **Admin Panel**: `http://localhost:3000/feedback-admin`
- **Contact Messages Admin**: `http://localhost:3000/contact-admin`

## Feedback Button Locations

The feedback button appears on:
- ✅ All wedding event pages (Parvathy's & Sreedevi's)
- ✅ Company pages (Landing, About, Services, Pricing, Portfolio, Contact)
- ✅ Main homepage
- ❌ Admin pages (hidden to avoid confusion)

**Position:**
- Left side of the screen
- Purple gradient button with MessageSquare icon
- Fixed position that adapts to navigation bars

## API Endpoints

- `GET /api/feedback` - Get all feedback
- `POST /api/feedback` - Submit new feedback
- `PATCH /api/feedback/:id` - Update feedback status/notes
- `DELETE /api/feedback/:id` - Delete feedback

## Feedback Categories

1. **General** - General feedback or comments
2. **Feature** - Feature requests or suggestions
3. **Bug** - Bug reports or issues
4. **UI** - User interface feedback
5. **Performance** - Performance-related feedback
6. **Other** - Everything else

## Feedback Statuses

1. **New** (Blue) - Just submitted, not yet reviewed
2. **Reviewed** (Yellow) - Admin has looked at it
3. **Resolved** (Green) - Issue fixed or feature implemented
4. **Archived** (Gray) - Completed or no longer relevant

## Tips

### Encourage Feedback:
- Add calls-to-action on key pages
- Mention it after successful purchases
- Include in email communications

### Respond Quickly:
- Check new feedback daily
- Email users with follow-ups
- Show you value their input

### Act on Feedback:
- Implement popular feature requests
- Fix reported bugs quickly
- Share updates with users who suggested them

## Security Note

⚠️ The admin panel (`/feedback-admin`) is not password-protected. Keep the URL private or implement authentication.

## Future Improvements

- Email notifications for new feedback
- Auto-reply thanking users
- Public feedback wall (filtered)
- Sentiment analysis
- Export to CSV
- Feedback trends over time
- Integration with project management tools

