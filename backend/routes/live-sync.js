/**
 * Live Event Photo Sync API - SQL/GCS Version
 * 
 * Handles real-time photo uploads from desktop apps and provides
 * support for live gallery updates.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { query } = require('../lib/db-gcp');
const { PhotoDB } = require('../lib/sql-db');
const { uploadFile } = require('../lib/gcs-storage');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const path = require('path');
const authenticateApiKey = require('../middleware/apiKeyAuth');

// Multer configuration for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for live sync
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|heic|heif|raw|cr2|nef|arw)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * POST /api/live/uploadPhoto
 */
router.post('/uploadPhoto', authenticateApiKey, upload.single('photo'), async (req, res) => {
  try {
    const { eventId, sister, timestamp } = req.body;
    const photographerId = req.photographer.id;
    const weddingId = req.photographer.weddingId;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No photo file provided' });
    }

    const photoId = uuidv4();
    const fileName = `${photoId}${path.extname(req.file.originalname)}`;
    const destination = `photos/${weddingId}/${fileName}`;

    // Upload to GCS
    const publicUrl = await uploadFile(destination, req.file.buffer, req.file.mimetype);

    // Save to SQL Database
    const photoData = {
      id: photoId,
      filename: req.file.originalname,
      file_path: destination,
      public_url: publicUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
      is_live_sync: true,
      sync_timestamp: timestamp || new Date().toISOString(),
      upload_source: 'live_sync',
      event_type: 'live_sync',
      uploaded_at: new Date().toISOString(),
      photographer_id: photographerId,
      wedding_id: weddingId,
      sister: sister || 'none'
    };

    await PhotoDB.create(photoData);

    // WebSocket notification logic
    const io = req.app.locals.io;
    if (io) {
      const socketPayload = {
        photo: {
          id: photoId,
          public_url: publicUrl,
          filename: req.file.originalname,
          uploaded_at: photoData.uploaded_at,
          sync_timestamp: photoData.sync_timestamp
        },
        weddingId: weddingId,
        sister: photoData.sister,
        eventId: eventId || null
      };

      // Emit to wedding room and sister room
      io.to(`wedding:${weddingId}`).emit('newPhoto', socketPayload);
      if (sister && sister !== 'none') io.to(`sister:${sister}`).emit('newPhoto', socketPayload);
      if (eventId) io.to(`event:${eventId}`).emit('newPhoto', socketPayload);
    }

    res.status(201).json({
      success: true,
      message: 'Photo uploaded and synced successfully',
      photo: {
        id: photoId,
        public_url: publicUrl
      }
    });

  } catch (error) {
    console.error('Live upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/live/photos
 */
router.get('/photos', authenticateApiKey, async (req, res) => {
  try {
    const { eventId, sister, limit = 50, offset = 0 } = req.query;
    const weddingId = req.photographer.weddingId;

    if (!weddingId && !sister) {
      return res.status(400).json({ message: 'Either wedding context or sister must be provided' });
    }

    // Filter by wedding_id OR sister
    let sql = 'SELECT * FROM photos WHERE is_live_sync = true';
    const params = [];
    let paramIndex = 1;

    if (weddingId) {
      sql += ` AND (wedding_id = $${paramIndex++} OR sister = $${paramIndex++})`;
      params.push(weddingId, sister || 'none');
    } else if (sister) {
      sql += ` AND sister = $${paramIndex++}`;
      params.push(sister);
    }

    // Order and Pagination
    sql += ` ORDER BY sync_timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));

    const { rows: photos } = await query(sql, params);

    res.json({
      success: true,
      photos: photos || [],
      count: photos.length
    });

  } catch (error) {
    console.error('Error fetching live photos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/live/api-keys
 */
router.post('/api-keys', async (req, res) => {
  try {
    const { photographerId, keyName } = req.body;

    if (!photographerId) {
      return res.status(400).json({
        message: 'photographerId is required'
      });
    }

    const apiKey = `ww_${crypto.randomBytes(24).toString('base64url')}`;

    const { rows } = await query(
      'INSERT INTO photographer_api_keys (photographer_id, api_key, key_name) VALUES ($1, $2, $3) RETURNING *',
      [photographerId, apiKey, keyName || 'Desktop App']
    );

    const keyData = rows[0];

    res.status(201).json({
      message: 'API key created successfully',
      apiKey: apiKey,
      keyId: keyData.id,
      keyName: keyData.key_name,
      createdAt: keyData.created_at
    });

  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      message: 'Error creating API key',
      error: error.message
    });
  }
});

/**
 * GET /api/live/api-keys
 */
router.get('/api-keys', async (req, res) => {
  try {
    const { photographerId } = req.query;

    if (!photographerId) {
      return res.status(400).json({
        message: 'photographerId is required'
      });
    }

    const { rows: keys } = await query(
      'SELECT id, key_name, is_active, last_used_at, created_at, expires_at FROM photographer_api_keys WHERE photographer_id = $1 ORDER BY created_at DESC',
      [photographerId]
    );

    res.json({
      keys: keys || []
    });

  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      message: 'Error fetching API keys',
      error: error.message
    });
  }
});

/**
 * DELETE /api/live/api-keys/:keyId
 */
router.delete('/api-keys/:keyId', async (req, res) => {
  try {
    const { keyId } = req.params;
    const { photographerId } = req.query;

    if (!photographerId) {
      return res.status(400).json({
        message: 'photographerId is required'
      });
    }

    await query(
      'DELETE FROM photographer_api_keys WHERE id = $1 AND photographer_id = $2',
      [keyId, photographerId]
    );

    res.json({
      message: 'API key revoked successfully'
    });

  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({
      message: 'Error revoking API key',
      error: error.message
    });
  }
});

module.exports = router;
