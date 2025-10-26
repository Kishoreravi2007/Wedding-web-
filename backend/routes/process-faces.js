/**
 * Face Processing Route
 * 
 * Endpoint to store face descriptors extracted from photos
 */

const express = require('express');
const router = express.Router();
const { PhotoDB, PhotoFaceDB, FaceDescriptorDB } = require('../lib/supabase-db');
const { authenticateToken } = require('../auth');

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
        
        if (faceData.descriptor.length !== 128) {
          console.warn(`Invalid descriptor length: ${faceData.descriptor.length}, expected 128`);
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

module.exports = router;

