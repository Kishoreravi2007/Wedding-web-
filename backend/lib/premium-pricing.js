/**
 * Premium pricing helpers (used by checkout APIs and the dashboard)
 */

const FEATURE_CATALOG = [
  // Core Features
  {
    key: 'website',
    label: 'Wedding Website',
    description: 'Beautiful, responsive wedding website',
    price: Number(process.env.PREMIUM_PRICE_WEBSITE || '4999')
  },
  {
    key: 'photo-gallery',
    label: 'Photo Gallery',
    description: 'Photo storage (up to 15GB) with organized galleries',
    price: Number(process.env.PREMIUM_PRICE_PHOTO_GALLERY || '2999')
  },
  {
    key: 'event-schedule',
    label: 'Event Schedule',
    description: 'Interactive timeline with multiple events and RSVP',
    price: Number(process.env.PREMIUM_PRICE_EVENT_SCHEDULE || '1999')
  },
  {
    key: 'wishes',
    label: 'Digital Wishes',
    description: 'Guest wish collection with moderation and display',
    price: Number(process.env.PREMIUM_PRICE_WISHES || '1499')
  },
  {
    key: 'music-player',
    label: 'Music Player',
    description: 'Background music player with custom playlist',
    price: Number(process.env.PREMIUM_PRICE_MUSIC_PLAYER || '999')
  },

  // Advanced Features
  {
    key: 'face-detection',
    label: 'AI Face Detection',
    description: 'Smart face recognition - guests find their photos instantly',
    price: Number(process.env.PREMIUM_PRICE_FACE_DETECTION || '4999')
  },
  {
    key: 'live-streaming',
    label: 'Live Streaming',
    description: 'Flexible live streaming with HD or 4K options',
    price: Number(process.env.PREMIUM_PRICE_LIVE_STREAMING || '0')
  },
  {
    key: 'photographer-portal',
    label: 'Photographer Portal',
    description: 'Dedicated portal for photographers',
    price: Number(process.env.PREMIUM_PRICE_PHOTOGRAPHER_PORTAL || '3999')
  },
  {
    key: 'live-sync',
    label: 'Live Photo Sync',
    description: 'Real-time photo upload from cameras via desktop app',
    price: Number(process.env.PREMIUM_PRICE_LIVE_SYNC || '5999')
  },
  {
    key: 'photo-booth',
    label: 'Photo Booth',
    description: 'Interactive photo booth with instant sharing',
    price: Number(process.env.PREMIUM_PRICE_PHOTO_BOOTH || '3499')
  },
  {
    key: 'guest-management',
    label: 'Guest Management',
    description: 'Guest list management with RSVP tracking',
    price: Number(process.env.PREMIUM_PRICE_GUEST_MANAGEMENT || '2499')
  },
  {
    key: 'notifications',
    label: 'Push Notifications',
    description: 'Send updates and reminders to guests',
    price: Number(process.env.PREMIUM_PRICE_NOTIFICATIONS || '1999')
  },

  // Premium Features
  {
    key: 'custom-branding',
    label: 'Custom Branding',
    description: 'Fully customized design, colors, fonts, and logo',
    price: Number(process.env.PREMIUM_PRICE_CUSTOM_BRANDING || '8999')
  },
  {
    key: 'custom-domain',
    label: 'Custom Name',
    description: 'Use your own personalized name (e.g., names.wedding.in)',
    price: Number(process.env.PREMIUM_PRICE_CUSTOM_DOMAIN || '1999')
  },
  {
    key: 'mobile-app',
    label: 'Mobile App',
    description: 'Native iOS & Android app for your wedding',
    price: Number(process.env.PREMIUM_PRICE_MOBILE_APP || '14999')
  },
  {
    key: 'analytics',
    label: 'Advanced Analytics',
    description: 'Detailed insights, engagement reports, and visitor stats',
    price: Number(process.env.PREMIUM_PRICE_ANALYTICS || '2999')
  },

  // Add-ons
  {
    key: 'priority-support',
    label: 'Priority Support',
    description: '24/7 priority customer support',
    price: Number(process.env.PREMIUM_PRICE_PRIORITY_SUPPORT || '3999')
  },
  {
    key: 'backup-restore',
    label: 'Backup & Restore',
    description: 'Automatic backups and easy data restoration',
    price: Number(process.env.PREMIUM_PRICE_BACKUP_RESTORE || '2499')
  },
  {
    key: 'email-marketing',
    label: 'Email Marketing',
    description: 'Send beautiful email invitations and updates',
    price: Number(process.env.PREMIUM_PRICE_EMAIL_MARKETING || '2999')
  },
  {
    key: 'sms-notifications',
    label: 'SMS Notifications',
    description: 'Send SMS updates to guests',
    price: Number(process.env.PREMIUM_PRICE_SMS_NOTIFICATIONS || '1999')
  },
  {
    key: 'gift-registry',
    label: 'Gift Registry',
    description: 'Create and manage your wedding gift registry',
    price: Number(process.env.PREMIUM_PRICE_GIFT_REGISTRY || '3499')
  }
];

const DURATION_OPTIONS = [1, 3, 6, 8, 12];

const DURATION_MULTIPLIERS = {
  1: Number(process.env.PREMIUM_MULTIPLIER_1 || '1'),
  3: Number(process.env.PREMIUM_MULTIPLIER_3 || '2.5'),
  6: Number(process.env.PREMIUM_MULTIPLIER_6 || '4.5'),
  8: Number(process.env.PREMIUM_MULTIPLIER_8 || '5.5'),
  12: Number(process.env.PREMIUM_MULTIPLIER_12 || '7')
};

const sanitizeDuration = (duration) => {
  return DURATION_OPTIONS.includes(Number(duration)) ? Number(duration) : 1;
};

const sanitizeFeatures = (features = []) => {
  if (!Array.isArray(features)) return [];
  const validKeys = FEATURE_CATALOG.map((feature) => feature.key);
  return Array.from(new Set(features.filter((key) => validKeys.includes(key))));
};

/**
 * Calculate the premium booking amount starting from selected features + duration
 */
const calculatePremiumTotal = ({ features = [], duration = 1 }) => {
  const normalizedDuration = sanitizeDuration(duration);
  const selectedFeatures = sanitizeFeatures(features);
  const featureSubtotal = selectedFeatures.reduce((sum, key) => {
    const feature = FEATURE_CATALOG.find((item) => item.key === key);
    return sum + (feature ? feature.price : 0);
  }, 0);

  const multiplier = DURATION_MULTIPLIERS[normalizedDuration] ?? 1;
  const base = Number(featureSubtotal.toFixed(2));

  // Calculate total: Frontend uses a CUMULATIVE multiplier (e.g. 12 months is 7x base, NOT 12x0.85x)
  let total = Number((base * multiplier).toFixed(2));

  // TEST MODE CAPPING: Razorpay Test Mode often rejects amounts > 15,000 or 50,000
  // If not in production, cap at 5000 to allow testing the flow.
  const isProd = process.env.NODE_ENV === 'production';
  const testLimit = Number(process.env.RAZORPAY_TEST_LIMIT || '5000');

  if (!isProd && total > testLimit) {
    console.log(`⚠️ [TEST MODE] Capping amount from ₹${total} to ₹${testLimit} for Razorpay testing`);
    total = testLimit;
  }

  return {
    base,
    multiplier,
    duration: normalizedDuration,
    features: selectedFeatures,
    total: Number.isFinite(total) ? total : base,
    isCapped: !isProd && total === testLimit && total < (base * multiplier)
  };
};

const getDurationPayload = () => {
  return DURATION_OPTIONS.map((option) => ({
    months: option,
    multiplier: DURATION_MULTIPLIERS[option] ?? 1
  }));
};

module.exports = {
  FEATURE_CATALOG,
  DURATION_OPTIONS,
  DURATION_MULTIPLIERS,
  calculatePremiumTotal,
  sanitizeFeatures,
  getDurationPayload
};
