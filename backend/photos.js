const express = require('express');
const router = express.Router();
const multer = require('multer');
const admin = require('firebase-admin');
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

// POST a new photo to Firebase Storage and save metadata to Firestore
router.post('/', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No photo file uploaded.' });
  }

  try {
    const file = req.file;
    const fileName = `photos/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (error) => {
      console.error('Error uploading to Firebase Storage:', error);
      res.status(500).json({ message: 'Error uploading photo to storage.' });
    });

    blobStream.on('finish', async () => {
      // Make the file public
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      const newPhoto = {
        filename: file.originalname,
        filePath: fileName,
        publicUrl: publicUrl,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection('photos').add(newPhoto);
      res.status(201).json({ id: docRef.id, ...newPhoto });
    });

    blobStream.end(file.buffer);

  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Error uploading photo.' });
  }
});

// DELETE a photo from Firebase Storage and Firestore
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

    // Delete from Firebase Storage
    await bucket.file(filePath).delete();

    // Delete metadata from Firestore
    await docRef.delete();

    res.status(200).json({ message: 'Photo deleted successfully.' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Error deleting photo.' });
  }
});

module.exports = router;
