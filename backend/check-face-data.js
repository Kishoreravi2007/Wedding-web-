/**
 * Diagnostic Script: Check Face Detection Data
 * 
 * This script checks:
 * 1. How many photos exist in the database
 * 2. How many have face descriptors
 * 3. Shows sample face data for debugging
 */

require('dotenv').config();
const { supabase } = require('./lib/supabase');
const { PhotoDB, FaceDescriptorDB, PhotoFaceDB } = require('./lib/sql-db');

async function checkFaceData() {
  console.log('🔍 Checking Face Detection Data...\n');

  try {
    // Get all photos
    const allPhotos = await PhotoDB.findAll();
    console.log(`📷 Total photos in database: ${allPhotos.length}\n`);

    // Check each photo for face data
    let photosWithFaces = 0;
    let photosWithoutFaces = 0;
    let totalFaces = 0;

    for (const photo of allPhotos) {
      const faces = await PhotoFaceDB.findByPhotoId(photo.id);

      if (faces && faces.length > 0) {
        photosWithFaces++;
        totalFaces += faces.length;
        console.log(`✅ ${photo.filename}: ${faces.length} face(s) detected`);

        // Show first face details for debugging
        if (faces[0].face_descriptor_id) {
          const descriptor = await FaceDescriptorDB.findById(faces[0].face_descriptor_id);
          if (descriptor) {
            console.log(`   └─ Descriptor length: ${descriptor.descriptor?.length || 0} dimensions`);
            console.log(`   └─ Confidence: ${descriptor.confidence}`);
          }
        }
      } else {
        photosWithoutFaces++;
        console.log(`❌ ${photo.filename}: NO faces detected`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY:');
    console.log('='.repeat(60));
    console.log(`📊 Total Photos: ${allPhotos.length}`);
    console.log(`✅ Photos WITH Faces: ${photosWithFaces}`);
    console.log(`❌ Photos WITHOUT Faces: ${photosWithoutFaces}`);
    console.log(`👤 Total Faces Detected: ${totalFaces}`);
    console.log('='.repeat(60));

    if (photosWithoutFaces > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log(`   ${photosWithoutFaces} photo(s) need face detection processing!`);
      console.log('\n   To fix this, you can either:');
      console.log('   1. Re-upload the photos (face detection will run automatically)');
      console.log('   2. Use the Face Processor tool in the photographer dashboard');
      console.log('   3. Run the manual face detection script');
    }

  } catch (error) {
    console.error('❌ Error checking face data:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkFaceData();

