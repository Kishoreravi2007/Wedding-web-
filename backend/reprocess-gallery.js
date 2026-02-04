/**
 * Reprocess Gallery - Extract Face Descriptors Using DeepFace API
 * 
 * This script processes all photos in the uploads directory, extracts face
 * embeddings using the DeepFace API (512-dim VGG-Face), and stores them
 * in the database for face search functionality.
 * 
 * Usage: node reprocess-gallery.js [--wedding <slug>] [--force]
 *   --wedding <slug>  Only process photos for a specific wedding
 *   --force           Reprocess photos even if they already have face data
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { PhotoDB, FaceDescriptorDB, PhotoFaceDB } = require('./lib/sql-db');

const DEEPFACE_API_URL = process.env.DEEPFACE_API_URL || 'http://localhost:8002';
const UPLOADS_PATH = path.join(__dirname, process.env.LOCAL_STORAGE_PATH || 'uploads');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Get all image files from the uploads directory recursively
 */
function getAllImageFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllImageFiles(filePath, fileList);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (IMAGE_EXTENSIONS.includes(ext)) {
                fileList.push(filePath);
            }
        }
    }

    return fileList;
}

/**
 * Extract the wedding slug (sister) from the file path
 * Assumes structure: uploads/<wedding-slug>/...
 */
function extractWeddingSlug(filePath) {
    const relativePath = path.relative(UPLOADS_PATH, filePath);
    const parts = relativePath.split(path.sep);
    return parts.length > 1 ? parts[0] : null;
}

/**
 * Call DeepFace API to detect faces and extract embeddings
 */
async function detectFaces(imagePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('detector_backend', 'yolov8');
    formData.append('conf_threshold', '0.5');
    formData.append('imgsz', '1280');

    try {
        const response = await axios.post(
            `${DEEPFACE_API_URL}/api/faces/detect`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 300000 // 5 min timeout for large images or model loading
            }
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`DeepFace API error: ${error.response.data?.detail || error.response.status}`);
        }
        throw error;
    }
}

/**
 * Ensure a photo record exists in the database
 */
async function ensurePhotoRecord(filePath, weddingSlug) {
    const filename = path.basename(filePath);
    const relativePath = path.relative(UPLOADS_PATH, filePath).replace(/\\/g, '/');

    // Check if photo already exists by file_path
    const existingPhotos = await PhotoDB.findAll({ limit: 1000 });
    let photo = existingPhotos.find(p => p.file_path === relativePath || p.filename === filename);

    if (!photo) {
        // Create new photo record
        const stat = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' :
            ext === '.webp' ? 'image/webp' :
                ext === '.gif' ? 'image/gif' : 'image/jpeg';

        photo = await PhotoDB.create({
            filename: filename,
            file_path: relativePath,
            public_url: `/uploads/${relativePath}`,
            size: stat.size,
            mimetype: mimeType,
            sister: weddingSlug,
            title: '',
            description: '',
            event_type: '',
            tags: [],
            storage_provider: 'local'
        });

        console.log(`   📷 Created photo record: ${photo.id.substring(0, 8)}...`);
    }

    return photo;
}

/**
 * Store face embeddings in the database
 */
async function storeFaceData(photo, faces) {
    let storedCount = 0;

    for (const face of faces) {
        if (!face.embedding || face.embedding.length === 0) {
            console.log(`   ⚠️  Skipping face with no embedding`);
            continue;
        }

        try {
            // Create face descriptor
            const descriptor = await FaceDescriptorDB.create({
                photo_id: photo.id,
                descriptor: face.embedding,
                confidence: face.det_score || 0.9
            });

            // Create photo_face link
            await PhotoFaceDB.create({
                photo_id: photo.id,
                face_descriptor_id: descriptor.id,
                bounding_box: {
                    x: face.bbox[0],
                    y: face.bbox[1],
                    width: face.bbox[2],
                    height: face.bbox[3]
                },
                confidence: face.det_score || 0.9,
                is_verified: false
            });

            storedCount++;
        } catch (err) {
            console.error(`   ❌ Error storing face: ${err.message}`);
        }
    }

    return storedCount;
}

/**
 * Check if a photo already has face data
 */
async function hasExistingFaceData(photoId) {
    const faces = await PhotoFaceDB.findByPhotoId(photoId);
    return faces && faces.length > 0;
}

/**
 * Main processing function
 */
async function processGallery(options = {}) {
    const { weddingFilter, force } = options;

    console.log('\n' + '='.repeat(70));
    console.log('🎯 Gallery Reprocessing - Face Embedding Extraction');
    console.log('='.repeat(70));
    console.log(`📁 Uploads path: ${UPLOADS_PATH}`);
    console.log(`🌐 DeepFace API: ${DEEPFACE_API_URL}`);
    console.log(`🎊 Wedding filter: ${weddingFilter || 'All'}`);
    console.log(`🔄 Force reprocess: ${force ? 'Yes' : 'No'}`);
    console.log('');

    // Verify DeepFace API is running
    try {
        const health = await axios.get(`${DEEPFACE_API_URL}/health`);
        console.log(`✅ DeepFace API is healthy: ${health.data.backend}`);
    } catch (err) {
        console.error(`❌ DeepFace API is not reachable at ${DEEPFACE_API_URL}`);
        console.error(`   Make sure to run: python deepface_api.py`);
        process.exit(1);
    }

    // Get all image files
    const allImages = getAllImageFiles(UPLOADS_PATH);
    console.log(`\n📷 Found ${allImages.length} image(s) in uploads\n`);

    let processed = 0;
    let skipped = 0;
    let errors = 0;
    let totalFaces = 0;

    for (const imagePath of allImages) {
        const filename = path.basename(imagePath);
        const weddingSlug = extractWeddingSlug(imagePath);

        // Apply wedding filter
        if (weddingFilter && weddingSlug !== weddingFilter) {
            continue;
        }

        console.log(`\n🔍 Processing: ${filename}`);
        console.log(`   Wedding: ${weddingSlug || 'Unknown'}`);

        try {
            // Ensure photo record exists
            const photo = await ensurePhotoRecord(imagePath, weddingSlug);

            // Check for existing face data
            if (!force && await hasExistingFaceData(photo.id)) {
                console.log(`   ⏭️  Skipping (already has face data)`);
                skipped++;
                continue;
            }

            // Detect faces
            console.log(`   🔬 Detecting faces...`);
            const result = await detectFaces(imagePath);

            if (!result.faces || result.faces.length === 0) {
                console.log(`   ⚠️  No faces detected`);
                processed++;
                continue;
            }

            console.log(`   👤 Found ${result.faces.length} face(s) (${result.embedding_dimension}-dim ${result.model})`);

            // Store face data
            const storedFaces = await storeFaceData(photo, result.faces);
            totalFaces += storedFaces;

            console.log(`   ✅ Stored ${storedFaces} face embedding(s)`);
            processed++;

        } catch (err) {
            console.error(`   ❌ Error: ${err.message}`);
            errors++;
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 PROCESSING COMPLETE');
    console.log('='.repeat(70));
    console.log(`✅ Processed: ${processed} photos`);
    console.log(`⏭️  Skipped: ${skipped} photos (already had face data)`);
    console.log(`❌ Errors: ${errors} photos`);
    console.log(`👤 Total faces extracted: ${totalFaces}`);
    console.log('='.repeat(70));

    if (totalFaces > 0) {
        console.log('\n🎉 SUCCESS! Face embeddings are now ready for search.');
        console.log('   Guests can use the Photo Booth to find their photos.');
    } else if (processed === 0 && skipped > 0) {
        console.log('\n✅ All photos already have face data. Use --force to reprocess.');
    } else {
        console.log('\n⚠️  No faces were extracted. Check image quality or API logs.');
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    weddingFilter: null,
    force: false
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--wedding' && args[i + 1]) {
        options.weddingFilter = args[i + 1];
        i++;
    } else if (args[i] === '--force') {
        options.force = true;
    }
}

// Run
processGallery(options)
    .then(() => process.exit(0))
    .catch(err => {
        console.error('\n❌ Fatal error:', err);
        process.exit(1);
    });
