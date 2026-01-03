/**
 * Check face descriptor dimensions in the database
 * This helps diagnose dimension mismatches between old and new embeddings
 */

require('dotenv').config();
const { query } = require('../lib/db-gcp');

async function checkFaceDimensions() {
    try {
        console.log('🔍 Checking face descriptor dimensions in database...\n');

        // Check face_descriptors table
        const descriptorQuery = `
      SELECT 
        id,
        array_length(descriptor, 1) as dimension,
        confidence,
        created_at
      FROM face_descriptors 
      ORDER BY created_at DESC 
      LIMIT 20;
    `;

        const { rows: descriptors } = await query(descriptorQuery);

        if (descriptors.length === 0) {
            console.log('⚠️  No face descriptors found in database');
            return;
        }

        console.log(`📊 Found ${descriptors.length} face descriptors (showing latest 20):\n`);

        // Group by dimension
        const dimensionGroups = {};
        descriptors.forEach(desc => {
            const dim = desc.dimension;
            if (!dimensionGroups[dim]) {
                dimensionGroups[dim] = 0;
            }
            dimensionGroups[dim]++;
        });

        console.log('Dimension Distribution:');
        Object.entries(dimensionGroups).forEach(([dim, count]) => {
            const percentage = ((count / descriptors.length) * 100).toFixed(1);
            console.log(`  ${dim}-dim: ${count} descriptors (${percentage}%)`);
        });

        console.log('\nLatest 5 descriptors:');
        descriptors.slice(0, 5).forEach(desc => {
            console.log(`  ID: ${desc.id}, Dim: ${desc.dimension}, Confidence: ${desc.confidence}, Created: ${desc.created_at}`);
        });

        // Check total counts
        const countQuery = `
      SELECT 
        COUNT(*) as total_descriptors,
        COUNT(DISTINCT photo_id) as photos_with_faces,
        COUNT(DISTINCT person_id) as identified_people
      FROM face_descriptors;
    `;

        const { rows: counts } = await query(countQuery);
        console.log('\n📈 Database Statistics:');
        console.log(`  Total face descriptors: ${counts[0].total_descriptors}`);
        console.log(`  Photos with faces: ${counts[0].photos_with_faces}`);
        console.log(`  Identified people: ${counts[0].identified_people || 0}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking dimensions:', error.message);
        process.exit(1);
    }
}

checkFaceDimensions();
