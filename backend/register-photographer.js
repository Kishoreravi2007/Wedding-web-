const http = require('http');

const data = JSON.stringify({
  username: 'photographer',
  password: 'photo123',
  role: 'photographer'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response:', responseData);
    if (res.statusCode === 201) {
      console.log('✓ Photographer registered successfully!');
      console.log('Username: photographer');
      console.log('Password: photo123');
    } else {
      console.log('Registration response:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();