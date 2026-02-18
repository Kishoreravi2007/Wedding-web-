const axios = require('axios');

async function verifyThemePersistence() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post('http://localhost:5002/api/auth/login', {
            username: 'photographer',
            password: 'photo123'
        });
        const token = loginRes.data.token;
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        console.log('2. Fetching current wedding data...');
        const getRes = await axios.get('http://localhost:5002/api/auth/client/wedding', config);
        console.log('   Format check:', getRes.data.wedding ? 'Wrapped (Fail)' : 'Flat (Pass)');
        const currentTheme = getRes.data.theme;
        console.log('   Current Theme:', currentTheme);

        const newTheme = currentTheme === 'Art Deco Glamour' ? 'Botanical Garden' : 'Art Deco Glamour';
        console.log(`3. Updating theme to: ${newTheme}...`);

        // Prepare payload exactly like handleThemeSelect
        const weddingData = {
            ...getRes.data,
            theme: newTheme
        };

        await axios.put('http://localhost:5002/api/auth/client/wedding', { weddingData }, config);
        console.log('   Update successful!');

        console.log('4. Verifying persistence...');
        const verifyRes = await axios.get('http://localhost:5002/api/auth/client/wedding', config);
        console.log('   Persisted Theme:', verifyRes.data.theme);

        if (verifyRes.data.theme === newTheme) {
            console.log('✅ SUCCESS: Theme persisted correctly!');
        } else {
            console.error('❌ FAILURE: Theme did not update correctly.');
        }

    } catch (error) {
        console.error('❌ Verification failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

verifyThemePersistence();
