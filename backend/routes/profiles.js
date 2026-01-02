/**
 * Profile API
 * 
 * Handles user profile operations using Cloud SQL.
 */

const express = require('express');
const router = express.Router();
const { query } = require('../lib/db-gcp');

/**
 * POST /api/profiles
 * Create or update a user profile
 */
router.post('/', async (req, res) => {
    try {
        const { user_id, full_name, location, bio, avatar_url, email } = req.body;

        if (!user_id || !email) {
            return res.status(400).json({ message: 'User ID and email are required' });
        }

        // Check if profile exists
        const checkQuery = 'SELECT id FROM profiles WHERE user_id = $1';
        const { rows: existing } = await query(checkQuery, [user_id]);

        let result;
        if (existing.length > 0) {
            // Update
            const updateQuery = `
        UPDATE profiles 
        SET full_name = $2, location = $3, bio = $4, avatar_url = $5, email = $6, updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `;
            const { rows } = await query(updateQuery, [user_id, full_name, location, bio, avatar_url, email]);
            result = rows[0];
        } else {
            // Insert
            const insertQuery = `
        INSERT INTO profiles (user_id, full_name, location, bio, avatar_url, email, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
            const { rows } = await query(insertQuery, [user_id, full_name, location, bio, avatar_url, email]);
            result = rows[0];
        }

        res.json(result);
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ message: 'Error saving profile', error: error.message });
    }
});

/**
 * GET /api/profiles/:userId
 * Get profile by user ID
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { rows } = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Error getting profile', error: error.message });
    }
});

module.exports = router;
