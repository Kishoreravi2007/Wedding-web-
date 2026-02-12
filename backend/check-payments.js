const { query } = require('./lib/db-gcp');

(async () => {
    try {
        console.log('Checking recent payments...');
        const { rows } = await query(
            `SELECT id, user_id, amount, status, created_at, payment_gateway_response 
             FROM payment_history 
             ORDER BY created_at DESC 
             LIMIT 5;`
        );
        const fs = require('fs');
        fs.writeFileSync('backend/payments.json', JSON.stringify(rows, null, 2));
        console.log('Written to payments.json');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
})();
