/**
 * Delete All Non-Admin Users from WeddingWeb
 * 
 * This script removes ALL user accounts except admin accounts from the Supabase `users` table.
 * Run with: node delete-all-users.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { supabase } = require('./lib/supabase');

async function deleteAllNonAdminUsers() {
    console.log('🗑️  Starting user cleanup...');

    try {
        // 1. First, list all users for confirmation
        const { data: allUsers, error: listError } = await supabase
            .from('users')
            .select('id, username, role, email, created_at')
            .order('created_at', { ascending: true });

        if (listError) {
            console.error('❌ Error fetching users:', listError);
            return;
        }

        console.log(`\n📋 Found ${allUsers.length} total users:`);
        allUsers.forEach(u => {
            const marker = u.role === 'admin' ? '🛡️  [ADMIN - KEEP]' : '🗑️  [DELETE]';
            console.log(`   ${marker} ${u.username} (${u.role}) - ${u.email || 'no email'}`);
        });

        const toDelete = allUsers.filter(u => u.role !== 'admin');
        const toKeep = allUsers.filter(u => u.role === 'admin');

        if (toDelete.length === 0) {
            console.log('\n✅ No non-admin users to delete. All clean!');
            return;
        }

        console.log(`\n🔥 Deleting ${toDelete.length} non-admin users, keeping ${toKeep.length} admin(s)...`);

        // 2. Delete all non-admin users
        const { error: deleteError, count } = await supabase
            .from('users')
            .delete()
            .neq('role', 'admin');

        if (deleteError) {
            console.error('❌ Error deleting users:', deleteError);
            return;
        }

        console.log(`✅ Successfully deleted ${toDelete.length} user account(s).`);

        // 3. Verify remaining users
        const { data: remaining, error: verifyError } = await supabase
            .from('users')
            .select('id, username, role, email');

        if (!verifyError) {
            console.log(`\n📋 Remaining users (${remaining.length}):`);
            remaining.forEach(u => {
                console.log(`   🛡️  ${u.username} (${u.role}) - ${u.email || 'no email'}`);
            });
        }

        console.log('\n🎉 User cleanup complete!');
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

deleteAllNonAdminUsers();
