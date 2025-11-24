# 📞 N8N Integration Setup Guide

This guide will help you set up n8n (workflow automation) to automatically call customers, handle conversations, and send email summaries.

## 🎯 Overview

The n8n integration allows you to:
1. **Trigger automated calls** from the admin dashboard
2. **Handle customer conversations** through AI/voice automation
3. **Receive call summaries** via email automatically
4. **Track call records** in your database

## 📋 Prerequisites

1. **n8n Instance** (self-hosted or cloud)
   - Sign up at [n8n.io](https://n8n.io) (cloud) or
   - Self-host n8n on your server
2. **Phone Service Provider** (Twilio, Vonage, etc.)
3. **AI Service** (OpenAI, Anthropic, etc.) for conversation handling
4. **Email Service** (SMTP) for sending summaries

## 🚀 Step-by-Step Setup

### Step 1: Configure Backend Environment

Add these to your `backend/.env` file:

```env
# N8N Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/trigger-call
N8N_API_KEY=your-n8n-api-key-optional

# Email Configuration (for sending call summaries)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
ADMIN_EMAIL=kishorekailas2@gmail.com
```

**For Gmail:**
1. Enable 2-Step Verification
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the app password as `SMTP_PASSWORD`

### Step 2: Create Database Table

Run the migration in Supabase:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy contents from `backend/migrations/create_call_records_table.sql`
3. Run the SQL script

### Step 3: Set Up n8n Workflow

#### 3.1 Create Webhook Trigger

1. **Open n8n** and create a new workflow
2. **Add "Webhook" node** (Trigger)
3. **Configure:**
   - HTTP Method: `POST`
   - Path: `/webhook/trigger-call`
   - Response Mode: `When Last Node Finishes`
4. **Save the webhook URL** - this is your `N8N_WEBHOOK_URL`

#### 3.2 Add Phone Call Node

1. **Add "Twilio" or "Vonage" node** (or your phone provider)
2. **Configure:**
   - Action: `Make a Call`
   - From: Your phone number
   - To: `{{ $json.phoneNumber }}` (from webhook)
   - URL: Your call handling endpoint (see next step)

#### 3.3 Add AI Conversation Handler

1. **Add "HTTP Request" node** for call handling
   - This will handle the conversation
   - Use TwiML/Voice XML for voice responses
   - Integrate with OpenAI/Anthropic for AI responses

2. **Add "OpenAI" or "Anthropic" node** for conversation:
   - Model: GPT-4 or Claude
   - Prompt: "You are a customer service representative for a wedding website company. Help the customer with their inquiry about: {{ $json.reason }}"
   - Conversation context: Include customer details from webhook

#### 3.4 Add Call Summary Generation

1. **Add "Function" node** to process call transcript
2. **Generate summary** using AI:
   - Extract key points
   - Identify resolution
   - Format for email

#### 3.5 Send Summary to Backend

1. **Add "HTTP Request" node** to call your backend:
   - Method: `POST`
   - URL: `https://your-backend-url.com/api/n8n/call-summary`
   - Body:
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

### Step 4: Test the Integration

1. **Go to admin dashboard**: `http://localhost:3000/admin/contact-messages`
2. **Select a message** with a phone number
3. **Click "Call Customer"** button
4. **Check backend console** for logs
5. **Check your email** for the call summary (after call completes)

## 📊 Workflow Example

Here's a simplified n8n workflow structure:

```
Webhook (Trigger)
  ↓
Extract Data (phoneNumber, name, reason)
  ↓
Make Phone Call (Twilio/Vonage)
  ↓
Handle Conversation (AI/IVR)
  ↓
Generate Summary (AI)
  ↓
Send to Backend (HTTP Request to /api/n8n/call-summary)
  ↓
Backend sends email summary to admin
```

## 🔧 API Endpoints

### Trigger Call
```bash
POST /api/n8n/trigger-call
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "messageId": "uuid-here",
  "feedbackId": "uuid-here",
  "reason": "Follow up on contact message"
}
```

### Receive Call Summary (called by n8n)
```bash
POST /api/n8n/call-summary
Content-Type: application/json

{
  "callId": "call_1234567890_abc123",
  "phoneNumber": "+1234567890",
  "duration": 300,
  "summary": "Customer asked about pricing...",
  "transcript": "Full conversation transcript...",
  "status": "completed",
  "resolution": "Provided pricing information"
}
```

### Get Call Status
```bash
GET /api/n8n/call-status/:callId
```

### Get All Calls
```bash
GET /api/n8n/calls
```

## 📧 Email Summary Format

The email summary includes:
- **Call Details**: Name, phone, email, reason, duration
- **Call Summary**: AI-generated summary of the conversation
- **Full Transcript**: Complete conversation (if available)
- **Resolution**: How the issue was resolved

## 🎨 Admin UI Integration

### Contact Messages Page
- **"Call Customer" button** appears when a message has a phone number
- Click to trigger automated call
- Call status tracked in real-time

### Feedback Page
- Similar "Call Customer" button for feedback with contact info
- Integrated with feedback management

## 🔒 Security Notes

1. **Protect n8n webhook** with authentication
2. **Use HTTPS** for all webhook URLs
3. **Validate phone numbers** before calling
4. **Rate limit** call triggers
5. **Store credentials** securely in environment variables

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Twilio API](https://www.twilio.com/docs/voice)
- [OpenAI API](https://platform.openai.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/)

## 🆘 Troubleshooting

### Calls not triggering
- Check `N8N_WEBHOOK_URL` is set correctly
- Verify n8n workflow is active
- Check backend console for errors

### Email summaries not sending
- Verify SMTP credentials in `.env`
- Check `ADMIN_EMAIL` is set
- Test email sending separately

### Call summaries not received
- Verify n8n workflow calls `/api/n8n/call-summary`
- Check backend console for webhook logs
- Ensure n8n can reach your backend URL

## ✅ Checklist

- [ ] n8n instance set up and running
- [ ] Phone service provider configured (Twilio/Vonage)
- [ ] AI service configured (OpenAI/Anthropic)
- [ ] SMTP email configured
- [ ] Database table created (`call_records`)
- [ ] Environment variables set in `.env`
- [ ] n8n workflow created and tested
- [ ] Webhook URL configured
- [ ] Test call completed successfully
- [ ] Email summary received

