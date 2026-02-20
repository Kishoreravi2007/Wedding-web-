const express = require('express');
const router = express.Router();
const { query } = require('../lib/db-gcp');
const { sendEmail } = require('../lib/email');
const {
  FEATURE_CATALOG,
  calculatePremiumTotal,
  getDurationPayload
} = require('../lib/premium-pricing');
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
  PREMIUM_PAYMENT_CURRENCY
} = require('../lib/razorpay-client');
const { authMiddleware } = require('../lib/secure-auth');
const authenticateToken = authMiddleware.verifyToken;

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://weddingweb.co.in').replace(/\/$/, '');
const DEFAULT_THEME = process.env.PREMIUM_DEFAULT_THEME || 'modern-classic';
const PREMIUM_UPI_ID = process.env.RAZORPAY_UPI_ID || null;

/**
 * Add months to a Date object while avoiding DST/month rollover glitches
 */
const addMonths = (date, months) => {
  const result = new Date(date);
  const day = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() !== day) {
    result.setDate(0);
  }
  return result;
};

/**
 * Ensure required tables exist
 */
const ensureTables = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS payment_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      duration INTEGER NOT NULL DEFAULT 1,
      features TEXT[] DEFAULT '{}',
      status VARCHAR(20) DEFAULT 'pending',
      payment_gateway VARCHAR(50),
      payment_gateway_response JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS premium_memberships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      features TEXT[] DEFAULT '{}',
      duration INTEGER NOT NULL DEFAULT 1,
      start_date TIMESTAMPTZ NOT NULL,
      expiry_date TIMESTAMPTZ NOT NULL,
      payment_id UUID,
      status VARCHAR(20) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};

// Run table check on load
ensureTables().catch(err => console.warn('Premium tables check warning:', err.message));

/**
 * Surface available feature/duration combos for front-end pricing logic
 */
router.get('/options', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      features: FEATURE_CATALOG,
      durations: getDurationPayload(),
      razorpay: {
        keyId: getRazorpayKeyId(),
        currency: PREMIUM_PAYMENT_CURRENCY,
        upiId: PREMIUM_UPI_ID
      }
    });
  } catch (error) {
    console.error('Error fetching premium options:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/premium/checkout
 * Store the desired features/duration + computed total before payment
 */
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Invalid user session' });
    }

    const { features, duration } = req.body;
    console.log('🔍 Checkout Request Body:', JSON.stringify(req.body));

    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({ success: false, error: 'Select at least one feature before checkout' });
    }

    const pricing = calculatePremiumTotal({ features, duration });
    console.log('🔍 Calculated Pricing:', JSON.stringify(pricing));

    const { rows } = await query(
      `INSERT INTO payment_history (user_id, amount, duration, features, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [userId, pricing.total, pricing.duration, pricing.features]
    );

    const data = rows[0];

    const razorpayOrder = await createRazorpayOrder({
      amount: pricing.total,
      receipt: data.id,
      notes: {
        user_id: userId,
        features: pricing.features.join(','),
        duration: `${pricing.duration} months`
      }
    });

    const gatewayName = 'razorpay';
    const gatewayResponse = {
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status
    };

    await query(
      `UPDATE payment_history SET payment_gateway = $1, payment_gateway_response = $2 WHERE id = $3`,
      [gatewayName, JSON.stringify(gatewayResponse), data.id]
    );

    res.json({
      success: true,
      checkoutId: data.id,
      amount: pricing.total,
      base: pricing.base,
      multiplier: pricing.multiplier,
      currency: PREMIUM_PAYMENT_CURRENCY,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status
      },
      razorpayKeyId: getRazorpayKeyId(),
      features: pricing.features,
      message: 'Checkout saved. Complete the payment to activate your premium membership.'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unable to start checkout.'
    });
  }
});

/**
 * POST /api/premium/activate
 * Activate premium access once a payment is verified
 */
router.post('/activate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { paymentId, transactionReference, startDate, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!userId || !paymentId) {
      return res.status(400).json({ success: false, error: 'paymentId is required' });
    }

    const { rows: paymentRows } = await query(
      'SELECT * FROM payment_history WHERE id = $1',
      [paymentId]
    );

    if (paymentRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    const payment = paymentRows[0];

    if (payment.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Payment does not belong to the current user' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Payment already activated' });
    }

    const isRazorpayPayment = Boolean(razorpay_signature && razorpay_payment_id && razorpay_order_id);

    if (isRazorpayPayment) {
      const signatureValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature
      });

      if (!signatureValid) {
        return res.status(400).json({ success: false, error: 'Invalid Razorpay signature' });
      }
    }

    const start = startDate ? new Date(startDate) : new Date();
    const expiry = addMonths(start, payment.duration);

    const gatewayResponse = {
      ...(payment.payment_gateway_response || {}),
      transactionReference: transactionReference || null,
      razorpay_payment_id: razorpay_payment_id || null,
      razorpay_order_id: razorpay_order_id || null,
      razorpay_signature: razorpay_signature || null,
      activatedAt: new Date().toISOString()
    };

    const gatewayName = isRazorpayPayment ? 'razorpay' : (transactionReference ? 'manual' : (payment.payment_gateway || 'offline'));

    await query(
      `UPDATE payment_history SET status = 'completed', payment_gateway = $1, payment_gateway_response = $2, updated_at = NOW() WHERE id = $3`,
      [gatewayName, JSON.stringify(gatewayResponse), paymentId]
    );

    const { rows: membershipRows } = await query(
      `INSERT INTO premium_memberships (user_id, features, duration, start_date, expiry_date, payment_id, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
       RETURNING *`,
      [userId, payment.features, payment.duration, start.toISOString(), expiry.toISOString(), payment.id, transactionReference ? `Transaction ${transactionReference}` : null]
    );

    const membership = membershipRows[0];

    // Update user's premium status
    await query(
      `UPDATE users SET has_premium_access = true WHERE id = $1`,
      [userId]
    );

    // Get user info for email (username is used as email)
    const { rows: userRows } = await query('SELECT username FROM users WHERE id = $1', [userId]);
    const userRecord = userRows[0];

    // Try to get the user's display name from the profiles table
    let displayName = userRecord?.username?.split('@')[0] || 'Customer';
    try {
      const { rows: profileRows } = await query(
        "SELECT display_name, full_name FROM profiles WHERE user_id = $1::text LIMIT 1",
        [userId]
      );
      if (profileRows[0]?.display_name) displayName = profileRows[0].display_name;
      else if (profileRows[0]?.full_name) displayName = profileRows[0].full_name;
    } catch (e) { /* profiles table may not have these cols, ignore */ }

    const txnId = razorpay_payment_id || transactionReference || payment.id;
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://weddingweb.in';

    // Check if username looks like an email
    if (userRecord?.username && userRecord.username.includes('@')) {
      try {
        const invoiceNumber = `WW-${payment.id.substring(0, 8).toUpperCase()}`;
        const invoiceDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

        // Build feature rows from payment.features using the catalog
        const featureRows = (payment.features || []).map(featureKey => {
          const catalogEntry = FEATURE_CATALOG.find(f => f.key === featureKey);
          return {
            name: catalogEntry ? catalogEntry.label : featureKey,
            price: catalogEntry ? catalogEntry.price : 0
          };
        });

        const featureRowsHtml = featureRows.map(f => `
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #334155; font-size: 14px;">
              ${f.name}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #334155; font-size: 14px; text-align: right;">
              ₹${f.price.toLocaleString('en-IN')}
            </td>
          </tr>
        `).join('');

        const featureListText = featureRows.map(f => `  • ${f.name} — ₹${f.price}`).join('\n');

        const htmlInvoice = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #e11d48 0%, #9333ea 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">WeddingWeb</h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Premium Membership Invoice</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

      <p style="color: #475569; font-size: 15px; margin: 0 0 24px;">
        Hi <strong>${displayName}</strong>, thank you for your purchase! Here is your invoice:
      </p>

      <!-- Invoice Meta -->
      <table style="width: 100%; margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 10px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px;">
            <p style="margin: 0 0 4px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Invoice No.</p>
            <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">${invoiceNumber}</p>
          </td>
          <td style="padding: 8px 12px;">
            <p style="margin: 0 0 4px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
            <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">${invoiceDate}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 12px;">
            <p style="margin: 0 0 4px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Transaction ID</p>
            <p style="margin: 0; color: #1e293b; font-size: 13px; font-weight: 600; font-family: monospace;">${txnId}</p>
          </td>
          <td style="padding: 8px 12px;">
            <p style="margin: 0 0 4px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
            <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">${payment.duration} Month(s)</p>
          </td>
        </tr>
      </table>

      <!-- Features Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 12px 16px; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Feature</th>
            <th style="padding: 12px 16px; text-align: right; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Base Price</th>
          </tr>
        </thead>
        <tbody>
          ${featureRowsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #64748b; font-size: 14px;">Duration Multiplier</span>
          <span style="color: #334155; font-size: 14px; font-weight: 500;">× ${payment.duration} month(s)</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 16px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 10px; margin-top: 12px;">
          <span style="color: #92400e; font-size: 16px; font-weight: 700;">Total Paid</span>
          <span style="color: #92400e; font-size: 20px; font-weight: 800;">₹${Number(payment.amount).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Membership Details -->
      <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 10px; border-left: 4px solid #22c55e;">
        <p style="margin: 0 0 8px; color: #166534; font-size: 14px; font-weight: 600;">✅ Membership Active</p>
        <p style="margin: 0; color: #15803d; font-size: 13px;">
          <strong>Start:</strong> ${start.toDateString()}<br>
          <strong>Expires:</strong> ${expiry.toDateString()}
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${FRONTEND_URL}/client"
           style="display: inline-block; background: linear-gradient(135deg, #e11d48, #9333ea); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
          Go to Premium Dashboard →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0 0 4px;">WeddingWeb — Build your dream wedding experience</p>
      <p style="margin: 0;">This is an automated invoice. Please keep it for your records.</p>
    </div>

  </div>
</body>
</html>
        `;

        const textInvoice = `
INVOICE — WeddingWeb Premium Membership
========================================
Invoice No: ${invoiceNumber}
Date: ${invoiceDate}
Transaction ID: ${txnId}
Duration: ${payment.duration} Month(s)

Features Purchased:
${featureListText}

Total Paid: ₹${payment.amount}

Membership Active:
  Start: ${start.toDateString()}
  Expires: ${expiry.toDateString()}

Access your dashboard: ${FRONTEND_URL}/client

Thanks for building with WeddingWeb!
        `.trim();

        await sendEmail({
          to: userRecord.username,
          subject: `WeddingWeb Invoice ${invoiceNumber} — Premium Membership Activated`,
          text: textInvoice,
          html: htmlInvoice
        });
        console.log(`📧 Invoice email sent to ${userRecord.username}`);
      } catch (emailError) {
        console.warn('Premium invoice email failed (non-blocking):', emailError);
      }
    }

    res.json({
      success: true,
      membership,
      message: 'Premium membership activated successfully.'
    });
  } catch (error) {
    console.error('Activation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Activation failed' });
  }
});

/**
 * GET /api/premium/status
 * Return membership status for gating the dashboard
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { rows: membershipRows } = await query(
      `SELECT * FROM premium_memberships WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    res.json({
      success: true,
      membership: membershipRows[0] || null
    });
  } catch (error) {
    console.error('Premium status error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unable to fetch premium status' });
  }
});

/**
 * GET /api/premium/purchases
 * List all purchases (Admin only)
 */
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    // Basic admin check (could be more robust)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Admin only.' });
    }

    const { rows } = await query(`
      SELECT p.*, u.username as customer_email, u.wedding_id 
      FROM payment_history p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      purchases: rows
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/premium/generate-admin-credentials
 * Restricted tool for kishore only to generate a temporary admin
 */
router.post('/generate-admin-credentials', authenticateToken, async (req, res) => {
  try {
    // STRICT SUPER ADMIN ONLY CHECK
    if (req.user.email !== 'kishorekailas1@gmail.com') {
      return res.status(403).json({ success: false, error: 'Access denied. Super Admin only.' });
    }

    const { username, password, email, fullName } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ success: false, error: 'Username, password and email are required' });
    }

    const bcrypt = require('bcryptjs');

    // Check if user exists
    const { rows: existing } = await query('SELECT id FROM users WHERE username = $1 OR username = $2', [username, email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'User or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { rows: newUserRows } = await query(
      `INSERT INTO users (username, password, role, is_active, created_at)
       VALUES ($1, $2, 'admin', true, NOW())
       RETURNING id, username, role`,
      [username, hashedPassword]
    );

    const newUser = newUserRows[0];

    // Create Profile
    try {
      await query(
        `INSERT INTO profiles (user_id, full_name, email, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [newUser.id, fullName || username, email.toLowerCase()]
      );
    } catch (profileError) {
      console.error('Failed to create profile for new admin:', profileError);
    }

    res.json({
      success: true,
      message: `Admin '${username}' generated successfully`,
      user: newUser
    });
  } catch (error) {
    console.error('Error generating admin credentials:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET ALL ADMINS
 * Restricted to Super Admin only
 */
router.get('/admins', authenticateToken, async (req, res) => {
  try {
    if (req.user.email !== 'kishorekailas1@gmail.com') {
      return res.status(403).json({ success: false, error: 'Access denied. Super Admin only.' });
    }

    const { rows } = await query(
      `SELECT u.id, u.username, u.role, u.is_active, u.created_at, p.full_name, p.email, p.avatar_url
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id::uuid
       WHERE u.role = 'admin'
       ORDER BY u.created_at DESC`
    );

    res.json({ success: true, admins: rows });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE ADMIN
 * Restricted to Super Admin only
 */
router.delete('/admins/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.email !== 'kishorekailas1@gmail.com') {
      return res.status(403).json({ success: false, error: 'Access denied. Super Admin only.' });
    }

    const adminId = req.params.id;

    // Check if trying to delete self
    if (adminId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
    }

    // Check if target is actually an admin
    const { rows: target } = await query('SELECT role FROM users WHERE id = $1', [adminId]);
    if (target.length === 0 || target[0].role !== 'admin') {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    // Delete user (cascade will handle profile if configured, but let's be safe)
    await query('DELETE FROM profiles WHERE user_id = $1::uuid', [adminId]);
    await query('DELETE FROM users WHERE id = $1', [adminId]);

    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
