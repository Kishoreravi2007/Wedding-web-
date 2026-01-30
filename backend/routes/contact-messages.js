const express = require('express');
const router = express.Router();
const db = require('../lib/db-gcp');
const { writeContactMessageToSheet, deleteContactMessageFromSheet } = require('../lib/google-sheets');
const NotificationService = require('../services/notification-service');
const { SecureUserDB } = require('../lib/secure-auth');

// Get all contact messages (for admin)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json({ success: true, messages: rows });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    if (error.code === '42P01') { // undefined_table
      return res.json({ success: true, messages: [] }); // Return empty if table doesn't exist yet
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit a new contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, eventDate, guestCount, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Insert message into DB
    const insertQuery = `
      INSERT INTO contact_messages (name, email, phone, event_date, guest_count, message, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'new', NOW())
      RETURNING *
    `;

    // Check if table exists first, or just let it fail/create it?
    // For robustness, let's catch the error and try to create table if missing (optional but nice)
    // But for now, we assume migration ran or we catch error.

    let result;
    try {
      result = await db.query(insertQuery, [name, email, phone, eventDate, guestCount, message]);
    } catch (err) {
      if (err.code === '42P01') {
        console.log('Creating contact_messages table...');
        await db.query(`
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT,
                    event_date TEXT,
                    guest_count INTEGER,
                    message TEXT NOT NULL,
                    status TEXT DEFAULT 'new',
                    response TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            `);
        // Retry insert
        result = await db.query(insertQuery, [name, email, phone, eventDate, guestCount, message]);
      } else {
        throw err;
      }
    }

    const newMessage = result.rows[0];

    // Create Notification for Admin/Users
    try {
      // For now, let's notify all admin users. 
      // Ideally this goes to the specific vendor, but contact_messages are currently global.
      const { rows: adminUsers } = await db.query("SELECT id FROM users WHERE role = 'admin'");
      for (const adminUser of adminUsers) {
        await NotificationService.createNotification(adminUser.id, {
          title: 'New Lead Received!',
          message: `${name} is interested in your services. View leads to respond.`,
          type: 'success',
          category: 'personal',
          link: '/#leads'
        });
      }
    } catch (notifError) {
      console.error('Error creating notification for lead:', notifError);
    }

    // Write to Google Sheets (non-blocking)
    try {
      await writeContactMessageToSheet({
        name,
        email,
        phone,
        eventDate,
        guestCount,
        message,
      });
    } catch (sheetsError) {
      console.error('Error writing to Google Sheets (non-critical):', sheetsError);
    }

    res.json({ success: true, message: 'Message sent successfully!', data: newMessage });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update message status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const { rows } = await db.query(
      `UPDATE contact_messages 
       SET status = COALESCE($1, status), 
           response = COALESCE($2, response)
       WHERE id = $3 
       RETURNING *`,
      [status, response, id]
    );

    res.json({ success: true, message: 'Message updated successfully!', data: rows[0] });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get message to delete from sheets later
    const { rows: existing } = await db.query('SELECT * FROM contact_messages WHERE id = $1', [id]);
    const messageData = existing[0];

    await db.query('DELETE FROM contact_messages WHERE id = $1', [id]);

    // Delete from Google Sheets (non-blocking)
    if (messageData) {
      try {
        await deleteContactMessageFromSheet({
          email: messageData.email,
          message: messageData.message,
          name: messageData.name,
        });
      } catch (sheetsError) {
        console.error('Error deleting from Google Sheets:', sheetsError);
      }
    }

    res.json({ success: true, message: 'Message deleted successfully!' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
