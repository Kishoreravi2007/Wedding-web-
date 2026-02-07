const express = require('express');
const router = express.Router();
const { query } = require('../lib/db-gcp');
const { authMiddleware } = require('../lib/secure-auth');

// Initialize table
const initTable = async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                text TEXT NOT NULL,
                is_approved BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Reviews table checked/created');
    } catch (err) {
        console.error('❌ Error initializing reviews table:', err);
    }
};
initTable();

// GET Public Reviews
router.get('/', async (req, res) => {
    try {
        // limit 3 for the landing page, or more if we have a carousel
        // Join with profiles/users to get names
        const result = await query(`
            SELECT r.*, p.full_name, p.partner_name, u.email 
            FROM reviews r
            JOIN users u ON r.user_id::text = u.id::text
            LEFT JOIN profiles p ON u.id::text = p.user_id::text
            WHERE r.is_approved = TRUE
            ORDER BY r.created_at DESC
            LIMIT 6
        `);

        // Format for frontend
        const reviews = result.rows.map(row => {
            let displayName = row.full_name || row.email.split('@')[0];
            if (row.partner_name) {
                displayName = `${displayName} & ${row.partner_name}`;
            }
            return {
                id: row.id,
                name: displayName,
                event: 'Verified Customer', // Generic or could fetch wedding date
                text: row.text,
                rating: row.rating
            };
        });

        res.json({ success: true, reviews });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// POST Review (Auth Required)
router.post('/', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { rating, text } = req.body;
        const userId = req.user.id;

        if (!rating || !text) {
            return res.status(400).json({ success: false, error: 'Rating and text required' });
        }

        const result = await query(
            'INSERT INTO reviews (user_id, rating, text) VALUES ($1, $2, $3) RETURNING *',
            [userId, rating, text]
        );

        res.json({ success: true, review: result.rows[0] });
    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

module.exports = router;
