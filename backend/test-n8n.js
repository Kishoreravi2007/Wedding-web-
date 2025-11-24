require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');

const webhookUrl = process.env.N8N_WEBHOOK_URL;

console.log('\n🔍 Testing N8N Webhook Configuration\n');
console.log('='.repeat(50));

if (!webhookUrl) {
  console.log('❌ N8N_WEBHOOK_URL is not set in .env file');
  console.log('\n💡 Add this to your backend/.env file:');
  console.log('N8N_WEBHOOK_URL=https://weddingweb.app.n8n.cloud/webhook/trigger-call');
  process.exit(1);
}

if (webhookUrl === 'https://your-n8n-instance.com/webhook/trigger-call') {
  console.log('❌ N8N_WEBHOOK_URL is still set to the placeholder value');
  console.log('\n💡 Update your backend/.env file with the actual webhook URL:');
  console.log('N8N_WEBHOOK_URL=https://weddingweb.app.n8n.cloud/webhook/trigger-call');
  process.exit(1);
}

console.log('✅ N8N_WEBHOOK_URL is configured');
console.log('📞 Webhook URL:', webhookUrl);
console.log('\n🧪 Testing webhook connection...\n');

const testPayload = {
  callId: 'test_' + Date.now(),
  phoneNumber: '+1234567890',
  name: 'Test User',
  email: 'test@example.com',
  reason: 'Test call from troubleshooting script',
  messageId: null,
  feedbackId: null,
};

axios.post(webhookUrl, testPayload, {
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
})
.then(response => {
  console.log('✅ SUCCESS! Webhook responded');
  console.log('📥 Response status:', response.status);
  console.log('📥 Response data:', JSON.stringify(response.data, null, 2));
  console.log('\n💡 Check your n8n workflow - it should show a new execution!');
  process.exit(0);
})
.catch(error => {
  console.log('❌ ERROR: Webhook request failed');
  console.log('\nError details:');
  
  if (error.response) {
    console.log('  Status:', error.response.status);
    console.log('  Data:', JSON.stringify(error.response.data, null, 2));
  } else if (error.request) {
    console.log('  No response received from server');
    console.log('  This could mean:');
    console.log('    - n8n workflow is not activated');
    console.log('    - Webhook URL is incorrect');
    console.log('    - Network/firewall is blocking the request');
  } else {
    console.log('  Error message:', error.message);
  }
  
  console.log('\n💡 Troubleshooting steps:');
  console.log('  1. Make sure your n8n workflow is ACTIVATED (toggle switch ON)');
  console.log('  2. Verify the webhook URL is correct in n8n');
  console.log('  3. Check n8n execution logs to see if request arrived');
  console.log('  4. Test the webhook URL directly in a browser or Postman');
  
  process.exit(1);
});

