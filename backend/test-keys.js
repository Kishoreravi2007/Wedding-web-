const axios = require('axios');

const key0 = "AIzaSyB8BGBnEsJhDRhJ03Bvdevh792Gh8A9Uj8";
const keyO = "AIzaSyB8BGBnEsJhDRhJO3Bvdevh792Gh8A9Uj8";

async function testKey(name, key) {
    console.log(`\nTesting Key ${name}: ${key}`);
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`;
    try {
        const response = await axios.post(url, {
            email: 'test@example.com',
            password: 'test',
            returnSecureToken: true
        });
        console.log(`Response for ${name}: SUCCESS (Unexpected!)`);
        console.log(response.data);
    } catch (error) {
        if (error.response) {
            console.log(`Response for ${name}: FAILED with status ${error.response.status}`);
            console.log(`Error Message: ${error.response.data.error.message}`);
        } else {
            console.log(`Response for ${name}: FAILED with error ${error.message}`);
        }
    }
}

async function run() {
    await testKey("0 (Zero)", key0);
    await testKey("O (Oscar)", keyO);
}

run();
