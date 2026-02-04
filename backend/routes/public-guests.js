const express = require('express');
const router = express.Router();
const db = require('../lib/db-gcp');

// Public RSVP endpoint (no auth needed)
router.get('/rsvp/:token/:status', async (req, res) => {
    try {
        const { token, status } = req.params;
        const validStatuses = ['attending', 'declined'];

        if (!validStatuses.includes(status)) {
            return res.status(400).send('Invalid RSVP status');
        }

        // Find guest by token and get wedding details
        const { rows: guestRows } = await db.query(
            `SELECT g.name, g.rsvp_token, w.groom_name, w.bride_name, w.slug 
             FROM guests g 
             JOIN weddings w ON g.user_id = w.user_id 
             WHERE g.rsvp_token = $1`,
            [token]
        );

        if (guestRows.length === 0) {
            return res.status(404).send('Guest invitation not found or link has expired.');
        }

        const guest = guestRows[0];
        const coupleName = `${guest.groom_name} & ${guest.bride_name}`;

        // Update RSVP status
        await db.query(
            'UPDATE guests SET rsvp_status = $1, updated_at = NOW() WHERE rsvp_token = $2',
            [status, token]
        );

        console.log(`✅ RSVP Updated: ${guest.name} marked as ${status}`);

        // Render a beautiful thank you page
        const isAttending = status === 'attending';
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSVP Confirmed - ${coupleName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%);
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 24px;
            padding: 50px 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            font-family: 'Playfair Display', serif;
            color: #1f2937;
            font-size: 28px;
            margin-bottom: 16px;
        }
        .couple-name {
            color: #e11d48;
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            margin-bottom: 24px;
        }
        p {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 50px;
            font-weight: 500;
            margin-top: 20px;
        }
        .attending {
            background: #dcfce7;
            color: #16a34a;
        }
        .declined {
            background: #f3f4f6;
            color: #6b7280;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #f3f4f6;
            font-size: 13px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">${isAttending ? '🎉' : '💌'}</div>
        <h1>${isAttending ? 'Thank You!' : 'Response Received'}</h1>
        <div class="couple-name">${coupleName}</div>
        <p>Dear ${guest.name},</p>
        <p>${isAttending
                ? 'We are so excited that you will be joining us on our special day! We can\'t wait to celebrate with you.'
                : 'Thank you for letting us know. We understand and will miss having you there. You\'ll be in our thoughts!'}</p>
        <div class="status-badge ${status}">${isAttending ? '✓ Confirmed Attending' : '✗ Respectfully Declined'}</div>
        <div class="footer">
            Powered by WeddingWeb.co.in
        </div>
    </div>
</body>
</html>
        `;

        res.send(html);

    } catch (error) {
        console.error('Error processing RSVP:', error);
        res.status(500).send('An error occurred while processing your RSVP. Please try again later.');
    }
});

module.exports = router;
