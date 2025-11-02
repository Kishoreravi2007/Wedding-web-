/**
 * Check users table structure in Supabase
 */

require('dotenv').config();
const { supabase } = require('./lib/supabase');

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...\n');

  try {
    // Try to get a sample user to see the schema
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying users table:', error.message);
      console.log('\nError details:', error);
      
      if (error.code === '42P01') {
        console.log('\n⚠️  Users table does not exist!');
        console.log('\n💡 Run the migration: backend/supabase/migrations/002_create_users_table.sql');
      }
    } else {
      console.log('✅ Users table exists!');
      console.log(`📊 Current users count: ${data?.length || 0}\n`);
      
      if (data && data.length > 0) {
        console.log('Sample user structure:');
        console.log(JSON.stringify(data[0], null, 2));
        console.log('\nColumns:');
        Object.keys(data[0]).forEach(col => {
          console.log(`  - ${col}: ${typeof data[0][col]}`);
        });
      } else {
        console.log('ℹ️  No users in table yet.');
        console.log('\n💡 Table exists but is empty. Schema should be checked via SQL.');
      }
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

checkUsersTable().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

