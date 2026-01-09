const { query } = require('./lib/db-gcp');

async function testQuery() {
    try {
        console.log('Testing exact query from auth.js...\n');

        const result = await query(
            'SELECT id, username, password, role, is_active, login_attempts, last_login_attempt, locked_until FROM users WHERE username = $1',
            ['photographer']
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('✅ Query successful!');
            console.log('User found:', user.username);
            console.log('Columns returned:', Object.keys(user).join(', '));
            console.log('\nUser data:');
            console.log('- ID:', user.id);
            console.log('- Role:', user.role);
            console.log('- Is Active:', user.is_active);
            console.log('- Login Attempts:', user.login_attempts);
        } else {
            console.log('❌ No user found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Query failed!');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error detail:', error.detail);
        process.exit(1);
    }
}

testQuery();
