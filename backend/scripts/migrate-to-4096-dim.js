/**
 * Migration Script: Reprocess Photos to 4096-dim VGG-Face Embeddings
 * 
 * This script fetches all existing photos and re-extracts face descriptors
 * using the DeepFace API (VGG-Face model, 4096 dimensions) to replace
 * old 128-dim face-api.js embeddings.
 * 
 * Usage:
 *   node scripts/migrate-to-4096-dim.js [--batch-size=10] [--sister=sister-a]
 */

require('dotenv').config();
const axios = require('axios');
const { query } = require('../lib/db-gcp');

const DEEPFACE_API_URL = process.env.DEEPFACE_API_URL || 'https://deepface-979970479540.asia-south1.run.app';
const BATCH_SIZE = parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '10');
const SISTER_FILTER = process.argv.find(arg => arg.startsWith('--sister='))?.split('=')[1] || null;

async function migrateToVGGFace() {
    try {
        console.log('🚀 Starting migration to 4096-dim VGG-Face embeddings...\n');
        console.log(`Configuration:`);
        console.log(`  DeepFace API: ${DEEPFACE_API_URL}`);
        console.log(`  Batch size: ${BATCH_SIZE}`);
        console.log(`  Sister filter: ${SISTER_FILTER || 'All'}\n`);

        // Get all photos
        let photosQuery = 'SELECT id, filename, public_url, sister FROM photos WHERE public_url IS NOT NULL';
        if (SISTER_FILTER) {
            photosQuery += ` AND sister = '${SISTER_FILTER}'`;
        }
        photosQuery += ' ORDER BY created_at DESC';

        const { rows: photos } = await query(photosQuery);
        console.log(`📸 Found ${photos.length} photos to process\n`);

        let processed = 0;
        let facesUpdated = 0;
        let errors = 0;

        for (let i = 0; i < photos.length; i += BATCH_SIZE) {
            const batch = photos.slice(i, i + BATCH_SIZE);
            console.log(`\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(photos.length / BATCH_SIZE)} (${batch.length} photos)...`);

            for (const photo of batch) {
                try {
                    console.log(`  Processing: ${photo.filename}...`);

                    // Fetch image from GCS
                    const imageRes = await axios.get(photo.public_url, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(imageRes.data);

                    // Create FormData for DeepFace API
                    const FormData = require('form-data');
                    const formData = new FormData();
                    formData.append('file', imageBuffer, { filename: photo.filename });
                    formData.append('detector_backend', 'yolov8');

                    // Call DeepFace API to extract 4096-dim embeddings
                    const detectRes = await axios.post(`${DEEPFACE_API_URL}/api/faces/detect`, formData, {
                        headers: formData.getHeaders(),
                        timeout: 30000
                    });

                    const { faces } = detectRes.data;

                    if (!faces || faces.length === 0) {
                        console.log(`    ⚠️  No faces detected`);
                        processed++;
                        continue;
                    }

                    console.log(`    ✅ Detected ${faces.length} face(s)`);

                    // Delete old face descriptors for this photo
                    await query('DELETE FROM face_descriptors WHERE photo_id = $1', [photo.id]);

                    // Insert new 4096-dim descriptors
                    for (const face of faces) {
                        await query(`
              INSERT INTO face_descriptors (photo_id, descriptor, confidence, created_at, updated_at)
              VALUES ($1, $2, $3, NOW(), NOW())
            `, [photo.id, face.embedding, face.det_score || 0.9]);
                        facesUpdated++;
                    }

                    processed++;
                    console.log(`    💾 Saved ${faces.length} 4096-dim descriptor(s)`);

                } catch (error) {
                    console.error(`    ❌ Error: ${error.message}`);
                    errors++;
                }

                // Small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Progress summary
            console.log(`\n📊 Progress: ${processed}/${photos.length} photos, ${facesUpdated} faces updated, ${errors} errors`);
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Photos processed: ${processed}`);
        console.log(`   Faces updated: ${facesUpdated}`);
        console.log(`   Errors: ${errors}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateToVGGFace();
