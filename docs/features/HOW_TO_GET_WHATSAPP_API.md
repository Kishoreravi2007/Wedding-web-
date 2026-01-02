# 📱 How to Get WhatsApp Business API Access

This guide covers the different ways to get WhatsApp Business API access for your bot.

## 🎯 Quick Comparison

| Option | Cost | Setup Time | Best For |
|--------|------|------------|----------|
| **Twilio WhatsApp** | Free sandbox, then ~$0.005-0.01/msg | 5 minutes | Quick start, testing |
| **360dialog** | Free tier available | 10-15 minutes | Production use |
| **Meta Direct** | Free (1K conversations/month) | 1-3 days (approval) | Large scale |
| **Wati** | Paid plans | 10 minutes | Enterprise |

## 🚀 Option 1: Twilio WhatsApp (Easiest - Recommended for Testing)

### Step 1: Sign Up for Twilio
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Sign up** for a free account
3. **Verify your email** and phone number

### Step 2: Get WhatsApp Sandbox
1. **Login to Twilio Console**: [https://console.twilio.com/](https://console.twilio.com/)
2. **Navigate to**: Messaging → Try it out → Send a WhatsApp message
3. **Join the Sandbox**:
   - You'll see a Twilio WhatsApp number (e.g., `+1 415 523 8886`)
   - Send the code shown to that number via WhatsApp
   - Example: Send `join <code>` to the Twilio number
4. **Sandbox activated!** ✅

### Step 3: Get API Credentials
1. **Account SID**: Found in Twilio Console dashboard (top right)
2. **Auth Token**: Click "View" next to Auth Token (keep it secret!)
3. **WhatsApp Number**: Format as `whatsapp:+14155238886` (use your sandbox number)

### Step 4: Configure in n8n
1. **Add HTTP Request node** for WhatsApp
2. **URL**: `https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json`
3. **Method**: POST
4. **Authentication**: Basic Auth
   - Username: Your Account SID
   - Password: Your Auth Token
5. **Body** (form-data):
   ```
   From: whatsapp:+14155238886
   To: whatsapp:{{ $json.phoneNumber }}
   Body: {{ $json.message }}
   ```

### Cost
- **Sandbox**: FREE (for testing)
- **Production**: ~$0.005-0.01 per message
- **Phone number**: ~$1/month

### Limitations
- **Sandbox**: Only works with verified numbers (customers must join sandbox)
- **Production**: Need to apply for WhatsApp Business Profile (can take time)

---

## 🌐 Option 2: 360dialog (Recommended for Production)

### Step 1: Sign Up
1. Go to [https://www.360dialog.com/](https://www.360dialog.com/)
2. **Sign up** for an account
3. **Verify your email**

### Step 2: Get API Key
1. **Login to dashboard**
2. **Go to API section**
3. **Copy your API key**

### Step 3: Connect WhatsApp Business Account
1. **Link your WhatsApp Business Account** (or create one)
2. **Verify your business** (may take 1-2 days)
3. **Get approved** for API access

### Step 4: Configure in n8n
1. **Add HTTP Request node**
2. **URL**: `https://waba-api.360dialog.io/v1/messages`
3. **Method**: POST
4. **Headers**:
   - `D360-API-KEY`: Your API key
   - `Content-Type`: application/json
5. **Body** (JSON):
   ```json
   {
     "to": "{{ $json.phoneNumber }}",
     "type": "text",
     "text": {
       "body": "{{ $json.message }}"
     }
   }
   ```

### Cost
- **Free tier**: Limited messages/month
- **Paid plans**: Varies by volume
- **No sandbox restrictions** - works with any WhatsApp number

---

## 📘 Option 3: Meta WhatsApp Business API (Direct)

### Step 1: Create Meta Business Account
1. Go to [https://business.facebook.com/](https://business.facebook.com/)
2. **Create a Business Account**
3. **Add your business details**

### Step 2: Apply for WhatsApp Business API
1. **Go to**: [https://www.facebook.com/business/whatsapp](https://www.facebook.com/business/whatsapp)
2. **Click "Get Started"**
3. **Fill out application form**:
   - Business name
   - Business type
   - Use case description
   - Expected message volume
4. **Submit for approval** (can take 1-3 days)

### Step 3: Get API Credentials
1. **Once approved**, go to Meta Business Manager
2. **Navigate to**: WhatsApp → API Setup
3. **Get**:
   - Phone Number ID
   - Business Account ID
   - Access Token

### Step 4: Configure in n8n
1. **Add HTTP Request node**
2. **URL**: `https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`
3. **Method**: POST
4. **Headers**:
   - `Authorization`: Bearer YOUR_ACCESS_TOKEN
   - `Content-Type`: application/json
5. **Body** (JSON):
   ```json
   {
     "messaging_product": "whatsapp",
     "to": "{{ $json.phoneNumber }}",
     "type": "text",
     "text": {
       "body": "{{ $json.message }}"
     }
   }
   ```

### Cost
- **First 1,000 conversations/month**: FREE
- **After**: ~$0.005-0.01 per conversation
- **No phone number cost**

### Limitations
- **Approval required** (can take time)
- **Business verification** needed
- **More complex setup**

---

## 🎯 Recommended Approach

### For Testing/Development:
**Use Twilio WhatsApp Sandbox** (Option 1)
- ✅ Fastest setup (5 minutes)
- ✅ Free for testing
- ✅ Easy to configure
- ⚠️ Only works with verified numbers

### For Production:
**Use 360dialog** (Option 2) or **Meta Direct** (Option 3)
- ✅ Works with any WhatsApp number
- ✅ No sandbox restrictions
- ✅ Professional setup
- ⚠️ Requires approval/verification

---

## 📋 Quick Setup Checklist

### Twilio (Testing):
- [ ] Sign up for Twilio account
- [ ] Join WhatsApp sandbox
- [ ] Get Account SID and Auth Token
- [ ] Configure in n8n HTTP Request node
- [ ] Test with verified number

### 360dialog (Production):
- [ ] Sign up for 360dialog account
- [ ] Get API key
- [ ] Link WhatsApp Business Account
- [ ] Verify business (if required)
- [ ] Configure in n8n
- [ ] Test with any WhatsApp number

### Meta Direct (Production):
- [ ] Create Meta Business Account
- [ ] Apply for WhatsApp Business API
- [ ] Wait for approval (1-3 days)
- [ ] Get Phone Number ID and Access Token
- [ ] Configure in n8n
- [ ] Test

---

## 🔧 n8n Configuration Example

### For Twilio:
```json
{
  "url": "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json",
  "method": "POST",
  "authentication": "basicAuth",
  "sendBody": true,
  "specifyBody": "formData",
  "formData": {
    "From": "whatsapp:+14155238886",
    "To": "whatsapp:{{ $json.phoneNumber }}",
    "Body": "{{ $json.message }}"
  }
}
```

### For 360dialog:
```json
{
  "url": "https://waba-api.360dialog.io/v1/messages",
  "method": "POST",
  "headers": {
    "D360-API-KEY": "{{ $env.D360_API_KEY }}",
    "Content-Type": "application/json"
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": {
    "to": "{{ $json.phoneNumber }}",
    "type": "text",
    "text": {
      "body": "{{ $json.message }}"
    }
  }
}
```

### For Meta:
```json
{
  "url": "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer {{ $env.META_ACCESS_TOKEN }}",
    "Content-Type": "application/json"
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": {
    "messaging_product": "whatsapp",
    "to": "{{ $json.phoneNumber }}",
    "type": "text",
    "text": {
      "body": "{{ $json.message }}"
    }
  }
}
```

---

## 💡 Tips

1. **Start with Twilio Sandbox** for quick testing
2. **Apply for production access** while testing
3. **Use 360dialog** if you need production access quickly
4. **Use Meta Direct** for large scale (1K+ free conversations/month)
5. **Test thoroughly** before going live

---

## 🆘 Need Help?

- **Twilio Support**: [https://support.twilio.com/](https://support.twilio.com/)
- **360dialog Docs**: [https://docs.360dialog.com/](https://docs.360dialog.com/)
- **Meta WhatsApp API**: [https://developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)

---

**Recommended: Start with Twilio Sandbox for testing, then move to 360dialog or Meta for production!** 🚀

