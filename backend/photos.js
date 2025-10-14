const express = require('express');
const router = express.Router();
const multer = require('multer');
const admin = require('firebase-admin');
const { supabase } = require('./server'); // Import supabase client
const db = admin.firestore();
const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);

// Multer configuration for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// GET all photos metadata from Firestore
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('photos').orderBy('uploadedAt', 'desc').get();
    const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(photos);
  } catch (error) {
    console.error('Error getting photos metadata:', error);
    res.status(500).json({ message: 'Error retrieving photos metadata.' });
  }
});

// POST a new photo to Supabase Storage and save metadata to Firestore
router.post('/', upload.single('photo'), async (req, res) => {
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
      filePath: fileName,
      publicUrl: publicUrl,
      size: file.size,
      mimetype: file.mimetype,
      sister: sister,
      title: title || '',
      description: description || '',
      eventType: eventType || '',
      tags: parsedTags,
      storageProvider: 'supabase', // Store provider
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('photos').add(newPhoto);
    res.status(201).json({ id: docRef.id, ...newPhoto });

  } catch (error) {
    console.error('Error uploading photo:', error);
    if (!res.headersSent) { // Prevent sending headers multiple times
      res.status(500).json({ message: 'Error uploading photo.' });
    }
  }
});

// DELETE a photo from Supabase Storage and Firestore
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection('photos').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Photo not found.' });
    }

    const photoData = doc.data();
    const filePath = photoData.filePath;

    const { error } = await supabase.storage
      .from('wedding-photos') // Replace with your Supabase bucket name
      .remove([filePath]);

    if (error) {
      console.error('Error deleting from Supabase Storage:', error);
      return res.status(500).json({ message: 'Error deleting photo from Supabase storage.' });
    }

    // Delete metadata from Firestore
    await docRef.delete();

    res.status(200).json({ message: 'Photo deleted successfully.' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Error deleting photo.' });
  }
});

module.exports = router;
