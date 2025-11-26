const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
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
const { authenticateToken } = require('../auth-simple');

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://weddingweb.co.in').replace(/\/$/, '');
const DEFAULT_THEME = process.env.PREMIUM_DEFAULT_THEME || 'modern-classic';
const PREMIUM_UPI_ID = process.env.RAZORPAY_UPI_ID || null;

/**
 * Ensure Supabase client is configured before any route runs
 */
const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Set SUPABASE_URL and key in environment.');
  }
  return supabase;
};

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
    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({ success: false, error: 'Select at least one feature before checkout' });
    }

    const pricing = calculatePremiumTotal({ features, duration });
    const client = ensureSupabase();

    const { data, error } = await client
      .from('payment_history')
      .insert([{
        user_id: userId,
        amount: pricing.total,
        duration: pricing.duration,
        features: pricing.features,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    let razorpayOrder = null;
    try {
      razorpayOrder = await createRazorpayOrder({
        amount: pricing.total,
        receipt: data.id,
        notes: {
          user_id: userId,
          features: pricing.features.join(','),
          duration: `${pricing.duration} months`
        }
      });
    } catch (orderError) {
      console.warn('Razorpay order creation failed:', orderError);
    }

    const paymentUpdatePayload = {
      payment_gateway: razorpayOrder ? 'razorpay' : 'offline',
      payment_gateway_response: razorpayOrder ? {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status
      } : {
        initializedAt: new Date().toISOString(),
        currency: PREMIUM_PAYMENT_CURRENCY,
        features: pricing.features
      }
    };

    const { error: updateError } = await client
      .from('payment_history')
      .update(paymentUpdatePayload)
      .eq('id', data.id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      checkoutId: data.id,
      amount: pricing.total,
      base: pricing.base,
      multiplier: pricing.multiplier,
      currency: PREMIUM_PAYMENT_CURRENCY,
      razorpayOrder: razorpayOrder ? {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status
      } : null,
      razorpayKeyId: razorpayOrder ? getRazorpayKeyId() : null,
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

    const client = ensureSupabase();
    const { data: payment, error: paymentError } = await client
      .from('payment_history')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

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

    const { error: updateError } = await client
      .from('payment_history')
      .update({
        status: 'completed',
        payment_gateway: gatewayName,
        payment_gateway_response: gatewayResponse
      })
      .eq('id', paymentId);

    if (updateError) {
      throw updateError;
    }

    const { data: membership } = await client
      .from('premium_memberships')
      .insert([{
        user_id: userId,
        features: payment.features,
        duration: payment.duration,
        start_date: start.toISOString(),
        expiry_date: expiry.toISOString(),
        payment_id: payment.id,
        status: 'active',
        notes: transactionReference ? `Transaction ${transactionReference}` : null
      }])
      .select()
      .single();

    const { data: existingSite } = await client
      .from('user_sites')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    let siteData = existingSite;

    if (!siteData) {
      const { data: createdSite } = await client
        .from('user_sites')
        .insert([{
          user_id: userId,
          theme: DEFAULT_THEME,
          event_metadata: { status: 'pending_setup' }
        }])
        .select()
        .single();

      siteData = createdSite;
    }

    const { data: userRecord } = await client
      .from('users')
      .select('username, email')
      .eq('id', userId)
      .single();

    const notificationMessage = `Your WeddingWeb premium builder is now active until ${expiry.toDateString()}.`;
    try {
      await client
        .from('user_notifications')
        .insert([{
          user_id: userId,
          title: 'Premium builder unlocked',
          message: notificationMessage,
          type: 'premium'
        }]);
    } catch (notifyError) {
      console.warn('Non-blocking: failed to insert premium notification', notifyError);
    }

    if (userRecord?.email) {
      try {
        await sendEmail({
          to: userRecord.email,
          subject: 'WeddingWeb Premium Builder Activated',
          text: `
Hi ${userRecord.username || 'there'},

Your premium website builder has been activated for ${payment.duration} month(s).

- Total paid: ₹${payment.amount}
- Start: ${start.toDateString()}
- Expires: ${expiry.toDateString()}

Access your dashboard: ${FRONTEND_URL}/premium-builder

Thanks for building with WeddingWeb!
        `.trim()
        });
      } catch (emailError) {
        console.warn('Premium activation email failed (non-blocking):', emailError);
      }
    }

    res.json({
      success: true,
      membership,
      site: siteData,
      message: 'Premium membership activated and notification queued.'
    });
  } catch (error) {
    console.error('Activation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Activation failed' });
  }
});

/**
 * GET /api/premium/status
 * Return membership and site status for gating the dashboard
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const client = ensureSupabase();
    const { data: membership } = await client
      .from('premium_memberships')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: site } = await client
      .from('user_sites')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    res.json({
      success: true,
      membership,
      site
    });
  } catch (error) {
    console.error('Premium status error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unable to fetch premium status' });
  }
});

module.exports = router;

