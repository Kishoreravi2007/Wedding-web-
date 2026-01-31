const express = require('express');
const router = express.Router();
const db = require('../lib/db-gcp');
const { authMiddleware } = require('../lib/secure-auth');

// Get all timeline events for the authenticated user
router.get('/', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            'SELECT * FROM event_timeline WHERE user_id = $1 ORDER BY event_date ASC, event_time ASC',
            [userId]
        );
        res.json({ success: true, timeline: rows });
    } catch (error) {
        console.error('Error fetching timeline:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch timeline' });
    }
});

// Add a new timeline event
router.post('/', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { event_date, event_time, title, description, location, location_map_url, sort_order } = req.body;

        if (!event_time || !title) {
            return res.status(400).json({ success: false, error: 'Time and title are required' });
        }

        const { rows } = await db.query(
            `INSERT INTO event_timeline (user_id, event_date, event_time, title, description, location, location_map_url, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userId, event_date, event_time, title, description, location, location_map_url, sort_order || 0]
        );

        res.status(201).json({ success: true, event: rows[0] });
    } catch (error) {
        console.error('Error adding timeline event:', error);
        res.status(500).json({ success: false, error: 'Failed to add timeline event' });
    }
});

// Update timeline event
router.patch('/:id', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updates = req.body;

        const allowedUpdates = ['event_date', 'event_time', 'title', 'description', 'location', 'location_map_url', 'sort_order'];
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
            UPDATE event_timeline 
            SET ${setClauses.join(', ')} 
            WHERE id = $${index} AND user_id = $${index + 1}
            RETURNING *
        `;

        const { rows } = await db.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Event not found or unauthorized' });
        }

        res.json({ success: true, event: rows[0] });
    } catch (error) {
        console.error('Error updating timeline event:', error);
        res.status(500).json({ success: false, error: 'Failed to update event' });
    }
});

// Delete a timeline event
router.delete('/:id', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { rowCount } = await db.query(
            'DELETE FROM event_timeline WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Event not found or unauthorized' });
        }

        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting timeline event:', error);
        res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
});

// Get timeline for public wedding page via slug (username)
router.get('/public/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log(`[Timeline] Fetching public timeline for slug: ${slug}`);
        const { rows } = await db.query(
            `SELECT t.*, u.username FROM event_timeline t
             JOIN users u ON t.user_id = u.id
             WHERE u.username ILIKE $1
             ORDER BY t.event_date ASC, t.event_time ASC`,
            [`${slug}%`]
        );
        console.log(`[Timeline] Found ${rows.length} events for slug: ${slug}`);
        res.json({ success: true, timeline: rows });
    } catch (error) {
        console.error('Error fetching public timeline:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch timeline' });
    }
});

module.exports = router;
