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

const FEATURE_BASE_PRICES = FEATURE_CATALOG.reduce((acc, feature) => {
  acc[feature.key] = feature.price;
  return acc;
}, {});

const { query } = require('./db-gcp');

/**
 * Calculate total price for selected features and duration
 *
 * @param {Array} featureKeys - Array of feature IDs
 * @param {number} duration - Number of months (1, 3, 6, 12)
 * @param {string} couponCode - Optional coupon code
 * @returns {Object} - { base, multiplier, total, discountAmount, couponDetails }
 */
async function calculatePremiumTotal(featureKeys, duration, couponCode = null) {
  if (!Array.isArray(featureKeys) || featureKeys.length === 0) {
    return { base: 0, multiplier: 1, total: 0, discountAmount: 0, couponDetails: null };
  }

  // Calculate base price (sum of monthly prices for each feature)
  let featureSubtotal = 0;
  featureKeys.forEach(key => {
    const price = FEATURE_BASE_PRICES[key] || 0;
    featureSubtotal += price;
  });

  // Get duration multiplier
  const normalizedDuration = sanitizeDuration(duration);
  const multiplier = DURATION_MULTIPLIERS[normalizedDuration] ?? 1;
  const base = Number(featureSubtotal.toFixed(2));

  // Use Math.round to ensure total is an integer (rupees) to match Pricing page and avoid paise discrepancies
  let subtotal = Math.round(base * multiplier);
  let total = subtotal;
  let discountAmount = 0;
  let couponDetails = null;

  // Apply Coupon if provided
  if (couponCode) {
    try {
      const { rows } = await query(
        'SELECT * FROM coupons WHERE LOWER(code) = LOWER($1) AND status = \'active\'',
        [couponCode]
      );

      if (rows.length > 0) {
        const coupon = rows[0];

        // Basic validation: expiry
        const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
        const isLimitReached = coupon.usage_limit && coupon.usage_count >= coupon.usage_limit;

        if (!isExpired && !isLimitReached) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * (coupon.discount_value / 100));
          } else if (coupon.discount_type === 'fixed') {
            discountAmount = Math.round(coupon.discount_value);
          }

          total = Math.max(0, subtotal - discountAmount);
          couponDetails = {
            code: coupon.code,
            type: coupon.discount_type,
            value: coupon.discount_value
          };
        }
      }
    } catch (error) {
      console.error('Error validating coupon in pricing logic:', error);
      // Fallback: No discount if DB fails
    }
  }

  return {
    base,
    multiplier,
    duration: normalizedDuration, // Keep duration for consistency with old return
    features: featureKeys, // Keep features for consistency with old return
    subtotal,
    total: Number.isFinite(total) ? total : base, // Ensure total is finite
    discountAmount,
    couponDetails
  };
}

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
