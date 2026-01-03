/**
 * Verification Script: Test Gallery Access Split
 * 
 * This script verifies that:
 * 1. GET /api/photos is accessible without a token.
 * 2. POST /api/photos requires a token.
 */

const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

async function testPublicGet() {
    console.log('🔍 Testing GET /api/photos (Public)...');
    return new Promise((resolve, reject) => {
        http.get(`${BASE_URL}/api/photos`, (res) => {
            console.log(`📡 GET status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('✅ Success: GET /api/photos is public');
                resolve(true);
            } else {
                console.log(`❌ Fail: GET /api/photos returned ${res.statusCode}`);
                resolve(false);
            }
        }).on('error', (e) => {
            console.error(`❌ Error connecting to backend: ${e.message}`);
            resolve(false);
        });
    });
}

async function testPrivatePost() {
    console.log('🔍 Testing POST /api/photos (Private)...');
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/api/photos',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            console.log(`📡 POST status: ${res.statusCode}`);
            if (res.statusCode === 401) {
                console.log('✅ Success: POST /api/photos requires authentication');
                resolve(true);
            } else {
                console.log(`❌ Fail: POST /api/photos returned ${res.statusCode} (Expected 401)`);
                resolve(false);
            }
        });

        req.on('error', (e) => {
            console.error(`❌ Error connecting to backend: ${e.message}`);
            resolve(false);
        });

        req.write(JSON.stringify({ test: true }));
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Starting Verification Tests...');
    const getPassed = await testPublicGet();
    const postPassed = await testPrivatePost();

    if (getPassed && postPassed) {
        console.log('\n✨ ALL TESTS PASSED! Authentication split is working correctly.');
    } else {
        console.log('\n❌ SOME TESTS FAILED. Please check the backend configuration.');
        process.exit(1);
    }
}

runTests();
