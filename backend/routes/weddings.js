const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../lib/db-gcp');
const authenticateApiKey = require('../middleware/apiKeyAuth');

// =====================================================
// GET ALL WEDDINGS
// =====================================================
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const authHeader = req.headers.authorization;

    // Check if it's a photographer using an API key
    if (authHeader && authHeader.startsWith('Bearer ww_')) {
      return authenticateApiKey(req, res, async () => {
        const weddingId = req.photographer.weddingId;

        if (!weddingId) {
          return res.json({ success: true, weddings: [], count: 0 });
        }

        const { rows } = await query('SELECT * FROM weddings WHERE id = $1', [weddingId]);
        return res.json({
          success: true,
          weddings: rows,
          count: rows.length
        });
      });
    }

    // Default admin/client behavior (no filtering by photographer)
    let sql = 'SELECT * FROM weddings';
    const params = [];

    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
    }

    sql += ' ORDER BY wedding_date DESC';

    const { rows } = await query(sql, params);

    res.json({
      success: true,
      weddings: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching weddings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// =====================================================
// GET WEDDING BY ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query('SELECT * FROM weddings WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }

    res.json({
      success: true,
      wedding: rows[0]
    });
  } catch (error) {
    console.error('Error fetching wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// GET WEDDING BY CODE
// =====================================================
router.get('/code/:weddingCode', async (req, res) => {
  try {
    const { weddingCode } = req.params;

    const { rows } = await query('SELECT * FROM weddings WHERE wedding_code = $1', [weddingCode]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }

    res.json({
      success: true,
      wedding: rows[0]
    });
  } catch (error) {
    console.error('Error fetching wedding by code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// GET WEDDING STATISTICS
// =====================================================
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    // We can use individual counts or a more complex query since RPC isn't available
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM photos WHERE wedding_id = $1) as total_photos,
        (SELECT COUNT(*) FROM people p JOIN users u ON p.id::text = u.id::text WHERE u.wedding_id = $1) as total_people,
        (SELECT COUNT(*) FROM wishes WHERE wedding_id = $1) as total_wishes,
        (SELECT COALESCE(SUM(size), 0) / (1024 * 1024) FROM photos WHERE wedding_id = $1) as storage_used_mb
    `;

    const { rows } = await query(statsQuery, [id]);

    res.json({
      success: true,
      stats: rows[0] || {
        total_photos: 0,
        total_people: 0,
        total_wishes: 0,
        storage_used_mb: 0
      }
    });
  } catch (error) {
    console.error('Error fetching wedding stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// CREATE NEW WEDDING
// =====================================================
router.post('/', async (req, res) => {
  try {
    const {
      wedding_code,
      bride_name,
      groom_name,
      wedding_date,
      wedding_month,
      venue,
      venue_address,
      package_type,
      status,
      theme_color,
      contact_email,
      contact_phone,
      enable_photo_booth,
      enable_face_recognition,
      enable_wishes,
      enable_live_stream
    } = req.body;

    if (!wedding_code || (!bride_name && !groom_name)) {
      return res.status(400).json({
        success: false,
        error: 'wedding_code and at least one of bride_name or groom_name are required'
      });
    }

    const insertSql = `
      INSERT INTO weddings (
        wedding_code, bride_name, groom_name, wedding_date, wedding_month,
        venue, venue_address, package_type, status, theme_color,
        contact_email, contact_phone, enable_photo_booth,
        enable_face_recognition, enable_wishes, enable_live_stream, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *
    `;

    const values = [
      wedding_code, bride_name, groom_name, wedding_date, wedding_month,
      venue, venue_address, package_type || 'basic', status || 'upcoming',
      theme_color || '#ff6b9d', contact_email, contact_phone,
      enable_photo_booth !== false, enable_face_recognition !== false,
      enable_wishes !== false, enable_live_stream || false
    ];

    const { rows } = await query(insertSql, values);

    res.status(201).json({
      success: true,
      message: 'Wedding created successfully',
      wedding: rows[0]
    });
  } catch (error) {
    console.error('Error creating wedding:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Wedding code already exists' });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// UPDATE WEDDING
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const allowedFields = [
      'wedding_code', 'bride_name', 'groom_name', 'wedding_date', 'wedding_month',
      'venue', 'venue_address', 'package_type', 'status', 'theme_color',
      'contact_email', 'contact_phone', 'enable_photo_booth',
      'enable_face_recognition', 'enable_wishes', 'enable_live_stream'
    ];

    const updates = [];
    const values = [id];
    let index = 2;

    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${index++}`);
        values.push(body[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    const sql = `UPDATE weddings SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const { rows } = await query(sql, values);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Wedding not found' });
    }

    res.json({
      success: true,
      message: 'Wedding updated successfully',
      wedding: rows[0]
    });
  } catch (error) {
    console.error('Error updating wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// DELETE WEDDING
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { PhotoDB } = require('../lib/sql-db');

    // Initialize storage provider for file deletion
    const storageProvider = process.env.STORAGE_PROVIDER || 'supabase';
    let storage;
    try {
      if (storageProvider === 'gcs') {
        storage = require('../lib/gcs-storage');
      } else if (storageProvider === 'local') {
        storage = require('../lib/local-storage');
      } else {
        storage = require('../lib/supabase-storage');
      }
    } catch (err) {
      console.warn('Fallback to supabase storage for delete op');
      storage = require('../lib/supabase-storage');
    }
    const { deleteFile } = storage;

    // 1. Fetch all photos for this wedding
    const photos = await PhotoDB.findAll({ weddingId: id, limit: 10000 });
    console.log(`🗑️ Processing cascading delete for wedding ${id}. Found ${photos.length} photos.`);

    // 2. Delete physical files
    for (const photo of photos) {
      if (photo.file_path) {
        try {
          await deleteFile(photo.file_path);
        } catch (fileErr) {
          console.error(`Failed to delete file ${photo.file_path}:`, fileErr.message);
          // Continue deletion despite file error
        }
      }
    }

    // 3. Delete wedding record (CASCADE will handle photos, people, wishes rows)
    // Note: We depend on ON DELETE CASCADE in the schema for the rows.
    const { rowCount } = await query('DELETE FROM weddings WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Wedding not found' });
    }

    res.json({
      success: true,
      message: `Wedding and ${photos.length} photos deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// ARCHIVE WEDDING
// =====================================================
router.post('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query(
      'UPDATE weddings SET status = $1 WHERE id = $2 RETURNING *',
      ['archived', id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Wedding not found' });
    }

    res.json({
      success: true,
      message: 'Wedding archived successfully',
      wedding: rows[0]
    });
  } catch (error) {
    console.error('Error archiving wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// GET UPCOMING WEDDINGS (Public)
// =====================================================
router.get('/public/upcoming', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT wedding_code, bride_name, groom_name, wedding_date, wedding_month, theme_color 
       FROM weddings 
       WHERE status IN ($1, $2) 
       ORDER BY wedding_date ASC`,
      ['active', 'upcoming']
    );

    res.json({
      success: true,
      weddings: rows
    });
  } catch (error) {
    console.error('Error fetching upcoming weddings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// GENERATE/GET PHOTOGRAPHER CREDENTIALS
// =====================================================
router.post('/:id/photographer', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get wedding details
    const { rows: weddingRows } = await query('SELECT * FROM weddings WHERE id = $1', [id]);
    if (weddingRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Wedding not found' });
    }
    const wedding = weddingRows[0];

    // 2. Generate credentials
    // Username: photo_[wedding_code] (cleaned)
    const baseCode = wedding.wedding_code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
    const username = `photo_${baseCode}`;
    const password = crypto.randomBytes(4).toString('hex'); // 8 characters

    // 3. Hash password for auth
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create/Update User
    // We use a specific prefix to avoid collision, or just rely on the username
    const userResult = await query(`
      INSERT INTO users (username, password, role, wedding_id, is_active, created_at)
      VALUES ($1, $2, 'photographer', $3, true, NOW())
      ON CONFLICT (username) DO UPDATE 
      SET password = EXCLUDED.password,
          wedding_id = EXCLUDED.wedding_id,
          updated_at = NOW()
      RETURNING id
    `, [username, hashedPassword, id]);

    // 5. Store plaintext credentials in weddings table for display
    await query(`
      UPDATE weddings 
      SET photographer_username = $1, 
          photographer_password = $2 
      WHERE id = $3
    `, [username, password, id]);

    res.json({
      success: true,
      credentials: {
        username,
        password
      },
      message: 'Photographer credentials generated successfully'
    });

  } catch (error) {
    console.error('Error generating photographer credentials:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
