const { query } = require('./lib/db-gcp');

async function addEmailColumn() {
    console.log('🔧 Adding email column to users table...');
    try {
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
        `);
        console.log('✅ Email column added successfully (or already exists).');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addEmailColumn();
