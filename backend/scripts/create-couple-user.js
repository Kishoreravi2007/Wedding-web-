/**
 * Create Couple's Portal User
 * 
 * Creates a couple user account with:
 * Username: phsv
 * Password: 123@qwerty
 * Role: couple (for the couple's portal access)
 */

require('dotenv').config();
const { SecureUserDB } = require('../lib/secure-auth');

async function createCoupleUser() {
    console.log('👫 Creating Couple\'s Portal User...\n');

    try {
        console.log('Creating couple user account:');
        console.log('   Username: phsv');
        console.log('   Password: 123@qwerty');
        console.log('   Role: couple\n');

        const newUser = await SecureUserDB.createUser({
            username: 'phsv',
            password: '123@qwerty',
            role: 'couple'  // Changed from 'photographer' to 'couple'
        });

        console.log('✅ Couple user created successfully!');
        console.log(`   User ID: ${newUser.id}`);
        console.log(`   Username: ${newUser.username}`);
        console.log(`   Role: ${newUser.role}`);

        // Test authentication
        console.log('\n🔐 Testing login credentials...');
        const user = await SecureUserDB.authenticateUser('phsv', '123@qwerty');
        console.log('✅ Authentication successful!');
        console.log(`   Logged in as: ${user.username} (${user.role})`);

        // Summary
        console.log('\n🎉 Couple\'s Portal User Created!');
        console.log('===================================');
        console.log('');
        console.log('👫 Couple Login Credentials:');
        console.log('   Username: phsv');
        console.log('   Password: 123@qwerty');
        console.log('');
        console.log('🌐 Login URL:');
        console.log('   Production: https://weddingweb.co.in/couple-login');
        console.log('   Local: http://localhost:3000/couple-login');
        console.log('');
        console.log('📝 Access Features:');
        console.log('   - View wedding photos');
        console.log('   - Send wishes');
        console.log('   - Access wedding details');
        console.log('   - View guest list');
        console.log('');

        process.exit(0);

    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️  User "phsv" already exists!');
            console.log('   To login, use:');
            console.log('   Username: phsv');
            console.log('   Password: 123@qwerty');
            console.log('   URL: https://weddingweb.co.in/couple-login');
            process.exit(0);
        } else {
            console.error('\n❌ Error creating couple user:', error.message);
            console.error('\n💡 Note: You can also register directly through the UI');
            console.error('   1. Go to https://weddingweb.co.in/couple-login');
            console.error('   2. Click "Sign Up" or "Register"');
            console.error('   3. Use the credentials:');
            console.error('      Username: phsv');
            console.error('      Password: 123@qwerty');
            process.exit(1);
        }
    }
}

createCoupleUser();
