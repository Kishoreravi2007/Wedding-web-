const express = require('express');
const router = express.Router();
const db = require('../lib/db-gcp');
const { authMiddleware } = require('../lib/secure-auth');
const emailService = require('../services/email-service');
const { v4: uuidv4 } = require('uuid');

// Get all guests for the authenticated user
router.use((req, res, next) => {
    console.log(`📡 Guests Router: ${req.method} ${req.path}`);
    next();
});

router.get('/', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            'SELECT * FROM guests WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, guests: rows });
    } catch (error) {
        console.error('Error fetching guests:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch guests' });
    }
});

// Helper function to get wedding info
async function getWeddingInfo(userId) {
    const { rows } = await db.query(
        'SELECT groom_name, bride_name, wedding_date, venue, slug FROM weddings WHERE user_id = $1 LIMIT 1',
        [userId]
    );
    if (rows.length > 0) {
        const wedding = rows[0];
        // Construct couple_name for the email template
        wedding.couple_name = `${wedding.groom_name} & ${wedding.bride_name}`;
        return wedding;
    }
    return null;
}

// Add a new guest
router.post('/', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, phone, group_name, rsvp_status, dietary_requirements, plus_one } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const rsvp_token = uuidv4();

        const { rows } = await db.query(
            `INSERT INTO guests (user_id, name, email, phone, group_name, rsvp_status, dietary_requirements, plus_one, rsvp_token)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [userId, name, email, phone, group_name, rsvp_status || 'pending', dietary_requirements, plus_one || false, rsvp_token]
        );

        const guest = rows[0];

        // Send invitation email if email is provided
        if (email) {
            const wedding = await getWeddingInfo(userId);
            console.log(`ℹ️ Wedding info for user ${userId}:`, wedding ? 'Found' : 'Not Found');
            if (wedding) {
                console.log(`📧 Triggering invitation email for ${guest.name} (${guest.email})`);
                // Non-blocking email send
                emailService.sendInvitationEmail(guest, wedding)
                    .then(() => console.log(`✅ Email service call completed for ${guest.name}`))
                    .catch(err => console.error('❌ Failed to send invitation email:', err));
            } else {
                console.warn(`⚠️ No wedding found for user ${userId}. Invitation email skipped.`);
            }
        }

        res.status(201).json({ success: true, guest });
    } catch (error) {
        console.error('Error adding guest:', error);
        res.status(500).json({ success: false, error: 'Failed to add guest' });
    }
});

// Update guest details
router.patch('/:id', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updates = req.body;

        const allowedUpdates = ['name', 'email', 'phone', 'group_name', 'rsvp_status', 'dietary_requirements', 'plus_one'];
        const setClauses = [];
        const values = [];
        let index = 1;

        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                setClauses.push(`${key} = $${index}`);
                values.push(updates[key]);
                index++;
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ success: false, error: 'No updates provided' });
        }

        values.push(id, userId);
        const query = `
            UPDATE guests 
            SET ${setClauses.join(', ')}, updated_at = NOW() 
            WHERE id = $${index} AND user_id = $${index + 1}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Guest not found or unauthorized' });
        }

        res.json({ success: true, guest: rows[0] });
    } catch (error) {
        console.error('Error updating guest:', error);
        res.status(500).json({ success: false, error: 'Failed to update guest' });
    }
});

// Reset all guests for the authenticated user
router.delete('/', authMiddleware.verifyToken, async (req, res) => {
    console.log('🗑️ Reset All Guests triggered');
    try {
        const userId = req.user.id;

        const { rowCount } = await db.query(
            'DELETE FROM guests WHERE user_id = $1',
            [userId]
        );

        res.json({
            success: true,
            message: `Successfully deleted all guests (${rowCount})`,
            count: rowCount
        });
    } catch (error) {
        console.error('Error resetting guests:', error);
        res.status(500).json({ success: false, error: 'Failed to reset guest list' });
    }
});

// Delete a guest
router.delete('/:id', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { rowCount } = await db.query(
            'DELETE FROM guests WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Guest not found or unauthorized' });
        }

        res.json({ success: true, message: 'Guest deleted successfully' });
    } catch (error) {
        console.error('Error deleting guest:', error);
        res.status(500).json({ success: false, error: 'Failed to delete guest' });
    }
});

// Bulk add guests (for CSV import)
router.post('/bulk', authMiddleware.verifyToken, async (req, res) => {
    console.log('📥 Received bulk guest import request');
    try {
        const userId = req.user.id;
        const { guests } = req.body;

        if (!guests || !Array.isArray(guests) || guests.length === 0) {
            return res.status(400).json({ success: false, error: 'No guests provided or invalid format' });
        }

        const wedding = await getWeddingInfo(userId);
        const results = [];

        for (const guest of guests) {
            if (!guest.name) continue; // Skip guests without names

            const rsvp_token = uuidv4();

            const { rows } = await db.query(
                `INSERT INTO guests (user_id, name, email, phone, group_name, rsvp_status, dietary_requirements, plus_one, rsvp_token)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [
                    userId,
                    guest.name,
                    guest.email,
                    guest.phone,
                    guest.group_name || null,
                    guest.rsvp_status || 'pending',
                    guest.dietary_requirements || null,
                    guest.plus_one || false,
                    rsvp_token
                ]
            );

            const savedGuest = rows[0];
            results.push(savedGuest);

            // Send invitation email if email is provided
            if (savedGuest.email && wedding) {
                console.log(`📧 Triggering bulk invitation email for ${savedGuest.name} (${savedGuest.email})`);
                emailService.sendInvitationEmail(savedGuest, wedding)
                    .then(() => console.log(`✅ Bulk email sent for ${savedGuest.name}`))
                    .catch(err => console.error(`❌ Failed to send bulk invitation email for ${savedGuest.name}:`, err));
            } else if (savedGuest.email && !wedding) {
                console.warn(`⚠️ No wedding found for user ${userId}. Bulk invitation skipped for ${savedGuest.name}.`);
            }
        }

        res.status(201).json({
            success: true,
            message: `Successfully imported ${results.length} guests and sent invitations.`,
            count: results.length,
            guests: results
        });
    } catch (error) {
        console.error('Error bulk adding guests:', error);
        res.status(500).json({ success: false, error: 'Failed to import guests' });
    }
});

module.exports = router;
