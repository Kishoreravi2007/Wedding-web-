const { uploadFile, deleteFile } = require('./lib/local-storage');
const fs = require('fs').promises;
const path = require('path');

async function testLocalStorage() {
    console.log('--- Testing Local Storage Provider ---');

    const testDestination = 'test-folder/test-image.txt';
    const testContent = Buffer.from('Hello Local Storage!');
    const mimetype = 'text/plain';

    try {
        // 1. Test Upload
        console.log(`1. Uploading test file to ${testDestination}...`);
        const publicUrl = await uploadFile(testDestination, testContent, mimetype);
        console.log(`✅ Upload successful! Public URL: ${publicUrl}`);

        // 2. Verify existence on disk
        const expectedPath = path.join(__dirname, 'uploads', testDestination);
        await fs.access(expectedPath);
        console.log(`✅ File exists on disk at: ${expectedPath}`);

        // 3. Test Delete
        console.log(`3. Deleting test file...`);
        await deleteFile(testDestination);

        try {
            await fs.access(expectedPath);
            console.error('❌ Error: File still exists after deletion!');
        } catch (err) {
            console.log('✅ File successfully removed from disk.');
        }

        console.log('\n--- Local Storage Provider Test Passed! ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testLocalStorage();
