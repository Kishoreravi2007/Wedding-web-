const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage, getPublicUrl } = require('./lib/firebase'); // Use Firebase Storage
const { PhotoDB, FaceDescriptorDB, PhotoFacesDB } = require('./lib/firestore-db'); // Use Firestore DB
const { authenticateToken } = require('./auth'); // Import authentication middleware
const { v4: uuidv4 } = require('uuid');

// Multer configuration for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// GET all photos metadata from Firestore
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

// POST a new photo to Firebase Storage and save metadata to Firestore
// Requires authentication
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No photo file uploaded.' });
  }
  
  const { sister, title, description, eventType, tags, face_descriptors } = req.body;
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

  // Parse face descriptors if provided
  let parsedFaceDescriptors = [];
  if (face_descriptors) {
    try {
      parsedFaceDescriptors = JSON.parse(face_descriptors);
      console.log(`📸 Received ${parsedFaceDescriptors.length} face descriptor(s) with photo`);
    } catch (parseError) {
      console.warn('Error parsing face descriptors:', parseError);
      // Continue upload even if face descriptors fail
    }
  }

  try {
    const file = req.file;
    const fileName = `${sister}/${Date.now()}_${file.originalname}`;
    
    // Upload to Firebase Storage
    const fileBuffer = file.buffer;
    const blob = storage.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          title: title || '',
          description: description || '',
          eventType: eventType || '',
          tags: JSON.stringify(parsedTags),
        }
      }
    });

    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('Error uploading to Firebase Storage:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file public
          await blob.makePublic();
          resolve();
        } catch (error) {
          console.error('Error making file public:', error);
          reject(error);
        }
      });

      blobStream.end(fileBuffer);
    });

    const publicUrl = getPublicUrl(fileName);

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
      storage_provider: 'firebase',
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
          await PhotoFacesDB.create({
            photo_id: insertedPhoto.id,
            face_descriptor_id: faceDescriptor.id,
            person_id: null,
            bounding_box: faceData.detection?.box || {
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
    
    // Delete file from Firebase Storage
    try {
      const file = storage.file(photo.file_path);
      await file.delete();
      console.log(`✅ Photo file deleted from Firebase Storage: ${photo.file_path}`);
    } catch (storageError) {
      console.error('Error deleting from Firebase Storage:', storageError);
      // Continue even if storage deletion fails
    }
    
    // Delete associated face descriptors
    const faceDescriptors = await FaceDescriptorDB.findAll({ photo_id: id });
    for (const descriptor of faceDescriptors) {
      await FaceDescriptorDB.delete(descriptor.id);
    }
    
    // Delete associated photo faces
    const photoFaces = await PhotoFacesDB.findAll({ photo_id: id });
    for (const photoFace of photoFaces) {
      await PhotoFacesDB.delete(photoFace.id);
    }
    
    // Delete photo metadata from Firestore
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
    // TODO: Implement face matching with Firestore
    
    res.json([]);
  } catch (error) {
    console.error('Error searching photos by faces:', error);
    res.status(500).json({ message: 'Error searching photos.' });
  }
});

module.exports = router;
