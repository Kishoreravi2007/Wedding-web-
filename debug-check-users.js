const { query } = require('./backend/lib/db-gcp');

async function checkUsers() {
    const email = 'kishoreravi266@gmail.com';
    console.log(`🔍 Checking users with username/email: ${email}`);

    try {
        const { rows } = await query('SELECT * FROM users WHERE username = $1 OR email = $1', [email]);
        console.log(`Found ${rows.length} user(s):`);
        rows.forEach(u => {
            console.log(`- ID: ${u.id}`);
            console.log(`  Username: ${u.username}`);
            console.log(`  Email: ${u.email}`);
            console.log(`  Created: ${u.created_at}`);
            console.log('---');
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkUsers();
