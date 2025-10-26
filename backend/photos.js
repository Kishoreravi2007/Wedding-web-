const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('./lib/supabase'); // Use shared Supabase client
const { PhotoDB } = require('./lib/supabase-db'); // Import PhotoDB
const { authenticateToken } = require('./auth'); // Import authentication middleware

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

// POST a new photo to Supabase Storage and save metadata to Firestore
// Requires authentication
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No photo file uploaded.' });
  }
  
  const { sister, title, description, eventType, tags } = req.body;
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

  try {
    const file = req.file;
    const fileName = `${sister}/${Date.now()}_${file.originalname}`;
    
    const { data, error } = await supabase.storage
      .from('wedding-photos') // Replace with your Supabase bucket name
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
        metadata: {
          title: title || '',
          description: description || '',
          eventType: eventType || '',
          tags: JSON.stringify(parsedTags),
        }
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      return res.status(500).json({ message: 'Error uploading photo to Supabase storage.' });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/wedding-photos/${fileName}`; // Construct public URL

    const newPhoto = {
      filename: file.originalname,
      file_path: fileName, // Use file_path to match Supabase schema
      public_url: publicUrl, // Use public_url to match Supabase schema
      size: file.size,
      mimetype: file.mimetype,
      sister: sister,
      title: title || '',
      description: description || '',
      event_type: eventType || '', // Use event_type to match Supabase schema
      tags: parsedTags,
      storage_provider: 'supabase', // Use storage_provider to match Supabase schema
    };

    const createdPhoto = await PhotoDB.create(newPhoto);
    
    // Trigger automatic face detection (non-blocking)
    try {
      const autoFaceDetection = require('./services/auto-face-detection');
      autoFaceDetection.triggerFaceDetection(sister).catch(error => {
        console.error('Background face detection error:', error.message);
      });
      console.log(`🔍 Face detection triggered for ${sister} gallery`);
    } catch (faceDetectionError) {
      // Don't fail the upload if face detection fails
      console.error('Failed to trigger face detection:', faceDetectionError.message);
    }
    
    res.status(201).json(createdPhoto);

  } catch (error) {
    console.error('Error uploading photo:', error);
    if (!res.headersSent) { // Prevent sending headers multiple times
      res.status(500).json({ message: 'Error uploading photo.' });
    }
  }
});

// DELETE a photo from Supabase Storage and Database
// Requires authentication
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const photo = await PhotoDB.findById(id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }

    const filePath = photo.file_path;

    const { error: storageError } = await supabase.storage
      .from('wedding-photos') // Replace with your Supabase bucket name
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting from Supabase Storage:', storageError);
      return res.status(500).json({ message: 'Error deleting photo from Supabase storage.' });
    }

    // Delete metadata from Supabase DB
    await PhotoDB.delete(id);

    res.status(200).json({ message: 'Photo deleted successfully.' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Error deleting photo.' });
  }
});

module.exports = router;
