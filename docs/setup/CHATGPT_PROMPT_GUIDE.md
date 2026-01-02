# 🎯 ChatGPT Prompt Configuration for WeddingWeb

## Current Configuration

The ChatGPT system prompt is configured to **ONLY** respond to WeddingWeb-related questions.

## Key Restrictions

1. ✅ **ONLY answers about WeddingWeb** services
2. ❌ **Refuses to answer** questions about other topics
3. 🔄 **Redirects** unrelated questions back to WeddingWeb

## System Prompt (Current)

```
You are a customer service representative EXCLUSIVELY for WeddingWeb, 
a wedding website platform. Your ONLY purpose is to help customers with 
WeddingWeb services.

STRICT RULES:
1. ONLY answer questions about WeddingWeb services, features, pricing, 
   and wedding websites
2. DO NOT answer questions about other topics (general wedding planning, 
   other companies, unrelated topics)
3. If asked about something unrelated to WeddingWeb, politely redirect: 
   "I'm here to help you with WeddingWeb services. How can I assist you 
   with your wedding website today?"
4. Keep responses focused on WeddingWeb's offerings:
   - Wedding website creation
   - Guest management
   - RSVP features
   - Photo galleries
   - Event scheduling
   - Pricing plans
   - Demo calls
   - Technical support
```

## How to Update the Prompt

### In n8n:

1. **Open your workflow** in n8n
2. **Click on "Generate Message with ChatGPT" node**
3. **Edit the "Messages" section**
4. **Modify the "system" role message** with your custom prompt
5. **Save and test**

### Example Customizations

#### More Strict Version:
```
You are WeddingWeb's customer service bot. You MUST ONLY discuss 
WeddingWeb services. If asked about anything else, respond: 
"I can only help with WeddingWeb wedding website services. 
What would you like to know about WeddingWeb?"
```

#### More Friendly Version:
```
You are a helpful WeddingWeb representative. While you specialize 
in WeddingWeb services, you can briefly acknowledge other questions 
but always guide the conversation back to how WeddingWeb can help 
with their wedding website needs.
```

## Testing the Restrictions

### ✅ Should Answer:
- "What features does WeddingWeb offer?"
- "How much does WeddingWeb cost?"
- "Can I see a demo of WeddingWeb?"
- "How do I create a wedding website?"

### ❌ Should Redirect:
- "What's the best wedding venue in my city?"
- "Can you recommend a photographer?"
- "What should I serve at my wedding?"
- "Tell me about other wedding planning apps"

## Adjusting Strictness

### More Strict (Current):
- Temperature: `0.7`
- Max Tokens: `500`
- System prompt emphasizes exclusivity

### Less Strict:
- Temperature: `0.8-0.9` (more creative)
- Max Tokens: `300` (shorter responses)
- System prompt allows brief off-topic acknowledgment

## Monitoring Responses

1. **Check email summaries** - Review what ChatGPT sent
2. **Monitor n8n logs** - See full conversation
3. **Customer feedback** - Ask if responses were relevant
4. **Adjust prompt** - Fine-tune based on results

## Best Practices

1. **Be specific** in system prompt about what to discuss
2. **Use examples** of allowed/not allowed topics
3. **Test regularly** with sample questions
4. **Monitor costs** - Longer prompts = more tokens = higher cost
5. **Iterate** - Adjust based on real customer interactions

---

**The current configuration ensures ChatGPT ONLY discusses WeddingWeb services!** 🎯

