const db = require('./backend/lib/db-gcp');
require('dotenv').config({ path: './backend/.env' });

async function checkData() {
    const slug = 'kr5770203';
    console.log(`Checking data for slug: ${slug}`);

    try {
        const { rows: weddingRows } = await db.query(
            'SELECT * FROM weddings WHERE wedding_code = $1',
            [slug]
        );
        console.log('Wedding Data:', JSON.stringify(weddingRows, null, 2));

        if (weddingRows.length > 0) {
            const userId = weddingRows[0].user_id;
            const { rows: timelineRows } = await db.query(
                'SELECT * FROM event_timeline WHERE user_id = $1',
                [userId]
            );
            console.log('Timeline Events:', JSON.stringify(timelineRows, null, 2));
        } else {
            console.log('No wedding found with that code.');
        }
    } catch (err) {
        console.error('Database error:', err);
    } finally {
        process.exit();
    }
}

checkData();
