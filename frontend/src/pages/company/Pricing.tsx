import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CompanyNavSimple from "@/components/CompanyNavSimple";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Check,
  Sparkles,
  Camera,
  Users,
  Video,
  Globe,
  Zap,
  Heart,
  Shield,
  Calendar,
  Image,
  MessageSquare,
  Radio,
  Music,
  Gift,
  Bell,
  FileText,
  Download,
  Cloud,
  Smartphone,
  Mail,
  Phone,
  Star
} from "lucide-react";
import { useState } from "react";
import StreamingQualityModal, {
  StreamingQuality,
  streamingBasePrices
} from "@/components/StreamingQualityModal";

interface PricingFeature {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: React.ReactNode;
  category: 'core' | 'features' | 'addons' | 'premium';
  popular?: boolean;
}

const pricingFeatures: PricingFeature[] = [
  // Core Features - Essential
  {
    id: 'website',
    name: 'Wedding Website',
    description: 'Beautiful, responsive wedding website with custom domain',
    basePrice: 4999,
    icon: <Globe className="w-5 h-5" />,
    category: 'core',
    popular: true
  },
  {
    id: 'photo-gallery',
    name: 'Photo Gallery',
    description: 'Photo storage (up to 15GB) with organized galleries',
    basePrice: 2999,
    icon: <Image className="w-5 h-5" />,
    category: 'core',
    popular: true
  },
  {
    id: 'event-schedule',
    name: 'Event Schedule',
    description: 'Interactive timeline with multiple events and RSVP',
    basePrice: 1999,
    icon: <Calendar className="w-5 h-5" />,
    category: 'core'
  },
  {
    id: 'wishes',
    name: 'Digital Wishes',
    description: 'Guest wish collection with moderation and display',
    basePrice: 1499,
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'core'
  },
  {
    id: 'music-player',
    name: 'Music Player',
    description: 'Background music player with custom playlist',
    basePrice: 999,
    icon: <Music className="w-5 h-5" />,
    category: 'core'
  },
  
  // Advanced Features
  {
    id: 'face-detection',
    name: 'AI Face Detection',
    description: 'Smart face recognition - guests find their photos instantly',
    basePrice: 4999,
    icon: <Sparkles className="w-5 h-5" />,
    category: 'features',
    popular: true
  },
  {
    id: 'live-streaming',
    name: 'Live Streaming',
    description: 'Flexible live streaming with HD or 4K options',
    basePrice: 0,
    icon: <Video className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'photographer-portal',
    name: 'Photographer Portal',
    description: 'Dedicated portal for photographers to upload & manage photos',
    basePrice: 3999,
    icon: <Camera className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'live-sync',
    name: 'Live Photo Sync',
    description: 'Real-time photo upload from cameras via desktop app',
    basePrice: 5999,
    icon: <Radio className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'photo-booth',
    name: 'Photo Booth',
    description: 'Interactive photo booth with instant sharing',
    basePrice: 3499,
    icon: <Camera className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'guest-management',
    name: 'Guest Management',
    description: 'Guest list management with RSVP tracking',
    basePrice: 2499,
    icon: <Users className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'notifications',
    name: 'Push Notifications',
    description: 'Send updates and reminders to guests',
    basePrice: 1999,
    icon: <Bell className="w-5 h-5" />,
    category: 'features'
  },
  
  // Premium Features
  {
    id: 'custom-branding',
    name: 'Custom Branding',
    description: 'Fully customized design, colors, fonts, and logo',
    basePrice: 8999,
    icon: <Heart className="w-5 h-5" />,
    category: 'premium'
  },
  {
    id: 'custom-domain',
    name: 'Custom Domain',
    description: 'Use your own domain (e.g., ourwedding.com)',
    basePrice: 1999,
    icon: <Globe className="w-5 h-5" />,
    category: 'premium'
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Native iOS & Android app for your wedding',
    basePrice: 14999,
    icon: <Smartphone className="w-5 h-5" />,
    category: 'premium'
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Detailed insights, engagement reports, and visitor stats',
    basePrice: 2999,
    icon: <FileText className="w-5 h-5" />,
    category: 'premium'
  },
  
  // Add-ons
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: '24/7 priority customer support with dedicated manager',
    basePrice: 3999,
    icon: <Shield className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'backup-restore',
    name: 'Backup & Restore',
    description: 'Automatic backups and easy data restoration',
    basePrice: 2499,
    icon: <Download className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    description: 'Send beautiful email invitations and updates',
    basePrice: 2999,
    icon: <Mail className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'sms-notifications',
    name: 'SMS Notifications',
    description: 'Send SMS updates to guests (1000 messages)',
    basePrice: 1999,
    icon: <Phone className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'gift-registry',
    name: 'Gift Registry',
    description: 'Create and manage your wedding gift registry',
    basePrice: 3499,
    icon: <Gift className="w-5 h-5" />,
    category: 'addons'
  }
];

type DurationKey = '1M' | '3M' | '6M' | '8M' | '12M';

const durationMultipliers: Record<DurationKey, number> = {
  '1M': 1,
  '3M': 2.5,
  '6M': 4.5,
  '8M': 5.5,
  '12M': 7
};

interface DurationOption {
  key: DurationKey;
  label: string;
  months: number;
  multiplier: number;
}

const durationOptions: DurationOption[] = [
  { key: '1M', label: '1 Month', months: 1, multiplier: durationMultipliers['1M'] },
  { key: '3M', label: '3 Months', months: 3, multiplier: durationMultipliers['3M'] },
  { key: '6M', label: '6 Months', months: 6, multiplier: durationMultipliers['6M'] },
  { key: '8M', label: '8 Months', months: 8, multiplier: durationMultipliers['8M'] },
  { key: '12M', label: '12 Months', months: 12, multiplier: durationMultipliers['12M'] }
];

const calculatePrice = (basePrice: number, duration: DurationKey) => {
  const multiplier = durationMultipliers[duration];
  return Math.round(basePrice * multiplier);
};

const BillingDurationSelector = ({
  selectedDuration,
  onChange
}: {
  selectedDuration: DurationKey;
  onChange: (duration: DurationKey) => void;
}) => (
  <div className="w-full max-w-md">
    <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
      <span>Billing Duration</span>
      <span className="text-xs text-slate-400">Auto-applied discounts</span>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {durationOptions.map((option) => {
        const isActive = option.key === selectedDuration;
        return (
          <button
            type="button"
            key={option.key}
            aria-pressed={isActive}
            onClick={() => onChange(option.key)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2 text-center text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 ${
              isActive
                ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-inner'
                : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'
            }`}
          >
            <span className="text-[13px] leading-tight">{option.label}</span>
            <span className="text-[10px] text-slate-400">{option.multiplier}x</span>
          </button>
        );
      })}
    </div>
  </div>
);

type CouponStatus = 'idle' | 'applied' | 'invalid';

const Pricing = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState<DurationKey>('1M');
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<CouponStatus>('idle');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [storageExtraGB, setStorageExtraGB] = useState(0);
  const [selectedStreamingQuality, setSelectedStreamingQuality] = useState<StreamingQuality>('HD');
  const [isStreamingModalOpen, setStreamingModalOpen] = useState(false);

  const STORAGE_STEP = 5;
  const STORAGE_RATE_PER_GB = 20;
  const STORAGE_BASE = 15;

  const toggleFeature = (featureId: string) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId);
    } else {
      newSelected.add(featureId);
    }
    setSelectedFeatures(newSelected);
    if (featureId === 'photo-gallery' && !newSelected.has('photo-gallery')) {
      setStorageExtraGB(0);
    }
  };

  const adjustStorageExtra = (delta: number) => {
    setSelectedFeatures((prev) => {
      const updated = new Set(prev);
      if (!updated.has('photo-gallery')) {
        updated.add('photo-gallery');
      }
      return updated;
    });
    setStorageExtraGB((prev) => Math.max(0, prev + delta));
  };

  const getStorageExtraDurationCost = () => {
    if (!selectedFeatures.has('photo-gallery') || storageExtraGB === 0) {
      return 0;
    }
    return Math.round(storageExtraGB * STORAGE_RATE_PER_GB * durationMultipliers[duration]);
  };

  const getFeatureBasePrice = (feature: PricingFeature) => {
    if (feature.id === "live-streaming") {
      return streamingBasePrices[selectedStreamingQuality];
    }
    return feature.basePrice;
  };

  const calculateFeatureDisplayPrice = (feature: PricingFeature) => {
    return calculatePrice(getFeatureBasePrice(feature), duration);
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    selectedFeatures.forEach((featureId) => {
      const feature = pricingFeatures.find((f) => f.id === featureId);
      if (feature) {
        subtotal += calculateFeatureDisplayPrice(feature);
      }
    });
    subtotal += getStorageExtraDurationCost();
    return subtotal;
  };

  const openStreamingModal = () => {
    setStreamingModalOpen(true);
  };

  const closeStreamingModal = () => {
    setStreamingModalOpen(false);
  };

  const handleStreamingQualitySelect = (quality: StreamingQuality) => {
    setSelectedStreamingQuality(quality);
    setSelectedFeatures((prev) => {
      const updated = new Set(prev);
      updated.add('live-streaming');
      return updated;
    });
    closeStreamingModal();
  };

  const handleLiveStreamingCheckboxChange = (
    checked: true | false | "indeterminate",
  ) => {
    if (checked === true) {
      openStreamingModal();
      return;
    }
    if (checked === false) {
      const updated = new Set(selectedFeatures);
      updated.delete('live-streaming');
      setSelectedFeatures(updated);
    }
  };

  const handleApplyCoupon = () => {
    const normalized = couponCode.trim().toLowerCase();
    if (normalized === 'dridhi') {
      setCouponDiscount(0.25);
      setCouponStatus('applied');
    } else {
      setCouponDiscount(0);
      setCouponStatus('invalid');
    }
  };

  const calculateBaseSubtotal = () => {
    let base = 0;
    selectedFeatures.forEach((featureId) => {
      const feature = pricingFeatures.find((f) => f.id === featureId);
      if (feature) {
        base += getFeatureBasePrice(feature);
      }
    });
    return base;
  };

  const getFeaturesByCategory = (category: 'core' | 'features' | 'addons' | 'premium') => {
    return pricingFeatures.filter((f) => f.category === category);
  };

  const baseSubtotal = calculateBaseSubtotal();
  const subtotal = calculateSubtotal();
  const roundedTotal = Math.max(0, Math.round(subtotal * (1 - couponDiscount)));
  const total = roundedTotal;
  const storageExtraDurationCost = getStorageExtraDurationCost();
  const discountAmount = Math.max(subtotal - total, 0);
  const activeDuration = durationOptions.find((option) => option.key === duration) ?? durationOptions[0];
  const undiscountedSubtotal = Math.round(baseSubtotal * activeDuration.months);
  const totalWithoutDiscount = undiscountedSubtotal;
  const savings = Math.max(totalWithoutDiscount - total, 0);
  const showSavings = duration !== '1M' && savings > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <CompanyNavSimple />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-4 py-2 bg-green-100 rounded-full">
              <span className="text-green-600 font-semibold">Customizable Pricing</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Build Your Perfect Package
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Choose only the features you need. Pay for what you use - transparent pricing with no hidden costs!
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-2 border-rose-100">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-rose-500" />
                    Core Features
                    <Badge variant="secondary" className="ml-auto">Essential</Badge>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Essential features for your wedding website</p>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {getFeaturesByCategory('core').map((feature) => {
                    const displayPrice = calculateFeatureDisplayPrice(feature);
                    return (
                      <div
                        key={feature.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                          selectedFeatures.has(feature.id)
                            ? 'border-rose-500 bg-rose-50 shadow-md'
                            : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                        }`}
                        onClick={() => toggleFeature(feature.id)}
                      >
                        <Checkbox
                          checked={selectedFeatures.has(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-rose-500">{feature.icon}</div>
                            <h3 className="font-semibold text-lg">{feature.name}</h3>
                            {feature.popular && (
                              <Badge className="bg-rose-500 text-white text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                          {feature.id === 'photo-gallery' && (
                            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-[13px] text-slate-600">
                              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                                <span>Storage base</span>
                                <span className="font-semibold text-slate-800">{STORAGE_BASE} GB included</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Add {STORAGE_STEP} GB blocks at ₹{STORAGE_RATE_PER_GB}/GB (₹{(STORAGE_STEP * STORAGE_RATE_PER_GB).toLocaleString('en-IN')} per block).
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    adjustStorageExtra(-STORAGE_STEP);
                                  }}
                                  disabled={storageExtraGB === 0}
                                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                                    storageExtraGB === 0
                                      ? 'cursor-not-allowed border-slate-200 text-slate-400'
                                      : 'border-rose-300 text-rose-600 hover:border-rose-400'
                                  }`}
                                >
                                  -{STORAGE_STEP} GB
                                </button>
                                <span className="text-[12px] font-semibold text-slate-800">
                                  Extra {storageExtraGB} GB
                                </span>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    adjustStorageExtra(STORAGE_STEP);
                                  }}
                                  className="rounded-full border px-3 py-1 text-[11px] font-semibold text-rose-600 transition border-rose-300 hover:border-rose-400"
                                >
                                  +{STORAGE_STEP} GB
                                </button>
                              </div>
                              {storageExtraDurationCost > 0 && (
                                <p className="text-[12px] text-slate-500">
                                  Extra storage adds ₹{storageExtraDurationCost.toLocaleString('en-IN')} for this
                                  duration.
                                </p>
                              )}
                            </div>
                          )}
                          <motion.p
                            key={`core-${feature.id}-${duration}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xl font-bold text-rose-600"
                          >
                            ₹{displayPrice.toLocaleString('en-IN')}
                          </motion.p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Advanced Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Zap className="w-6 h-6 text-purple-500" />
                    Advanced Features
                    <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Powerful features to enhance your wedding experience</p>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {getFeaturesByCategory('features').map((feature) => {
                    const displayPrice = calculateFeatureDisplayPrice(feature);
                    return (
                      <div
                        key={feature.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                          selectedFeatures.has(feature.id)
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                        onClick={() => {
                          if (feature.id === 'live-streaming') {
                            openStreamingModal();
                            return;
                          }
                          toggleFeature(feature.id);
                        }}
                      >
                        <Checkbox
                          checked={selectedFeatures.has(feature.id)}
                          onCheckedChange={(checked) => {
                            if (feature.id === 'live-streaming') {
                              handleLiveStreamingCheckboxChange(checked);
                            } else {
                              toggleFeature(feature.id);
                            }
                          }}
                          onClick={(event) => {
                            if (feature.id === 'live-streaming') {
                              event.stopPropagation();
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-purple-500">{feature.icon}</div>
                            <h3 className="font-semibold text-lg">{feature.name}</h3>
                            {feature.popular && (
                              <Badge className="bg-purple-500 text-white text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                          {feature.id === 'live-streaming' && selectedFeatures.has('live-streaming') && (
                            <p className="text-[12px] font-semibold text-slate-700">
                              Selected: Live Streaming ({selectedStreamingQuality})
                            </p>
                          )}
                          <motion.p
                            key={`feature-${feature.id}-${duration}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xl font-bold text-purple-600"
                          >
                            ₹{displayPrice.toLocaleString('en-IN')}
                          </motion.p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-2 border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Star className="w-6 h-6 text-indigo-500" />
                    Premium Features
                    <Badge variant="secondary" className="ml-auto">Luxury</Badge>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Premium features for an extraordinary wedding experience</p>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {getFeaturesByCategory('premium').map((feature) => {
                    const displayPrice = calculateFeatureDisplayPrice(feature);
                    return (
                      <div
                        key={feature.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                          selectedFeatures.has(feature.id)
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                        onClick={() => toggleFeature(feature.id)}
                      >
                        <Checkbox
                          checked={selectedFeatures.has(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-indigo-500">{feature.icon}</div>
                            <h3 className="font-semibold text-lg">{feature.name}</h3>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                          <motion.p
                            key={`premium-${feature.id}-${duration}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xl font-bold text-indigo-600"
                          >
                            ₹{displayPrice.toLocaleString('en-IN')}
                          </motion.p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Add-ons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Heart className="w-6 h-6 text-slate-500" />
                    Optional Add-ons
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Extra services to make your wedding even more special</p>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {getFeaturesByCategory('addons').map((feature) => {
                    const displayPrice = calculateFeatureDisplayPrice(feature);
                    return (
                      <div
                        key={feature.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                          selectedFeatures.has(feature.id)
                            ? 'border-slate-500 bg-slate-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                        onClick={() => toggleFeature(feature.id)}
                      >
                        <Checkbox
                          checked={selectedFeatures.has(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-slate-500">{feature.icon}</div>
                            <h3 className="font-semibold text-lg">{feature.name}</h3>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                          <motion.p
                            key={`addon-${feature.id}-${duration}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xl font-bold text-slate-600"
                          >
                            ₹{displayPrice.toLocaleString('en-IN')}
                          </motion.p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="flex justify-end mb-4 px-2 lg:px-0">
              <BillingDurationSelector selectedDuration={duration} onChange={setDuration} />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="sticky top-24"
            >
              <Card className="border-2 border-rose-200 shadow-2xl bg-gradient-to-br from-white to-rose-50/30">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Your Package
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {selectedFeatures.size === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="font-medium">Select features to build your package</p>
                      <p className="text-sm mt-2">Start with Core Features for best value</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {Array.from(selectedFeatures).map((featureId) => {
                          const feature = pricingFeatures.find((f) => f.id === featureId);
                          if (!feature) return null;
                          const displayPrice = calculateFeatureDisplayPrice(feature);
                          const summaryLabel =
                            feature.id === 'live-streaming'
                              ? `Live Streaming (${selectedStreamingQuality})`
                              : feature.name;
                          return (
                            <div
                              key={featureId}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">{summaryLabel}</span>
                              </div>
                              <motion.span
                                key={`summary-${featureId}-${duration}`}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm font-bold text-rose-600 ml-2 flex-shrink-0"
                              >
                                ₹{displayPrice.toLocaleString('en-IN')}
                              </motion.span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t-2 border-slate-200 pt-4 space-y-3 bg-white rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-base">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-semibold text-slate-800">
                              ₹{subtotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {storageExtraDurationCost > 0 && (
                            <div className="flex items-center justify-between text-base text-slate-600">
                              <span>Extra storage</span>
                              <span className="font-semibold text-slate-600">
                                ₹{storageExtraDurationCost.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                          {couponDiscount > 0 && discountAmount > 0 && (
                            <div className="flex items-center justify-between text-base text-rose-600">
                              <span className="text-slate-600">Coupon discount (25%)</span>
                              <span className="font-semibold text-rose-600">
                                -₹{discountAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                      <div className="border-slate-200 rounded-2xl border bg-slate-50/60 p-4 text-sm text-slate-700 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
                          <span>Coupon code</span>
                          <span className="text-emerald-500">Coming soon perks</span>
                        </div>
                        <div className="mt-3 flex gap-2 flex-col sm:flex-row">
                          <label className="sr-only" htmlFor="pricing-coupon">
                            Enter coupon code
                          </label>
                          <input
                            id="pricing-coupon"
                            type="text"
                            value={couponCode}
                            onChange={(event) => {
                              setCouponCode(event.target.value);
                              setCouponStatus('idle');
                              setCouponDiscount(0);
                            }}
                            placeholder="EG: WEDSAVE100"
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
                          />
                          <Button
                            size="sm"
                            className="px-4 py-2 text-[11px] uppercase tracking-wide"
                            onClick={handleApplyCoupon}
                          >
                            Apply
                          </Button>
                        </div>
                        {couponStatus !== 'idle' && (
                          <p
                            className={`mt-2 text-[11px] ${
                              couponStatus === 'applied' ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {couponStatus === 'applied'
                              ? `Coupon "${couponCode}" applied. Enjoy 25% off!`
                              : 'Coupon code invalid. Try DRIDHI (case-insensitive).'}
                          </p>
                        )}
                      </div>
                        <div className="border-t-2 border-rose-200 pt-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-lg font-bold text-slate-900">Total Amount</span>
                            <div className="flex items-center gap-2">
                              {showSavings && (
                                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] px-2 py-1 rounded-full shadow-sm">
                                  You save ₹{savings.toLocaleString('en-IN')}
                                </Badge>
                              )}
                              <motion.span
                                key={`total-${duration}-${total}`}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-3xl font-bold text-rose-600"
                              >
                                ₹{total.toLocaleString('en-IN')}
                              </motion.span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            One-time payment • No recurring charges • All prices in INR
                          </p>
                        </div>
                        <Link to="/company/contact" className="block">
                          <Button
                            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                            size="lg"
                          >
                            Book a Slot
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full border-2"
                          onClick={() => setSelectedFeatures(new Set())}
                        >
                          Clear All
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600">
        <div className="container mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Need Help Choosing?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Our team is here to help you build the perfect package for your special day
            </p>
            <Link to="/company/contact">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-6"
              >
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    <StreamingQualityModal
      isOpen={isStreamingModalOpen}
      onClose={closeStreamingModal}
      selectedQuality={selectedStreamingQuality}
      onSelect={handleStreamingQualitySelect}
    />
    </div>
  );
};

export default Pricing;
