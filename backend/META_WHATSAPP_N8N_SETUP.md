# 🔧 Meta WhatsApp API - n8n Configuration Guide

## ✅ Your Credentials (from Meta Dashboard)

Based on your Meta App Dashboard, you have:

- **Access Token**: `EAAL8bSBnCOQBQONZCqdtZCg...` (keep this secret!)
- **Phone Number ID**: `875127749019884`
- **WhatsApp Business Account ID**: `1237568424867728`
- **Test Number**: `+1 555 079 9579`

## 🔐 Step 1: Store Credentials Securely in n8n

### Option A: Environment Variables (Recommended)

1. **Go to n8n Settings** → **Environment Variables**
2. **Add these variables**:

```
META_WHATSAPP_ACCESS_TOKEN=EAAL8bSBnCOQBQONZCqdtZCgOb1m98bypP3JmWZAqogieg6GdKHQJbPZB9h6ObnvSrkmrmY5KNZB59BUrLeetFs5coMZCd7SL9KcMZBHZAVqBl8XvFCLZA28OVGenx60kBrn9ZAZAdwI8ob9GwP7ZBJ8BvDcjMmHm7snIA2qxLGiel25AWKmiDuaEOanVZCuZCYRydybfs8SntXgO5y9uDySD4OPO49HAyZAcenau6kVXaKe0H8U20v82Kd9p4s5AtVSp9aYQYSGeyVZBB4HAp9s1EZAPFLPH3rS9iBwZDZD

META_WHATSAPP_PHONE_NUMBER_ID=875127749019884

META_WHATSAPP_BUSINESS_ACCOUNT_ID=1237568424867728
```

### Option B: HTTP Header Auth (Alternative)

You can also use n8n's HTTP Header Auth credential type.

## 📝 Step 2: Update n8n Workflow

### Update "Send WhatsApp Message" Node

1. **Open your n8n workflow**
2. **Click on "Send WhatsApp Message" node**
3. **Update the configuration**:

**URL:**
```
https://graph.facebook.com/v18.0/875127749019884/messages
```

**Method:** POST

**Authentication:** Generic Credential Type → HTTP Header Auth

**Headers:**
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.META_WHATSAPP_ACCESS_TOKEN }}`

**OR** if using direct value:
- **Name**: `Authorization`  
- **Value**: `Bearer EAAL8bSBnCOQBQONZCqdtZCgOb1m98bypP3JmWZAqogieg6GdKHQJbPZB9h6ObnvSrkmrmY5KNZB59BUrLeetFs5coMZCd7SL9KcMZBHZAVqBl8XvFCLZA28OVGenx60kBrn9ZAZAdwI8ob9GwP7ZBJ8BvDcjMmHm7snIA2qxLGiel25AWKmiDuaEOanVZCuZCYRydybfs8SntXgO5y9uDySD4OPO49HAyZAcenau6kVXaKe0H8U20v82Kd9p4s5AtVSp9aYQYSGeyVZBB4HAp9s1EZAPFLPH3rS9iBwZDZD`

**Body (JSON):**
```json
{
  "messaging_product": "whatsapp",
  "to": "{{ $json.phoneNumber }}",
  "type": "text",
  "text": {
    "body": "{{ $('Generate Message with Gemini').item.json.candidates[0].content.parts[0].text }}"
  }
}
```

## 🔧 Step 3: Complete n8n Node Configuration

### Full Configuration for "Send WhatsApp Message" Node:

```json
{
  "parameters": {
    "url": "https://graph.facebook.com/v18.0/875127749019884/messages",
    "method": "POST",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{ $json.phoneNumber }}\",\n  \"type\": \"text\",\n  \"text\": {\n    \"body\": \"{{ $('Generate Message with Gemini').item.json.candidates[0].content.parts[0].text }}\"\n  }\n}",
    "options": {
      "response": {
        "response": {
          "responseFormat": "json"
        }
      }
    }
  }
}
```

### HTTP Header Auth Credential Setup:

1. **Click "Credential to connect with"** → **Create New**
2. **Select "HTTP Header Auth"**
3. **Configure**:
   - **Name**: `Meta WhatsApp API`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer {{ $env.META_WHATSAPP_ACCESS_TOKEN }}`
   - **OR** directly: `Bearer EAAL8bSBnCOQBQONZCqdtZCgOb1m98bypP3JmWZAqogieg6GdKHQJbPZB9h6ObnvSrkmrmY5KNZB59BUrLeetFs5coMZCd7SL9KcMZBHZAVqBl8XvFCLZA28OVGenx60kBrn9ZAZAdwI8ob9GwP7ZBJ8BvDcjMmHm7snIA2qxLGiel25AWKmiDuaEOanVZCuZCYRydybfs8SntXgO5y9uDySD4OPO49HAyZAcenau6kVXaKe0H8U20v82Kd9p4s5AtVSp9aYQYSGeyVZBB4HAp9s1EZAPFLPH3rS9iBwZDZD`

## ⚠️ Important Notes

### Access Token Expiration
- **Test tokens expire** after a certain time
- **Regenerate** if you get authentication errors
- Go to Meta Dashboard → API Setup → Generate new access token

### Phone Number Format
- **Always include country code**: `+919544143072` (not `9544143072`)
- **No spaces or dashes**: `+919544143072` (not `+91 95441 43072`)

### Test Number Limitations
- **Test number** (`+1 555 079 9579`) works for 90 days
- **Free messages** during test period
- **For production**, you'll need to:
  1. Complete business verification
  2. Get approved for production access
  3. Use your own phone number

## 🧪 Step 4: Test the Configuration

1. **Activate your workflow** in n8n
2. **Go to admin panel**
3. **Click "Send WhatsApp"** on a contact message
4. **Check n8n execution logs**:
   - Should show successful API call
   - Response should have `"messages": [{"id": "..."}]`
5. **Check customer's WhatsApp** - message should arrive!

## 🔍 Troubleshooting

### Error: "Invalid OAuth access token"
- **Solution**: Regenerate access token in Meta Dashboard
- **Check**: Token might have expired

### Error: "Phone number not registered"
- **Solution**: Make sure phone number includes country code
- **Format**: `+919544143072` (with + and country code)

### Error: "Rate limit exceeded"
- **Solution**: You've hit the free tier limit
- **Check**: Meta Dashboard for usage stats

### Error: "Message failed to send"
- **Solution**: Check phone number format
- **Verify**: Customer's WhatsApp number is correct
- **Check**: n8n execution logs for detailed error

## 📊 API Response Format

**Success Response:**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{
    "input": "+919544143072",
    "wa_id": "919544143072"
  }],
  "messages": [{
    "id": "wamid.xxx"
  }]
}
```

**Error Response:**
```json
{
  "error": {
    "message": "Error message here",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 463
  }
}
```

## 🔄 Updating Workflow JSON

If you want to update the workflow JSON file directly, I can help you update `backend/n8n-workflow-whatsapp.json` with your Meta credentials.

## ✅ Checklist

- [ ] Access token stored in n8n environment variables
- [ ] Phone Number ID configured in workflow
- [ ] HTTP Header Auth credential created
- [ ] "Send WhatsApp Message" node updated
- [ ] Workflow activated
- [ ] Test message sent successfully
- [ ] Customer received WhatsApp message

---

**Your Meta WhatsApp API is ready to use! Configure it in n8n and start sending messages!** 🚀

