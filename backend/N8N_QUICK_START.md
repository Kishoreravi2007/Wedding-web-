# 🚀 N8N Integration Quick Start

## What It Does

When you click "Call Customer" in the admin dashboard:
1. ✅ Triggers an automated call via n8n
2. ✅ AI handles the conversation
3. ✅ Generates a summary of the chat
4. ✅ Sends email summary to you automatically

## ⚡ Quick Setup (5 minutes)

### 1. Add to `backend/.env`:

```env
# N8N Webhook URL (get this from your n8n workflow)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/trigger-call

# Email for receiving call summaries
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
ADMIN_EMAIL=kishorekailas2@gmail.com
```

### 2. Create n8n Workflow

1. **Create Webhook** → Copy webhook URL → Set as `N8N_WEBHOOK_URL`
2. **Add Phone Call Node** (Twilio/Vonage) → Connect to phone number
3. **Add AI Node** (OpenAI/Claude) → Handle conversation
4. **Add HTTP Request** → Call `https://your-backend.com/api/n8n/call-summary` with summary

### 3. Test It!

1. Go to admin → Contact Messages
2. Select a message with phone number
3. Click "Call Customer"
4. Check your email for the summary!

## 📚 Full Documentation

See `backend/N8N_INTEGRATION_SETUP.md` for complete setup guide.

