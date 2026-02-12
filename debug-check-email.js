const { query } = require('./backend/lib/db-gcp');

async function checkEmail() {
    const email = 'kishoreravi266@gmail.com';
    try {
        console.log(`🔍 Checking profiles for email: ${email}`);
        const { rows } = await query('SELECT * FROM profiles WHERE email = $1', [email]);

        if (rows.length === 0) {
            console.log('❌ No profiles found with this email.');
        } else {
            console.log(`⚠️ Found ${rows.length} profile(s):`);
            rows.forEach(p => {
                console.log(`   ID: ${p.id}, UserID: ${p.user_id}, Name: ${p.full_name}`);
            });
        }

        // Check Users table for this email
        console.log(`🔍 Checking users for email: ${email}`);
        // Users table uses 'username' for email often
        const { rows: users } = await query('SELECT * FROM users WHERE username = $1 OR email = $1', [email]);
        if (users.length === 0) {
            console.log('❌ No users found with this email.');
        } else {
            console.log(`✅ Found ${users.length} user(s):`);
            users.forEach(u => {
                console.log(`   ID: ${u.id}, Username: ${u.username}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

checkEmail();
