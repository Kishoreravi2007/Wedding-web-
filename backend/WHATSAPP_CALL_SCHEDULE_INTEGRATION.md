# 📞 WhatsApp Bot → Call Schedules Integration

## ✅ What Was Added

The WhatsApp bot now automatically saves customer details to the **Call Schedules** section in the admin panel.

## 🎯 How It Works

1. **Admin clicks "Send WhatsApp"** in admin panel
2. **Gemini generates message** asking if customer wants to talk to an executive
3. **WhatsApp message sent** to customer
4. **Customer details automatically saved** to call schedules:
   - Name
   - Email (or generated from phone if not provided)
   - Phone number
   - Message/Reason
   - Source: "whatsapp-bot"
   - Preferred date: Today's date (default)

5. **Appears in admin panel** → Call Schedules page

## 📋 Gemini Message

The Gemini bot now **always asks** at the end of the message:

> "Would you like to speak with a WeddingWeb executive? Please reply YES if you'd like us to schedule a call with you."

## 🔄 Workflow Flow

```
Admin Panel (Send WhatsApp)
    ↓
Backend API (/api/n8n/trigger-whatsapp)
    ↓
n8n Webhook
    ↓
Set Variables
    ↓
Generate Message with Gemini (asks about executive call)
    ↓
Send WhatsApp Message
    ↓
Generate Summary
    ↓
Send Summary to Backend
    ↓
Save to Call Schedules ← NEW!
    ↓
Webhook Response
```

## 📊 Call Schedule Data Saved

When a WhatsApp message is sent, the following is saved to `call_schedules`:

- **name**: Customer's name
- **email**: Customer's email (or auto-generated from phone if missing)
- **phone**: Customer's phone number
- **preferred_date**: Today's date (default)
- **message**: Customer's original inquiry/reason
- **source**: "whatsapp-bot"
- **status**: "pending" (default)

## 👀 Viewing in Admin Panel

1. **Go to Admin Panel** → **Call Schedules**
2. **See all WhatsApp inquiries** with:
   - Customer name
   - Phone number
   - Their message/reason
   - Status: "pending"
   - Source: "whatsapp-bot"

## 🔧 Backend Changes

### Updated `backend/routes/call-schedules.js`:
- Made `preferredDate` optional (defaults to today)
- Only requires `name` and `email` now
- Auto-generates email from phone if email not provided

## 📝 Example

**Customer Inquiry:**
- Name: "John Doe"
- Phone: "+91 9876543210"
- Reason: "I want to know about WeddingWeb pricing"

**What Happens:**
1. Gemini sends WhatsApp: "Hi John! I'd be happy to help with WeddingWeb pricing... Would you like to speak with a WeddingWeb executive? Please reply YES if you'd like us to schedule a call with you."
2. Call schedule created:
   - Name: "John Doe"
   - Phone: "+91 9876543210"
   - Email: "whatsapp-919876543210@weddingweb.local" (auto-generated)
   - Message: "Customer inquiry via WhatsApp: I want to know about WeddingWeb pricing"
   - Source: "whatsapp-bot"
   - Status: "pending"

**Admin sees this in Call Schedules page!** ✅

## 🎯 Next Steps (Future Enhancement)

Currently, the system saves the request automatically. In the future, you can:

1. **Set up WhatsApp webhook** to receive customer replies
2. **If customer replies "YES"**, update the call schedule status
3. **Send notification** to admin when customer wants to talk

---

**The integration is complete! All WhatsApp inquiries are now automatically saved to Call Schedules!** 🚀

