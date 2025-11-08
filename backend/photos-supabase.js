const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('./lib/supabase'); // Use Supabase
const { PhotoDB, FaceDescriptorDB, PhotoFaceDB } = require('./lib/supabase-db'); // Use Supabase DB
const { authenticateToken } = require('./auth-secure'); // Import Supabase authentication middleware
const { v4: uuidv4 } = require('uuid');

// Multer configuration for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// GET all photos metadata from Supabase
router.get('/', async (req, res) => {
  try {
    const { sister } = req.query;
    const filters = {};
    if (sister && (sister === 'sister-a' || sister === 'sister-b')) {
      filters.sister = sister;
    }
    const photos = await PhotoDB.findAll(filters);
    res.json(photos);
  } catch (error) {
    console.error('Error getting photos metadata:', error);
    res.status(500).json({ message: 'Error retrieving photos metadata.' });
  }
});

// POST a new photo to Supabase Storage and save metadata to Supabase DB
// Requires authentication
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No photo file uploaded.' });
  }
  
  const { sister, title, description, eventType, tags, face_descriptors, faces } = req.body;
  if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
    return res.status(400).json({ message: 'Invalid or missing sister identifier.' });
  }

  let parsedTags = [];
  if (tags) {
    try {
      parsedTags = JSON.parse(tags);
      if (!Array.isArray(parsedTags)) {
        throw new Error('Tags must be an array.');
      }
    } catch (parseError) {
      console.error('Error parsing tags:', parseError);
      return res.status(400).json({ message: 'Invalid tags format.' });
    }
  }

  // Parse face descriptors if provided (accept both 'faces' and 'face_descriptors' for compatibility)
  let parsedFaceDescriptors = [];
  const faceDataParam = faces || face_descriptors;
  if (faceDataParam) {
    try {
      parsedFaceDescriptors = JSON.parse(faceDataParam);
      console.log(`📸 Received ${parsedFaceDescriptors.length} face descriptor(s) with photo`);
    } catch (parseError) {
      console.warn('Error parsing face descriptors:', parseError);
      // Continue upload even if face descriptors fail
    }
  }

  try {
    const file = req.file;
    const fileName = `${sister}/${Date.now()}_${uuidv4()}_${file.originalname}`;
    
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
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wedding-photos')
      .getPublicUrl(fileName);

    console.log(`✅ Photo uploaded to Supabase: ${publicUrl}`);

    const newPhoto = {
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
      storage_provider: 'supabase',
      photographer_id: req.user?.id || req.user?.uid || null,
    };

    const insertedPhoto = await PhotoDB.create(newPhoto);

    // Store face descriptors if provided
    if (parsedFaceDescriptors && parsedFaceDescriptors.length > 0) {
      console.log(`💾 Storing ${parsedFaceDescriptors.length} face descriptor(s) for photo ${insertedPhoto.id}`);
      
      for (const faceData of parsedFaceDescriptors) {
        try {
          // Store face descriptor
          const faceDescriptor = await FaceDescriptorDB.create({
            descriptor: faceData.descriptor,
            photo_id: insertedPhoto.id,
            person_id: null, // Will be set when matched with a person
            confidence: faceData.confidence || null
          });

          // Store photo face with bounding box
          await PhotoFaceDB.create({
            photo_id: insertedPhoto.id,
            face_descriptor_id: faceDescriptor.id,
            person_id: null,
            bounding_box: faceData.boundingBox || faceData.detection?.box || {
              x: 0,
              y: 0,
              width: 0,
              height: 0
            },
            confidence: faceData.confidence || null,
            is_verified: false
          });

          console.log(`✅ Face descriptor stored: ${faceDescriptor.id}`);
        } catch (faceError) {
          console.error('Error storing face descriptor:', faceError);
          // Continue even if face storage fails
        }
      }
    }

    res.status(201).json({
      message: 'Photo uploaded successfully!',
      photo: insertedPhoto
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Error uploading photo.' });
  }
});

// GET a single photo by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await PhotoDB.findById(id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }
    
    res.json(photo);
  } catch (error) {
    console.error('Error getting photo:', error);
    res.status(500).json({ message: 'Error retrieving photo.' });
  }
});

// PUT update a photo's metadata (authentication required)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_type, tags } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (event_type !== undefined) updates.event_type = event_type;
    if (tags !== undefined) updates.tags = tags;
    
    const updatedPhoto = await PhotoDB.update(id, updates);
    
    if (!updatedPhoto) {
      return res.status(404).json({ message: 'Photo not found.' });
    }
    
    res.json({
      message: 'Photo updated successfully!',
      photo: updatedPhoto
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ message: 'Error updating photo.' });
  }
});

// DELETE a photo (authentication required)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get photo metadata first
    const photo = await PhotoDB.findById(id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }
    
    // Delete file from Supabase Storage
    try {
      const { error: deleteError } = await supabase.storage
        .from('wedding-photos')
        .remove([photo.file_path]);
      
      if (deleteError) {
        console.error('Error deleting from Supabase Storage:', deleteError);
        // Continue even if storage deletion fails
      } else {
        console.log(`✅ Photo file deleted from Supabase Storage: ${photo.file_path}`);
      }
    } catch (storageError) {
      console.error('Error deleting from Supabase Storage:', storageError);
      // Continue even if storage deletion fails
    }
    
    // Delete associated face descriptors
    await FaceDescriptorDB.deleteByPhotoId(id);
    
    // Delete associated photo faces
    await PhotoFaceDB.deleteByPhotoId(id);
    
    // Delete photo metadata from Supabase DB
    await PhotoDB.delete(id);
    
    res.json({ message: 'Photo deleted successfully!' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Error deleting photo.' });
  }
});

// GET photos by face search
router.post('/search/faces', async (req, res) => {
  try {
    const { face_descriptors } = req.body;
    
    if (!face_descriptors || !Array.isArray(face_descriptors) || face_descriptors.length === 0) {
      return res.status(400).json({ message: 'Face descriptors array is required.' });
    }
    
    console.log(`🔍 Searching photos with ${face_descriptors.length} face descriptor(s)`);
    
    // This would require implementing face matching algorithm
    // For now, return empty array
    // TODO: Implement face matching with Supabase
    
    res.json([]);
  } catch (error) {
    console.error('Error searching photos by faces:', error);
    res.status(500).json({ message: 'Error searching photos.' });
  }
});

module.exports = router;

