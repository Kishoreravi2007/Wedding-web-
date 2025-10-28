/**
 * Auto Face Detection API Routes
 * 
 * API endpoints for automated face detection processing
 */

const express = require('express');
const router = express.Router();
const autoFaceProcessor = require('../services/auto-face-processor');

/**
 * GET /api/auto-face-detection/unprocessed
 * Get list of photos that need face detection
 */
router.get('/unprocessed', async (req, res) => {
  try {
    const result = await autoFaceProcessor.getUnprocessedPhotosList();
    res.json(result);
  } catch (error) {
    console.error('Error getting unprocessed photos:', error);
    res.status(500).json({
      message: 'Failed to get unprocessed photos',
      error: error.message
    });
  }
});

/**
 * GET /api/auto-face-detection/status
 * Get current processing status and stats
 */
router.get('/status', async (req, res) => {
  try {
    const unprocessed = await autoFaceProcessor.checkUnprocessedPhotos();
    const stats = autoFaceProcessor.getStats();

    res.json({
      unprocessedCount: unprocessed.length,
      needsProcessing: unprocessed.length > 0,
      stats: stats,
      unprocessedPhotos: unprocessed.slice(0, 10).map(p => ({
        id: p.id,
        filename: p.filename,
        sister: p.sister
      }))
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({
      message: 'Failed to get status',
      error: error.message
    });
  }
});

/**
 * POST /api/auto-face-detection/record
 * Record processing completion from frontend
 */
router.post('/record', async (req, res) => {
  try {
    const { photosProcessed, facesFound, errors } = req.body;
    autoFaceProcessor.recordProcessing(photosProcessed || 0, facesFound || 0, errors || 0);
    
    res.json({
      message: 'Processing stats recorded',
      stats: autoFaceProcessor.getStats()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to record stats',
      error: error.message
    });
  }
});

module.exports = router;

