/**
 * Add password reset columns to users table
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const { query } = require(__dirname + '/../db/postgres');

async function addPasswordResetColumns() {
    console.log('🔧 Adding password reset columns...');

    try {
        // Add password_reset_token column
        await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_reset_token TEXT
    `);
        console.log('✅ Added password_reset_token column');

        // Add password_reset_expires column
        await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE
    `);
        console.log('✅ Added password_reset_expires column');

        console.log('🎉 Password reset columns added successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
}

addPasswordResetColumns();
