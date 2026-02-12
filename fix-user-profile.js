const { query } = require('./backend/lib/db-gcp');

async function fixProfile() {
    const userId = 'e0a98884-aba6-40e1-9cc3-bf6da46d7c95';
    const email = 'kishoreravi266@gmail.com';
    const fullName = 'Kishore Ravi';

    console.log(`🔍 Checking profile for user ${userId}...`);

    try {
        const { rows } = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

        if (rows.length === 0) {
            // Check if profile exists by email (duplicate key error case)
            const { rows: emailProfiles } = await query('SELECT * FROM profiles WHERE email = $1', [email]);

            if (emailProfiles.length > 0) {
                console.log(`⚠️ Profile exists for email ${email} but different User ID. Updating ownership...`);
                // We update the user_id to the new one
                await query(
                    'UPDATE profiles SET user_id = $1, full_name = $2, updated_at = NOW() WHERE email = $3',
                    [userId, fullName, email]
                );
                console.log('✅ Profile ownership transferred successfully.');
            } else {
                console.log('📝 No profile found. Creating new profile...');
                await query(
                    'INSERT INTO profiles (user_id, full_name, email, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
                    [userId, fullName, email]
                );
                console.log('✅ Profile created successfully.');
            }
        } else {
            console.log('📝 Profile exists. Updating name...');
            await query(
                'UPDATE profiles SET full_name = $1, updated_at = NOW() WHERE user_id = $2',
                [fullName, userId]
            );
            console.log('✅ Profile updated successfully.');
        }
    } catch (error) {
        console.error('❌ Error fixing profile:', error);
    } finally {
        process.exit(0);
    }
}

fixProfile();
