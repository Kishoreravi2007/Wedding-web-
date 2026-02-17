/**
 * Diagnostic Script for Face Search Issues
 * 
 * This script helps identify why face search is returning wrong photos.
 * Run: node backend/diagnose_face_search.js
 */

const { PhotoDB, FaceDescriptorDB } = require('./lib/sql-db');
const { matchFace } = require('./lib/face-recognition');

async function diagnoseFaceSearch() {
  console.log('='.repeat(70));
  console.log('Face Search Diagnostic Tool');
  console.log('='.repeat(70));

  try {
    // Step 1: Check photo counts by wedding
    console.log('\n📸 Step 1: Checking Photo Counts by Wedding');
    console.log('-'.repeat(70));

    const allPhotos = await PhotoDB.findAll();
    const sisterAPhotos = allPhotos.filter(p => p.sister === 'sister-a');
    const sisterBPhotos = allPhotos.filter(p => p.sister === 'sister-b');
    const wrongPhotos = allPhotos.filter(p => p.sister && !['sister-a', 'sister-b'].includes(p.sister));
    const noSisterPhotos = allPhotos.filter(p => !p.sister);

    console.log(`Total photos: ${allPhotos.length}`);
    console.log(`  Sister A (Parvathy): ${sisterAPhotos.length}`);
    console.log(`  Sister B (Sreedevi): ${sisterBPhotos.length}`);
    console.log(`  Wrong sister field: ${wrongPhotos.length}`);
    console.log(`  Missing sister field: ${noSisterPhotos.length}`);

    if (wrongPhotos.length > 0) {
      console.log('\n⚠️  WARNING: Found photos with invalid sister field:');
      wrongPhotos.slice(0, 5).forEach(p => {
        console.log(`   - ${p.filename}: sister="${p.sister}"`);
      });
    }

    if (noSisterPhotos.length > 0) {
      console.log('\n⚠️  WARNING: Found photos with missing sister field:');
      noSisterPhotos.slice(0, 5).forEach(p => {
        console.log(`   - ${p.filename}: sister=undefined`);
      });
    }

    // Step 2: Check face descriptor distribution
    console.log('\n👤 Step 2: Checking Face Descriptor Distribution');
    console.log('-'.repeat(70));

    const allDescriptors = await FaceDescriptorDB.findAll();
    console.log(`Total face descriptors: ${allDescriptors.length}`);

    // Group by photo
    const descriptorsByPhoto = new Map();
    allDescriptors.forEach(desc => {
      if (!descriptorsByPhoto.has(desc.photo_id)) {
        descriptorsByPhoto.set(desc.photo_id, []);
      }
      descriptorsByPhoto.get(desc.photo_id).push(desc);
    });

    console.log(`Photos with face descriptors: ${descriptorsByPhoto.size}`);

    // Check face descriptors for each wedding
    const sisterADescriptors = [];
    const sisterBDescriptors = [];
    const unknownDescriptors = [];

    for (const [photoId, descriptors] of descriptorsByPhoto.entries()) {
      const photo = allPhotos.find(p => p.id === photoId);
      if (!photo) {
        unknownDescriptors.push(...descriptors);
        continue;
      }

      if (photo.sister === 'sister-a') {
        sisterADescriptors.push(...descriptors);
      } else if (photo.sister === 'sister-b') {
        sisterBDescriptors.push(...descriptors);
      } else {
        unknownDescriptors.push(...descriptors);
      }
    }

    console.log(`  Sister A descriptors: ${sisterADescriptors.length}`);
    console.log(`  Sister B descriptors: ${sisterBDescriptors.length}`);
    console.log(`  Unknown/wrong descriptors: ${unknownDescriptors.length}`);

    // Step 3: Test wedding filtering
    console.log('\n🔍 Step 3: Testing Wedding Filtering');
    console.log('-'.repeat(70));

    console.log('\nTesting Sister A filter:');
    const sisterAPhotosFiltered = await PhotoDB.findAll({ sister: 'sister-a' });
    console.log(`  Photos returned: ${sisterAPhotosFiltered.length}`);
    const wrongSisterA = sisterAPhotosFiltered.filter(p => p.sister !== 'sister-a');
    if (wrongSisterA.length > 0) {
      console.log(`  ❌ ERROR: ${wrongSisterA.length} photos have wrong sister field!`);
      wrongSisterA.slice(0, 3).forEach(p => {
        console.log(`     - ${p.filename}: sister="${p.sister}"`);
      });
    } else {
      console.log(`  ✅ All photos have correct sister field`);
    }

    console.log('\nTesting Sister B filter:');
    const sisterBPhotosFiltered = await PhotoDB.findAll({ sister: 'sister-b' });
    console.log(`  Photos returned: ${sisterBPhotosFiltered.length}`);
    const wrongSisterB = sisterBPhotosFiltered.filter(p => p.sister !== 'sister-b');
    if (wrongSisterB.length > 0) {
      console.log(`  ❌ ERROR: ${wrongSisterB.length} photos have wrong sister field!`);
      wrongSisterB.slice(0, 3).forEach(p => {
        console.log(`     - ${p.filename}: sister="${p.sister}"`);
      });
    } else {
      console.log(`  ✅ All photos have correct sister field`);
    }

    // Step 4: Check for cross-wedding face descriptors
    console.log('\n⚠️  Step 4: Checking for Cross-Wedding Issues');
    console.log('-'.repeat(70));

    // Get photos from sister-a
    const sisterAPhotoIds = sisterAPhotos.map(p => p.id);
    const sisterADescriptorsFromPhotos = allDescriptors.filter(d =>
      sisterAPhotoIds.includes(d.photo_id)
    );

    // Get photos from sister-b
    const sisterBPhotoIds = sisterBPhotos.map(p => p.id);
    const sisterBDescriptorsFromPhotos = allDescriptors.filter(d =>
      sisterBPhotoIds.includes(d.photo_id)
    );

    console.log(`Sister A photo IDs: ${sisterAPhotoIds.length}`);
    console.log(`Sister A descriptors from photos: ${sisterADescriptorsFromPhotos.length}`);
    console.log(`Sister B photo IDs: ${sisterBPhotoIds.length}`);
    console.log(`Sister B descriptors from photos: ${sisterBDescriptorsFromPhotos.length}`);

    // Check for descriptors that claim to be from one wedding but photo is in another
    const crossWeddingIssues = [];
    for (const desc of allDescriptors) {
      const photo = allPhotos.find(p => p.id === desc.photo_id);
      if (photo && desc.person) {
        // Check if person's sister field matches photo's sister field
        if (desc.person.sister && desc.person.sister !== 'both' && photo.sister !== desc.person.sister) {
          crossWeddingIssues.push({
            descriptorId: desc.id,
            photoId: photo.id,
            photoSister: photo.sister,
            personSister: desc.person.sister
          });
        }
      }
    }

    if (crossWeddingIssues.length > 0) {
      console.log(`\n❌ Found ${crossWeddingIssues.length} cross-wedding issues:`);
      crossWeddingIssues.slice(0, 5).forEach(issue => {
        console.log(`   - Descriptor ${issue.descriptorId}: Photo is ${issue.photoSister}, Person is ${issue.personSister}`);
      });
    } else {
      console.log(`\n✅ No cross-wedding issues found`);
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('Diagnostic Summary');
    console.log('='.repeat(70));

    const issues = [];
    if (wrongPhotos.length > 0) issues.push(`${wrongPhotos.length} photos with invalid sister field`);
    if (noSisterPhotos.length > 0) issues.push(`${noSisterPhotos.length} photos missing sister field`);
    if (wrongSisterA.length > 0) issues.push(`Sister A filter returning wrong photos`);
    if (wrongSisterB.length > 0) issues.push(`Sister B filter returning wrong photos`);
    if (crossWeddingIssues.length > 0) issues.push(`${crossWeddingIssues.length} cross-wedding issues`);

    if (issues.length === 0) {
      console.log('✅ No issues found! Database looks correct.');
      console.log('\nIf you\'re still getting wrong photos, the issue might be:');
      console.log('  1. Face matching threshold too lenient (currently 0.35)');
      console.log('  2. Similar-looking people in photos');
      console.log('  3. Face descriptors incorrectly linked');
      console.log('\nCheck backend logs during a search to see match distances.');
    } else {
      console.log('❌ Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\nThese issues need to be fixed before face search will work correctly.');
    }

  } catch (error) {
    console.error('❌ Error running diagnostic:', error);
    throw error;
  }
}

// Run diagnostic
diagnoseFaceSearch()
  .then(() => {
    console.log('\n✅ Diagnostic complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  });

