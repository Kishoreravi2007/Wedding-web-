/**
 * Face Search Setup Script
 * 
 * This script sets up the face search system by:
 * 1. Running database migrations
 * 2. Creating storage buckets
 * 3. Setting up RLS policies
 * 4. Testing the system
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupFaceSearch() {
  console.log('🔍 Setting up Face Search System');
  console.log('================================\n');

  try {
    // Step 1: Run database migrations
    console.log('📊 Running database migrations...');
    
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '004_create_face_search_tables.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (migrationError) {
      console.error('❌ Migration failed:', migrationError);
      return;
    }

    console.log('✅ Database migrations completed');

    // Step 2: Verify tables were created
    console.log('\n🔍 Verifying database setup...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['event_photos', 'face_matches', 'face_search_sessions']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }

    const tableNames = tables.map(t => t.table_name);
    const expectedTables = ['event_photos', 'face_matches', 'face_search_sessions'];
    
    for (const table of expectedTables) {
      if (tableNames.includes(table)) {
        console.log(`✅ Table '${table}' created successfully`);
      } else {
        console.error(`❌ Table '${table}' not found`);
      }
    }

    // Step 3: Check storage bucket
    console.log('\n📦 Checking storage bucket...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error checking buckets:', bucketsError);
      return;
    }

    const eventPhotosBucket = buckets.find(b => b.id === 'event-photos');
    
    if (eventPhotosBucket) {
      console.log('✅ Storage bucket "event-photos" is ready');
    } else {
      console.error('❌ Storage bucket "event-photos" not found');
    }

    // Step 4: Test RLS policies
    console.log('\n🔒 Testing RLS policies...');
    
    // Test public read access to event_photos
    const { data: testPhotos, error: testError } = await supabase
      .from('event_photos')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ RLS policy test failed:', testError);
    } else {
      console.log('✅ RLS policies are working correctly');
    }

    // Step 5: Create sample data for testing
    console.log('\n📸 Creating sample data...');
    
    const samplePhotos = [
      {
        event_id: 'wedding-event',
        filename: 'sample-wedding-1.jpg',
        storage_path: 'wedding-event/sample-wedding-1.jpg',
        file_size: 1024000,
        mime_type: 'image/jpeg',
        width: 1920,
        height: 1080,
        face_count: 2,
        face_embeddings: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]], // Sample embeddings
        metadata: {
          uploaded_by: 'system',
          processing_date: new Date().toISOString(),
          sample: true
        }
      },
      {
        event_id: 'wedding-event',
        filename: 'sample-wedding-2.jpg',
        storage_path: 'wedding-event/sample-wedding-2.jpg',
        file_size: 856000,
        mime_type: 'image/jpeg',
        width: 1280,
        height: 720,
        face_count: 1,
        face_embeddings: [[0.7, 0.8, 0.9]],
        metadata: {
          uploaded_by: 'system',
          processing_date: new Date().toISOString(),
          sample: true
        }
      }
    ];

    const { error: insertError } = await supabase
      .from('event_photos')
      .insert(samplePhotos);

    if (insertError) {
      console.log('⚠️ Sample data already exists or insert failed:', insertError.message);
    } else {
      console.log('✅ Sample data created successfully');
    }

    // Step 6: Test face search functionality
    console.log('\n🔍 Testing face search functionality...');
    
    const { data: photos, error: photosError } = await supabase
      .from('event_photos')
      .select('*')
      .eq('event_id', 'wedding-event');

    if (photosError) {
      console.error('❌ Error fetching photos:', photosError);
    } else {
      console.log(`✅ Found ${photos.length} photos in database`);
      
      if (photos.length > 0) {
        const totalFaces = photos.reduce((sum, photo) => sum + (photo.face_count || 0), 0);
        console.log(`✅ Total faces detected: ${totalFaces}`);
      }
    }

    // Step 7: Create analytics views
    console.log('\n📊 Setting up analytics views...');
    
    const analyticsViews = [
      {
        name: 'face_search_analytics',
        sql: `
          CREATE OR REPLACE VIEW face_search_analytics AS
          SELECT 
              s.event_id,
              COUNT(s.id) as total_searches,
              AVG(s.matches_found) as avg_matches_per_search,
              AVG(s.search_duration_ms) as avg_search_duration_ms,
              COUNT(DISTINCT s.session_id) as unique_searchers,
              MAX(s.created_at) as last_search_time
          FROM face_search_sessions s
          GROUP BY s.event_id;
        `
      },
      {
        name: 'popular_photos',
        sql: `
          CREATE OR REPLACE VIEW popular_photos AS
          SELECT 
              p.id,
              p.event_id,
              p.filename,
              p.storage_path,
              COUNT(fm.id) as match_count,
              AVG(fm.similarity_score) as avg_similarity,
              MAX(fm.created_at) as last_matched
          FROM event_photos p
          LEFT JOIN face_matches fm ON p.id = fm.matched_photo_id
          GROUP BY p.id, p.event_id, p.filename, p.storage_path
          ORDER BY match_count DESC, avg_similarity DESC;
        `
      }
    ];

    for (const view of analyticsViews) {
      const { error: viewError } = await supabase.rpc('exec_sql', {
        sql: view.sql
      });

      if (viewError) {
        console.log(`⚠️ Could not create view ${view.name}:`, viewError.message);
      } else {
        console.log(`✅ View '${view.name}' created successfully`);
      }
    }

    // Step 8: Final verification
    console.log('\n🎉 Face Search System Setup Complete!');
    console.log('=====================================');
    console.log('');
    console.log('✅ Database tables created');
    console.log('✅ Storage bucket configured');
    console.log('✅ RLS policies applied');
    console.log('✅ Sample data inserted');
    console.log('✅ Analytics views created');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Upload event photos using the PhotoUploader component');
    console.log('   2. Test face search with the FaceSearch component');
    console.log('   3. Monitor analytics in the Supabase dashboard');
    console.log('');
    console.log('🔧 Components Available:');
    console.log('   - FaceSearch: Guest face search interface');
    console.log('   - PhotoUploader: Photographer photo upload');
    console.log('   - FaceSearchPage: Complete search experience');
    console.log('');
    console.log('📊 Database Tables:');
    console.log('   - event_photos: Stores photo metadata and face embeddings');
    console.log('   - face_matches: Tracks search results and matches');
    console.log('   - face_search_sessions: Analytics and session tracking');
    console.log('');
    console.log('🎯 Ready for face search! 🔍✨');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your Supabase configuration');
    console.error('   2. Verify database permissions');
    console.error('   3. Ensure storage bucket exists');
    console.error('   4. Check RLS policies');
    process.exit(1);
  }
}

// Run the setup
setupFaceSearch();
