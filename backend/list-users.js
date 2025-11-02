/**
 * List all users in Supabase database
 */

require('dotenv').config();
const { supabase } = require('./lib/supabase');

async function listUsers() {
  console.log('👥 Listing all users...\n');

  try {
    const { data: users, error, count } = await supabase
      .from('users')
      .select('id, username, role, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`📊 Total users: ${count || 0}\n`);

    if (!users || users.length === 0) {
      console.log('⚠️  No users found in database!\n');
      console.log('💡 Create a user with:');
      console.log('   node create-photographer.js [username] [password]\n');
      return;
    }

    console.log('Users:');
    console.log('─'.repeat(80));
    users.forEach((user, i) => {
      console.log(`${i + 1}. Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('─'.repeat(80));
    });

    console.log(`\n✅ Found ${users.length} user(s)\n`);

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    
    if (error.message.includes('relation "users" does not exist')) {
      console.log('\n⚠️  Users table does not exist!');
      console.log('\n💡 Create the users table by running this SQL in Supabase:');
      console.log('   See: backend/supabase/migrations/002_create_users_table.sql\n');
    } else {
      console.log('\nPossible issues:');
      console.log('1. Supabase connection not configured');
      console.log('2. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env\n');
    }
    process.exit(1);
  }
}

listUsers().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

