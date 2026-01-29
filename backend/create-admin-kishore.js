/**
 * Create New Admin User: kishore
 * Password: qwerty123
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

async function createAdminUser() {
  console.log('🔐 Creating new admin user: kishore');
  console.log('=====================================\n');

  const username = 'kishore';
  const password = 'qwerty123';
  const role = 'admin';

  try {
    // Step 1: Check if user already exists
    console.log('1️⃣ Checking if user already exists...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .single();

    if (existingUser) {
      console.log('⚠️  User already exists! Updating password instead...\n');

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          role: role,
          is_active: true
        })
        .eq('username', username);

      if (updateError) throw updateError;

      console.log('✅ User updated successfully!');
    } else {
      // Step 2: Hash password
      console.log('2️⃣ Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log('✅ Password hashed\n');

      // Step 3: Create user in database
      console.log('3️⃣ Creating user in database...');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            username: username,
            password: hashedPassword,
            role: role,
            is_active: true
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      console.log('✅ User created successfully!\n');
      console.log('User ID:', newUser.id);
    }

    // Success message
    console.log('\n🎉 Admin User Setup Complete!');
    console.log('=====================================');
    console.log('');
    console.log('🔐 Login Credentials:');
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

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

