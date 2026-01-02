# 🎯 Gemini Strict Prompt Configuration

## Current Configuration

The Gemini prompt has been configured with **STRICT restrictions** to ensure it ONLY answers WeddingWeb-related questions.

## 🔒 Key Restrictions

1. ✅ **FORBIDDEN** from answering any non-WeddingWeb questions
2. ✅ **MUST redirect** with exact message if asked about other topics
3. ✅ **ONLY allowed topics**: WeddingWeb services, features, pricing, support
4. ✅ **Lower temperature** (0.3) for more focused, less creative responses

## 📋 Prompt Structure

### Absolute Restrictions
- ❌ NO answers about: venues, photographers, caterers, florists, dresses, general planning
- ❌ NO general advice or recommendations outside WeddingWeb
- ❌ NO engagement with unrelated topics

### Required Redirect
If asked about anything NOT related to WeddingWeb, Gemini MUST respond with:
```
"I'm here exclusively to help you with WeddingWeb wedding website services. 
How can I assist you with creating or managing your wedding website today?"
```

### Only Allowed Topics
- ✅ Wedding website creation
- ✅ Guest management
- ✅ RSVP features
- ✅ Photo galleries
- ✅ Event scheduling
- ✅ Pricing plans
- ✅ Demo calls
- ✅ Technical support
- ✅ Account management
- ✅ Feature explanations

## ⚙️ Generation Config

```json
{
  "temperature": 0.3,        // Lower = more focused, less creative
  "maxOutputTokens": 400,     // Shorter responses
  "topP": 0.8,                // More deterministic
  "topK": 20                  // Limited token selection
}
```

**Why these settings:**
- **Temperature 0.3**: Much lower than default (0.7-0.9), makes responses more predictable and focused
- **Max Tokens 400**: Shorter responses = less chance to go off-topic
- **TopP/TopK**: Limits creative variations

## 🧪 Testing the Restrictions

### ✅ Should Answer:
- "What features does WeddingWeb offer?"
- "How much does WeddingWeb cost?"
- "Can I see a demo of WeddingWeb?"
- "How do I create a wedding website on WeddingWeb?"

### ❌ Should Redirect (with exact message):
- "What's the best wedding venue?"
- "Can you recommend a photographer?"
- "What should I serve at my wedding?"
- "Tell me about other wedding planning apps"
- "How do I plan my wedding?"

## 🔧 How to Make It Even Stricter

### Option 1: Lower Temperature Further
Change `temperature` to `0.1` for maximum focus:
```json
"temperature": 0.1
```

### Option 2: Add System-Level Instructions
Add at the very beginning of the prompt:
```
SYSTEM: You are a WeddingWeb-only assistant. Any question not about 
WeddingWeb must be redirected. You are not allowed to answer 
anything else.
```

### Option 3: Add Examples
Add to the prompt:
```
Examples of FORBIDDEN questions (must redirect):
- "What's a good wedding venue?" → Redirect
- "Recommend a photographer" → Redirect
- "How do I plan my wedding?" → Redirect

Examples of ALLOWED questions (can answer):
- "What does WeddingWeb cost?" → Answer
- "How do I create a website?" → Answer
- "What features are included?" → Answer
```

## 📊 Monitoring

To ensure Gemini stays on topic:

1. **Review email summaries** - Check what messages were sent
2. **Monitor n8n logs** - See full prompts and responses
3. **Test with sample questions** - Try off-topic questions
4. **Adjust if needed** - Lower temperature or strengthen prompt

## 🎯 Current Prompt Highlights

- Uses words like "FORBIDDEN", "MUST", "EXCLUSIVELY"
- Provides exact redirect message to use
- Lists forbidden topics explicitly
- Lower temperature for focused responses
- Shorter max tokens to prevent rambling

---

**The prompt is now configured to be extremely strict about WeddingWeb-only responses!** 🎯

