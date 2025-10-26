/**
 * Test Supabase Connection
 * 
 * Verifies that Supabase credentials are configured correctly
 * and the database/storage is accessible.
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔌 Testing Supabase Connection...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`  SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`  SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '⚠️  Missing (optional)'}`);
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in backend/.env\n');
  console.log('Example .env file:');
  console.log('  SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('  SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
  process.exit(1);
}

// Test connection with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🧪 Running Tests...\n');
  
  // Test 1: Storage buckets
  console.log('1️⃣  Testing Storage Access...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    console.log(`  ✅ Storage accessible`);
    console.log(`  📦 Found ${buckets.length} bucket(s):`);
    
    buckets.forEach(bucket => {
      console.log(`     - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    // Check for wedding-photos bucket
    const weddingBucket = buckets.find(b => b.name === 'wedding-photos');
    if (weddingBucket) {
      console.log(`  ✅ wedding-photos bucket exists`);
    } else {
      console.log(`  ⚠️  wedding-photos bucket not found - create it in Supabase dashboard`);
    }
    
  } catch (error) {
    console.log(`  ❌ Storage error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 2: Database tables
  console.log('2️⃣  Testing Database Access...');
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`  ⚠️  Table 'photos' does not exist - run database schema SQL`);
      } else {
        throw error;
      }
    } else {
      console.log(`  ✅ Database accessible`);
      console.log(`  ✅ Table 'photos' exists`);
    }
    
  } catch (error) {
    console.log(`  ❌ Database error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 3: Count existing photos
  console.log('3️⃣  Checking Existing Data...');
  try {
    const { count: photoCount, error: photoError } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true });
    
    if (photoError && photoError.code !== 'PGRST116') {
      throw photoError;
    }
    
    if (!photoError) {
      console.log(`  📸 Photos in database: ${photoCount || 0}`);
      
      // Count by sister
      const { data: sisterAPhotos } = await supabase
        .from('photos')
        .select('id')
        .eq('sister', 'sister-a');
      
      const { data: sisterBPhotos } = await supabase
        .from('photos')
        .select('id')
        .eq('sister', 'sister-b');
      
      console.log(`     Sister A: ${sisterAPhotos?.length || 0}`);
      console.log(`     Sister B: ${sisterBPhotos?.length || 0}`);
    }
    
  } catch (error) {
    console.log(`  ℹ️  Could not check data: ${error.message}`);
  }
  
  console.log('');
  
  // Summary
  console.log('='.repeat(50));
  console.log('📊 Connection Test Summary');
  console.log('='.repeat(50));
  console.log('');
  console.log('If all tests passed (✅), you\'re ready to migrate!');
  console.log('Run: node migrate-to-supabase.js');
  console.log('');
  console.log('If you see warnings (⚠️):');
  console.log('  1. Create "wedding-photos" bucket in Supabase Storage');
  console.log('  2. Run database schema SQL in Supabase SQL Editor');
  console.log('  3. See SUPABASE_SETUP_GUIDE.md for detailed instructions');
  console.log('');
}

testConnection().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});

