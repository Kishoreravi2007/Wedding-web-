const express = require('express');
const router = express.Router();
const db = require('../lib/db-gcp');
const { authMiddleware } = require('../lib/secure-auth');
const emailService = require('../services/email-service');
const whatsappService = require('../services/whatsapp-service');
const { v4: uuidv4 } = require('uuid');

// Get all guests for the authenticated user
router.use((req, res, next) => {
    console.log(`📡 Guests Router: ${req.method} ${req.path}`);
    next();
});

// Helper function to recalculate and update guest count
async function updateGuestCount(userId) {
    try {
        const { rows: countRows } = await db.query(
            `SELECT COUNT(*) as count FROM guests 
             WHERE user_id = $1 AND rsvp_status = 'attending'`,
            [userId]
        );
        const attendingCount = parseInt(countRows[0].count, 10);

        await db.query(
            'UPDATE weddings SET guest_count = $1, updated_at = NOW() WHERE user_id = $2',
            [attendingCount, userId]
        );
        console.log(`📊 Guest count updated to ${attendingCount} for user ${userId}`);
        return attendingCount;
    } catch (error) {
        console.error('Error updating guest count:', error);
        return null;
    }
}


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
        if (email || phone) {
            const wedding = await getWeddingInfo(userId);
            console.log(`ℹ️ Wedding info for user ${userId}:`, wedding ? 'Found' : 'Not Found');

            if (wedding) {
                // Handle Email
                if (email) {
                    console.log(`📧 Triggering invitation email for ${guest.name} (${guest.email})`);
                    emailService.sendInvitationEmail(guest, wedding)
                        .then(() => console.log(`✅ Email service call completed for ${guest.name}`))
                        .catch(err => console.error('❌ Failed to send invitation email:', err));
                }

                // Handle WhatsApp
                if (phone) {
                    console.log(`💬 Triggering WhatsApp invitation for ${guest.name} (${guest.phone})`);
                    whatsappService.sendInvitation(guest, wedding)
                        .then(() => console.log(`✅ WhatsApp service call completed for ${guest.name}`))
                        .catch(err => console.error('❌ Failed to send WhatsApp invitation:', err));
                }
            } else {
                console.warn(`⚠️ No wedding found for user ${userId}. Invitations skipped.`);
            }
        }

        // Update guest count if the new guest is attending
        if (rsvp_status === 'attending') {
            await updateGuestCount(userId);
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

        // Update guest count if RSVP status was changed
        if (updates.rsvp_status !== undefined) {
            await updateGuestCount(userId);
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

        // Reset guest count to 0
        await updateGuestCount(userId);

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

        // Recalculate guest count after deletion
        await updateGuestCount(userId);

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

            // Send invitation if contact info is provided
            if (wedding && (savedGuest.email || savedGuest.phone)) {
                console.log(`📩 Triggering invitations for ${savedGuest.name}`);

                if (savedGuest.email) {
                    emailService.sendInvitationEmail(savedGuest, wedding)
                        .then(() => console.log(`✅ Bulk email sent for ${savedGuest.name}`))
                        .catch(err => console.error(`❌ Failed to send bulk invitation email for ${savedGuest.name}:`, err));
                }

                if (savedGuest.phone) {
                    whatsappService.sendInvitation(savedGuest, wedding)
                        .then(() => console.log(`✅ Bulk WhatsApp sent for ${savedGuest.name}`))
                        .catch(err => console.error(`❌ Failed to send bulk WhatsApp for ${savedGuest.name}:`, err));
                }
            } else if (!wedding && (savedGuest.email || savedGuest.phone)) {
                console.warn(`⚠️ No wedding found for user ${userId}. Bulk invitations skipped for ${savedGuest.name}.`);
            }
        }

        // Recalculate guest count after bulk import
        await updateGuestCount(userId);

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

// Send WhatsApp invitation manually
router.post('/:id/send-whatsapp', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { rows: guestRows } = await db.query(
            'SELECT * FROM guests WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (guestRows.length === 0) {
            return res.status(404).json({ success: false, error: 'Guest not found' });
        }

        const guest = guestRows[0];
        if (!guest.phone) {
            return res.status(400).json({ success: false, error: 'Guest does not have a phone number' });
        }

        const wedding = await getWeddingInfo(userId);
        if (!wedding) {
            return res.status(404).json({ success: false, error: 'Wedding info not found' });
        }

        const result = await whatsappService.sendInvitation(guest, wedding);
        if (result.success) {
            res.json({ success: true, message: 'WhatsApp invitation sent successfully' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        res.status(500).json({ success: false, error: 'Failed to send WhatsApp invitation' });
    }
});

// Send WhatsApp invitation to all guests
router.post('/send-whatsapp-all', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all guests with phone numbers for this user
        const { rows: guests } = await db.query(
            'SELECT * FROM guests WHERE user_id = $1 AND phone IS NOT NULL AND phone != \'\'',
            [userId]
        );

        if (guests.length === 0) {
            return res.status(404).json({ success: false, error: 'No guests with phone numbers found' });
        }

        const wedding = await getWeddingInfo(userId);
        if (!wedding) {
            return res.status(404).json({ success: false, error: 'Wedding info not found' });
        }

        // Send invitations (Non-blocking as it might take time for many guests)
        // Note: WhatsApp might flag rapid-fire messages as spam, so we introduce small delays
        const sendInvitations = async () => {
            console.log(`📣 Starting bulk WhatsApp invitations for ${guests.length} guests...`);
            let count = 0;
            for (const guest of guests) {
                try {
                    // Small delay to be safe (500ms between messages)
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const result = await whatsappService.sendInvitation(guest, wedding);
                    if (result.success) count++;
                } catch (err) {
                    console.error(`❌ Bulk WhatsApp failed for ${guest.name}:`, err.message);
                }
            }
            console.log(`✅ Bulk WhatsApp completed. Sent ${count}/${guests.length} messages.`);
        };

        // Start the background process
        sendInvitations();

        res.json({
            success: true,
            message: `Starting to send WhatsApp invitations to ${guests.length} guests in the background.`,
            count: guests.length
        });
    } catch (error) {
        console.error('Error in bulk WhatsApp:', error);
        res.status(500).json({ success: false, error: 'Failed to trigger bulk WhatsApp invitations' });
    }
});

module.exports = router;
