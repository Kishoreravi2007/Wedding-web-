const { query } = require('./lib/db-gcp');

async function checkCounts() {
    try {
        const res1 = await query("SELECT COUNT(*) FROM photos WHERE sister = 'kishoreravi'");
        const res2 = await query("SELECT COUNT(*) FROM photos WHERE sister = 'kishoreravi' AND event_type != 'hero'");
        const res3 = await query("SELECT COUNT(*) FROM photos");
        const res4 = await query("SELECT sister, event_type, COUNT(*) FROM photos GROUP BY sister, event_type");
        const res5 = await query("SELECT id, wedding_code FROM weddings");

        console.log('Total Photos in DB:', res3.rows[0].count);
        console.log('Photos with sister=kishoreravi:', res1.rows[0].count);
        console.log('Photos with sister=kishoreravi AND event_type != hero:', res2.rows[0].count);
        console.log('\nBreakdown by sister and event_type:');
        console.table(res4.rows);
        console.log('\nWeddings in DB:');
        console.table(res5.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkCounts();
