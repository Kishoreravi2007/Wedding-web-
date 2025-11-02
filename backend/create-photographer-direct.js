/**
 * Create a photographer user directly in Supabase (bypassing RPC functions)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabase } = require('./lib/supabase');

async function createPhotographer() {
  console.log('📸 Creating photographer account...\n');

  const username = process.argv[2] || 'photographer';
  const password = process.argv[3] || 'wedding2024';
  const role = 'photographer';

  try {
    console.log(`Creating user: ${username}`);
    console.log(`Role: ${role}`);
    console.log('Password: ********\n');

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert directly into users table (column is 'password' not 'password_hash')
    console.log('💾 Inserting into database...');
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password: hashedPassword,  // Column name is 'password'
          role
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Photographer account created successfully!\n');
    console.log('📋 Account Details:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Username: ${data.username}`);
    console.log(`   Role: ${data.role}`);
    console.log(`   Created: ${data.created_at}\n`);

    console.log('🔐 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n📝 IMPORTANT: Change the password after first login!\n');

    console.log('🌐 Login at:');
    console.log('   https://weddingweb.co.in/photographer/login\n');

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    
    if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('already exists')) {
      console.log('\n⚠️  Username already exists!');
      console.log('💡 Try logging in with existing credentials or use a different username.\n');
    } else if (error.code === '42P01' || error.message.includes('relation "users" does not exist')) {
      console.log('\n⚠️  Users table does not exist!');
      console.log('\n💡 Create it with this SQL in Supabase:');
      console.log(`
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'photographer', 'couple', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for service role" ON users
FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow select for service role" ON users
FOR SELECT TO service_role USING (true);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `);
    } else {
      console.log('\nDetails:', error);
    }
    process.exit(1);
  }
}

// Help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Create a photographer account (direct insert method)\n');
  console.log('Usage:');
  console.log('  node create-photographer-direct.js [username] [password]\n');
  console.log('Examples:');
  console.log('  node create-photographer-direct.js');
  console.log('  node create-photographer-direct.js myuser mypassword\n');
  process.exit(0);
}

createPhotographer().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

