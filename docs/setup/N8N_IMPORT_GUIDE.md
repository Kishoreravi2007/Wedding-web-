# 📥 How to Import the N8N Workflow

This guide will help you import the pre-made n8n workflow into your n8n instance.

## 🚀 Quick Import Steps

### Step 1: Get Your n8n Account

1. Go to [https://n8n.io](https://n8n.io)
2. Sign up for a free account (or log in if you have one)
3. You'll be taken to your n8n dashboard

### Step 2: Import the Workflow

1. **In n8n dashboard**, click **"Workflows"** in the left sidebar
2. Click **"+ New Workflow"** button (top right)
3. Click the **"⋮" (three dots menu)** in the top right
4. Select **"Import from File"** or **"Import from URL"**
5. **Upload** the file: `backend/n8n-workflow.json`
6. The workflow will be imported and opened

### Step 3: Configure the Webhook

1. **Click on the "Webhook" node** (first node)
2. **Click "Execute Node"** to activate it
3. **Copy the Webhook URL** that appears
   - Example: `https://your-username.app.n8n.cloud/webhook/trigger-call`
4. **Save this URL** - you'll need it for your backend `.env` file

### Step 4: Set Up Twilio Credentials

1. **Click on the "Make Phone Call" node** (Twilio node)
2. **Click "Create New Credential"** or select existing
3. **Enter your Twilio credentials:**
   - **Account SID**: From your Twilio dashboard
   - **Auth Token**: From your Twilio dashboard
4. **Click "Save"**

### Step 5: Configure Environment Variables

In n8n, you need to set environment variables:

1. **Go to Settings** → **Environment Variables** (or use n8n's credential system)
2. **Add these variables:**
   - `TWILIO_PHONE_NUMBER`: Your Twilio phone number (e.g., `+1234567890`)
   - `BACKEND_URL`: Your backend URL (e.g., `https://your-backend.com` or `http://localhost:5001`)

**OR** you can edit the nodes directly:
- In the **"Make Phone Call" node**, replace `={{ $env.TWILIO_PHONE_NUMBER }}` with your actual Twilio number
- In the **"Send Summary to Backend" node**, replace `={{ $env.BACKEND_URL }}` with your actual backend URL

### Step 6: Update Backend URL in Workflow

1. **Click on "Send Summary to Backend" node**
2. **Update the URL** to match your backend:
   - For local: `http://localhost:5001/api/n8n/call-summary`
   - For production: `https://your-backend.com/api/n8n/call-summary`

### Step 7: Activate the Workflow

1. **Toggle the "Active" switch** in the top right of the workflow
2. The workflow is now live and ready to receive calls!

### Step 8: Update Your Backend .env

Add the webhook URL to your `backend/.env` file:

```env
N8N_WEBHOOK_URL=https://your-username.app.n8n.cloud/webhook/trigger-call
```

Replace `https://your-username.app.n8n.cloud/webhook/trigger-call` with the actual webhook URL from Step 3.

## ✅ Testing the Workflow

1. **Go to your admin dashboard**: `http://localhost:3000/admin/contact-messages`
2. **Select a message** with a phone number
3. **Click "Call Customer"** button
4. **Check n8n execution logs**:
   - Go back to n8n
   - Click on the workflow
   - You should see execution history
   - Click on an execution to see the flow
5. **Check your email** (`kishorekailas2@gmail.com`) for the call summary

## 🔧 Customizing the Workflow

### Add AI Conversation Handling

To add real AI conversation handling:

1. **Add an "OpenAI" node** after the "Set Variables" node
2. **Configure it** to process the call transcript
3. **Connect it** to generate responses

### Improve Call Summary

1. **Edit the "Generate Summary" node** (Code node)
2. **Add logic** to:
   - Process actual call transcripts
   - Use AI to generate better summaries
   - Extract key information

### Add Error Handling

1. **Add "IF" nodes** to check for errors
2. **Add error handling** for failed calls
3. **Send notifications** if calls fail

## 📋 What the Workflow Does

1. **Receives webhook** from your backend when "Call Customer" is clicked
2. **Extracts data** (phone number, name, reason, etc.)
3. **Makes phone call** via Twilio
4. **Handles the call** (your backend returns TwiML)
5. **Generates summary** (currently basic, can be enhanced with AI)
6. **Sends summary** to your backend
7. **Backend sends email** to `kishorekailas2@gmail.com`

## 🆘 Troubleshooting

### Workflow not receiving calls
- Check if workflow is **activated** (toggle switch)
- Verify webhook URL in backend `.env` matches n8n webhook URL
- Check n8n execution logs for errors

### Calls not connecting
- Verify Twilio credentials are correct
- Check Twilio phone number is valid
- Ensure backend URL is accessible from n8n

### Email summaries not sending
- Check backend SMTP configuration in `.env`
- Verify `ADMIN_EMAIL` is set to `kishorekailas2@gmail.com`
- Check backend console for email errors

### Backend call handler not working
- Ensure backend is running
- Check that `/api/n8n/call-handler` endpoint exists
- Verify CORS is configured correctly

## 📚 Next Steps

1. **Test with a real phone number** (your own number first!)
2. **Customize the TwiML** responses in `backend/routes/n8n-integration.js`
3. **Add AI integration** for better conversation handling
4. **Enhance summary generation** with actual call transcripts
5. **Add call recording** if needed

## 💡 Tips

- **Start simple**: Test the basic flow first before adding AI
- **Use your own number**: Test with your phone number first
- **Check logs**: Both n8n and backend logs will help debug issues
- **Monitor costs**: Twilio charges per call, so monitor usage

---

**Need help?** Check the main setup guide: `backend/N8N_INTEGRATION_SETUP.md`

