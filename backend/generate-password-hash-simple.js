/**
 * Generate a bcrypt hash for a password
 * Use this to get the hash to insert into Supabase
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'wedding2024';

async function generateHash() {
  try {
    const hash = await bcrypt.hash(password, 10);
    
    console.log('\n🔐 Password Hash Generator\n');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this SQL in Supabase:\n');
    console.log(`UPDATE users SET password = '${hash}' WHERE username = 'photographer';`);
    console.log('\nOr to insert new user:\n');
    console.log(`INSERT INTO users (username, password, role) VALUES ('photographer', '${hash}', 'photographer');`);
    console.log('');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();

