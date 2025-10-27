/**
 * Generate bcrypt hash for password: qwerty123
 */

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'qwerty123';
  const hash = await bcrypt.hash(password, 12);
  
  console.log('Password:', password);
  console.log('Bcrypt Hash (12 rounds):', hash);
  console.log('\nUse this hash in your SQL INSERT statement');
}

generateHash();

