const bcrypt = require('bcryptjs');
const { supabase } = require('./server');
const UserDB = require('./lib/user-db')(supabase);

async function registerPhotographer() {
  try {
    console.log('🔐 Registering photographer user...');
    
    // Check if user already exists
    const existingUser = await UserDB.findByUsername('photographer');
    if (existingUser) {
      console.log('✓ Photographer user already exists!');
      console.log('Username: photographer');
      console.log('Password: photo123');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('photo123', 10);
    
    // Create the user
    const newUser = await UserDB.create({
      username: 'photographer',
      password: hashedPassword,
      role: 'photographer'
    });
    
    console.log('✅ Photographer registered successfully!');
    console.log('Username: photographer');
    console.log('Password: photo123');
    console.log('User ID:', newUser.id);
    
  } catch (error) {
    console.error('❌ Error registering photographer:', error.message);
    console.error('Full error:', error);
  }
}

registerPhotographer();
