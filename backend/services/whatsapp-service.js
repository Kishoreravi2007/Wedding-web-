const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

/**
 * WhatsApp Service (Option 2: WhatsApp Web Automation)
 * Sends messages directly from a personal WhatsApp account.
 */

let client;
let isReady = false;

// Initialize the WhatsApp Client
const initializeClient = () => {
    console.log('🚀 Initializing WhatsApp Web Client...');

    client = new Client({
        authStrategy: new LocalAuth({
            dataPath: path.join(__dirname, '../.wwebjs_auth')
        }),
        puppeteer: {
            headless: true,
            executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('📸 SCAN THIS QR CODE WITH YOUR WHATSAPP APP:');
        qrcode.generate(qr, { small: true });

        // Also save to a file just in case terminal output is messy
        const qrPath = path.join(__dirname, '../whatsapp-qr.txt');
        fs.writeFileSync(qrPath, qr);
        console.log(`💡 QR code string also saved to: ${qrPath}`);
    });

    client.on('ready', () => {
        console.log('✅ WhatsApp Web Client is READY!');
        isReady = true;
    });

    client.on('authenticated', () => {
        console.log('🔐 WhatsApp Authenticated successfully');
    });

    client.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp Authentication failure:', msg);
    });

    client.on('disconnected', (reason) => {
        console.log('🔌 WhatsApp Client was disconnected:', reason);
        isReady = false;
        // Try to re-initialize
        setTimeout(initializeClient, 5000);
    });

    client.initialize().catch(err => {
        console.error('❌ Failed to initialize WhatsApp client:', err);
    });
};

// Start initialization
// initializeClient();

/**
 * Send a wedding invitation via WhatsApp Web
 * @param {Object} guest - Guest object (name, phone, rsvp_token)
 * @param {Object} wedding - Wedding object (couple_name, wedding_date, venue, slug)
 */
const sendInvitation = async (guest, wedding) => {
    if (!isReady) {
        console.warn('⚠️ WhatsApp service is not ready yet. Please scan the QR code.');
        return { success: false, error: 'WhatsApp service not ready' };
    }

    if (!guest.phone) {
        return { success: false, error: 'Phone number missing' };
    }

    // Format phone number: remove any non-digits and add country code if missing
    let chatId = guest.phone.replace(/\D/g, '');
    if (!chatId.startsWith('91') && chatId.length === 10) {
        chatId = '91' + chatId;
    }
    chatId += '@c.us';

    const rsvpBaseUrl = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/public/guests/rsvp/${guest.rsvp_token}`;
    const weddingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/weddings/${wedding.slug || 'details'}`;

    const formattedDate = wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'TBA';

    const message = `*Wedding Invitation* 💍\n\nDear ${guest.name},\n\nYou are cordially invited to celebrate the wedding of *${wedding.couple_name}*!\n\n📅 *Date:* ${formattedDate}\n📍 *Venue:* ${wedding.venue || 'Our Wedding Venue'}\n\nWe would love to have you with us. Please let us know if you can make it:\n\n✅ *Yes, I'll be there:* ${rsvpBaseUrl}/attending\n❌ *Respectfully Decline:* ${rsvpBaseUrl}/declined\n\nView our wedding website for more details:\n🔗 ${weddingUrl}\n\nSee you there!\n_Sent via WeddingWeb_`;

    try {
        console.log(`💬 Sending WhatsApp invitation to ${guest.name} (${chatId})...`);

        // Load the logo
        const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
        if (fs.existsSync(logoPath)) {
            const media = MessageMedia.fromFilePath(logoPath);
            await client.sendMessage(chatId, media, { caption: message });
        } else {
            await client.sendMessage(chatId, message);
        }

        console.log(`✅ Message sent to ${guest.name}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Failed to send WhatsApp to ${guest.name}:`, error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendInvitation
};
