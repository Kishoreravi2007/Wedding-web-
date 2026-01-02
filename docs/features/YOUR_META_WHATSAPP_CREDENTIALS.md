# 🔐 Your Meta WhatsApp API Credentials

## ✅ Credentials Summary

### Access Token
```
EAAL8bSBnCOQBQONZCqdtZCgOb1m98bypP3JmWZAqogieg6GdKHQJbPZB9h6ObnvSrkmrmY5KNZB59BUrLeetFs5coMZCd7SL9KcMZBHZAVqBl8XvFCLZA28OVGenx60kBrn9ZAZAdwI8ob9GwP7ZBJ8BvDcjMmHm7snIA2qxLGiel25AWKmiDuaEOanVZCuZCYRydybfs8SntXgO5y9uDySD4OPO49HAyZAcenau6kVXaKe0H8U20v82Kd9p4s5AtVSp9aYQYSGeyVZBB4HAp9s1EZAPFLPH3rS9iBwZDZD
```

### Phone Number ID
```
875127749019884
```

### WhatsApp Business Account ID
```
1237568424867728
```

### Test Phone Number
```
+1 555 079 9579
```

---

## 🔧 Configuration Status

### ✅ Already Configured

1. **n8n Workflow** (`backend/n8n-workflow-whatsapp.json`):
   - ✅ URL updated: `https://graph.facebook.com/v18.0/875127749019884/messages`
   - ✅ JSON body includes `"messaging_product": "whatsapp"`
   - ✅ Ready for Meta WhatsApp API

2. **Backend Routes**:
   - ✅ `/api/n8n/trigger-whatsapp` - Ready
   - ✅ `/api/n8n/whatsapp-summary` - Ready
   - ✅ Call schedules integration - Ready

3. **Frontend**:
   - ✅ "Send WhatsApp" buttons - Updated
   - ✅ Admin panel - Ready

---

## 📝 Next Steps: Configure in n8n

### Step 1: Add Access Token to n8n

1. **Open n8n**
2. **Go to**: Settings → Environment Variables
3. **Add new variable**:
   - **Name**: `META_WHATSAPP_ACCESS_TOKEN`
   - **Value**: `EAAL8bSBnCOQBQONZCqdtZCgOb1m98bypP3JmWZAqogieg6GdKHQJbPZB9h6ObnvSrkmrmY5KNZB59BUrLeetFs5coMZCd7SL9KcMZBHZAVqBl8XvFCLZA28OVGenx60kBrn9ZAZAdwI8ob9GwP7ZBJ8BvDcjMmHm7snIA2qxLGiel25AWKmiDuaEOanVZCuZCYRydybfs8SntXgO5y9uDySD4OPO49HAyZAcenau6kVXaKe0H8U20v82Kd9p4s5AtVSp9aYQYSGeyVZBB4HAp9s1EZAPFLPH3rS9iBwZDZD`

### Step 2: Configure "Send WhatsApp Message" Node

1. **Import workflow**: `backend/n8n-workflow-whatsapp.json`
2. **Click on "Send WhatsApp Message" node**
3. **Set Authentication**:
   - Click "Credential to connect with" → **Create New**
   - Select **"HTTP Header Auth"**
   - **Name**: `Meta WhatsApp API`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer {{ $env.META_WHATSAPP_ACCESS_TOKEN }}`
4. **Verify URL** (should be):
   ```
   https://graph.facebook.com/v18.0/875127749019884/messages
   ```
5. **Verify Body** (should include):
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

### Step 3: Test

1. **Activate workflow** in n8n
2. **Go to admin panel**
3. **Click "Send WhatsApp"** on a contact message
4. **Check n8n execution logs** for success
5. **Check customer's WhatsApp** - message should arrive!

---

## 🔒 Security Notes

### ⚠️ Keep Credentials Secret

- **Never commit** these credentials to Git
- **Don't share** access token publicly
- **Regenerate token** if exposed
- **Use environment variables** in n8n (not hardcoded)

### 🔄 Token Expiration

- **Test tokens expire** after a certain period
- **If messages stop working**, regenerate token:
  1. Go to Meta Dashboard → API Setup
  2. Click "Generate access token"
  3. Copy new token
  4. Update in n8n environment variables

---

## 📊 API Endpoint Details

### Base URL
```
https://graph.facebook.com/v18.0/
```

### Full Endpoint
```
https://graph.facebook.com/v18.0/875127749019884/messages
```

### Request Format
```json
{
  "messaging_product": "whatsapp",
  "to": "+919544143072",
  "type": "text",
  "text": {
    "body": "Your message here"
  }
}
```

### Headers Required
```
Authorization: Bearer EAAL8bSBnCOQBQONZCqdtZCg...
Content-Type: application/json
```

---

## ✅ Checklist

- [x] Access Token obtained
- [x] Phone Number ID obtained
- [x] Business Account ID obtained
- [x] n8n workflow updated
- [x] Backend routes ready
- [x] Frontend buttons updated
- [ ] Access token added to n8n environment variables
- [ ] HTTP Header Auth credential created in n8n
- [ ] Workflow activated in n8n
- [ ] Test message sent successfully

---

## 🆘 Troubleshooting

### If messages don't send:

1. **Check access token** - Regenerate if expired
2. **Verify phone number format** - Must be `+919544143072` (with country code)
3. **Check n8n logs** - Look for error messages
4. **Verify workflow is activated** - Toggle must be ON
5. **Check Meta Dashboard** - Ensure app is not restricted

### Common Errors:

- **"Invalid OAuth access token"** → Regenerate token
- **"Phone number not registered"** → Check number format
- **"Rate limit exceeded"** → Wait or upgrade plan
- **"Message failed"** → Check phone number and format

---

**Your credentials are ready! Just configure them in n8n and you're good to go!** 🚀

