const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayClient = null;

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials missing from server environment');
  }

  if (!razorpayClient) {
    console.log(`✅ Initializing Razorpay Client with Key ID: ${keyId.substring(0, 10)}...`);
    try {
      razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
    } catch (err) {
      console.error('❌ Failed to initialize Razorpay client:', err.message);
      throw new Error('Failed to initialize Razorpay client: ' + err.message);
    }
  }

  return razorpayClient;
};

const createRazorpayOrder = async ({ amount, receipt, notes = {}, currency = (process.env.PREMIUM_PAYMENT_CURRENCY || 'INR') }) => {
  const client = getRazorpayClient();

  if (!client) {
    throw new Error('Razorpay client could not be initialized');
  }

  try {
    const orderPayload = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt,
      payment_capture: 1,
      notes
    };

    console.log('💳 [Razorpay] Creating order with payload:', JSON.stringify({
      ...orderPayload,
      amount_in_rupees: amount
    }, null, 2));

    const order = await client.orders.create(orderPayload);
    console.log(`✅ [Razorpay] Order created successfully: ${order.id} (₹${amount})`);
    return order;
  } catch (err) {
    console.error('❌ Razorpay order creation failed:', err);
    // Throw specific error from Razorpay response if available
    const errorMessage = err.error?.description || err.message || 'Razorpay order creation failed';
    throw new Error(errorMessage);
  }
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || !orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac('sha256', keySecret).update(payload).digest('hex');
  return expectedSignature === signature;
};

const getRazorpayKeyId = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) return null;
  return keyId;
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
  PREMIUM_PAYMENT_CURRENCY: process.env.PREMIUM_PAYMENT_CURRENCY || 'INR'
};
