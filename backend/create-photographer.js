const { query } = require('./lib/db-gcp');
const bcrypt = require('bcryptjs');

async function createPhotographer() {
  try {
    // Delete existing photographer user
    await query('DELETE FROM users WHERE username=$1', ['photographer']);
    console.log('Deleted existing photographer user');

    // Hash password
    const hash = await bcrypt.hash('photographer', 12);
    console.log('Generated password hash');

    // Create new user
    await query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['photographer', hash, 'photographer']
    );

    console.log('✅ Photographer user created successfully!');
    console.log('Username: photographer');
    console.log('Password: photographer');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createPhotographer();
