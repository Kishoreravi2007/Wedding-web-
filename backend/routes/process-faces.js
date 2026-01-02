/**
 * Face Processing Route
 * 
 * Endpoint to store face descriptors extracted from photos
 */

const express = require('express');
const router = express.Router();
const { PhotoDB, PhotoFaceDB, FaceDescriptorDB } = require('../lib/supabase-db');
const { authenticateToken } = require('../auth-simple');

/**
 * POST /api/process-faces/store-descriptors
 * Store face descriptors for a photo
 */
router.post('/store-descriptors', authenticateToken, async (req, res) => {
  try {
    const { photo_id, faces } = req.body;

    if (!photo_id || !faces || !Array.isArray(faces)) {
      return res.status(400).json({
        message: 'photo_id and faces array are required'
      });
    }

    console.log(`📸 Storing ${faces.length} face descriptor(s) for photo ${photo_id}`);

    // Verify photo exists
    const photo = await PhotoDB.findById(photo_id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const storedFaces = [];

    for (const faceData of faces) {
      try {
        // Validate face data
        if (!faceData.descriptor || !Array.isArray(faceData.descriptor)) {
          console.warn('Invalid descriptor for face, skipping');
          continue;
        }

        if (faceData.descriptor.length !== 128 && faceData.descriptor.length !== 512 && faceData.descriptor.length !== 2622 && faceData.descriptor.length !== 4096) {
          console.warn(`Invalid descriptor length: ${faceData.descriptor.length}, expected 128, 512, 2622, or 4096`);
          continue;
        }

        // Store face descriptor
        const faceDescriptor = await FaceDescriptorDB.create({
          photo_id: photo_id,
          descriptor: faceData.descriptor,
          confidence: faceData.confidence || 0.8
        });

        // Create photo_face record
        const photoFace = await PhotoFaceDB.create({
          photo_id: photo_id,
          face_descriptor_id: faceDescriptor.id,
          bounding_box: faceData.boundingBox || null,
          confidence: faceData.confidence || 0.8,
          is_verified: false
        });

        storedFaces.push({
          face_id: photoFace.id,
          descriptor_id: faceDescriptor.id
        });

      } catch (faceError) {
        console.error('Error storing face:', faceError);
        // Continue with other faces
      }
    }

    console.log(`✅ Stored ${storedFaces.length} face descriptor(s)`);

    res.json({
      message: `Successfully stored ${storedFaces.length} face descriptor(s)`,
      photo_id: photo_id,
      faces_stored: storedFaces.length,
      faces: storedFaces
    });

  } catch (error) {
    console.error('Error storing face descriptors:', error);
    res.status(500).json({
      message: 'Failed to store face descriptors',
      error: error.message
    });
  }
});

/**
 * GET /api/process-faces/stats
 * Get statistics about face processing
 */
router.get('/stats', async (req, res) => {
  try {
    const { PhotoDB, PhotoFaceDB } = require('../lib/supabase-db');

    const { sister } = req.query;
    const filters = sister ? { sister } : {};

    const allPhotos = await PhotoDB.findAll(filters);
    let photosWithFaces = 0;
    let totalFaces = 0;

    for (const photo of allPhotos) {
      const faces = await PhotoFaceDB.findByPhotoId(photo.id);
      if (faces && faces.length > 0) {
        photosWithFaces++;
        totalFaces += faces.length;
      }
    }

    res.json({
      total_photos: allPhotos.length,
      photos_with_faces: photosWithFaces,
      photos_without_faces: allPhotos.length - photosWithFaces,
      total_faces_detected: totalFaces,
      coverage_percent: allPhotos.length > 0 ?
        ((photosWithFaces / allPhotos.length) * 100).toFixed(1) : 0
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      message: 'Failed to get stats',
      error: error.message
    });
  }
});

/**
 * POST /api/process-faces/reprocess-all
 * Reprocess all photos with DeepFace to update embeddings
 * This is needed when switching face recognition models
 * NOTE: Temporarily public for testing - add authenticateToken back in production
 */
router.post('/reprocess-all', async (req, res) => {

  try {
    const { sister, limit = 10 } = req.body;
    const DEEPFACE_API_URL = process.env.DEEPFACE_API_URL || 'http://localhost:8002';
    const fetch = (await import('node-fetch')).default;
    const FormData = (await import('form-data')).default;

    console.log(`🔄 Reprocessing photos with DeepFace...`);
    console.log(`   Sister filter: ${sister || 'all'}`);
    console.log(`   Limit: ${limit}`);

    // Get photos to reprocess
    const filters = sister ? { sister } : {};
    const allPhotos = await PhotoDB.findAll(filters);
    const photosToProcess = allPhotos.slice(0, limit);

    console.log(`📸 Found ${allPhotos.length} photos, processing ${photosToProcess.length}`);

    const results = {
      processed: 0,
      failed: 0,
      faces_updated: 0,
      errors: []
    };

    for (const photo of photosToProcess) {
      try {
        // Download the photo
        const imageResponse = await fetch(photo.public_url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status}`);
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Send to DeepFace API for face detection
        const formData = new FormData();
        formData.append('file', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
        formData.append('return_landmarks', 'false');
        formData.append('return_age_gender', 'false');
        formData.append('enforce_detection', 'false');

        const deepfaceResponse = await fetch(`${DEEPFACE_API_URL}/api/faces/detect`, {
          method: 'POST',
          body: formData
        });

        if (!deepfaceResponse.ok) {
          throw new Error(`DeepFace API error: ${deepfaceResponse.status}`);
        }

        const faceResult = await deepfaceResponse.json();

        if (faceResult.faces && faceResult.faces.length > 0) {
          // Delete old face descriptors for this photo
          await FaceDescriptorDB.deleteByPhotoId(photo.id);
          await PhotoFaceDB.deleteByPhotoId(photo.id);

          // Store new face descriptors
          for (const face of faceResult.faces) {
            const faceDescriptor = await FaceDescriptorDB.create({
              photo_id: photo.id,
              descriptor: face.embedding,
              confidence: face.det_score || 0.8
            });

            await PhotoFaceDB.create({
              photo_id: photo.id,
              face_descriptor_id: faceDescriptor.id,
              bounding_box: {
                x: face.bbox[0],
                y: face.bbox[1],
                width: face.bbox[2],
                height: face.bbox[3]
              },
              confidence: face.det_score || 0.8,
              is_verified: false
            });

            results.faces_updated++;
          }

          console.log(`✅ ${photo.filename}: ${faceResult.faces.length} faces`);
        } else {
          console.log(`⚠️ ${photo.filename}: No faces detected`);
        }

        results.processed++;

      } catch (photoError) {
        console.error(`❌ Error processing ${photo.filename}:`, photoError.message);
        results.failed++;
        results.errors.push({
          photo_id: photo.id,
          filename: photo.filename,
          error: photoError.message
        });
      }
    }

    console.log(`\n📊 Reprocessing complete:`);
    console.log(`   Processed: ${results.processed}`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Faces updated: ${results.faces_updated}`);

    res.json({
      message: 'Reprocessing complete',
      total_photos: allPhotos.length,
      processed: results.processed,
      failed: results.failed,
      faces_updated: results.faces_updated,
      errors: results.errors.slice(0, 10) // Limit error output
    });

  } catch (error) {
    console.error('Error reprocessing photos:', error);
    res.status(500).json({
      message: 'Failed to reprocess photos',
      error: error.message
    });
  }
});

module.exports = router;

