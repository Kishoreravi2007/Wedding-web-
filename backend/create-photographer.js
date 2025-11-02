/**
 * Create a photographer user in Supabase
 * Run this to create your first photographer account
 */

require('dotenv').config();
const { SecureUserDB } = require('./lib/secure-auth');

async function createPhotographer() {
  console.log('📸 Creating photographer account...\n');

  // Change these credentials as needed
  const username = process.argv[2] || 'photographer';
  const password = process.argv[3] || 'wedding2024'; // CHANGE THIS!
  const role = 'photographer';

  try {
    console.log(`Creating user: ${username}`);
    console.log(`Role: ${role}`);
    console.log('Password: ********\n');

    const newUser = await SecureUserDB.createUser({
      username,
      password,
      role
    });

    console.log('✅ Photographer account created successfully!\n');
    console.log('📋 Account Details:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   Created: ${newUser.created_at}\n`);

    console.log('🔐 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n📝 IMPORTANT: Change the password after first login!\n');

    console.log('🌐 Login at:');
    console.log('   https://weddingweb.co.in/photographer/login');
    console.log('   OR');
    console.log('   http://localhost:5173/photographer/login (local)\n');

  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.error('❌ Error: Username already exists!');
      console.log('\n💡 Try a different username or use the existing one.\n');
    } else {
      console.error('❌ Error creating user:', error.message);
      console.log('\nPossible issues:');
      console.log('1. Supabase connection not configured');
      console.log('2. Users table doesn\'t exist');
      console.log('3. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env\n');
    }
    process.exit(1);
  }
}

// Usage info
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Create a photographer account\n');
  console.log('Usage:');
  console.log('  node create-photographer.js [username] [password]\n');
  console.log('Examples:');
  console.log('  node create-photographer.js');
  console.log('  node create-photographer.js myuser mypassword');
  console.log('  node create-photographer.js john secure123\n');
  process.exit(0);
}

// Run
createPhotographer().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

