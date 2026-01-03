const { query } = require('../lib/db-gcp');

async function checkDescriptors() {
    try {
        const { rows } = await query(`
      SELECT 
        array_length(descriptor, 1) as dimension, 
        COUNT(*) as count 
      FROM face_descriptors 
      GROUP BY dimension
    `);
        console.log('Descriptor dimensions in database:');
        rows.forEach(row => console.log(`- ${row.dimension} dimensions: ${row.count} records`));
    } catch (error) {
        console.error('Error checking descriptors:', error);
    } finally {
        process.exit();
    }
}

checkDescriptors();
