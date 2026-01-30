/**
 * Migration script to create notifications table
 */
const { query } = require('../lib/db-gcp');

async function migrate() {
    console.log('Starting notifications migration...');

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
      category TEXT DEFAULT 'personal', -- 'personal', 'marketing'
      link TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
  `;

    try {
        await query(createTableQuery);
        console.log('Notifications table created successfully.');
    } catch (error) {
        console.error('Error creating notifications table:', error);
        process.exit(1);
    }

    process.exit(0);
}

migrate();
