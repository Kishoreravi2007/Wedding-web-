const express = require('express');
const router = express.Router();
const db = require('../lib/db-gcp');
const { authMiddleware } = require('../lib/secure-auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/timeline');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5005';

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
// Add event
router.post('/', authMiddleware.verifyToken, upload.single('photo'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { event_date, event_time, title, description, location, location_map_url, sort_order } = req.body;

        let photo_url = req.body.photo_url || null;
        if (req.file) {
            photo_url = `${API_BASE_URL}/uploads/timeline/${req.file.filename}`;
        }

        if (!event_time || !title) {
            return res.status(400).json({ success: false, error: 'Time and title are required' });
        }

        const { rows } = await db.query(
            `INSERT INTO event_timeline (user_id, event_date, event_time, title, description, location, location_map_url, photo_url, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [userId, event_date, event_time, title, description, location, location_map_url, photo_url, sort_order || 0]
        );

        res.status(201).json({ success: true, event: rows[0] });
    } catch (error) {
        console.error('Error adding timeline event:', error);
        res.status(500).json({ success: false, error: 'Failed to add timeline event' });
    }
});

// Update timeline event
router.patch('/:id', authMiddleware.verifyToken, upload.single('photo'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updates = req.body;

        console.log('PATCH /timeline/:id - Payload:', {
            id,
            file: req.file ? req.file.filename : 'none',
            body: updates
        });

        if (req.file) {
            updates.photo_url = `${API_BASE_URL}/uploads/timeline/${req.file.filename}`;
        }

        const allowedUpdates = ['event_date', 'event_time', 'title', 'description', 'location', 'location_map_url', 'photo_url', 'sort_order'];
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

        console.log('Update query clauses:', setClauses);

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
