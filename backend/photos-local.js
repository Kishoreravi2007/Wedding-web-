const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const sister = req.body.sister;
    const uploadDir = path.join(__dirname, '../uploads/wedding_gallery', sister.replace('-', '_'));
    
    // Ensure directory exists
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}_${uniqueSuffix}${ext}`);
  }
});

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
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
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

// POST upload photos to local filesystem
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo file uploaded.' });
    }
    
    const { sister } = req.body;
    if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
      // Clean up uploaded file if validation fails
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'Invalid or missing sister identifier.' });
    }

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const galleryName = sister.replace('-', '_');
    const publicUrl = `${baseUrl}/uploads/wedding_gallery/${galleryName}/${req.file.filename}`;
    
    const photoData = {
      id: `${galleryName}_${req.file.filename}`,
      filename: req.file.originalname,
      file_path: `${galleryName}/${req.file.filename}`,
      public_url: publicUrl,
      url: publicUrl,
      thumbnail: publicUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
      sister: sister,
      uploadedAt: new Date(),
      storage_provider: 'local'
    };
    
    console.log(`✅ Photo uploaded successfully: ${req.file.filename} to ${sister} gallery`);
    
    res.status(201).json(photoData);
  } catch (error) {
    console.error('Error uploading photo:', error);
    
    // Clean up file if there was an error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error uploading photo.', error: error.message });
    }
  }
});

// POST upload multiple photos at once
router.post('/batch', upload.array('photos', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded.' });
    }
    
    const { sister } = req.body;
    if (!sister || !['sister-a', 'sister-b'].includes(sister)) {
      // Clean up uploaded files
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
      return res.status(400).json({ message: 'Invalid or missing sister identifier.' });
    }

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const galleryName = sister.replace('-', '_');
    
    const uploadedPhotos = req.files.map(file => ({
      id: `${galleryName}_${file.filename}`,
      filename: file.originalname,
      file_path: `${galleryName}/${file.filename}`,
      public_url: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${file.filename}`,
      url: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${file.filename}`,
      thumbnail: `${baseUrl}/uploads/wedding_gallery/${galleryName}/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      sister: sister,
      uploadedAt: new Date(),
      storage_provider: 'local'
    }));
    
    console.log(`✅ ${uploadedPhotos.length} photos uploaded successfully to ${sister} gallery`);
    
    res.status(201).json({
      message: `${uploadedPhotos.length} photos uploaded successfully`,
      photos: uploadedPhotos
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    
    // Clean up files if there was an error
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }
    
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error uploading photos.', error: error.message });
    }
  }
});

// DELETE a photo from local filesystem
router.delete('/:id', async (req, res) => {
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

