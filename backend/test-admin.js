const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "kishore-75492"
});

async function listUsers() {
    try {
        const listUsersResult = await admin.auth().listUsers(10);
        console.log('Successfully listed users:');
        listUsersResult.users.forEach((userRecord) => {
            console.log('user', userRecord.toJSON().email);
        });
    } catch (error) {
        console.log('Error listing users:', error.message);
        console.log('Error Code:', error.code);
    }
}

listUsers();
