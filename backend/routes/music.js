
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../lib/local-storage');
const { authMiddleware } = require('../lib/secure-auth');
const authenticateToken = authMiddleware.verifyToken;

// Multer Config
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit for audio
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|m4a|ogg)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed (MP3, WAV, M4A, OGG)'));
        }
    }
});

/**
 * POST /api/music/upload
 * Upload a music file
 */
router.post('/upload', authenticateToken, upload.single('music'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No music file uploaded' });
        }

        const { sister } = req.body;
        if (!sister) {
            return res.status(400).json({ message: 'Sister (wedding slug) required' });
        }

        const file = req.file;
        const timestamp = Date.now();
        const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const destination = `music/${sister}/${timestamp}_${cleanFileName}`;

        const publicUrl = await uploadFile(destination, file.buffer, file.mimetype);

        res.status(201).json({
            success: true,
            message: 'Music uploaded successfully',
            url: publicUrl,
            filename: cleanFileName
        });

    } catch (error) {
        console.error('Music upload error:', error);
        res.status(500).json({
            message: 'Error uploading music',
            error: error.message
        });
    }
});

module.exports = router;
