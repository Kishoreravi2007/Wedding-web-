/**
 * Admin Setup Endpoint
 * Creates essential admin/photographer users via API
 * This is a one-time setup endpoint
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../lib/db-gcp');

// Secret key to protect this endpoint
const SETUP_SECRET = process.env.SETUP_SECRET || 'wedding-setup-2024';

router.post('/setup-users', async (req, res) => {
    try {
        const { secret } = req.body;

        // Verify secret
        if (secret !== SETUP_SECRET) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const results = [];

        // Create photographer user
        const photographerPassword = await bcrypt.hash('photo123', 10);

        const photographerResult = await query(`
      INSERT INTO users (username, password_hash, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
      RETURNING id, username, role
    `, ['photographer', photographerPassword, 'photographer', true]);

        results.push({
            user: 'photographer',
            action: photographerResult.rows.length > 0 ? 'created/updated' : 'already exists',
            data: photographerResult.rows[0]
        });

        // Create couple user (phsv)
        const couplePassword = await bcrypt.hash('123@qwerty', 10);

        const coupleResult = await query(`
      INSERT INTO users (username, password_hash, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
      RETURNING id, username, role
    `, ['phsv', couplePassword, 'couple', true]);

        results.push({
            user: 'phsv',
            action: coupleResult.rows.length > 0 ? 'created/updated' : 'already exists',
            data: coupleResult.rows[0]
        });

        res.json({
            success: true,
            message: 'Users created/updated successfully',
            results,
            credentials: [
                { username: 'photographer', password: 'photo123', url: '/photographer-login' },
                { username: 'phsv', password: '123@qwerty', url: '/couple-login' }
            ]
        });

    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({
            error: 'Setup failed',
            details: error.message
        });
    }
});

module.exports = router;
