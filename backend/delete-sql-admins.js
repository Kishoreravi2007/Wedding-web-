const { query } = require('./lib/db-gcp');

async function deleteAdmins() {
    console.log('🗑️ Deleting ALL admin accounts from SQL database...\n');
    try {
        const { rowCount } = await query(
            "DELETE FROM users WHERE role = 'admin'"
        );

        console.log(`✅ Successfully deleted ${rowCount} admin accounts.`);
    } catch (err) {
        console.error('❌ Error deleting admins:', err);
    }
}

deleteAdmins().then(() => process.exit(0));
