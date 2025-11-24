const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../lib/supabase');
const { sendCallSummaryEmail } = require('../lib/email');

/**
 * N8N Integration Routes
 * 
 * These endpoints are designed to work with n8n workflows for:
 * - Triggering automated calls to users
 * - Receiving call summaries from n8n
 * - Managing call records
 */

// Store call records (in-memory for now, will use database)
const callRecords = new Map();

/**
 * Save call record to database
 */
async function saveCallRecord(callRecord) {
  try {
    // Check if table exists by trying to query it
    const { error: checkError } = await supabase
      .from('call_records')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist - use in-memory storage
      console.log('⚠️ call_records table not found - using in-memory storage');
      console.log('   Run the migration: backend/migrations/create_call_records_table.sql');
      callRecords.set(callRecord.id, callRecord);
      return null;
    }

    const { data, error } = await supabase
      .from('call_records')
      .insert([{
        call_id: callRecord.id,
        phone_number: callRecord.phoneNumber,
        name: callRecord.name,
        email: callRecord.email,
        message_id: callRecord.messageId,
        feedback_id: callRecord.feedbackId,
        reason: callRecord.reason,
        status: callRecord.status,
        summary: callRecord.summary,
        transcript: callRecord.transcript,
        duration: callRecord.duration,
        resolution: callRecord.resolution,
        created_at: callRecord.createdAt,
        completed_at: callRecord.completedAt,
      }])
      .select()
      .single();

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving call record to database:', error);
    // Fallback to in-memory storage
    callRecords.set(callRecord.id, callRecord);
    return null;
  }
}

/**
 * Update call record in database
 */
async function updateCallRecord(callId, updates) {
  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('call_records')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist - update in-memory storage
      const callRecord = callRecords.get(callId);
      if (callRecord) {
        Object.assign(callRecord, updates);
        callRecords.set(callId, callRecord);
      }
      return null;
    }

    const { data, error } = await supabase
      .from('call_records')
      .update({
        status: updates.status,
        summary: updates.summary,
        transcript: updates.transcript,
        duration: updates.duration,
        resolution: updates.resolution,
        completed_at: updates.completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('call_id', callId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating call record in database:', error);
    // Fallback to in-memory storage
    const callRecord = callRecords.get(callId);
    if (callRecord) {
      Object.assign(callRecord, updates);
      callRecords.set(callId, callRecord);
    }
    return null;
  }
}

/**
 * POST /api/n8n/trigger-whatsapp
 * Trigger a WhatsApp message through n8n workflow with ChatGPT
 * This endpoint is called by your application to send a WhatsApp message
 */
router.post('/trigger-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, name, email, messageId, feedbackId, reason } = req.body;

    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Create message record
    const messageRecordId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageRecord = {
      id: messageRecordId,
      phoneNumber,
      name: name || 'Unknown',
      email: email || null,
      messageId: messageId || null,
      feedbackId: feedbackId || null,
      reason: reason || 'General inquiry',
      status: 'pending',
      createdAt: new Date().toISOString(),
      message: null,
      summary: null,
    };

    callRecords.set(messageRecordId, messageRecord);

    // Save to database (reusing call_records table structure)
    await saveCallRecord({
      ...messageRecord,
      callId: messageRecordId,
      duration: null,
    });

    // Return webhook URL for n8n to call
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/trigger-whatsapp';
    
    // Prepare data to send to n8n
    const n8nPayload = {
      messageId: messageRecordId,
      phoneNumber,
      name: messageRecord.name,
      email: messageRecord.email,
      reason: messageRecord.reason,
      messageId: messageId,
      feedbackId: feedbackId,
    };

    // Send webhook to n8n (if configured)
    let n8nResponse = null;
    if (process.env.N8N_WEBHOOK_URL && process.env.N8N_WEBHOOK_URL !== 'https://your-n8n-instance.com/webhook/trigger-whatsapp') {
      try {
        console.log('💬 Sending WhatsApp trigger to n8n:', webhookUrl);
        n8nResponse = await axios.post(webhookUrl, n8nPayload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout (ChatGPT may take longer)
        });
        console.log('✅ N8N webhook called successfully');
      } catch (error) {
        console.error('⚠️ Failed to call n8n webhook:', error.message);
        // Don't fail the request if n8n is unavailable
      }
    } else {
      console.log('💬 WhatsApp message triggered (n8n webhook not configured):', {
        messageId: messageRecordId,
        phoneNumber,
        name: messageRecord.name,
        reason: messageRecord.reason,
      });
      console.log('💡 To enable n8n integration, set N8N_WEBHOOK_URL in your .env file');
    }

    res.json({
      success: true,
      message: 'WhatsApp message triggered successfully',
      messageId: messageRecordId,
      webhookUrl: process.env.N8N_WEBHOOK_URL || 'Not configured',
      payload: n8nPayload,
      n8nResponse: n8nResponse?.data || null,
    });
  } catch (error) {
    console.error('Error triggering WhatsApp message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/n8n/trigger-call (DEPRECATED - kept for backward compatibility)
 * Use /api/n8n/trigger-whatsapp instead
 */
router.post('/trigger-call', async (req, res) => {
  // Redirect to WhatsApp endpoint
  req.url = '/trigger-whatsapp';
  return router.handle(req, res);
});

/**
 * POST /api/n8n/whatsapp-summary
 * Receive WhatsApp message summary from n8n workflow
 * This endpoint is called by n8n after the message is sent
 */
router.post('/whatsapp-summary', async (req, res) => {
  try {
    const { messageId, phoneNumber, name, email, message, summary, status } = req.body;

    if (!messageId || !summary) {
      return res.status(400).json({
        success: false,
        error: 'Message ID and summary are required'
      });
    }

    // Update message record
    const messageRecord = callRecords.get(messageId);
    const updates = {
      status: status || 'sent',
      summary: summary,
      message: message || null,
      completedAt: new Date().toISOString(),
    };

    if (messageRecord) {
      Object.assign(messageRecord, updates);
      callRecords.set(messageId, messageRecord);
    }

    // Update in database
    await updateCallRecord(messageId, {
      ...updates,
      status: updates.status,
      summary: updates.summary,
      transcript: updates.message,
    });

    // Send email summary to admin
    try {
      const emailResult = await sendCallSummaryEmail({
        ...messageRecord,
        summary,
        transcript: message,
        duration: null,
        status,
        resolution: 'WhatsApp message sent successfully',
      });
      
      if (emailResult.success) {
        console.log('✅ WhatsApp summary email sent successfully');
      } else {
        console.warn('⚠️ Failed to send WhatsApp summary email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending WhatsApp summary email:', emailError);
      // Don't fail the request if email fails
    }

    console.log('✅ WhatsApp summary received:', {
      messageId,
      phoneNumber,
      status,
    });

    res.json({
      success: true,
      message: 'WhatsApp summary received and processed',
      messageId,
    });
  } catch (error) {
    console.error('Error processing WhatsApp summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/n8n/call-summary (DEPRECATED - kept for backward compatibility)
 * Use /api/n8n/whatsapp-summary instead
 */
router.post('/call-summary', async (req, res) => {
  try {
    const { callId, phoneNumber, duration, summary, transcript, status, resolution } = req.body;

    if (!callId || !summary) {
      return res.status(400).json({
        success: false,
        error: 'Call ID and summary are required'
      });
    }

    // Update call record
    const callRecord = callRecords.get(callId);
    const updates = {
      status: status || 'completed',
      summary: summary,
      transcript: transcript || null,
      duration: duration || null,
      resolution: resolution || null,
      completedAt: new Date().toISOString(),
    };

    if (callRecord) {
      Object.assign(callRecord, updates);
      callRecords.set(callId, callRecord);
    }

    // Update in database
    await updateCallRecord(callId, updates);

    // Send email summary to admin
    try {
      const emailResult = await sendCallSummaryEmail({
        ...callRecord,
        summary,
        transcript,
        duration,
        status,
        resolution,
      });
      
      if (emailResult.success) {
        console.log('✅ Call summary email sent successfully');
      } else {
        console.warn('⚠️ Failed to send call summary email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending call summary email:', emailError);
      // Don't fail the request if email fails
    }

    console.log('✅ Call summary received:', {
      callId,
      phoneNumber,
      duration,
      status,
    });

    res.json({
      success: true,
      message: 'Call summary received and processed',
      callId,
    });
  } catch (error) {
    console.error('Error processing call summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/n8n/call-status/:callId
 * Get status of a call
 */
router.get('/call-status/:callId', (req, res) => {
  try {
    const { callId } = req.params;
    const callRecord = callRecords.get(callId);

    if (!callRecord) {
      return res.status(404).json({
        success: false,
        error: 'Call record not found'
      });
    }

    res.json({
      success: true,
      call: callRecord,
    });
  } catch (error) {
    console.error('Error fetching call status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/n8n/calls
 * Get all call records
 */
router.get('/calls', (req, res) => {
  try {
    const calls = Array.from(callRecords.values());
    res.json({
      success: true,
      calls,
      total: calls.length,
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/n8n/call-handler
 * Handles incoming calls from Twilio
 * Returns TwiML to control the call
 * This endpoint is called by Twilio when the customer answers
 */
router.post('/call-handler', async (req, res) => {
  try {
    const { From, To, CallSid } = req.body;
    
    console.log('📞 Incoming call from Twilio:', { From, To, CallSid });
    
    // Generate TwiML response
    // This is a simple example - you can customize this based on your needs
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Hello, this is an automated call from the wedding website. 
    How can I help you today?
  </Say>
  <Gather input="speech" timeout="10" action="/api/n8n/call-process" method="POST" speechTimeout="auto">
    <Say>Please speak your question or concern.</Say>
  </Gather>
  <Say>Thank you for calling. We will get back to you soon. Goodbye.</Say>
  <Hangup/>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling call:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, there was an error processing your call. Please try again later.</Say>
  <Hangup/>
</Response>`;
    res.type('text/xml');
    res.send(errorTwiml);
  }
});

/**
 * POST /api/n8n/call-process
 * Processes speech input from the call
 * This is called after the customer speaks
 */
router.post('/call-process', async (req, res) => {
  try {
    const { From, To, CallSid, SpeechResult } = req.body;
    
    console.log('🗣️ Call speech received:', { From, SpeechResult });
    
    // In a real implementation, you would:
    // 1. Process the speech with AI (OpenAI, etc.)
    // 2. Generate a response
    // 3. Continue the conversation
    
    // For now, we'll provide a simple response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Thank you for your message. We have noted your inquiry and will get back to you shortly. 
    Is there anything else I can help you with?
  </Say>
  <Gather input="speech" timeout="5" action="/api/n8n/call-end" method="POST" speechTimeout="auto">
    <Say>Please say yes or no.</Say>
  </Gather>
  <Say>Thank you for calling. Have a great day!</Say>
  <Hangup/>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error processing call speech:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`;
    res.type('text/xml');
    res.send(errorTwiml);
  }
});

/**
 * POST /api/n8n/call-end
 * Handles the end of the call
 */
router.post('/call-end', async (req, res) => {
  try {
    const { From, To, CallSid, SpeechResult } = req.body;
    
    console.log('📞 Call ending:', { From, CallSid });
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling. Have a wonderful day!</Say>
  <Hangup/>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error ending call:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
    res.type('text/xml');
    res.send(errorTwiml);
  }
});

/**
 * POST /api/n8n/webhook
 * Generic webhook endpoint for n8n to call
 * This can be used for various n8n workflow callbacks
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log('📥 N8N Webhook received:', { event, data });

    // Handle different webhook events
    switch (event) {
      case 'call_completed':
        // Handle call completion
        return res.json({ success: true, message: 'Call completion processed' });
      
      case 'call_failed':
        // Handle call failure
        return res.json({ success: true, message: 'Call failure processed' });
      
      default:
        return res.json({ success: true, message: 'Webhook received' });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

