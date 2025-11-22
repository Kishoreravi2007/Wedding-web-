/**
 * Live Event Photo Sync API
 * 
 * Handles real-time photo uploads from desktop apps and provides
 * WebSocket support for live gallery updates.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('../lib/supabase');
const { PhotoDB } = require('../lib/supabase-db');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

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
 * API Key Authentication Middleware
 * Validates Bearer token from Authorization header
 */
async function authenticateApiKey(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Missing or invalid Authorization header. Use: Authorization: Bearer <api_key>' 
      });
    }
    
    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Find the API key in database
    const { data: keyData, error: keyError } = await supabase
      .from('photographer_api_keys')
      .select('*, photographer_id, is_active, expires_at')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();
    
    if (keyError || !keyData) {
      return res.status(401).json({ 
        message: 'Invalid or inactive API key' 
      });
    }
    
    // Check expiration
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return res.status(401).json({ 
        message: 'API key has expired' 
      });
    }
    
    // Update last_used_at
    await supabase
      .from('photographer_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);
    
    // Attach photographer info to request
    req.photographer = {
      id: keyData.photographer_id,
      apiKeyId: keyData.id
    };
    
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
}

/**
 * POST /api/live/uploadPhoto
 * Upload a photo via live sync (from desktop app)
 * 
 * Body (multipart/form-data):
 * - photo: File (binary)
 * - eventId: UUID (optional, can use sister as fallback)
 * - title: string (optional)
 * - description: string (optional)
 * - timestamp: ISO string (optional, defaults to now)
 */
router.post('/uploadPhoto', authenticateApiKey, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No photo file uploaded' 
      });
    }
    
    const { eventId, title, description, timestamp, sister } = req.body;
    const photographerId = req.photographer.id;
    
    // Validate eventId or sister
    let targetSister = sister;
    let targetEventId = eventId || null;
    
    if (eventId) {
      // Verify event exists and photographer has access
      const { data: event, error: eventError } = await supabase
        .from('weddings')
        .select('id, wedding_code, bride_name, groom_name')
        .eq('id', eventId)
        .single();
      
      if (eventError || !event) {
        return res.status(404).json({ 
          message: 'Event not found' 
        });
      }
      
      // Map event to sister if needed (for backwards compatibility)
      // You can extend this logic based on your wedding structure
      if (!targetSister) {
        // Default mapping - adjust based on your data model
        targetSister = 'sister-a'; // or derive from event data
      }
    } else if (sister && ['sister-a', 'sister-b'].includes(sister)) {
      targetSister = sister;
    } else {
      return res.status(400).json({ 
        message: 'Either eventId or sister must be provided' 
      });
    }
    
    const file = req.file;
    const syncTimestamp = timestamp ? new Date(timestamp) : new Date();
    const fileName = `${targetSister}/live/${Date.now()}_${uuidv4()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wedding-photos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading to Supabase Storage:', uploadError);
      return res.status(500).json({ 
        message: 'Error uploading photo to storage',
        error: uploadError.message 
      });
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wedding-photos')
      .getPublicUrl(fileName);
    
    // Create photo record
    const photoData = {
      filename: file.originalname,
      file_path: fileName,
      public_url: publicUrl,
      size: file.size,
      mimetype: file.mimetype,
      sister: targetSister,
      event_id: targetEventId,
      title: title || file.originalname,
      description: description || null,
      event_type: 'live_sync',
      tags: ['live-sync'],
      storage_provider: 'supabase',
      photographer_id: photographerId,
      is_live_sync: true,
      sync_timestamp: syncTimestamp.toISOString(),
      upload_source: 'desktop_app'
    };
    
    const photo = await PhotoDB.create(photoData);
    
    // Emit WebSocket event manually (in case Realtime doesn't catch it immediately)
    // Access io from app.locals if available
    const io = req.app.locals.io;
    if (io) {
      io.to(`event:${targetEventId}`).emit('newPhoto', {
        photo: {
          id: photo.id,
          public_url: photo.public_url,
          filename: photo.filename,
          title: photo.title,
          uploaded_at: photo.uploaded_at || photo.created_at,
          sync_timestamp: photo.sync_timestamp
        },
        eventId: targetEventId
      });
      
      io.to(`sister:${targetSister}`).emit('newPhoto', {
        photo: {
          id: photo.id,
          public_url: photo.public_url,
          filename: photo.filename,
          title: photo.title,
          uploaded_at: photo.uploaded_at || photo.created_at,
          sync_timestamp: photo.sync_timestamp
        },
        sister: targetSister
      });
    }
    
    console.log(`✅ Live sync photo uploaded: ${photo.id} by photographer ${photographerId}`);
    
    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: {
        id: photo.id,
        public_url: photo.public_url,
        filename: photo.filename,
        uploaded_at: photo.uploaded_at || photo.created_at
      },
      eventId: targetEventId,
      sister: targetSister
    });
    
  } catch (error) {
    console.error('Error in live photo upload:', error);
    res.status(500).json({ 
      message: 'Error uploading photo',
      error: error.message 
    });
  }
});

/**
 * GET /api/live/photos
 * Get photos for a specific event
 * 
 * Query params:
 * - eventId: UUID (optional)
 * - sister: string (optional, fallback if no eventId)
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 */
router.get('/photos', async (req, res) => {
  try {
    const { eventId, sister, limit = 50, offset = 0 } = req.query;
    
    let filters = {};
    
    if (eventId) {
      filters.eventId = eventId;
    } else if (sister && ['sister-a', 'sister-b'].includes(sister)) {
      filters.sister = sister;
    } else {
      return res.status(400).json({ 
        message: 'Either eventId or sister must be provided' 
      });
    }
    
    // Build query
    let query = supabase
      .from('photos')
      .select('*')
      .eq('is_live_sync', true)
      .order('sync_timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (eventId) {
      query = query.eq('event_id', eventId);
    } else {
      query = query.eq('sister', sister);
    }
    
    const { data: photos, error } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json({
      photos: photos || [],
      count: photos?.length || 0,
      eventId: eventId || null,
      sister: sister || null
    });
    
  } catch (error) {
    console.error('Error fetching live photos:', error);
    res.status(500).json({ 
      message: 'Error fetching photos',
      error: error.message 
    });
  }
});

/**
 * POST /api/live/api-keys
 * Generate a new API key for the authenticated photographer
 * 
 * Requires: Regular JWT authentication (not API key)
 */
router.post('/api-keys', async (req, res) => {
  try {
    // This endpoint should use regular JWT auth, not API key auth
    // For now, we'll accept photographer_id in body (should be from JWT in production)
    const { photographerId, keyName } = req.body;
    
    if (!photographerId) {
      return res.status(400).json({ 
        message: 'photographerId is required' 
      });
    }
    
    // Generate secure API key
    const apiKey = `ww_${crypto.randomBytes(24).toString('base64url')}`;
    
    // Store in database
    const { data: keyData, error: keyError } = await supabase
      .from('photographer_api_keys')
      .insert([{
        photographer_id: photographerId,
        api_key: apiKey,
        key_name: keyName || 'Desktop App',
        is_active: true
      }])
      .select()
      .single();
    
    if (keyError) {
      throw keyError;
    }
    
    res.status(201).json({
      message: 'API key created successfully',
      apiKey: apiKey, // Only returned once - store securely!
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
 * List all API keys for the authenticated photographer
 */
router.get('/api-keys', async (req, res) => {
  try {
    const { photographerId } = req.query;
    
    if (!photographerId) {
      return res.status(400).json({ 
        message: 'photographerId is required' 
      });
    }
    
    const { data: keys, error } = await supabase
      .from('photographer_api_keys')
      .select('id, key_name, is_active, last_used_at, created_at, expires_at')
      .eq('photographer_id', photographerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
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
 * Revoke an API key
 */
router.delete('/api-keys/:keyId', async (req, res) => {
  try {
    const { keyId } = req.params;
    const { photographerId } = req.query; // Should come from JWT in production
    
    if (!photographerId) {
      return res.status(400).json({ 
        message: 'photographerId is required' 
      });
    }
    
    const { error } = await supabase
      .from('photographer_api_keys')
      .delete()
      .eq('id', keyId)
      .eq('photographer_id', photographerId);
    
    if (error) {
      throw error;
    }
    
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

