
const { query } = require('./lib/db-gcp');

async function check() {
    try {
        const userRes = await query("SELECT id, username FROM users WHERE username = 'kr5770203@gmail.com'");
        console.log("User Lookup:", userRes.rows);

        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;
            const weddingRes = await query("SELECT id, groom_name, bride_name, wedding_code FROM weddings WHERE user_id = $1", [userId]);
            console.log("Wedding Lookup:", weddingRes.rows);
        }
    } catch (err) {
        console.error("Error checking DB:", err);
    } finally {
        process.exit();
    }
}

check();
