# 🔐 Meta WhatsApp API - Quick Setup Guide

## ✅ Your Credentials

From your Meta App Dashboard:

- **Access Token**: `EAAL8bSBnCOQBQONZCqdtZCgOb1m98bypP3JmWZAqogieg6GdKHQJbPZB9h6ObnvSrkmrmY5KNZB59BUrLeetFs5coMZCd7SL9KcMZBHZAVqBl8XvFCLZA28OVGenx60kBrn9ZAZAdwI8ob9GwP7ZBJ8BvDcjMmHm7snIA2qxLGiel25AWKmiDuaEOanVZCuZCYRydybfs8SntXgO5y9uDySD4OPO49HAyZAcenau6kVXaKe0H8U20v82Kd9p4s5AtVSp9aYQYSGeyVZBB4HAp9s1EZAPFLPH3rS9iBwZDZD`
- **Phone Number ID**: `875127749019884`
- **WhatsApp Business Account ID**: `1237568424867728`

## 🚀 Quick Setup in n8n

### Step 1: Add Environment Variables

1. **Go to n8n** → **Settings** → **Environment Variables**
2. **Add**:
   ```
   META_WHATSAPP_ACCESS_TOKEN=EAAL8bSBnCOQBQONZCqdtZCgOb1m98bypP3JmWZAqogieg6GdKHQJbPZB9h6ObnvSrkmrmY5KNZB59BUrLeetFs5coMZCd7SL9KcMZBHZAVqBl8XvFCLZA28OVGenx60kBrn9ZAZAdwI8ob9GwP7ZBJ8BvDcjMmHm7snIA2qxLGiel25AWKmiDuaEOanVZCuZCYRydybfs8SntXgO5y9uDySD4OPO49HAyZAcenau6kVXaKe0H8U20v82Kd9p4s5AtVSp9aYQYSGeyVZBB4HAp9s1EZAPFLPH3rS9iBwZDZD
   ```

### Step 2: Configure "Send WhatsApp Message" Node

1. **Open your workflow** in n8n
2. **Click "Send WhatsApp Message" node**
3. **Update**:

**URL:**
```
https://graph.facebook.com/v18.0/875127749019884/messages
```

**Authentication:**
- Click "Credential to connect with" → **Create New**
- Select **"HTTP Header Auth"**
- **Name**: `Meta WhatsApp API`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer {{ $env.META_WHATSAPP_ACCESS_TOKEN }}`

**Body (JSON)** - Already updated in workflow! ✅

### Step 3: Test

1. **Activate workflow**
2. **Go to admin panel**
3. **Click "Send WhatsApp"**
4. **Check n8n logs** - should show success!

## ⚠️ Important Notes

1. **Access Token Expires**: Regenerate in Meta Dashboard if it stops working
2. **Phone Format**: Always use `+919544143072` (with country code, no spaces)
3. **Test Number**: Your test number works for 90 days, then you'll need production access

## ✅ Done!

Your workflow is now configured for Meta WhatsApp API! 🎉

