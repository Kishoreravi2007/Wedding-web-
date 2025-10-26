/**
 * Face Detection Trigger API
 * 
 * Endpoints to manually or automatically trigger face detection
 */

const express = require('express');
const router = express.Router();
const autoFaceDetection = require('../services/auto-face-detection');

/**
 * POST /api/face-detection/trigger
 * Manually trigger face detection for a gallery
 */
router.post('/trigger', async (req, res) => {
  try {
    const { sister } = req.body;
    
    if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
      return res.status(400).json({ 
        message: 'Invalid sister parameter. Must be sister-a or sister-b' 
      });
    }

    // Trigger face detection (non-blocking)
    autoFaceDetection.triggerFaceDetection(sister)
      .then(result => {
        console.log(`Face detection result for ${sister}:`, result);
      })
      .catch(error => {
        console.error(`Face detection error for ${sister}:`, error);
      });

    res.json({
      message: `Face detection started for ${sister}`,
      status: 'processing'
    });

  } catch (error) {
    console.error('Error triggering face detection:', error);
    res.status(500).json({ 
      message: 'Error triggering face detection',
      error: error.message 
    });
  }
});

/**
 * GET /api/face-detection/status
 * Get face detection status for a gallery
 */
router.get('/status/:sister', async (req, res) => {
  try {
    const { sister } = req.params;
    
    if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
      return res.status(400).json({ 
        message: 'Invalid sister parameter' 
      });
    }

    const stats = await autoFaceDetection.getStats(sister);
    const isProcessing = autoFaceDetection.processing.has(sister);
    const isQueued = autoFaceDetection.queue.has(sister);

    res.json({
      sister,
      hasBeenClustered: await autoFaceDetection.hasBeenClustered(sister),
      isProcessing,
      isQueued,
      stats
    });

  } catch (error) {
    console.error('Error getting face detection status:', error);
    res.status(500).json({ 
      message: 'Error getting status',
      error: error.message 
    });
  }
});

/**
 * POST /api/face-detection/trigger-all
 * Trigger face detection for both galleries
 */
router.post('/trigger-all', async (req, res) => {
  try {
    // Trigger both galleries (non-blocking)
    autoFaceDetection.triggerFaceDetection('sister-a').catch(console.error);
    autoFaceDetection.triggerFaceDetection('sister-b').catch(console.error);

    res.json({
      message: 'Face detection started for both galleries',
      status: 'processing'
    });

  } catch (error) {
    console.error('Error triggering face detection:', error);
    res.status(500).json({ 
      message: 'Error triggering face detection',
      error: error.message 
    });
  }
});

module.exports = router;

