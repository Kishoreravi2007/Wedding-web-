const fetch = require('node-fetch');

async function testSync() {
    const API_BASE_URL = 'http://localhost:5005';

    // Login to get token
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'kirankailas12@gmail.com', password: 'password123' })
    });

    const { token } = await loginRes.json();

    // Fetch wedding data
    const res = await fetch(`${API_BASE_URL}/api/auth/client/wedding`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    console.log('📡 API Response:', JSON.stringify(data, null, 2));

    if (data.wedding && data.wedding.wedding_code === 'kiranravi') {
        console.log('✅ SUCCESS: Wedding code correctly synchronized!');
    } else {
        console.log('❌ FAILURE: Wedding code mismatch or structure error.');
    }
}

testSync();
