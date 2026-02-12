const { query } = require('./backend/lib/db-gcp');

async function checkProfile(email) {
    try {
        console.log(`Checking data for: ${email}`);

        // 1. Check user
        const { rows: userRows } = await query('SELECT id, username, role FROM users WHERE username = $1', [email]);
        if (userRows.length === 0) {
            console.log('User not found in users table.');
            return;
        }
        const user = userRows[0];
        console.log('User found:', JSON.stringify(user, null, 2));

        // 2. Check profile by email
        const { rows: profileEmailRows } = await query('SELECT * FROM profiles WHERE email = $1', [email]);
        console.log(`Profiles found by email (${email}):`, profileEmailRows.length);
        if (profileEmailRows.length > 0) {
            console.log(JSON.stringify(profileEmailRows, null, 2));
        }

        // 3. Check profile by user_id
        const { rows: profileIdRows } = await query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
        console.log(`Profiles found by user_id (${user.id}):`, profileIdRows.length);
        if (profileIdRows.length > 0) {
            console.log(JSON.stringify(profileIdRows, null, 2));
        }

        // 4. Check all profiles to see if any have data that might belong to this user (e.g. by full_name)
        // const { rows: allProfiles } = await query('SELECT id, user_id, email, full_name, avatar_url FROM profiles LIMIT 10');
        // console.log('Recent profiles:', JSON.stringify(allProfiles, null, 2));

    } catch (err) {
        console.error('Error during diagnostic:', err);
    } finally {
        process.exit();
    }
}

const targetEmail = process.argv[2] || 'kishoreravi266@gmail.com';
checkProfile(targetEmail);
