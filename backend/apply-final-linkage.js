const { query } = require('./lib/db-gcp');

async function linkUser() {
    const userId = '0e6f3505-15f0-4051-a520-56c3c31e3eb1'; // kr5770203@gmail.com
    const weddingId = '51e8511f-2eb9-49b2-95ce-c00c150d70a0'; // kishoreravi

    console.log(`🔗 Linking user ${userId} to wedding ${weddingId}...`);

    try {
        // Update wedding ownership
        await query('UPDATE weddings SET user_id = $1 WHERE id = $2', [userId, weddingId]);
        console.log('✅ Wedding user_id updated.');

        // Update user record with wedding_id
        await query('UPDATE users SET wedding_id = $1 WHERE id = $2', [weddingId, userId]);
        console.log('✅ User wedding_id updated.');

        console.log('✨ Linkage complete!');
    } catch (err) {
        console.error('❌ Linkage failed:', err.message);
    } finally {
        process.exit(0);
    }
}

linkUser();
