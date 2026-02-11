/**
 * Fix Supabase Schema and Link User
 * 
 * 1. Adds 'id' column to 'weddings' table
 * 2. Links the user 'kishoreravi266@gmail.com' to the 'kishoreravi' wedding
 */
const { query } = require('./lib/db-gcp');

async function fixSupabase() {
    console.log('🔧 Fixing Supabase schema and data linkage...\n');
    try {
        // 1. Add 'id' column to weddings if it doesn't exist
        // Using gen_random_uuid() as default to populate existing rows
        console.log('📏 Adding "id" column to "weddings" table...');
        await query(`
      ALTER TABLE weddings 
      ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() UNIQUE;
    `);
        console.log('✅ "id" column added.\n');

        // 2. Identify the user and the wedding
        const userEmail = 'kishoreravi266@gmail.com';
        const weddingCode = 'kishoreravi';

        console.log(`🔗 Linking user "${userEmail}" to wedding "${weddingCode}"...`);

        // Get user ID
        console.log(`🔍 Looking up user: ${userEmail}`);
        const findUserIdRes = await query("SELECT id FROM users WHERE username = $1 LIMIT 1", [userEmail]);

        if (findUserIdRes.rows.length === 0) {
            throw new Error('User not found in database');
        }
        const userId = findUserIdRes.rows[0].id;
        console.log(`👤 Found user ID: ${userId}`);

        // Update wedding to have this user_id
        const weddingUpdateRes = await query(
            'UPDATE weddings SET user_id = $1 WHERE wedding_code = $2 RETURNING id',
            [userId, weddingCode]
        );

        if (weddingUpdateRes.rows.length === 0) {
            // Try by slug
            await query('UPDATE weddings SET user_id = $1 WHERE slug = $2', [userId, weddingCode]);
            console.log('⚠️ Wedding not found by wedding_code, tried slug.');
        } else {
            const weddingId = weddingUpdateRes.rows[0].id;
            console.log(`💒 Linked wedding "${weddingCode}" (ID: ${weddingId}) to user.`);

            // Also update user's wedding_id for fast lookup
            await query('UPDATE users SET wedding_id = $1 WHERE id = $2', [weddingId, userId]);
            console.log('✅ Updated users table with wedding_id.');
        }

        console.log('\n✨ Supabase fix complete!');

    } catch (err) {
        console.error('❌ Fix failed:', err.message);
        console.error(err);
    } finally {
        process.exit(0);
    }
}

fixSupabase();
