const { query } = require('./lib/db-gcp');

async function seedWeddingCode() {
    const userId = '0e6f3505-15f0-4051-a520-56c3c31e3eb1';
    const weddingCode = 'kr5770203';

    try {
        console.log(`Updating wedding_code for user ${userId} to "${weddingCode}"...`);

        await query(
            `UPDATE weddings SET wedding_code = $1 WHERE user_id = $2`,
            [weddingCode, userId]
        );

        console.log('✅ Successfully updated wedding_code.');
    } catch (error) {
        console.error('❌ Failed to update wedding_code:', error);
    }
}

seedWeddingCode();
