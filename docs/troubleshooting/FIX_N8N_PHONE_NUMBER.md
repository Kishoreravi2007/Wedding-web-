# 🔧 Fix: n8n Phone Number Undefined Error

## Problem
The "Make Phone Call" node shows `undefined` for the phone number because the "Set Variables" node is trying to access `$json.body.phoneNumber`, but the data structure might be different.

## Solution: Check and Fix the Data Structure

### Step 1: Check What Data the Webhook Receives

1. **In n8n, click on the "Webhook" node**
2. **Click "Execute Node"** to test it
3. **Look at the OUTPUT panel** - you'll see the actual data structure

The data might be in one of these formats:
- `$json.body.phoneNumber` (if wrapped in `body`)
- `$json.phoneNumber` (if direct)
- `$json.query.phoneNumber` (if sent as query params)

### Step 2: Fix the "Set Variables" Node

Based on what you see in the Webhook output, update the "Set Variables" node:

#### Option A: If data is directly in `$json` (most common)

In the "Set Variables" node, change all references from:
- `{{ $json.body.phoneNumber }}` → `{{ $json.phoneNumber }}`
- `{{ $json.body.callId }}` → `{{ $json.callId }}`
- `{{ $json.body.name }}` → `{{ $json.name }}`
- `{{ $json.body.email }}` → `{{ $json.email }}`
- `{{ $json.body.reason }}` → `{{ $json.reason }}`

#### Option B: If data is in `$json.body` (current setup)

Keep it as is, but make sure the backend is sending the data correctly.

### Step 3: Verify Backend is Sending Correct Data

The backend sends this payload:
```json
{
  "callId": "...",
  "phoneNumber": "+91...",
  "name": "...",
  "email": "...",
  "reason": "...",
  "messageId": "...",
  "feedbackId": "..."
}
```

### Step 4: Quick Fix - Test with Direct Access

**Temporary fix to test:**

1. **In the "Set Variables" node**, try both formats:
   - First try: `{{ $json.phoneNumber }}`
   - If that's undefined, try: `{{ $json.body.phoneNumber }}`

2. **Or use a fallback expression:**
   ```
   {{ $json.phoneNumber || $json.body?.phoneNumber || $json.query?.phoneNumber }}
   ```

### Step 5: Debug the Actual Data Structure

1. **Add a "Code" node** between "Webhook" and "Set Variables"
2. **Add this code to see the structure:**
   ```javascript
   // Log the entire input to see structure
   console.log('Full JSON:', JSON.stringify($input.all()[0].json, null, 2));
   
   // Try to access phone number in different ways
   const data = $input.all()[0].json;
   console.log('Direct phoneNumber:', data.phoneNumber);
   console.log('Body phoneNumber:', data.body?.phoneNumber);
   console.log('Query phoneNumber:', data.query?.phoneNumber);
   
   // Return the data as-is for now
   return data;
   ```

3. **Execute this node** and check the OUTPUT to see the actual structure

### Step 6: Update "Set Variables" Based on Actual Structure

Once you know the structure, update "Set Variables" accordingly.

## Most Likely Fix

Based on n8n's default behavior, **try changing the "Set Variables" node to use direct access:**

1. **Click on "Set Variables" node**
2. **For each assignment, change:**
   - `{{ $json.body.phoneNumber }}` → `{{ $json.phoneNumber }}`
   - `{{ $json.body.callId }}` → `{{ $json.callId }}`
   - `{{ $json.body.name }}` → `{{ $json.name }}`
   - `{{ $json.body.email }}` → `{{ $json.email }}`
   - `{{ $json.body.reason }}` → `{{ $json.reason }}`

3. **Click "Execute Node"** to test
4. **Check the OUTPUT** - you should now see the phone number value instead of `undefined`

## Alternative: Use Expression with Fallback

If you're not sure, use this expression in the "To" field of "Make Phone Call" node:

```
{{ $json.phoneNumber || $json.body?.phoneNumber || $json.query?.phoneNumber || 'ERROR_NO_PHONE' }}
```

This will try multiple paths and show an error if none work.

## Verify the Fix

After updating:
1. **Click "Execute Node"** on "Set Variables"
2. **Check OUTPUT** - should show actual values, not `undefined`
3. **Click "Execute Node"** on "Make Phone Call"
4. **Should now have a valid phone number** in the "To" field

## Still Not Working?

If it's still undefined:
1. **Check the Webhook node OUTPUT** - what does the actual data look like?
2. **Check backend logs** - is the data being sent correctly?
3. **Check n8n execution logs** - click on the failed execution to see details

