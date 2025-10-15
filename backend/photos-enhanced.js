/**
 * Enhanced Photos API with Face Detection and Recognition
 * 
 * Provides photo upload with automatic face processing,
 * batch operations, and comprehensive analytics
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('./server');
const { PhotoDB } = require('./lib/supabase-db');
const { faceProcessingService } = require('./services/face-processing-service');

// Multer configuration for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB file size limit
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * POST /api/photos-enhanced/upload
 * Upload a photo with automatic face detection and recognition
 */
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo file uploaded' });
    }

    const { 
      sister, 
      title, 
      description, 
      eventType, 
      tags,
      faceDescriptors // Sent from frontend after detection
    } = req.body;

    // Validate sister parameter
    if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
      return res.status(400).json({ message: 'Invalid or missing sister identifier' });
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (!Array.isArray(parsedTags)) {
          throw new Error('Tags must be an array');
        }
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid tags format' });
      }
    }

    // Parse face descriptors
    let parsedFaceDescriptors = [];
    if (faceDescriptors) {
      try {
        parsedFaceDescriptors = typeof faceDescriptors === 'string' 
          ? JSON.parse(faceDescriptors) 
          : faceDescriptors;
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid face descriptors format' });
      }
    }

    // Upload to Supabase Storage
    const file = req.file;
    const fileName = `${sister}/${Date.now()}_${file.originalname}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wedding-photos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
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
    const { data: publicUrlData } = supabase.storage
      .from('wedding-photos')
      .getPublicUrl(fileName);
    
    const publicUrl = publicUrlData.publicUrl;

    // Create photo record in database
    const photoData = {
      filename: file.originalname,
      file_path: fileName,
      public_url: publicUrl,
      size: file.size,
      mimetype: file.mimetype,
      sister: sister,
      title: title || file.originalname,
      description: description || null,
      event_type: eventType || null,
      tags: parsedTags,
      storage_provider: 'supabase',
      photographer_id: req.user?.id || null
    };

    const photo = await PhotoDB.create(photoData);

    // Process faces if descriptors provided
    let faceProcessingResult = null;
    if (parsedFaceDescriptors && parsedFaceDescriptors.length > 0) {
      try {
        faceProcessingResult = await faceProcessingService.processSinglePhoto(
          photo.id,
          parsedFaceDescriptors,
          {
            confidenceThreshold: 0.6,
            autoVerify: false
          }
        );
      } catch (faceError) {
        console.error('Error processing faces:', faceError);
        // Don't fail the upload, just log the error
        faceProcessingResult = {
          success: false,
          errors: [faceError.message]
        };
      }
    }

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: {
        id: photo.id,
        ...photoData,
        created_at: photo.created_at
      },
      faceProcessing: faceProcessingResult
    });

  } catch (error) {
    console.error('Error in photo upload:', error);
    res.status(500).json({ 
      message: 'Error uploading photo',
      error: error.message 
    });
  }
});

/**
 * POST /api/photos-enhanced/upload-batch
 * Upload multiple photos at once
 */
router.post('/upload-batch', upload.array('photos', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photo files uploaded' });
    }

    const { sister, eventType } = req.body;

    if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
      return res.status(400).json({ message: 'Invalid or missing sister identifier' });
    }

    const uploadResults = {
      total: req.files.length,
      successful: 0,
      failed: 0,
      photos: []
    };

    // Process each file
    for (const file of req.files) {
      try {
        const fileName = `${sister}/${Date.now()}_${file.originalname}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('wedding-photos')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('wedding-photos')
          .getPublicUrl(fileName);

        // Create database record
        const photoData = {
          filename: file.originalname,
          file_path: fileName,
          public_url: publicUrlData.publicUrl,
          size: file.size,
          mimetype: file.mimetype,
          sister: sister,
          title: file.originalname,
          event_type: eventType || null,
          tags: [],
          storage_provider: 'supabase',
          photographer_id: req.user?.id || null
        };

        const photo = await PhotoDB.create(photoData);
        
        uploadResults.successful++;
        uploadResults.photos.push({
          id: photo.id,
          filename: photo.filename,
          url: photo.public_url
        });

      } catch (fileError) {
        console.error(`Error uploading ${file.originalname}:`, fileError);
        uploadResults.failed++;
        uploadResults.photos.push({
          filename: file.originalname,
          error: fileError.message
        });
      }
    }

    res.status(201).json({
      message: `Batch upload completed: ${uploadResults.successful} successful, ${uploadResults.failed} failed`,
      results: uploadResults
    });

  } catch (error) {
    console.error('Error in batch upload:', error);
    res.status(500).json({ 
      message: 'Error in batch upload',
      error: error.message 
    });
  }
});

/**
 * POST /api/photos-enhanced/:photoId/process-faces
 * Process or reprocess faces for an uploaded photo
 */
router.post('/:photoId/process-faces', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { faceDescriptors, options } = req.body;

    if (!faceDescriptors || !Array.isArray(faceDescriptors)) {
      return res.status(400).json({ message: 'Face descriptors array required' });
    }

    const result = await faceProcessingService.processSinglePhoto(
      photoId,
      faceDescriptors,
      options || {}
    );

    res.json({
      message: 'Face processing completed',
      result
    });

  } catch (error) {
    console.error('Error processing faces:', error);
    res.status(500).json({ 
      message: 'Error processing faces',
      error: error.message 
    });
  }
});

/**
 * POST /api/photos-enhanced/process-batch
 * Process multiple photos for face detection (batch operation)
 */
router.post('/process-batch', async (req, res) => {
  try {
    const { photos, options } = req.body;

    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({ message: 'Photos array required' });
    }

    // Add to processing queue
    const queueId = await faceProcessingService.addToQueue(photos, options || {});

    res.json({
      message: 'Batch processing queued',
      queueId,
      photoCount: photos.length
    });

  } catch (error) {
    console.error('Error queuing batch:', error);
    res.status(500).json({ 
      message: 'Error queuing batch processing',
      error: error.message 
    });
  }
});

/**
 * GET /api/photos-enhanced/processing-stats
 * Get face processing statistics
 */
router.get('/processing-stats', async (req, res) => {
  try {
    const stats = faceProcessingService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      message: 'Error retrieving statistics',
      error: error.message 
    });
  }
});

/**
 * GET /api/photos-enhanced/unidentified-faces
 * Get all unidentified faces
 */
router.get('/unidentified-faces', async (req, res) => {
  try {
    const { limit, offset, photoId } = req.query;
    
    const result = await faceProcessingService.getUnidentifiedFaces({
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      photoId: photoId || null
    });

    res.json(result);

  } catch (error) {
    console.error('Error getting unidentified faces:', error);
    res.status(500).json({ 
      message: 'Error retrieving unidentified faces',
      error: error.message 
    });
  }
});

/**
 * POST /api/photos-enhanced/reprocess-faces
 * Reprocess faces with new threshold or settings
 */
router.post('/reprocess-faces', async (req, res) => {
  try {
    const { faceIds, threshold } = req.body;

    if (!faceIds || !Array.isArray(faceIds)) {
      return res.status(400).json({ message: 'Face IDs array required' });
    }

    const results = await faceProcessingService.reprocessFaces(
      faceIds,
      threshold || 0.5
    );

    res.json({
      message: 'Reprocessing completed',
      results
    });

  } catch (error) {
    console.error('Error reprocessing faces:', error);
    res.status(500).json({ 
      message: 'Error reprocessing faces',
      error: error.message 
    });
  }
});

/**
 * GET /api/photos-enhanced/:photoId/face-quality
 * Get face detection quality report for a photo
 */
router.get('/:photoId/face-quality', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const report = await faceProcessingService.getFaceQualityReport(photoId);
    
    if (!report) {
      return res.status(404).json({ message: 'Photo not found or no faces detected' });
    }

    res.json(report);

  } catch (error) {
    console.error('Error getting quality report:', error);
    res.status(500).json({ 
      message: 'Error retrieving quality report',
      error: error.message 
    });
  }
});

/**
 * GET /api/photos-enhanced/by-person/:personId
 * Get all photos containing a specific person
 */
router.get('/by-person/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const { limit, offset, minConfidence } = req.query;

    let query = supabase
      .from('photo_faces')
      .select(`
        id,
        confidence,
        is_verified,
        bounding_box,
        photo:photos (
          id,
          filename,
          public_url,
          title,
          description,
          event_type,
          uploaded_at
        )
      `)
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    if (minConfidence) {
      query = query.gte('confidence', parseFloat(minConfidence));
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(
        parseInt(offset), 
        parseInt(offset) + (parseInt(limit) || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      personId,
      photos: data.map(pf => ({
        ...pf.photo,
        faceData: {
          confidence: pf.confidence,
          isVerified: pf.is_verified,
          boundingBox: pf.bounding_box
        }
      })),
      total: data.length
    });

  } catch (error) {
    console.error('Error getting photos by person:', error);
    res.status(500).json({ 
      message: 'Error retrieving photos',
      error: error.message 
    });
  }
});

module.exports = router;

