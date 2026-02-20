/**
 * Email Webhook Route
 * 
 * Handles incoming emails pushed from Google Apps Script.
 */

const express = require('express');
const router = express.Router();
const db = require('../lib/db-gcp'); // Add database import
const AIService = require('../services/ai-service');
const EmailService = require('../services/email-service');

// Simple secret to prevent unauthorized hits to the webhook
const WEBHOOK_SECRET = process.env.JWT_SECRET || 'wedding-web-secret-auto-reply';

/**
 * GET /api/email/test
 * Health check for the email webhook integration
 */
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Email webhook route is active' });
});

/**
 * POST /api/email/auto-reply-webhook
 * Receives: { secret, emailId, messageId, from, subject, body }
 */
router.post('/auto-reply-webhook', async (req, res) => {
    console.log(`[Webhook] 📥 Incoming request to /auto-reply-webhook`);
    console.log(`[Webhook] 📦 Body:`, JSON.stringify(req.body, null, 2));

    const { secret, from, subject, body, messageId } = req.body;

    // 1. Verify Secret
    if (secret !== WEBHOOK_SECRET) {
        console.warn(`[Webhook] ❌ Unauthorized webhook attempt. Expected secret: ${WEBHOOK_SECRET.substring(0, 5)}..., Received: ${secret?.substring(0, 5)}...`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[Webhook] 📩 Verified email from ${from}: ${subject}`);

    try {
        // 2. Parse name and email more robustly
        const name = from.includes('<') ? from.split('<')[0].trim() : from.split('@')[0];
        const email = from.includes('<') ? (from.match(/<(.+)>/)?.[1] || from) : from;

        // 3. Save to Database
        console.log(`[Webhook] 💾 Saving message from ${email} to database...`);
        const insertQuery = `
            INSERT INTO contact_messages (name, email, subject, message, status, email_message_id, created_at)
            VALUES ($1, $2, $3, $4, 'new', $5, NOW())
            ON CONFLICT (email_message_id) 
            DO UPDATE SET created_at = EXCLUDED.created_at
            RETURNING *
        `;

        try {
            const res = await db.query(insertQuery, [name, email, subject, body, messageId || null]);
            console.log(`[Webhook] 💾 INSERT Result:`, res.rowCount > 0 ? 'Success' : 'No rows inserted');
            if (res.rows[0]) console.log(`[Webhook] 🆔 Inserted ID:`, res.rows[0].id);
        } catch (dbErr) {
            if (dbErr.code === '42P01' || dbErr.message.includes('column "subject" does not exist')) {
                // Handle missing table or missing subject column (adding subject column if missing)
                console.log('[Webhook] 🛠️ Updating contact_messages schema...');
                await db.query(`
                    CREATE TABLE IF NOT EXISTS contact_messages (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL,
                        subject TEXT,
                        phone TEXT,
                        event_date TEXT,
                        guest_count INTEGER,
                        message TEXT NOT NULL,
                        status TEXT DEFAULT 'new',
                        response TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                `);
                // Check if subject column exists, if not add it
                try {
                    await db.query('ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS subject TEXT');
                } catch (e) {
                    // Ignore if already exists or other error
                }

                await db.query(insertQuery, [from.split('<')[0].trim() || from, from.match(/<(.+)>/)?.[1] || from, subject, body]);
            } else {
                console.error('[Webhook] ❌ Database error:', dbErr);
            }
        }

        // 3. Generate AI response (with WeddingWeb constraints)
        const aiResult = await AIService.generateSupportResponse({
            from,
            subject,
            body
        });

        // 4. Send the reply
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

        console.log(`[Webhook] ✅ Successfully saved message and sent AI reply to ${from}`);
        res.json({ success: true, replied: true });

    } catch (error) {
        console.error('[Webhook] ❌ Failed to process webhook email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
