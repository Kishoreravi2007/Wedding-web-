# 🔧 Troubleshooting: N8N Webhook Not Receiving Signals

## Quick Checklist

1. ✅ **Check if N8N_WEBHOOK_URL is set in `.env`**
2. ✅ **Check backend console logs**
3. ✅ **Verify workflow is activated in n8n**
4. ✅ **Test the webhook URL directly**

## Step-by-Step Troubleshooting

### Step 1: Verify Environment Variable

Check your `backend/.env` file has the correct webhook URL:

```env
N8N_WEBHOOK_URL=https://weddingweb.app.n8n.cloud/webhook/trigger-call
```

**Important:** 
- Make sure it's NOT the placeholder: `https://your-n8n-instance.com/webhook/trigger-call`
- Make sure there are no extra spaces or quotes
- The URL should match exactly what you see in n8n

### Step 2: Restart Your Backend

After updating `.env`, you MUST restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd backend
npm start
```

### Step 3: Check Backend Console Logs

When you click "Call Customer", check your backend console. You should see one of these:

**✅ If configured correctly:**
```
📞 Sending call trigger to n8n: https://weddingweb.app.n8n.cloud/webhook/trigger-call
✅ N8N webhook called successfully
```

**❌ If NOT configured:**
```
📞 Call triggered (n8n webhook not configured): { ... }
💡 To enable n8n integration, set N8N_WEBHOOK_URL in your .env file
```

**⚠️ If there's an error:**
```
⚠️ Failed to call n8n webhook: [error message]
```

### Step 4: Verify Workflow is Activated

1. Go to your n8n workflow
2. Check the **"Active" toggle** in the top right
3. It should be **ON** (green/enabled)
4. If it's OFF, click it to activate

### Step 5: Test Webhook Directly

You can test the webhook URL directly using curl or Postman:

```bash
curl -X POST https://weddingweb.app.n8n.cloud/webhook/trigger-call \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "test_123",
    "phoneNumber": "+1234567890",
    "name": "Test User",
    "email": "test@example.com",
    "reason": "Test call"
  }'
```

Or use a tool like Postman or Thunder Client in VS Code.

**Expected response:** You should see the workflow execute in n8n.

### Step 6: Check Network/Firewall Issues

- Make sure your backend can reach the internet
- Check if there's a firewall blocking outbound HTTPS requests
- Verify the n8n URL is accessible from your server

### Step 7: Check Browser Console

Open browser DevTools (F12) → Console tab → Click "Call Customer"

Look for any errors in the console.

### Step 8: Verify Frontend is Calling Correct Endpoint

The frontend should call: `POST /api/n8n/trigger-call`

Check the Network tab in browser DevTools to see:
- Is the request being sent?
- What's the response?
- Any errors?

## Common Issues and Solutions

### Issue 1: "n8n webhook not configured" message

**Solution:**
- Check `.env` file has `N8N_WEBHOOK_URL` set
- Make sure it's not the placeholder value
- Restart backend after updating `.env`

### Issue 2: "Failed to call n8n webhook" error

**Possible causes:**
- n8n workflow is not activated
- Webhook URL is incorrect
- Network/firewall blocking the request
- n8n service is down

**Solution:**
- Verify workflow is active in n8n
- Test webhook URL directly (Step 5)
- Check n8n service status

### Issue 3: Webhook receives request but workflow doesn't execute

**Solution:**
- Check n8n execution logs
- Verify all nodes are connected properly
- Check for errors in n8n workflow nodes

### Issue 4: Timeout errors

The backend has a 5-second timeout. If n8n takes longer:
- Check n8n execution logs
- Verify workflow isn't stuck
- Consider increasing timeout in code

## Debug Mode

To see more detailed logs, you can temporarily add this to `backend/routes/n8n-integration.js`:

```javascript
console.log('🔍 Debug - N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL);
console.log('🔍 Debug - Webhook URL check:', 
  process.env.N8N_WEBHOOK_URL && 
  process.env.N8N_WEBHOOK_URL !== 'https://your-n8n-instance.com/webhook/trigger-call'
);
```

## Still Not Working?

1. **Check n8n execution history:**
   - Go to n8n → Your workflow
   - Click "Executions" tab
   - See if any requests are coming through

2. **Check backend response:**
   - When you click "Call Customer", check the response in browser DevTools
   - Look for the `webhookUrl` field in the response
   - It should show your actual webhook URL, not "Not configured"

3. **Test with a simple HTTP request:**
   ```bash
   # From your backend directory
   node -e "
   const axios = require('axios');
   axios.post('https://weddingweb.app.n8n.cloud/webhook/trigger-call', {
     callId: 'test',
     phoneNumber: '+1234567890',
     name: 'Test'
   }).then(r => console.log('Success:', r.data))
     .catch(e => console.error('Error:', e.message));
   "
   ```

## Quick Test Script

Create a test file `backend/test-n8n.js`:

```javascript
require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');

const webhookUrl = process.env.N8N_WEBHOOK_URL;

if (!webhookUrl || webhookUrl === 'https://your-n8n-instance.com/webhook/trigger-call') {
  console.log('❌ N8N_WEBHOOK_URL not configured in .env');
  process.exit(1);
}

console.log('📞 Testing n8n webhook:', webhookUrl);

axios.post(webhookUrl, {
  callId: 'test_' + Date.now(),
  phoneNumber: '+1234567890',
  name: 'Test User',
  email: 'test@example.com',
  reason: 'Test call'
}, {
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
})
.then(response => {
  console.log('✅ Success! Response:', response.data);
})
.catch(error => {
  console.error('❌ Error:', error.message);
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
});
```

Run it:
```bash
cd backend
node test-n8n.js
```

