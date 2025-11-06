const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for local file storage
// Use memory storage first, then save to disk after we know the sister value
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// GET all photos from local filesystem
router.get('/', async (req, res) => {
  try {
    const { sister } = req.query;
    
    const photos = [];
    // Use the request's hostname to build the base URL so it works on any device
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${process.env.PORT || 5000}`;
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
    
    // Determine which galleries to scan
    const galleries = sister && (sister === 'sister-a' || sister === 'sister-b')
      ? [sister.replace('-', '_')]
      : ['sister_a', 'sister_b'];
    
    for (const galleryName of galleries) {
      const galleryDir = path.join(__dirname, '../uploads/wedding_gallery', galleryName);
      
      try {
        const files = await fs.readdir(galleryDir);
        
        for (const file of files) {
          const filePath = path.join(galleryDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile() && /\.(jpg|jpeg|png|gif|heic|webp)$/i.test(file)) {
            const sisterName = galleryName === 'sister_a' ? 'sister-a' : 'sister-b';
            photos.push({
              id: `${galleryName}_${file}`,
              filename: file,
              file_path: `${galleryName}/${file}`,
              public_url: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${file}`,
              url: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${file}`,
              thumbnail: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${file}`,
              size: stats.size,
              mimetype: getMimeType(file),
              sister: sisterName,
              uploadedAt: stats.birthtime || stats.ctime,
              storage_provider: 'local'
            });
          }
        }
      } catch (error) {
        console.log(`Gallery ${galleryName} not found or empty`);
      }
    }
    
    // Sort by upload date, newest first
    photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    res.json(photos);
  } catch (error) {
    console.error('Error getting photos:', error);
    res.status(500).json({ message: 'Error retrieving photos.', error: error.message });
  }
});

// POST upload photos to local filesystem (requires authentication)
router.post('/', (req, res, next) => {
  // Import authenticateToken from auth module
  const { authenticateToken } = require('./auth-simple');
  authenticateToken(req, res, next);
}, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo file uploaded.' });
    }
    
    const { sister } = req.body;
    if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
      return res.status(400).json({ message: 'Invalid or missing sister identifier.' });
    }

    // Now save the file from memory to disk
    const galleryName = sister.replace('-', '_');
    const uploadDir = path.join(__dirname, '../uploads/wedding_gallery', galleryName);
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const basename = path.basename(req.file.originalname, ext);
    const filename = `${basename}_${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, filename);
    
    // Write file to disk
    await fs.writeFile(filePath, req.file.buffer);

    // Use the request's hostname to build the base URL so it works on any device
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${process.env.PORT || 5001}`;
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
    const publicUrl = `${baseUrl}/uploads/wedding_gallery/${galleryName}/${filename}`;
    
    const photoData = {
      id: `${galleryName}_${filename}`,
      filename: req.file.originalname,
      file_path: `${galleryName}/${filename}`,
      public_url: publicUrl,
      url: publicUrl,
      thumbnail: publicUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
      sister: sister,
      uploadedAt: new Date(),
      storage_provider: 'local'
    };
    
    console.log(`✅ Photo uploaded successfully: ${filename} to ${sister} gallery`);
    
    // Trigger automatic face detection (non-blocking)
    const autoFaceDetection = require('./services/auto-face-detection');
    autoFaceDetection.triggerFaceDetection(sister).catch(error => {
      console.error('Background face detection error:', error.message);
    });
    
    res.status(201).json(photoData);
  } catch (error) {
    console.error('Error uploading photo:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error uploading photo.', error: error.message });
    }
  }
});

// POST upload multiple photos at once (requires authentication)
router.post('/batch', (req, res, next) => {
  const { authenticateToken } = require('./auth-simple');
  authenticateToken(req, res, next);
}, upload.array('photos', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded.' });
    }
    
    const { sister } = req.body;
    if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
      return res.status(400).json({ message: 'Invalid or missing sister identifier.' });
    }

    const galleryName = sister.replace('-', '_');
    const uploadDir = path.join(__dirname, '../uploads/wedding_gallery', galleryName);
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Use the request's hostname to build the base URL so it works on any device
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${process.env.PORT || 5001}`;
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
    const uploadedPhotos = [];
    
    // Save each file from memory to disk
    for (const file of req.files) {
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      const filename = `${basename}_${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, filename);
      
      await fs.writeFile(filePath, file.buffer);
      
      uploadedPhotos.push({
        id: `${galleryName}_${filename}`,
        filename: file.originalname,
        file_path: `${galleryName}/${filename}`,
        public_url: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${filename}`,
        url: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${filename}`,
        thumbnail: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${filename}`,
        size: file.size,
        mimetype: file.mimetype,
        sister: sister,
        uploadedAt: new Date(),
        storage_provider: 'local'
      });
    }
    
    console.log(`✅ ${uploadedPhotos.length} photos uploaded successfully to ${sister} gallery`);
    
    // Trigger automatic face detection (non-blocking)
    const autoFaceDetection = require('./services/auto-face-detection');
    autoFaceDetection.triggerFaceDetection(sister).catch(error => {
      console.error('Background face detection error:', error.message);
    });
    
    res.status(201).json({
      message: `${uploadedPhotos.length} photos uploaded successfully`,
      photos: uploadedPhotos
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error uploading photos.', error: error.message });
    }
  }
});

// DELETE a photo from local filesystem (requires authentication)
router.delete('/:id', (req, res, next) => {
  const { authenticateToken } = require('./auth-simple');
  authenticateToken(req, res, next);
}, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse ID to get file path (format: sister_a_filename or sister_b_filename)
    const parts = id.split('_');
    if (parts.length < 3) {
      return res.status(400).json({ message: 'Invalid photo ID.' });
    }
    
    const sister = `${parts[0]}_${parts[1]}`;  // sister_a or sister_b
    const filename = parts.slice(2).join('_');  // rest is filename
    
    const filePath = path.join(__dirname, '../uploads/wedding_gallery', sister, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ message: 'Photo not found.' });
    }
    
    // Delete the file
    await fs.unlink(filePath);
    
    console.log(`🗑️  Photo deleted: ${filename} from ${sister} gallery`);
    
    res.status(200).json({ message: 'Photo deleted successfully.', id });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Error deleting photo.', error: error.message });
  }
});

// Helper function to determine MIME type from file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.bmp': 'image/bmp'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = router;

