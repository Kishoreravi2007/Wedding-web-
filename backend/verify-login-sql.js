const axios = require('axios');

async function verifyLogin() {
    try {
        console.log('Testing login endpoint...');
        const response = await axios.post('http://localhost:5002/api/auth/login', {
            username: 'photographer',
            password: 'photo123'
        });

        console.log('✅ Login successful!');
        console.log('Status:', response.status);
        console.log('User role:', response.data.user.role);
        console.log('Token received:', response.data.token ? 'Yes' : 'No');
        console.log('AccessToken received:', response.data.accessToken ? 'Yes' : 'No');

    } catch (error) {
        console.error('❌ Login failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

verifyLogin();
