/**
 * Photos API - Cloud SQL & GCS Version
 * 
 * This module handles photo uploads, retrieval, and deletion using:
 * - Google Cloud Storage for file storage
 * - Cloud SQL (PostgreSQL) for metadata
 * - Face recognition integration
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
// const { supabase } = require('./server'); // Removed Supabase usage
const { PhotoDB, FaceDescriptorDB, PhotoFaceDB } = require('./lib/sql-db'); // Use SQL implementation
const { uploadFile, deleteFile } = require('./lib/gcs-storage'); // Switched back to GCS
const { matchFace, validateDescriptor } = require('./lib/face-recognition-logic');
const { authMiddleware } = require('./lib/secure-auth');
const authenticateToken = authMiddleware.verifyToken;

// Multer configuration for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 1 // One file at a time
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

/**
 * GET /api/photos
 * Retrieve all photos with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { sister, eventType, tags, personId, limit, offset } = req.query;

    const filters = {
      sister,
      eventType,
      tags: tags ? JSON.parse(tags) : undefined,
      personId,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    // Get photos from database
    const photos = await PhotoDB.findAll(filters);

    // Get total count
    const total = await PhotoDB.count({ sister, eventType });

    // Format response
    const formattedPhotos = photos.map(photo => ({
      id: photo.id,
      filename: photo.filename,
      publicUrl: photo.public_url,
      size: photo.size,
      mimetype: photo.mimetype,
      sister: photo.sister,
      title: photo.title || '',
      description: photo.description || '',
      eventType: photo.event_type || '',
      tags: photo.tags || [],
      uploadedAt: photo.uploaded_at,
      faces: (photo.photo_faces || []).map(face => ({
        id: face.id,
        boundingBox: face.bounding_box,
        confidence: face.confidence,
        isVerified: face.is_verified,
        person: face.person ? {
          id: face.person.id,
          name: face.person.name,
          role: face.person.role
        } : null
      }))
    }));

    res.json({
      photos: formattedPhotos,
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + formattedPhotos.length < total
    });
  } catch (error) {
    console.error('Error getting photos:', error);

    // Provide more helpful error messages for common database issues
    let status = 500;
    let message = 'Error retrieving photos';
    let detail = error.message;

    if (error.message && error.message.includes('Tenant or user not found')) {
      message = 'Database connection failed (Supabase project may be paused or ID incorrect)';
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Connection terminated')) {
      message = 'Could not connect to the database server';
    }

    res.status(status).json({
      message,
      error: detail
    });
  }
});

/**
 * GET /api/photos/:id
 * Retrieve a single photo by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await PhotoDB.findById(id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.json({
      id: photo.id,
      filename: photo.filename,
      publicUrl: photo.public_url,
      size: photo.size,
      mimetype: photo.mimetype,
      sister: photo.sister,
      title: photo.title || '',
      description: photo.description || '',
      eventType: photo.event_type || '',
      tags: photo.tags || [],
      uploadedAt: photo.uploaded_at,
      faces: (photo.photo_faces || []).map(face => ({
        id: face.id,
        boundingBox: face.bounding_box,
        confidence: face.confidence,
        isVerified: face.is_verified,
        person: face.person ? {
          id: face.person.id,
          name: face.person.name,
          role: face.person.role
        } : null
      }))
    });
  } catch (error) {
    console.error('Error getting photo:', error);
    res.status(500).json({
      message: 'Error retrieving photo',
      error: error.message
    });
  }
});

/**
 * POST /api/photos
 * Upload a new photo with optional face data
 */
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  console.log('📸 POST /api/photos: Received upload request');
  // Validate file upload
  if (!req.file) {
    return res.status(400).json({ message: 'No photo file uploaded' });
  }

  const { sister, title, description, eventType, tags } = req.body;
  const faces = req.body.faces || req.body.faceDescriptors || req.body.face_descriptors;

  // Validate required fields
  if (!sister) {
    return res.status(400).json({
      message: 'Invalid or missing sister identifier/photographer.'
    });
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
      return res.status(400).json({
        message: 'Invalid tags format. Must be a JSON array'
      });
    }
  }

  // Parse faces
  let parsedFaces = [];
  if (faces) {
    try {
      parsedFaces = typeof faces === 'string' ? JSON.parse(faces) : faces;
      if (!Array.isArray(parsedFaces)) {
        throw new Error('Faces must be an array');
      }

      // Validate face descriptors
      for (const face of parsedFaces) {
        if (face.descriptor) {
          const validation = validateDescriptor(face.descriptor);
          if (!validation.valid) {
            return res.status(400).json({
              message: `Invalid face descriptor: ${validation.error}`
            });
          }
        }
      }
    } catch (parseError) {
      return res.status(400).json({
        message: 'Invalid faces format',
        error: parseError.message
      });
    }
  }

  const file = req.file;
  const timestamp = Date.now();
  const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${sister}/${timestamp}_${cleanFileName}`;

  try {

    // Upload to GCS
    const publicUrl = await uploadFile(fileName, file.buffer, file.mimetype);

    // Create photo record in database
    const photoData = {
      filename: file.originalname,
      file_path: fileName,
      public_url: publicUrl,
      size: file.size,
      mimetype: file.mimetype,
      sister: sister,
      title: title || '',
      description: description || '',
      event_type: eventType || '',
      tags: parsedTags,
      storage_provider: 'gcs', // Switched back to gcs
      photographer_id: req.user?.id || null // From authentication middleware
    };

    const photo = await PhotoDB.create(photoData);

    // Process faces if provided
    const processedFaces = [];
    if (parsedFaces.length > 0) {
      for (const faceData of parsedFaces) {
        try {
          // Store face descriptor
          const faceDescriptor = await FaceDescriptorDB.create({
            person_id: faceData.personId || null,
            descriptor: faceData.descriptor,
            photo_id: photo.id,
            confidence: faceData.confidence || 0.8
          });

          // Match face to known people if no person assigned
          let matchedPerson = null;
          if (!faceData.personId && faceData.descriptor) {
            const matchResult = await matchFace(faceData.descriptor, 0.6);
            if (matchResult.bestMatch) {
              matchedPerson = {
                id: matchResult.bestMatch.personId,
                name: matchResult.bestMatch.personName,
                confidence: matchResult.bestMatch.confidence
              };
            }
          }

          // Create photo face record
          const photoFace = await PhotoFaceDB.create({
            photo_id: photo.id,
            person_id: faceData.personId || matchedPerson?.id || null,
            face_descriptor_id: faceDescriptor.id,
            bounding_box: faceData.boundingBox,
            confidence: matchedPerson?.confidence || faceData.confidence || 0.8,
            is_verified: !!faceData.personId // Verified if manually tagged
          });

          processedFaces.push({
            id: photoFace.id,
            boundingBox: photoFace.bounding_box,
            confidence: photoFace.confidence,
            person: matchedPerson || (faceData.personId ? { id: faceData.personId } : null)
          });
        } catch (faceError) {
          console.error('Error processing face:', faceError);
          // Continue processing other faces
        }
      }
    }

    // Return created photo with face data
    res.status(201).json({
      id: photo.id,
      filename: photo.filename,
      publicUrl: photo.public_url,
      size: photo.size,
      mimetype: photo.mimetype,
      sister: photo.sister,
      title: photo.title,
      description: photo.description,
      eventType: photo.event_type,
      tags: photo.tags,
      uploadedAt: photo.uploaded_at,
      faces: processedFaces,
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading photo:', error);

    // Cleanup: try to delete uploaded file if database operations failed
    if (fileName) {
      try {
        await deleteFile(fileName);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      message: 'Error uploading photo',
      error: error.message
    });
  }
});

/**
 * DELETE /api/photos/:id
 * Delete a photo from storage and database
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Get photo metadata
    const photo = await PhotoDB.findById(id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check permissions (optional: implement user-based access control)
    // if (req.user?.id && photo.photographer_id !== req.user.id) {
    //   return res.status(403).json({ message: 'Unauthorized to delete this photo' });
    // }

    // Delete from Storage
    try {
      await deleteFile(photo.file_path);
    } catch (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue with database deletion even if storage delete fails
    }

    // Delete from database (cascades to photo_faces and face_descriptors)
    await PhotoDB.delete(id);

    res.status(200).json({
      message: 'Photo deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      message: 'Error deleting photo',
      error: error.message
    });
  }
});

/**
 * PATCH /api/photos/:id
 * Update photo metadata
 */
router.patch('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, eventType, tags } = req.body;

  try {
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (eventType !== undefined) updates.event_type = eventType;
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    }

    const photo = await PhotoDB.update(id, updates);

    res.json({
      id: photo.id,
      ...updates,
      message: 'Photo updated successfully'
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({
      message: 'Error updating photo',
      error: error.message
    });
  }
});

/**
 * GET /api/photos/:id/faces
 * Get all detected faces in a photo
 */
router.get('/:id/faces', async (req, res) => {
  try {
    const { id } = req.params;
    const faces = await PhotoFaceDB.findByPhotoId(id);

    res.json({
      photoId: id,
      faces: faces.map(face => ({
        id: face.id,
        boundingBox: face.bounding_box,
        confidence: face.confidence,
        isVerified: face.is_verified,
        person: face.person ? {
          id: face.person.id,
          name: face.person.name,
          role: face.person.role
        } : null
      }))
    });
  } catch (error) {
    console.error('Error getting photo faces:', error);
    res.status(500).json({
      message: 'Error retrieving faces',
      error: error.message
    });
  }
});

/**
 * Error handling middleware
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Too many files. Upload one photo at a time'
      });
    }
  }

  res.status(500).json({
    message: 'Internal server error',
    error: error.message
  });
});

module.exports = router;

