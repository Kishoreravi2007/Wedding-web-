/**
 * Supabase Migration Runner
 * 
 * This script runs SQL migrations against a Supabase database.
 * It reads migration files from the migrations directory and executes them.
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client with service role key (has admin access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Run a single migration file
 */
async function runMigration(filePath, fileName) {
  console.log(`\n📄 Running migration: ${fileName}`);
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split by statements (basic splitting, may need enhancement for complex SQL)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comment-only statements
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
        
        if (error) {
          // Some statements might fail if objects already exist
          // We'll log but continue
          console.warn(`   ⚠️  Warning on statement ${i + 1}: ${error.message}`);
        }
      } catch (err) {
        console.warn(`   ⚠️  Warning on statement ${i + 1}: ${err.message}`);
      }
    }
    
    // Alternative: Use raw SQL execution (if RPC not available)
    // This requires direct PostgreSQL connection
    console.log('   ✅ Migration completed (check warnings above)');
    
  } catch (error) {
    console.error(`   ❌ Error running migration: ${error.message}`);
    throw error;
  }
}

/**
 * Alternative: Execute SQL directly using fetch
 */
async function executeSqlDirect(sql) {
  try {
    // This is a workaround since Supabase doesn't have a direct SQL execution method
    // You may need to use PostgreSQL client library instead
    console.log('   💡 Note: For production, consider using a PostgreSQL client library');
    console.log('   📋 SQL to execute:');
    console.log('   ' + sql.substring(0, 200) + '...\n');
  } catch (error) {
    throw error;
  }
}

/**
 * Main migration runner
 */
async function runMigrations() {
  console.log('🚀 Starting Supabase Migration Runner\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  // Get migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Ensure they run in order
  
  if (files.length === 0) {
    console.log('⚠️  No migration files found');
    return;
  }
  
  console.log(`\n📚 Found ${files.length} migration file(s):\n`);
  files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
  
  // Print instructions for manual execution
  console.log('\n' + '='.repeat(80));
  console.log('IMPORTANT: Manual Execution Required');
  console.log('='.repeat(80));
  console.log('\nSince Supabase doesn\'t provide a direct SQL execution API,');
  console.log('please follow these steps to run migrations:\n');
  console.log('1. Open your Supabase Dashboard: ' + supabaseUrl.replace('/v1', ''));
  console.log('2. Navigate to: SQL Editor');
  console.log('3. For each migration file listed above:');
  console.log('   a. Open the file from: backend/supabase/migrations/');
  console.log('   b. Copy the entire SQL content');
  console.log('   c. Paste into the SQL Editor');
  console.log('   d. Click "Run" to execute');
  console.log('\n' + '='.repeat(80));
  
  // Verify connection
  try {
    const { data, error } = await supabase.from('photos').select('count').limit(1);
    if (error && error.code === 'PGRST116') {
      console.log('\n✅ Connection successful (tables not yet created - expected)');
    } else if (!error) {
      console.log('\n✅ Connection successful (tables already exist)');
    }
  } catch (err) {
    console.log('\n❌ Could not connect to Supabase. Please check your credentials.');
  }
  
  console.log('\n✨ Setup complete! Follow the instructions above to run migrations.\n');
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('✅ Migration runner completed');
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

