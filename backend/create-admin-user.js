const { SecureUserDB } = require('./lib/secure-auth');

async function createAdmin() {
    try {
        console.log('Creating admin user...');
        const newUser = await SecureUserDB.createUser({
            username: 'photographer',
            password: 'photo123',
            role: 'photographer'
        });
        console.log('✅ Admin user created:', newUser);
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('ℹ️  Admin user already exists.');
        } else {
            console.error('❌ Error creating admin:', error.message);
        }
    } finally {
        process.exit();
    }
}

createAdmin();
