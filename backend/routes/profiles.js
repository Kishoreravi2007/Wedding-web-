const express = require('express');
const router = express.Router();
const multer = require('multer');
const { query } = require('../lib/db-gcp');
const { authMiddleware } = require('../lib/secure-auth');
const authenticateToken = authMiddleware.verifyToken;

// Load storage provider
const storageProvider = process.env.STORAGE_PROVIDER || 'supabase';
let storage;
try {
    if (storageProvider === 'gcs') storage = require('../lib/gcs-storage');
    else if (storageProvider === 'local') storage = require('../lib/local-storage');
    else storage = require('../lib/supabase-storage');
} catch (err) {
    storage = require('../lib/supabase-storage');
}
const { uploadFile } = storage;

// Multer config for avatar
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * GET /api/profiles
 * List all profiles
 */
router.get('/', async (req, res) => {
    try {
        const { rows } = await query('SELECT * FROM profiles ORDER BY full_name');
        res.json({ profiles: rows });
    } catch (error) {
        console.error('Error listing profiles:', error);
        res.status(500).json({ message: 'Error listing profiles', error: error.message });
    }
});

/**
 * POST /api/profiles
 * Create or update a user profile
 */
// router.post('/', authenticateToken, ... (rest of the file remains same)
/**
 * POST /api/profiles/upload
 * Upload profile avatar
 */
router.post('/upload', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const userId = req.user.id;
        const fileName = `avatars/${userId}_${Date.now()}_${req.file.originalname}`;

        const publicUrl = await uploadFile('profiles', fileName, req.file.buffer, req.file.mimetype);

        // Update profile with new avatar_url
        const updateQuery = 'UPDATE profiles SET avatar_url = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *';
        const { rows } = await query(updateQuery, [publicUrl, userId]);

        res.json({
            message: 'Avatar updated successfully',
            avatar_url: publicUrl,
            profile: rows[0]
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Error uploading avatar', error: error.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { full_name, location, bio, avatar_url, email } = req.body;
        const user_id = req.user.id; // Use authenticated ID from token

        if (!user_id || !email) {
            return res.status(400).json({ message: 'User ID and email are required' });
        }

        // Check if profile exists by user_id
        const checkQuery = 'SELECT id FROM profiles WHERE user_id = $1 OR email = $2';
        const { rows: existing } = await query(checkQuery, [user_id, email]);

        let result;
        if (existing.length > 0) {
            // Update the existing profile (use the authenticated user_id)
            const updateQuery = `
        UPDATE profiles 
        SET full_name = $2, location = $3, bio = $4, avatar_url = $5, email = $6, updated_at = NOW(), user_id = $1
        WHERE id = $7
        RETURNING *
      `;
            const { rows } = await query(updateQuery, [user_id, full_name, location, bio, avatar_url, email, existing[0].id]);
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
            // Return a default profile instead of 404 for a better UX
            return res.json({
                user_id: userId,
                full_name: 'Guest User',
                location: 'Not specified',
                bio: 'Welcome! Click Edit Profile to tell your story.',
                avatar_url: null,
                is_default: true
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Error getting profile', error: error.message });
    }
});

module.exports = router;
