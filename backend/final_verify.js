const axios = require('axios');

async function verify() {
    try {
        const weddingId = '51e8511f-2eb9-49b2-95ce-c00c150d70a0';
        const url = `http://localhost:5001/api/photos?weddingId=${weddingId}`;
        console.log(`Checking: ${url}`);

        const res = await axios.get(url);
        console.log('Status:', res.status);
        console.log('Photos retrieved:', res.data.photos.length);
        if (res.data.photos.length > 0) {
            console.log('Sample Photo:', res.data.photos[0].filename);
        }
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

verify();
