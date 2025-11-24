# 💬 WhatsApp Bot with ChatGPT Setup Guide

This guide will help you set up a WhatsApp bot that uses ChatGPT (OpenAI) to generate intelligent, personalized responses for your wedding website customers.

## 🎯 What This Does

When you click "Send WhatsApp" in the admin panel:
1. **Backend** sends customer info to n8n
2. **n8n** uses **ChatGPT** to generate a personalized message
3. **WhatsApp** sends the message to the customer
4. **You** receive an email summary

## 📋 Prerequisites

1. **n8n Account** (free tier available at [n8n.io](https://n8n.io))
2. **OpenAI API Key** (for ChatGPT) - [Get one here](https://platform.openai.com/api-keys)
3. **WhatsApp Business API Access** - Choose one:
   - **Twilio WhatsApp API** (recommended) - [Sign up](https://www.twilio.com/whatsapp)
   - **Meta WhatsApp Business API** - [Apply here](https://www.facebook.com/business/whatsapp)
   - **360dialog** - [Sign up](https://www.360dialog.com/)

## 🚀 Step 1: Get OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click **"Create new secret key"**
4. **Copy the API key** - you'll need it for n8n
5. **Add credits** to your OpenAI account (pay-as-you-go, ~$0.01-0.03 per message)

## 📱 Step 2: Set Up WhatsApp Business API

### Option A: Twilio WhatsApp API (Easiest)

1. **Sign up for Twilio**: [https://www.twilio.com/whatsapp](https://www.twilio.com/whatsapp)
2. **Get WhatsApp Sandbox**:
   - Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join the sandbox (send code to Twilio number)
3. **Get API Credentials**:
   - Account SID
   - Auth Token
   - WhatsApp number (format: `whatsapp:+1234567890`)

**Cost**: Free for sandbox testing, then ~$0.005-0.01 per message

### Option B: Meta WhatsApp Business API

1. **Apply for WhatsApp Business API**: [https://www.facebook.com/business/whatsapp](https://www.facebook.com/business/whatsapp)
2. **Get approved** (can take a few days)
3. **Get API credentials** from Meta Business Manager

**Cost**: Free for first 1,000 conversations/month, then paid

### Option C: 360dialog (Recommended for Production)

1. **Sign up**: [https://www.360dialog.com/](https://www.360dialog.com/)
2. **Get API key** from dashboard
3. **Configure webhook** URL

**Cost**: Varies by plan

## 🔧 Step 3: Import n8n Workflow

1. **Open n8n**: Go to your n8n instance
2. **Create new workflow**
3. **Click "Import from File"** or **"Import from URL"**
4. **Import**: `backend/n8n-workflow-whatsapp.json`
5. **Or manually create** using the guide below

## ⚙️ Step 4: Configure n8n Workflow

### 4.1 Configure OpenAI (ChatGPT) Node

1. **Click on "Generate Message with ChatGPT" node**
2. **Add OpenAI Credentials**:
   - Click "Credential to connect with" → "Create New"
   - **Name**: "OpenAI API"
   - **API Key**: Paste your OpenAI API key
   - **Save**
3. **Configure Model**:
   - **Model**: `gpt-4` or `gpt-3.5-turbo` (gpt-3.5-turbo is cheaper)
   - **Temperature**: `0.7` (balanced creativity)
   - **Max Tokens**: `500` (message length)

### 4.2 Configure WhatsApp Node

1. **Click on "Send WhatsApp Message" node**
2. **Set WhatsApp API URL**:
   - **Twilio**: `https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json`
   - **360dialog**: `https://waba-api.360dialog.io/v1/messages`
   - **Meta**: `https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`

3. **Add Authentication**:
   - **Twilio**: Use HTTP Header Auth
     - Header Name: `Authorization`
     - Header Value: `Basic BASE64(AccountSID:AuthToken)`
   - **360dialog**: Use API Key in header
     - Header Name: `D360-API-KEY`
     - Header Value: Your API key

4. **Set Request Body**:
   ```json
   {
     "to": "{{ $json.phoneNumber }}",
     "type": "text",
     "text": {
       "body": "{{ $('Generate Message with ChatGPT').item.json.choices[0].message.content }}"
     }
   }
   ```

### 4.3 Configure Webhook

1. **Click on "Webhook" node**
2. **Copy the Webhook URL** (e.g., `https://your-username.app.n8n.cloud/webhook/trigger-whatsapp`)
3. **Save this URL** - you'll need it for your backend `.env` file

### 4.4 Set Environment Variables

In n8n, go to **Settings** → **Environment Variables** and add:

- `BACKEND_URL`: Your backend URL (e.g., `https://backend-bf2g.onrender.com`)
- `WHATSAPP_API_URL`: Your WhatsApp API endpoint
- `OPENAI_API_KEY`: Your OpenAI API key (if not using credentials)

## 🔗 Step 5: Update Backend Environment Variables

Add to your `backend/.env` file:

```env
# n8n Webhook URL (from Step 4.3)
N8N_WEBHOOK_URL=https://your-username.app.n8n.cloud/webhook/trigger-whatsapp

# Optional: If you want to use OpenAI directly in backend
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## ✅ Step 6: Test the Workflow

1. **Activate the workflow** in n8n (toggle switch)
2. **Go to your admin panel**
3. **Click "Send WhatsApp"** on a contact message or feedback
4. **Check n8n execution logs** to see if it worked
5. **Check your email** for the summary
6. **Check customer's WhatsApp** - they should receive the message!

## 🎨 Customizing ChatGPT Responses

The ChatGPT node is configured with this system prompt:

```
You are a friendly and professional customer service representative 
for a wedding website company called WeddingWeb. Your role is to:

1. Greet customers warmly and professionally
2. Understand their wedding planning needs
3. Provide helpful information about wedding website services
4. Answer questions about pricing, features, and how the platform works
5. Schedule demo calls or consultations when needed
6. Be empathetic, patient, and solution-oriented
```

**To customize**:
1. **Edit the "Generate Message with ChatGPT" node** in n8n
2. **Modify the system message** in the "Messages" section
3. **Adjust temperature** (0.0-1.0) for more/less creative responses
4. **Change max tokens** for longer/shorter messages

## 📊 How It Works

```
Admin Panel
    ↓
Backend API (/api/n8n/trigger-whatsapp)
    ↓
n8n Webhook
    ↓
Set Variables (extract customer info)
    ↓
ChatGPT Node (generate personalized message)
    ↓
WhatsApp API (send message to customer)
    ↓
Generate Summary
    ↓
Backend API (/api/n8n/whatsapp-summary)
    ↓
Email Summary to Admin
```

## 💰 Cost Estimation

**Per WhatsApp Message:**
- **OpenAI (GPT-4)**: ~$0.01-0.03 per message
- **OpenAI (GPT-3.5-turbo)**: ~$0.001-0.002 per message (10x cheaper!)
- **WhatsApp (Twilio)**: ~$0.005-0.01 per message
- **WhatsApp (360dialog)**: Varies by plan

**Total per message**: ~$0.006-0.04 (depending on model and provider)

**For 100 messages/month**: ~$0.60-4.00/month

## 🔧 Troubleshooting

### Issue: "OpenAI API key invalid"
- **Solution**: Check your API key in n8n credentials
- **Check**: Make sure you have credits in your OpenAI account

### Issue: "WhatsApp message not sent"
- **Solution**: Check WhatsApp API credentials
- **Check**: Verify phone number format (include country code, e.g., `+919547143072`)
- **Check**: For Twilio sandbox, customer must join sandbox first

### Issue: "ChatGPT response is too long"
- **Solution**: Reduce `maxTokens` in ChatGPT node (try 300 instead of 500)

### Issue: "Workflow times out"
- **Solution**: Increase timeout in n8n workflow settings
- **Solution**: Use GPT-3.5-turbo instead of GPT-4 (faster)

## 🎯 Next Steps

1. **Test with a few customers**
2. **Monitor costs** in OpenAI dashboard
3. **Adjust ChatGPT prompts** based on customer responses
4. **Set up webhook** to receive customer replies (optional)
5. **Add conversation history** to ChatGPT for better context (advanced)

## 📚 Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [n8n Documentation](https://docs.n8n.io/)
- [360dialog Documentation](https://docs.360dialog.com/)

---

**Your WhatsApp bot is now powered by ChatGPT! 🚀**

The bot will generate intelligent, personalized messages for each customer based on their inquiry, making your customer service more efficient and professional.

