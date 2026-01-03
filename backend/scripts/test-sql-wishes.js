const { WishesDB } = require('../lib/sql-db');

async function testWishes() {
    console.log('🚀 Testing SQL-based Wishes Service...');

    try {
        // 1. Create a wish
        console.log('\n📝 1. Creating a test wish...');
        const testWish = await WishesDB.create({
            name: 'Tester',
            wish: 'This is a test wish from SQL',
            recipient: 'both'
        });
        console.log('✅ Created:', testWish);

        // 2. Fetch all wishes
        console.log('\n🔍 2. Fetching all wishes...');
        const wishes = await WishesDB.findAll();
        console.log(`✅ Found ${wishes.length} wishes`);
        wishes.forEach(w => console.log(`- ${w.name}: ${w.wish} (${w.recipient})`));

        // 3. Delete the test wish
        console.log(`\n🗑️ 3. Deleting test wish (ID: ${testWish.id})...`);
        await WishesDB.delete(testWish.id);
        console.log('✅ Deleted successfully');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        process.exit();
    }
}

testWishes();
