/**
 * Migration Script: Local Filesystem → Supabase Storage
 * 
 * Migrates all existing wedding photos from local uploads/ directory
 * to Supabase Storage and creates corresponding database records.
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
  console.error('Please check backend/.env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const LOCAL_UPLOADS_DIR = path.join(__dirname, '../uploads/wedding_gallery');
const STORAGE_BUCKET = 'wedding-photos';

/**
 * Get all image files from a directory
 */
async function getImageFiles(dir) {
  const files = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await getImageFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && /\.(jpg|jpeg|png|gif|heic|webp|bmp)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Get MIME type from file extension
 */
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

/**
 * Determine sister from file path
 */
function determineSister(filePath) {
  if (filePath.includes('sister_a')) return 'sister-a';
  if (filePath.includes('sister_b')) return 'sister-b';
  return 'sister-b'; // Default
}

/**
 * Upload a file to Supabase Storage
 */
async function uploadToSupabase(localPath, sister) {
  try {
    // Read file
    const fileBuffer = await fs.readFile(localPath);
    const filename = path.basename(localPath);
    const stats = await fs.stat(localPath);
    
    // Create storage path: sister-a/filename or sister-b/filename
    const storagePath = `${sister}/${filename}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: getMimeType(filename),
        upsert: true, // Replace if exists
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    
    const publicUrl = urlData.publicUrl;
    
    // Create database record
    const photoData = {
      filename: filename,
      file_path: storagePath,
      public_url: publicUrl,
      size: stats.size,
      mimetype: getMimeType(filename),
      sister: sister,
      storage_provider: 'supabase',
      uploaded_at: stats.birthtime || stats.ctime,
    };
    
    const { data: dbData, error: dbError } = await supabase
      .from('photos')
      .insert([photoData])
      .select()
      .single();
    
    if (dbError) {
      // If record already exists, update it
      if (dbError.code === '23505') { // Unique constraint violation
        const { data: updateData, error: updateError } = await supabase
          .from('photos')
          .update(photoData)
          .eq('file_path', storagePath)
          .select()
          .single();
        
        if (updateError) {
          throw updateError;
        }
        
        return { success: true, data: updateData, updated: true };
      }
      throw dbError;
    }
    
    return { success: true, data: dbData, updated: false };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting migration to Supabase...\n');
  
  // Check if uploads directory exists
  try {
    await fs.access(LOCAL_UPLOADS_DIR);
  } catch {
    console.error(`❌ Error: Uploads directory not found: ${LOCAL_UPLOADS_DIR}`);
    process.exit(1);
  }
  
  // Verify Supabase connection
  console.log('🔌 Verifying Supabase connection...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Failed to connect to Supabase:', bucketsError.message);
    process.exit(1);
  }
  
  // Check if bucket exists
  const bucketExists = buckets.some(b => b.name === STORAGE_BUCKET);
  if (!bucketExists) {
    console.error(`❌ Error: Storage bucket "${STORAGE_BUCKET}" does not exist`);
    console.error('Please create it in Supabase dashboard: Storage > New Bucket');
    process.exit(1);
  }
  
  console.log('✅ Connected to Supabase\n');
  
  // Get all image files
  console.log('📂 Scanning for photos...');
  const imageFiles = await getImageFiles(LOCAL_UPLOADS_DIR);
  
  if (imageFiles.length === 0) {
    console.log('⚠️  No photos found to migrate');
    return;
  }
  
  console.log(`📸 Found ${imageFiles.length} photos to migrate\n`);
  
  // Group by sister
  const sisterAFiles = imageFiles.filter(f => f.includes('sister_a'));
  const sisterBFiles = imageFiles.filter(f => f.includes('sister_b'));
  
  console.log(`Sister A: ${sisterAFiles.length} photos`);
  console.log(`Sister B: ${sisterBFiles.length} photos\n`);
  
  // Migrate files
  const results = {
    success: 0,
    failed: 0,
    updated: 0,
    errors: []
  };
  
  console.log('🔄 Uploading to Supabase...\n');
  
  for (const filePath of imageFiles) {
    const sister = determineSister(filePath);
    const filename = path.basename(filePath);
    
    process.stdout.write(`  Uploading ${filename} (${sister})... `);
    
    const result = await uploadToSupabase(filePath, sister);
    
    if (result.success) {
      if (result.updated) {
        console.log('✅ Updated');
        results.updated++;
      } else {
        console.log('✅ Uploaded');
      }
      results.success++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      results.failed++;
      results.errors.push({ file: filename, error: result.error });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully migrated: ${results.success} photos`);
  console.log(`📝 Updated existing:     ${results.updated} photos`);
  console.log(`❌ Failed:               ${results.failed} photos`);
  console.log(`📁 Sister A:             ${sisterAFiles.length} photos`);
  console.log(`📁 Sister B:             ${sisterBFiles.length} photos`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }
  
  console.log('\n✅ Migration complete!\n');
  
  // Next steps
  console.log('📝 Next steps:');
  console.log('  1. Verify photos in Supabase dashboard: Storage > wedding-photos');
  console.log('  2. Check database records: Table Editor > photos');
  console.log('  3. Test photo gallery: http://localhost:3000/sreedevi/gallery');
  console.log('  4. Run face data migration: node migrate-face-data.js\n');
}

// Run migration
migrate().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});

