# 📞 N8N Workflow Setup - Step by Step Guide

This guide will walk you through creating an n8n workflow from scratch to handle automated customer calls.

## 🎯 What You Need

1. **n8n Account** (free tier available at [n8n.io](https://n8n.io))
2. **Phone Service** (choose one):
   - **Twilio** (recommended) - [Sign up here](https://www.twilio.com/try-twilio)
   - **Vonage** (formerly Nexmo)
   - Any other voice API provider
3. **AI Service** (for conversation handling):
   - **OpenAI** (GPT-4) - [Get API key](https://platform.openai.com/api-keys)
   - **Anthropic Claude** - [Get API key](https://console.anthropic.com/)
4. **Your Backend URL** (where your wedding website backend is hosted)

## 🚀 Step 1: Sign Up for n8n

1. Go to [https://n8n.io](https://n8n.io)
2. Click **"Start Free"** or **"Sign Up"**
3. Create your account (you can use Google/GitHub login)
4. You'll be taken to your n8n dashboard

## 📋 Step 2: Create a New Workflow

1. In n8n dashboard, click **"+ New Workflow"**
2. Name it: **"Customer Call Automation"**
3. Click **"Save"**

## 🔗 Step 3: Add Webhook Trigger

This receives the call request from your backend.

1. **Click the "+" button** to add a node
2. **Search for "Webhook"** and select it
3. **Configure the Webhook:**
   - **HTTP Method:** `POST`
   - **Path:** `/webhook/trigger-call`
   - **Response Mode:** `When Last Node Finishes`
   - **Response Code:** `200`
4. **Click "Execute Node"** to test
5. **Copy the Webhook URL** - This is your `N8N_WEBHOOK_URL`
   - Example: `https://your-username.app.n8n.cloud/webhook/trigger-call`
6. **Save this URL** - you'll need it for your backend `.env` file

## 📞 Step 4: Add Phone Call Node (Twilio Example)

### 4.1 Set Up Twilio Credentials

1. **Sign up for Twilio:** [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Get your credentials:**
   - Account SID
   - Auth Token
   - Phone Number (buy a number from Twilio)

### 4.2 Add Twilio Node in n8n

1. **Click "+" after the Webhook node**
2. **Search for "Twilio"** and select it
3. **Configure Twilio:**
   - **Operation:** `Make a Call`
   - **From:** Your Twilio phone number (e.g., `+1234567890`)
   - **To:** `{{ $json.phoneNumber }}` (from webhook data)
   - **URL:** Your call handling endpoint (we'll create this next)

### 4.3 Create Call Handling Endpoint

You need a URL that Twilio will call when the customer answers. This URL should return TwiML (Twilio Markup Language) to control the call.

**Option A: Use n8n HTTP Request Node (Simpler)**

1. **Add an "HTTP Request" node** before the Twilio node
2. **Configure:**
   - **Method:** `POST`
   - **URL:** `https://your-backend-url.com/api/n8n/call-handler`
   - **Body:** Pass through webhook data
3. **This endpoint should return TwiML** (see backend setup below)

**Option B: Use Twilio Functions (More Advanced)**

Create a Twilio Function that handles the call and returns TwiML.

## 🤖 Step 5: Add AI Conversation Handler

1. **Add "OpenAI" node** (or your AI provider)
2. **Configure:**
   - **Operation:** `Chat`
   - **Model:** `gpt-4` or `gpt-3.5-turbo`
   - **Messages:** 
     ```json
     [
       {
         "role": "system",
         "content": "You are a helpful customer service representative for a wedding website company. Be friendly, professional, and helpful. The customer inquiry is: {{ $json.reason }}"
       },
       {
         "role": "user",
         "content": "{{ $json.transcript }}"
       }
     ]
     ```
3. **This will generate responses** based on the conversation

## 📝 Step 6: Add Call Summary Generation

1. **Add another "OpenAI" node** for summary
2. **Configure:**
   - **Operation:** `Chat`
   - **Model:** `gpt-4`
   - **Messages:**
     ```json
     [
       {
         "role": "system",
         "content": "You are a call summary generator. Analyze the conversation transcript and create a concise summary with: 1) Key points discussed, 2) Customer concerns, 3) Resolution or next steps."
       },
       {
         "role": "user",
         "content": "Create a summary of this call:\n\n{{ $json.fullTranscript }}"
       }
     ]
     ```

## 📧 Step 7: Send Summary to Your Backend

1. **Add "HTTP Request" node**
2. **Configure:**
   - **Method:** `POST`
   - **URL:** `https://your-backend-url.com/api/n8n/call-summary`
   - **Authentication:** None (or add API key if you set one up)
   - **Body (JSON):**
     ```json
     {
       "callId": "{{ $json.callId }}",
       "phoneNumber": "{{ $json.phoneNumber }}",
       "duration": "{{ $json.duration }}",
       "summary": "{{ $json.summary }}",
       "transcript": "{{ $json.transcript }}",
       "status": "completed",
       "resolution": "{{ $json.resolution }}"
     }
     ```
3. **This will trigger your backend** to send the email summary

## 🔄 Complete Workflow Structure

Here's how your workflow should look:

```
┌─────────────┐
│  Webhook    │ ← Receives call request from backend
│  (Trigger)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Set        │ ← Extract and format data
│  Variables  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Twilio     │ ← Make the phone call
│  Make Call  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  HTTP       │ ← Handle call conversation
│  Request    │   (Returns TwiML)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  OpenAI     │ ← Generate AI responses
│  Chat       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  OpenAI     │ ← Generate call summary
│  Summary    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  HTTP       │ ← Send summary to backend
│  Request    │   (Backend sends email)
└─────────────┘
```

## 🛠️ Step 8: Create Backend Call Handler Endpoint

You need to add a call handler endpoint to your backend that returns TwiML. Add this to your `backend/routes/n8n-integration.js`:

```javascript
/**
 * POST /api/n8n/call-handler
 * Handles incoming calls from Twilio
 * Returns TwiML to control the call
 */
router.post('/call-handler', async (req, res) => {
  try {
    const { From, To, CallSid } = req.body;
    
    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Hello, this is an automated call from the wedding website. 
    How can I help you today?
  </Say>
  <Gather input="speech" timeout="10" action="/api/n8n/call-process" method="POST">
    <Say>Please speak your question or concern.</Say>
  </Gather>
  <Say>Thank you for calling. Goodbye.</Say>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling call:', error);
    res.status(500).send('Error');
  }
});
```

## ✅ Step 9: Test Your Workflow

1. **Activate your workflow** in n8n (toggle the switch)
2. **Go to your admin dashboard**
3. **Click "Call Customer"** on a contact message
4. **Check n8n execution logs** to see if it's working
5. **Check your email** for the summary

## 🔧 Configuration Checklist

- [ ] n8n account created
- [ ] Workflow created and named
- [ ] Webhook node configured and URL copied
- [ ] Twilio account set up with phone number
- [ ] Twilio node configured in n8n
- [ ] OpenAI API key obtained
- [ ] OpenAI nodes configured
- [ ] Backend call handler endpoint created
- [ ] Backend `.env` file updated with `N8N_WEBHOOK_URL`
- [ ] Workflow activated in n8n
- [ ] Test call completed successfully

## 💡 Alternative: Simpler Workflow (Without AI)

If you want to start simple without AI conversation handling:

1. **Webhook** → Receives call request
2. **Twilio Make Call** → Calls the customer
3. **Simple TwiML** → Plays a pre-recorded message or connects to a human
4. **HTTP Request** → Sends basic summary to backend

You can add AI later once the basic flow works.

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Twilio TwiML Guide](https://www.twilio.com/docs/voice/twiml)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [n8n Community Forum](https://community.n8n.io/)

## 🆘 Need Help?

If you get stuck:
1. Check n8n execution logs (click on any node to see details)
2. Check your backend console for errors
3. Verify all API keys and credentials are correct
4. Make sure your workflow is **activated** (toggle switch in n8n)

