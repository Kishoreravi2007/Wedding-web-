const Razorpay = require('razorpay');
const crypto = require('crypto');

const {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  PREMIUM_PAYMENT_CURRENCY = 'INR'
} = process.env;

let razorpayClient = null;

/**
 * Lazily initialize the Razorpay SDK client using service credentials
 */
const getRazorpayClient = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn('Razorpay credentials missing, skipping order creation.');
    return null;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  }

  return razorpayClient;
};

/**
 * Create an order in Razorpay so the front-end can open the checkout modal
 */
const createRazorpayOrder = async ({ amount, receipt, notes = {}, currency = PREMIUM_PAYMENT_CURRENCY }) => {
  const client = getRazorpayClient();

  if (!client) {
    return null;
  }

  const orderPayload = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt,
    payment_capture: 1,
    notes
  };

  return client.orders.create(orderPayload);
};

/**
 * Verify the Razorpay webhook/signature after payment completes
 */
const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!RAZORPAY_KEY_SECRET || !orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(payload).digest('hex');
  return expectedSignature === signature;
};

/**
 * Expose the key id so the front-end can initialize the SDK
 */
const getRazorpayKeyId = () => RAZORPAY_KEY_ID || null;

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
  PREMIUM_PAYMENT_CURRENCY
};

