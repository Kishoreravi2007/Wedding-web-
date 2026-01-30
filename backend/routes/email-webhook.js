/**
 * Email Webhook Route
 * 
 * Handles incoming emails pushed from Google Apps Script.
 */

const express = require('express');
const router = express.Router();
const AIService = require('../services/ai-service');
const EmailService = require('../services/email-service');

// Simple secret to prevent unauthorized hits to the webhook
const WEBHOOK_SECRET = process.env.JWT_SECRET || 'wedding-web-secret-auto-reply';

/**
 * POST /api/email/auto-reply-webhook
 * Receives: { secret, emailId, messageId, from, subject, body }
 */
router.post('/auto-reply-webhook', async (req, res) => {
    const { secret, from, subject, body } = req.body;

    // 1. Verify Secret
    if (secret !== WEBHOOK_SECRET) {
        console.warn(`[Webhook] ❌ Unauthorized webhook attempt from ${from}`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[Webhook] 📩 Received email from ${from}: ${subject}`);

    try {
        // 2. Generate AI response (with WeddingWeb constraints)
        const aiResult = await AIService.generateSupportResponse({
            from,
            subject,
            body
        });

        // 3. Send the reply
        await EmailService.sendEmail({
            to: from,
            subject: `Re: ${subject}`,
            text: aiResult.text,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                    <p>${aiResult.text.replace(/\n/g, '<br>')}</p>
                    <br>
                    <hr style="border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #888;">
                        This is an automated response from WeddingWeb AI Support. 
                        If you need further assistance, please keep replying to this thread.
                    </p>
                </div>
            `
        });

        console.log(`[Webhook] ✅ Successfully sent AI reply to ${from}`);
        res.json({ success: true, replied: true });

    } catch (error) {
        console.error('[Webhook] ❌ Failed to process webhook email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
