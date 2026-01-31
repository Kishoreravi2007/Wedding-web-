const db = require('./backend/lib/db-gcp');

async function run() {
    const slug = 'kr5770203';
    try {
        const { rows: users } = await db.query(
            'SELECT id, username FROM users WHERE username ILIKE $1',
            [`${slug}%`]
        );
        console.log('--- Matching Users ---');
        console.log(users);

        for (const user of users) {
            const { rows: events } = await db.query(
                'SELECT id, title, event_date, event_time, location, location_map_url FROM event_timeline WHERE user_id = $1',
                [user.id]
            );
            console.log(`\n--- Events for User: ${user.username} (ID: ${user.id}) ---`);
            console.log(events);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

run();
