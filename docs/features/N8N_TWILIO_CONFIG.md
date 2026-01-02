# 📞 Twilio Node Configuration Guide

## Quick Setup for "Make Phone Call" Node

### Field Values:

1. **From**: `+91 9544143072` (your Twilio phone number - already set ✅)

2. **To**: 
   ```
   {{ $json.phoneNumber }}
   ```
   - This gets the customer's phone number from the webhook data
   - Click "Expression" button to enter this
   - Make sure it's in E.164 format (e.g., `+1234567890`)

3. **Use TwiML**: ✅ ON (already set correctly)

4. **Message**: 
   - This is actually the **TwiML URL** (not a text message)
   - Click "Expression" button
   - Enter your backend URL:
   
   **For Local Development (using ngrok):**
   ```
   https://your-ngrok-url.ngrok.io/api/n8n/call-handler
   ```
   
   **For Production:**
   ```
   https://your-backend-domain.com/api/n8n/call-handler
   ```
   
   **Example:**
   ```
   http://localhost:5001/api/n8n/call-handler
   ```
   (Note: Localhost won't work - Twilio needs a public URL)

## 🔧 Step-by-Step Configuration

1. **Click on "To" field**
2. **Click "Expression" button** (top right of the field)
3. **Type:** `{{ $json.phoneNumber }}`
4. **Click "Message" field**
5. **Click "Expression" button**
6. **Type your backend URL:**
   - If using ngrok: `https://abc123.ngrok.io/api/n8n/call-handler`
   - If deployed: `https://your-backend.com/api/n8n/call-handler`

## 🌐 Setting Up ngrok for Local Testing

Since Twilio needs a public URL, use ngrok for local testing:

1. **Install ngrok**: [https://ngrok.com/download](https://ngrok.com/download)
2. **Run ngrok:**
   ```bash
   ngrok http 5001
   ```
3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)
4. **Use it in the Message field:**
   ```
   https://abc123.ngrok.io/api/n8n/call-handler
   ```

## ✅ Verification

After setting these values:
- Red borders should disappear
- No warning icons
- You can click "Execute step" to test

## 📋 Complete Field Summary

| Field | Value | Type |
|-------|-------|------|
| **From** | `+91 9554143072` | Fixed |
| **To** | `{{ $json.phoneNumber }}` | Expression |
| **Use TwiML** | ON | Toggle |
| **Message** | `https://your-backend.com/api/n8n/call-handler` | Expression |

## 🆘 Troubleshooting

### "To" field error:
- Make sure you clicked "Expression" button
- Verify the webhook sends `phoneNumber` in the data
- Check that phone number is in E.164 format

### "Message" field error:
- Make sure you clicked "Expression" button
- Verify the URL is accessible (test in browser)
- For local testing, use ngrok
- URL must be HTTPS (or HTTP for localhost with ngrok)

### Call not connecting:
- Verify Twilio credentials are correct
- Check that your backend is running
- Ensure the call-handler endpoint is accessible
- Check backend logs for errors

