/**
 * Premium pricing helpers (used by checkout APIs and the dashboard)
 */

const FEATURE_CATALOG = [
  {
    key: 'photo_gallery',
    label: 'Photo + Video Gallery',
    description: 'Upload, reorder, and feature gallery-worthy moments',
    price: Number(process.env.PREMIUM_PRICE_PHOTO_GALLERY || '1200')
  },
  {
    key: 'music_player',
    label: 'Music & Audio Player',
    description: 'Upload MP3s, enable autoplay, and add track details',
    price: Number(process.env.PREMIUM_PRICE_MUSIC_PLAYER || '500')
  },
  {
    key: 'event_details',
    label: 'Event Details & Timeline',
    description: 'Add venues, timeline, Google Map iframe, and logistics',
    price: Number(process.env.PREMIUM_PRICE_EVENT_DETAILS || '800')
  },
  {
    key: 'theme_customization',
    label: 'Premium Themes',
    description: 'Choose from elegant wedding templates with live preview',
    price: Number(process.env.PREMIUM_PRICE_THEME || '900')
  },
  {
    key: 'custom_story',
    label: 'Couple Story & Custom Copy',
    description: 'Share your journey with curated text, timelines, and messages',
    price: Number(process.env.PREMIUM_PRICE_CUSTOM_STORY || '450')
  }
];

const DURATION_OPTIONS = [1, 3, 6, 8, 12];

const DURATION_MULTIPLIERS = {
  1: Number(process.env.PREMIUM_MULTIPLIER_1 || '1'),
  3: Number(process.env.PREMIUM_MULTIPLIER_3 || '0.95'),
  6: Number(process.env.PREMIUM_MULTIPLIER_6 || '0.92'),
  8: Number(process.env.PREMIUM_MULTIPLIER_8 || '0.9'),
  12: Number(process.env.PREMIUM_MULTIPLIER_12 || '0.85')
};

const sanitizeDuration = (duration) => {
  return DURATION_OPTIONS.includes(duration) ? duration : 1;
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
  const total = Number((base * multiplier).toFixed(2));

  return {
    base,
    multiplier,
    duration: normalizedDuration,
    features: selectedFeatures,
    total: Number.isFinite(total) ? total : base
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

