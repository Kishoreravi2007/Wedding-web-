const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const db = require('../lib/db-gcp');

class EmailIngestionService {
    constructor() {
        this.config = {
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: process.env.SMTP_USER || 'help.weddingweb@gmail.com',
                pass: process.env.SMTP_PASSWORD
            },
            logger: false
        };
    }

    async syncInbox() {
        const client = new ImapFlow(this.config);
        console.log('📡 [IMAP] Connecting to sync inbox...');

        try {
            await client.connect();
            let lock = await client.getMailboxLock('INBOX');

            try {
                // Fetch last 20 messages (reduced from 50 for speed)
                const count = client.mailbox.exists;
                const startRange = Math.max(1, count - 19);
                const query = `${startRange}:${count}`;

                console.log(`📡 [IMAP] Scanning range ${query} (${count} total)...`);
                const startTime = Date.now();
                let stats = { new: 0, duplicates: 0, errors: 0 };

                for await (let message of client.fetch(query, { source: true, envelope: true })) {
                    try {
                        const parsed = await simpleParser(message.source);
                        const messageId = message.envelope.messageId || parsed.messageId;

                        const msgData = {
                            email_message_id: messageId,
                            name: parsed.from?.value[0]?.name || parsed.from?.value[0]?.address || 'Anonymous Sensor',
                            email: parsed.from?.value[0]?.address,
                            subject: parsed.subject || 'Direct Signal Ingress',
                            message: parsed.text || parsed.html || 'No readable content',
                            created_at: parsed.date || new Date()
                        };

                        // Upsert logic
                        const insertQuery = `
                            INSERT INTO contact_messages (name, email, subject, message, email_message_id, created_at, status)
                            VALUES ($1, $2, $3, $4, $5, $6, 'new')
                            ON CONFLICT (email_message_id) DO NOTHING
                            RETURNING id
                        `;

                        const { rowCount } = await db.query(insertQuery, [
                            msgData.name,
                            msgData.email,
                            msgData.subject,
                            msgData.message,
                            msgData.email_message_id,
                            msgData.created_at
                        ]);

                        if (rowCount > 0) stats.new++;
                        else stats.duplicates++;

                    } catch (msgErr) {
                        console.error('❌ [IMAP] Message Parse Error:', msgErr.message);
                        stats.errors++;
                    }
                }

                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`✅ [IMAP] Sync complete in ${duration}s. New: ${stats.new}, Duplicates: ${stats.duplicates}, Errors: ${stats.errors}`);
                return { success: true, stats };

            } finally {
                lock.release();
            }

        } catch (error) {
            console.error('❌ [IMAP] Sync Failed:', error);
            return { success: false, error: error.message };
        } finally {
            await client.logout();
        }
    }
}

module.exports = new EmailIngestionService();
