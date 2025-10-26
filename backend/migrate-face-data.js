/**
 * Migration Script: Face Detection Data → Supabase
 * 
 * Migrates face detection data (guest mappings and reference images)
 * to Supabase Storage and Database.
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const STORAGE_BUCKET = 'wedding-photos';
const REFERENCE_IMAGES_DIR = path.join(__dirname, 'reference_images');
const GUEST_MAPPING_FILES = {
  'sister-a': path.join(__dirname, 'guest_mapping_sister_a.json'),
  'sister-b': path.join(__dirname, 'guest_mapping_sister_b.json')
};

/**
 * Load guest mapping file
 */
async function loadGuestMapping(sister) {
  try {
    const filePath = GUEST_MAPPING_FILES[sister];
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.log(`  ℹ️  No guest mapping found for ${sister}`);
    return {};
  }
}

/**
 * Upload reference image to Supabase Storage
 */
async function uploadReferenceImage(localPath, guestId, sister) {
  try {
    const fileBuffer = await fs.readFile(localPath);
    const filename = path.basename(localPath);
    
    // Create storage path: reference_images/sister-a/Guest_001/Guest_001_rep.jpg
    const storagePath = `reference_images/${sister}/${guestId}/${filename}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    
    return urlData.publicUrl;
    
  } catch (error) {
    console.error(`  ❌ Failed to upload reference image: ${error.message}`);
    return null;
  }
}

/**
 * Migrate guest data for a sister
 */
async function migrateGuestData(sister) {
  console.log(`\n📁 Migrating ${sister} guest data...`);
  
  // Load guest mapping
  const guestMapping = await loadGuestMapping(sister);
  const guestIds = Object.keys(guestMapping);
  
  if (guestIds.length === 0) {
    console.log(`  ℹ️  No guests found for ${sister}`);
    return { success: 0, failed: 0 };
  }
  
  console.log(`  Found ${guestIds.length} guests\n`);
  
  const results = { success: 0, failed: 0 };
  
  for (const guestId of guestIds) {
    const photoPaths = guestMapping[guestId];
    
    process.stdout.write(`  Processing ${guestId}... `);
    
    try {
      // Upload reference image
      const sisterDirName = sister.replace('-', '_');
      const referenceImagePath = path.join(
        REFERENCE_IMAGES_DIR,
        sisterDirName,
        guestId,
        `${guestId}_rep.jpg`
      );
      
      let referenceImageUrl = null;
      
      // Check if reference image exists
      try {
        await fs.access(referenceImagePath);
        referenceImageUrl = await uploadReferenceImage(referenceImagePath, guestId, sister);
      } catch {
        console.log('⚠️  No reference image found');
      }
      
      // Create/update people record
      const { data: personData, error: personError } = await supabase
        .from('people')
        .upsert([
          {
            guest_id: guestId,
            name: guestId, // Can be updated later
            sister: sister,
            role: 'guest'
          }
        ], { onConflict: 'guest_id' })
        .select()
        .single();
      
      if (personError) {
        throw personError;
      }
      
      // Create/update guest mapping record
      const { error: mappingError } = await supabase
        .from('guest_mappings')
        .upsert([
          {
            guest_id: guestId,
            sister: sister,
            photo_paths: photoPaths,
            reference_image_url: referenceImageUrl
          }
        ], { onConflict: 'guest_id,sister' });
      
      if (mappingError) {
        throw mappingError;
      }
      
      console.log('✅');
      results.success++;
      
    } catch (error) {
      console.log(`❌ ${error.message}`);
      results.failed++;
    }
  }
  
  return results;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting face data migration to Supabase...\n');
  
  // Verify Supabase connection
  console.log('🔌 Verifying Supabase connection...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Failed to connect to Supabase:', bucketsError.message);
    process.exit(1);
  }
  
  console.log('✅ Connected to Supabase');
  
  // Migrate both sisters
  const sisterAResults = await migrateGuestData('sister-a');
  const sisterBResults = await migrateGuestData('sister-b');
  
  // Summary
  const totalSuccess = sisterAResults.success + sisterBResults.success;
  const totalFailed = sisterAResults.failed + sisterBResults.failed;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Face Data Migration Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully migrated: ${totalSuccess} guests`);
  console.log(`❌ Failed:               ${totalFailed} guests`);
  console.log(`📁 Sister A:             ${sisterAResults.success} guests`);
  console.log(`📁 Sister B:             ${sisterBResults.success} guests`);
  
  console.log('\n✅ Face data migration complete!\n');
  
  // Next steps
  console.log('📝 Next steps:');
  console.log('  1. Verify guest records: Table Editor > people');
  console.log('  2. Check guest mappings: Table Editor > guest_mappings');
  console.log('  3. Verify reference images: Storage > wedding-photos > reference_images');
  console.log('  4. Test face admin: http://localhost:3000/face-admin\n');
}

// Run migration
migrate().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});

