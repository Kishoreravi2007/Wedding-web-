const db = require('../lib/db-gcp');
const AIService = require('../services/ai-service');
const EmailService = require('../services/email-service');
const EmailIngestionService = require('../services/email-ingestion-service');
const { authMiddleware, superAdminOnly } = require('../lib/secure-auth');

// Sync Inbox via IMAP
router.post('/sync', authMiddleware, superAdminOnly, async (req, res) => {
    console.log('🔄 [Email Hub] Sync requested by admin');
    const result = await EmailIngestionService.syncInbox();
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

/**
 * GET /api/email/inbox
 * Fetches messages that arrived via support email (indicated by having a subject)
 */
router.get('/inbox', authMiddleware, superAdminOnly, async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Failed to fetch inbox:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * POST /api/email/enhance-reply
 * Uses Gemini to polish a rough reply draft
 */
router.post('/enhance-reply', authMiddleware, superAdminOnly, async (req, res) => {
    const { messageId, draftReply } = req.body;

    if (!messageId || !draftReply) {
        return res.status(400).json({ error: 'Message ID and draft are required' });
    }

    try {
        // Fetch original message for context
        const { rows } = await db.query('SELECT message FROM contact_messages WHERE id = $1', [messageId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Original message not found' });

        const originalMessage = rows[0].message;
        const result = await AIService.enhanceReplyDraft({ originalMessage, draftReply });

        res.json(result);
    } catch (error) {
        console.error('Gemini Enhancement Error:', error);
        res.status(500).json({ error: 'AI enhancement failed' });
    }
});

/**
 * POST /api/email/send-reply
 * Sends the email and marks the thread as replied
 */
router.post('/send-reply', authMiddleware, superAdminOnly, async (req, res) => {
    const { messageId, replyText } = req.body;

    if (!messageId || !replyText) {
        return res.status(400).json({ error: 'Message ID and reply text are required' });
    }

    try {
        // Fetch message details
        const { rows } = await db.query('SELECT * FROM contact_messages WHERE id = $1', [messageId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Message not found' });

        const msg = rows[0];

        // Send Email
        const emailResult = await EmailService.sendEmail({
            to: msg.email,
            subject: `Re: ${msg.subject || 'WeddingWeb Inquiry'}`,
            text: replyText,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                    <p>${replyText.replace(/\n/g, '<br>')}</p>
                    <br>
                    <hr style="border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 11px; color: #888;">
                        Replied by WeddingWeb Support Hub.
                    </p>
                </div>
            `
        });

        if (emailResult.success) {
            // Update database
            await db.query(`
                UPDATE contact_messages 
                SET status = 'replied', response = $1, updated_at = NOW() 
                WHERE id = $2
            `, [replyText, messageId]);

            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Email delivery failed', details: emailResult.error });
        }
    } catch (error) {
        console.error('Send Reply Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /api/email/:id
 * Delete a message from the inbox
 */
router.delete('/:id', authMiddleware, superAdminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;
