# 🤖 Google Gemini Setup Guide for WhatsApp Bot

This guide will help you set up Google Gemini AI instead of ChatGPT for your WhatsApp bot.

## 🎯 What Changed

- ✅ Replaced OpenAI ChatGPT with **Google Gemini**
- ✅ Using Gemini Pro model via HTTP Request
- ✅ Same strict WeddingWeb-only response rules
- ✅ Lower cost than ChatGPT

## 📋 Prerequisites

1. **Google AI Studio Account** - [Sign up here](https://aistudio.google.com/)
2. **Gemini API Key** - Free tier available
3. **n8n Account** - Your existing n8n instance

## 🚀 Step 1: Get Gemini API Key

1. **Go to Google AI Studio**: [https://aistudio.google.com/](https://aistudio.google.com/)
2. **Sign in** with your Google account
3. **Click "Get API Key"** in the left sidebar
4. **Create API key** in new project (or select existing)
5. **Copy the API key** - you'll need it for n8n

**Note**: Gemini API has a **free tier** with generous limits!

## ⚙️ Step 2: Configure n8n Workflow

### 2.1 Set Environment Variable in n8n

1. **Go to n8n Settings** → **Environment Variables**
2. **Add new variable**:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from Step 1
   - **Save**

### 2.2 Import Updated Workflow

1. **Open n8n**
2. **Import** `backend/n8n-workflow-whatsapp.json`
3. **The workflow is already configured** to use Gemini!

### 2.3 Verify Gemini Node

1. **Click on "Generate Message with Gemini" node**
2. **Check the URL** - should be:
   ```
   https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={{ $env.GEMINI_API_KEY }}
   ```
3. **Verify** the API key is set in environment variables

## 🔧 Step 3: Test the Workflow

1. **Activate the workflow** in n8n
2. **Go to admin panel**
3. **Click "Send WhatsApp"** on a contact message
4. **Check n8n execution logs** - should show Gemini response
5. **Check customer's WhatsApp** - message should arrive!

## 💰 Cost Comparison

### Gemini (Current):
- **Free tier**: 60 requests/minute, 1,500 requests/day
- **Paid**: ~$0.00025 per 1K characters (very cheap!)
- **Model**: `gemini-pro` (free tier)

### ChatGPT (Previous):
- **GPT-4**: ~$0.01-0.03 per message
- **GPT-3.5-turbo**: ~$0.001-0.002 per message

**Gemini is FREE for most use cases!** 🎉

## 🎨 Customizing Gemini Responses

### Change Model

In the "Generate Message with Gemini" node, you can change the model:

- **gemini-pro** (current) - Best for general use
- **gemini-pro-vision** - For image understanding
- **gemini-ultra** - Most advanced (if available)

Update the URL:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

### Adjust Temperature

In the JSON body, change:
```json
"generationConfig": {
  "temperature": 0.7,  // 0.0-1.0 (lower = more focused)
  "maxOutputTokens": 500  // Maximum response length
}
```

### Modify System Prompt

Edit the `text` field in the JSON body to change the prompt. The current prompt ensures:
- ✅ Only answers WeddingWeb questions
- ✅ Redirects unrelated questions
- ✅ Professional and concise responses

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
Gemini API (generate personalized message)
    ↓
WhatsApp API (send message to customer)
    ↓
Generate Summary
    ↓
Backend API (/api/n8n/whatsapp-summary)
    ↓
Email Summary to Admin
```

## 🔍 Troubleshooting

### Issue: "API key invalid"
- **Solution**: Check `GEMINI_API_KEY` in n8n environment variables
- **Verify**: API key is correct in Google AI Studio

### Issue: "Model not found"
- **Solution**: Make sure model name is correct (`gemini-pro`)
- **Check**: Model availability in your region

### Issue: "Rate limit exceeded"
- **Solution**: You've hit free tier limits
- **Options**: Wait, or upgrade to paid tier

### Issue: "Response format error"
- **Solution**: Check JSON body structure in HTTP Request node
- **Verify**: Response parsing in "Generate Summary" node

## 📚 Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

## ✅ Checklist

- [ ] Google AI Studio account created
- [ ] Gemini API key obtained
- [ ] `GEMINI_API_KEY` set in n8n environment variables
- [ ] Workflow imported and activated
- [ ] Test message sent successfully
- [ ] Customer received WhatsApp message
- [ ] Email summary received

---

**Your WhatsApp bot is now powered by Google Gemini! 🚀**

Gemini is free for most use cases and provides excellent responses focused on WeddingWeb services.

