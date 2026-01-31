const express = require('express');
const router = express.Router();
const db = require('../lib/db-gcp');
const { authMiddleware } = require('../lib/secure-auth');

// Get all guests for the authenticated user
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

// Add a new guest
router.post('/', authMiddleware.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, phone, group_name, rsvp_status, dietary_requirements, plus_one } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const { rows } = await db.query(
            `INSERT INTO guests (user_id, name, email, phone, group_name, rsvp_status, dietary_requirements, plus_one)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userId, name, email, phone, group_name, rsvp_status || 'pending', dietary_requirements, plus_one || false]
        );

        res.status(201).json({ success: true, guest: rows[0] });
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

module.exports = router;
