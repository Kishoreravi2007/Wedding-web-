const { TokenManager, SecureUserDB } = require('../lib/secure-auth');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function generateToken() {
    try {
        const user = await SecureUserDB.getUserById('3a74d459-ce3c-45f2-adee-9c2af8d600d7'); // admin user
        if (!user) {
            console.error('Admin user not found');
            process.exit(1);
        }

        const token = TokenManager.generateToken(user);
        console.log('JSON_START');
        console.log(JSON.stringify({ token }, null, 2));
        console.log('JSON_END');
        process.exit(0);
    } catch (error) {
        console.error('Error generating token:', error);
        process.exit(1);
    }
}

generateToken();
