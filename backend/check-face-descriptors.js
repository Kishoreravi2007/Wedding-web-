/**
 * Quick script to check if face descriptors exist in Supabase
 */

require('dotenv').config();
const { supabase } = require('./lib/supabase');

async function checkFaceDescriptors() {
  console.log('🔍 Checking face descriptors in Supabase...\n');

  try {
    // Check face_descriptors table
    const { data: descriptors, error: descError, count: descCount } = await supabase
      .from('face_descriptors')
      .select('*', { count: 'exact' })
      .limit(5);

    if (descError) {
      console.error('❌ Error querying face_descriptors:', descError.message);
    } else {
      console.log(`📊 Face Descriptors: ${descCount || 0} total`);
      if (descriptors && descriptors.length > 0) {
        console.log('Sample descriptors:');
        descriptors.forEach((desc, i) => {
          console.log(`  ${i + 1}. ID: ${desc.id}`);
          console.log(`     Photo ID: ${desc.photo_id}`);
          console.log(`     Person ID: ${desc.person_id || 'None'}`);
          console.log(`     Descriptor length: ${desc.descriptor?.length || 0}`);
        });
      } else {
        console.log('⚠️  No face descriptors found in database!');
      }
    }

    console.log('');

    // Check photos table
    const { data: photos, error: photoError, count: photoCount } = await supabase
      .from('photos')
      .select('id, filename, sister, storage_provider', { count: 'exact' })
      .limit(5);

    if (photoError) {
      console.error('❌ Error querying photos:', photoError.message);
    } else {
      console.log(`📸 Photos: ${photoCount || 0} total`);
      if (photos && photos.length > 0) {
        console.log('Sample photos:');
        photos.forEach((photo, i) => {
          console.log(`  ${i + 1}. ${photo.filename} (${photo.sister})`);
        });
      } else {
        console.log('⚠️  No photos found in database!');
      }
    }

    console.log('');

    // Check photo_faces table
    const { data: faces, error: facesError, count: facesCount } = await supabase
      .from('photo_faces')
      .select('*', { count: 'exact' })
      .limit(5);

    if (facesError) {
      console.error('❌ Error querying photo_faces:', facesError.message);
    } else {
      console.log(`👤 Photo Faces: ${facesCount || 0} total`);
      if (faces && faces.length > 0) {
        console.log('Sample face records:');
        faces.forEach((face, i) => {
          console.log(`  ${i + 1}. Photo: ${face.photo_id}, Person: ${face.person_id || 'Unknown'}`);
        });
      } else {
        console.log('⚠️  No photo_faces found in database!');
      }
    }

    console.log('\n📋 Summary:');
    console.log(`   Photos: ${photoCount || 0}`);
    console.log(`   Face Descriptors: ${descCount || 0}`);
    console.log(`   Photo Faces: ${facesCount || 0}`);

    if (!descCount || descCount === 0) {
      console.log('\n⚠️  ISSUE FOUND: No face descriptors in database!');
      console.log('');
      console.log('💡 To fix this:');
      console.log('   1. Upload photos using the photographer portal');
      console.log('   2. Make sure face detection is enabled during upload');
      console.log('   3. Check backend logs for "💾 Storing N face descriptor(s)"');
      console.log('   4. Verify face_descriptors are being saved to Supabase');
    } else {
      console.log('\n✅ Face descriptors exist! Photo booth should work.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkFaceDescriptors().then(() => {
  console.log('\n✅ Check complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

