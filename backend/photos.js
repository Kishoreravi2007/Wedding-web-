const express = require('express');
const router = express.Router();
const multer = require('multer');
// Firebase is removed, so photo storage and retrieval are disabled.
// To re-enable, integrate with another cloud storage solution (e.g., AWS S3, Cloudinary)
// and a persistent database for metadata.

// Multer configuration for in-memory storage (files will not be saved persistently)
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory temporarily
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// In-memory storage for photo metadata (not persistent across server restarts)
const photos = [];
let photoIdCounter = 1;

// GET all photos metadata (returns empty array as storage is disabled)
router.get('/', (req, res) => {
  try {
    // In a real application, you would fetch metadata from a persistent database
    res.json(photos);
  } catch (error) {
    console.error('Error getting photos metadata:', error);
    res.status(500).json({ message: 'Error retrieving photos metadata.' });
  }
});

// POST a new photo (disabled without Firebase Storage)
router.post('/', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No photo file uploaded.' });
  }

  try {
    // In a real application, you would upload the file to cloud storage
    // and save its metadata to a persistent database.
    const newPhoto = {
      id: String(photoIdCounter++),
      filename: req.file.originalname,
      url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, // Base64 for demonstration, not for production
      timestamp: new Date().toISOString(),
      message: 'Photo upload is disabled as Firebase Storage has been removed. Photos are not persistently stored.',
    };
    photos.push(newPhoto);
    res.status(201).json(newPhoto);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Error uploading photo.' });
  }
});

module.exports = router;
