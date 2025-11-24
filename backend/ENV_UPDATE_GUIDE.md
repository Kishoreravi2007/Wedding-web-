# 🔧 Environment Variables Update Guide

## ✅ Required Changes for WhatsApp Bot

You need to update **ONE** environment variable in your `backend/.env` file.

## 📝 Update Required

### Change This Line:

**OLD (for phone calls):**
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/trigger-call
```

**NEW (for WhatsApp bot):**
```env
N8N_WEBHOOK_URL=https://your-username.app.n8n.cloud/webhook/trigger-whatsapp
```

## 🔍 How to Get Your n8n Webhook URL

1. **Go to your n8n workflow**
2. **Click on the "Webhook" node**
3. **Copy the webhook URL** (it should end with `/trigger-whatsapp`)
4. **Paste it** into your `backend/.env` file

Example:
```
N8N_WEBHOOK_URL=https://weddingweb.app.n8n.cloud/webhook/trigger-whatsapp
```

## 📋 Complete .env Checklist

### ✅ Already Configured (No Changes Needed):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - Email settings
- `ADMIN_EMAIL` - Your email for summaries
- `GOOGLE_SHEETS_*` - Google Sheets integration
- All other existing variables

### 🔄 Update This:
- `N8N_WEBHOOK_URL` - Change from `trigger-call` to `trigger-whatsapp`

### ❌ NOT Needed in Backend .env:
- `OPENAI_API_KEY` - Configure this in **n8n** (not backend .env)
- `WHATSAPP_API_URL` - Configure this in **n8n** (not backend .env)
- `WHATSAPP_API_KEY` - Configure this in **n8n** (not backend .env)

## 🎯 Quick Update Steps

1. **Open** `backend/.env` file
2. **Find** the line with `N8N_WEBHOOK_URL`
3. **Change** `trigger-call` to `trigger-whatsapp`
4. **Update** the full URL to your actual n8n webhook URL
5. **Save** the file
6. **Restart** your backend server

## 📝 Example .env Section

```env
# N8N Integration (for WhatsApp bot with ChatGPT)
N8N_WEBHOOK_URL=https://weddingweb.app.n8n.cloud/webhook/trigger-whatsapp
N8N_API_KEY=your-n8n-api-key-optional
```

## ⚠️ Important Notes

1. **Backend .env** only needs the webhook URL
2. **n8n credentials** (OpenAI, WhatsApp) are configured **inside n8n**, not in backend .env
3. **After updating**, restart your backend server for changes to take effect

## 🧪 Test Your Configuration

After updating, test by:
1. Going to admin panel
2. Clicking "Send WhatsApp" on a contact message
3. Checking backend logs for: `💬 Sending WhatsApp trigger to n8n:`
4. Checking n8n execution logs

## 🚨 Common Issues

### Issue: "n8n webhook not configured"
- **Solution**: Make sure `N8N_WEBHOOK_URL` is set correctly
- **Check**: URL should end with `/trigger-whatsapp`

### Issue: "Webhook URL not working"
- **Solution**: Verify the webhook URL in n8n
- **Check**: Make sure the workflow is **activated** in n8n

### Issue: "Changes not taking effect"
- **Solution**: Restart your backend server after updating .env

---

**That's it! Just update the `N8N_WEBHOOK_URL` and you're done!** ✅

