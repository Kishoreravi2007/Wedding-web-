/**
 * Process Existing Photos - Extract Face Descriptors
 * 
 * This script processes all photos in the database that don't have face descriptors,
 * downloads them from Supabase storage, detects faces, and stores the descriptors.
 */

require('dotenv').config();
const { supabase } = require('./lib/supabase');
const { PhotoDB, FaceDescriptorDB, PhotoFaceDB } = require('./lib/supabase-db');
const canvas = require('canvas');
const faceapi = require('face-api.js');

// Patch face-api.js to work with Node.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load face detection models
async function loadModels() {
  console.log('📥 Loading face-api models...');
  const modelPath = './models';
  
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)
  ]);
  
  console.log('✅ Models loaded successfully\n');
}

// Process a single photo
async function processPhoto(photo) {
  try {
    console.log(`\n🔍 Processing: ${photo.filename}`);
    
    // Download photo from Supabase storage
    const { data: photoBlob, error: downloadError } = await supabase.storage
      .from('wedding-photos')
      .download(photo.file_path);
    
    if (downloadError) {
      throw new Error(`Download failed: ${downloadError.message}`);
    }
    
    // Convert blob to buffer
    const buffer = Buffer.from(await photoBlob.arrayBuffer());
    
    // Create image from buffer
    const img = await canvas.loadImage(buffer);
    
    // Detect faces
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416 }))
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    console.log(`   Found ${detections.length} face(s)`);
    
    if (detections.length === 0) {
      console.log('   ⚠️  No faces detected in this photo');
      return { success: true, faces: 0 };
    }
    
    // Store face descriptors
    let storedFaces = 0;
    for (const detection of detections) {
      try {
        // Store face descriptor
        const faceDescriptor = await FaceDescriptorDB.create({
          photo_id: photo.id,
          descriptor: Array.from(detection.descriptor),
          confidence: detection.detection.score
        });
        
        // Create photo_face record
        await PhotoFaceDB.create({
          photo_id: photo.id,
          face_descriptor_id: faceDescriptor.id,
          bounding_box: {
            x: detection.detection.box.x,
            y: detection.detection.box.y,
            width: detection.detection.box.width,
            height: detection.detection.box.height
          },
          confidence: detection.detection.score,
          is_verified: false
        });
        
        storedFaces++;
      } catch (faceError) {
        console.error('   ❌ Error storing face:', faceError.message);
      }
    }
    
    console.log(`   ✅ Stored ${storedFaces} face descriptor(s)`);
    return { success: true, faces: storedFaces };
    
  } catch (error) {
    console.error(`   ❌ Error processing photo: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main function
async function processAllPhotos() {
  console.log('🎯 Face Detection Processing for Existing Photos\n');
  console.log('='.repeat(60));
  
  try {
    // Load models
    await loadModels();
    
    // Get all photos
    const allPhotos = await PhotoDB.findAll();
    console.log(`📷 Found ${allPhotos.length} photos in database\n`);
    
    let processed = 0;
    let skipped = 0;
    let totalFaces = 0;
    let errors = 0;
    
    for (const photo of allPhotos) {
      // Check if photo already has face data
      const existingFaces = await PhotoFaceDB.findByPhotoId(photo.id);
      
      if (existingFaces && existingFaces.length > 0) {
        console.log(`⏭️  Skipping ${photo.filename} (already processed)`);
        skipped++;
        continue;
      }
      
      // Process photo
      const result = await processPhoto(photo);
      
      if (result.success) {
        processed++;
        totalFaces += result.faces;
      } else {
        errors++;
      }
      
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('PROCESSING COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully Processed: ${processed} photos`);
    console.log(`⏭️  Skipped (Already Done): ${skipped} photos`);
    console.log(`❌ Errors: ${errors} photos`);
    console.log(`👤 Total Faces Detected: ${totalFaces}`);
    console.log('='.repeat(60));
    
    if (totalFaces > 0) {
      console.log('\n🎉 SUCCESS! Face detection is now ready to use!');
      console.log('   Guests can now use the Photo Booth to find their photos.');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
processAllPhotos();

