const { query } = require('./lib/db-gcp');

async function findPhotographer() {
    try {
        const id = 'b7931da5-e3a9-465f-bcf6-b10295922f20';
        const { rows } = await query('SELECT id, username, wedding_id FROM users WHERE id = $1', [id]);
        console.log('Photographer:', rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

findPhotographer();
