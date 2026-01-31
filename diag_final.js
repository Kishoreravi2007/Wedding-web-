const db = require('./backend/lib/db-gcp');
require('dotenv').config({ path: './backend/.env' });

async function run() {
    const slug = 'kr5770203';
    console.log(`Checking timeline for slug: ${slug}`);
    try {
        const query = `
            SELECT t.*, u.username 
            FROM event_timeline t
            JOIN users u ON t.user_id = u.id
            WHERE u.username ILIKE $1
            ORDER BY t.event_date ASC, t.event_time ASC
        `;
        const { rows } = await db.query(query, [`${slug}%`]);
        console.log(`Query found ${rows.length} rows.`);
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

run();
