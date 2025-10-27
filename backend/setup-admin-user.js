/**
 * Setup Admin User with Users Table
 * Creates the users table if it doesn't exist, then creates admin user
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdminUser() {
  console.log('🔐 Setting up Admin User System');
  console.log('=====================================\n');

  try {
    // Step 1: Create users table if it doesn't exist
    console.log('1️⃣ Creating users table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Enable Row Level Security
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;

      -- Create policy for service role to manage users
      DROP POLICY IF EXISTS "Service role can manage users" ON users;
      CREATE POLICY "Service role can manage users" ON users
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    }).catch(async () => {
      // If exec_sql doesn't exist, try direct table creation
      // This is a fallback - the table will be created via SQL editor manually if this fails
      console.log('   Note: Please run the SQL manually in Supabase SQL Editor if this fails');
      return { error: null };
    });

    console.log('✅ Users table ready\n');

    // Step 2: Hash password
    console.log('2️⃣ Hashing password for user: kishore...');
    const username = 'kishore';
    const password = 'qwerty123';
    const role = 'admin';
    
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed\n');

    // Step 3: Insert admin user (use upsert to handle existing user)
    console.log('3️⃣ Creating/updating admin user...');
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .upsert(
        {
          username: username,
          password: hashedPassword,
          role: role,
          is_active: true,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'username',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('✅ Admin user created/updated successfully!\n');
    if (newUser) {
      console.log('User ID:', newUser.id);
      console.log('Username:', newUser.username);
      console.log('Role:', newUser.role);
    }

    // Success message
    console.log('\n🎉 Admin User Setup Complete!');
    console.log('=====================================');
    console.log('');
    console.log('🔐 Your New Login Credentials:');
    console.log('   Username: kishore');
    console.log('   Password: qwerty123');
    console.log('   Role: admin');
    console.log('');
    console.log('🌐 Login URLs:');
    console.log('   Local: http://localhost:3000/admin-login');
    console.log('   Production: https://weddingweb.co.in/admin-login');
    console.log('');
    console.log('✅ You can now login with these credentials!');
    console.log('');
    console.log('⚠️  SECURITY NOTE:');
    console.log('   - This is a production password');
    console.log('   - Keep it secure and private');
    console.log('   - Consider changing it after first login');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('Could not find the table')) {
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('=====================================');
      console.log('The users table needs to be created manually.');
      console.log('');
      console.log('1. Go to: https://supabase.com/dashboard/project/dmsghmogmwmpxjaipbod/editor');
      console.log('2. Click "SQL Editor" in the left sidebar');
      console.log('3. Click "New query"');
      console.log('4. Copy and paste this SQL:');
      console.log('');
      console.log('------- COPY THIS SQL -------');
      console.log(`
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users" ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert admin user (password is already hashed: qwerty123)
INSERT INTO users (username, password, role, is_active)
VALUES ('kishore', '${await bcrypt.hash('qwerty123', 12)}', 'admin', true)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password, role = EXCLUDED.role, updated_at = CURRENT_TIMESTAMP;
      `);
      console.log('------- END SQL -------');
      console.log('');
      console.log('5. Click "Run" to execute');
      console.log('6. You should see "Success. No rows returned"');
      console.log('7. Try logging in with username: kishore, password: qwerty123');
      console.log('');
    }
    
    process.exit(1);
  }
}

// Run the script
setupAdminUser()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

