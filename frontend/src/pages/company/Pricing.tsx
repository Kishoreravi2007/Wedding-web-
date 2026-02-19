import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { WeddingWebHeader } from "@/components/WeddingWebHeader";

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
  MessageCircle,
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
  Star,
  Loader2,
  CreditCard,
  Crown,
  CheckCircle2,
  XCircle,
  Pencil
} from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import StreamingQualityModal, {
  StreamingQuality,
  streamingBasePrices
} from "@/components/StreamingQualityModal";
import { apiCall } from "@/lib/api";
import { showError, showSuccess } from "@/utils/toast";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpayScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });
};

interface PricingFeature {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: React.ReactNode;
  category: 'core' | 'features' | 'addons' | 'premium';
  popular?: boolean;
}

interface CouponValidationResponse {
  valid: boolean;
  discount_type: 'percentage' | 'fixed';
  discount_value: number | string;
}

interface CheckoutResponse {
  success: boolean;
  checkoutId: string;
  amount: number;
  currency: string;
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
  razorpayKeyId: string;
  isCapped?: boolean;
}

interface ActivateResponse {
  success: boolean;
  message: string;
  membership?: any;
}

const pricingFeatures: PricingFeature[] = [
  // Core Features
  {
    id: 'website',
    name: 'Wedding Website',
    description: 'Beautiful, responsive wedding website',
    basePrice: 4999,
    icon: <Globe className="w-5 h-5" />,
    category: 'core',
    popular: true
  },
  {
    id: 'visual-editor',
    name: 'Visual Website Builder',
    description: 'Drag-and-drop editor to customize your website design',
    basePrice: 8999,
    icon: <Pencil className="w-5 h-5" />,
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
    id: 'face-detection',
    name: 'AI Face Detection',
    description: 'Smart face recognition - guests find their photos instantly',
    basePrice: 4999,
    icon: <Sparkles className="w-5 h-5" />,
    category: 'premium',
    popular: true
  },
  {
    id: 'email-marketing',
    name: 'Email Invitations',
    description: 'Send beautiful email invitations, reminders, and updates',
    basePrice: 2499,
    icon: <Mail className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'whatsapp-updates',
    name: 'WhatsApp Updates',
    description: 'Send automated event updates and reminders via WhatsApp',
    basePrice: 2999,
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'guest-management',
    name: 'Guest Management',
    description: 'Guest list management with RSVP tracking',
    basePrice: 2499,
    icon: <Users className="w-5 h-5" />,
    category: 'core'
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

  // Optional Add-ons
  {
    id: 'priority-support',
    name: '24/7 Priority Support',
    description: 'Dedicated support manager and round-the-clock assistance',
    basePrice: 3999,
    icon: <Shield className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'custom-domain',
    name: 'Custom Name',
    description: 'Use your own personalized name (e.g., names.wedding.in)',
    basePrice: 1999,
    icon: <Globe className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Visitor stats, RSVP insights, and engagement reports',
    basePrice: 2999,
    icon: <FileText className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'concierge-setup',
    name: 'Concierge Setup',
    description: 'We build your website for you - just send us the details',
    basePrice: 4999,
    icon: <Crown className="w-5 h-5" />,
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
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2 text-center text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 ${isActive
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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState<DurationKey>('1M');
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<CouponStatus>('idle');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [storageExtraGB, setStorageExtraGB] = useState(0);
  const [selectedStreamingQuality, setSelectedStreamingQuality] = useState<StreamingQuality>('HD');
  const [isStreamingModalOpen, setStreamingModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');

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

  const [fixedDiscount, setFixedDiscount] = useState(0);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

    setCouponStatus('idle');
    try {
      const response = await apiCall<CouponValidationResponse>(`/api/coupons/validate/${code}`);

      if (response.valid) {
        const val = Number(response.discount_value);
        if (response.discount_type === 'percentage') {
          setCouponDiscount(val / 100);
          setFixedDiscount(0);
        } else {
          setCouponDiscount(0);
          setFixedDiscount(val);
        }
        setCouponStatus('applied');
      }
    } catch (err) {
      setCouponDiscount(0);
      setFixedDiscount(0);
      setCouponStatus('invalid');
    }
  };

  const handleBookNow = async () => {
    if (!currentUser) {
      showError('Please log in to continue with your purchase.');
      navigate('/login');
      return;
    }

    if (selectedFeatures.size === 0) {
      showError('Please select at least one feature before booking.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('idle');

    try {
      // Map pricing page feature IDs to backend feature keys
      const featureKeys = Array.from(selectedFeatures);
      const activeDur = durationOptions.find((o) => o.key === duration);
      const months = activeDur?.months ?? 1;

      const response = await apiCall<CheckoutResponse>('/api/premium/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: featureKeys,
          duration: months
        })
      });

      console.log('🔍 Checkout API Response:', response);

      if (response.isCapped) {
        showSuccess(`Note: Transaction capped at ₹${response.amount} for Testing.`);
      }

      if (!response.razorpayOrder?.id || !response.razorpayKeyId) {
        showError('Razorpay is not configured. Please contact support.');
        setIsProcessing(false);
        return;
      }

      await loadRazorpayScript();

      const rzpOptions = {
        key: response.razorpayKeyId,
        amount: response.razorpayOrder.amount,
        currency: response.currency || 'INR',
        name: 'WeddingWeb',
        description: 'Premium Wedding Package',
        order_id: response.razorpayOrder.id,
        handler: async (payload: any) => {
          try {
            await apiCall<ActivateResponse>('/api/premium/activate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: response.checkoutId,
                razorpay_payment_id: payload.razorpay_payment_id,
                razorpay_order_id: payload.razorpay_order_id,
                razorpay_signature: payload.razorpay_signature
              })
            });
            setPaymentStatus('success');
            showSuccess('Payment successful! Your premium membership is active.');
          } catch (err: any) {
            setPaymentStatus('failed');
            showError(err.message || 'Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {},
        notes: {
          features: featureKeys.join(', '),
          duration: `${months} month(s)`
        },
        theme: { color: '#e11d48' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentStatus('failed');
            showError('Payment was cancelled. You can try again anytime.');
          }
        }
      };

      const razorpay = new window.Razorpay(rzpOptions);
      razorpay.on('payment.failed', (resp: any) => {
        setIsProcessing(false);
        setPaymentStatus('failed');
        showError(resp?.error?.description || 'Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      showError(err.message || 'Failed to start checkout. Please log in and try again.');
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
  const roundedTotal = Math.max(0, Math.round(subtotal * (1 - couponDiscount) - fixedDiscount));
  const total = roundedTotal;
  const storageExtraDurationCost = getStorageExtraDurationCost();
  const discountAmount = Math.max(subtotal - total, 0);
  const activeDuration = durationOptions.find((option) => option.key === duration) ?? durationOptions[0];
  const undiscountedSubtotal = Math.round(baseSubtotal * activeDuration.months);
  const totalWithoutDiscount = undiscountedSubtotal;
  const savings = Math.max(totalWithoutDiscount - total, 0);
  const showSavings = duration !== '1M' && savings > 0;

  if (currentUser?.has_premium_access) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <WeddingWebHeader />
        <section className="relative pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl px-8 py-12 rounded-3xl bg-white shadow-2xl border-2 border-amber-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <Crown className="w-12 h-12 text-amber-500 opacity-20 rotate-12" />
            </div>

            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-amber-600" />
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
              You are a <span className="text-amber-600">Premium Member!</span>
            </h1>

            <p className="text-lg text-slate-600 mb-10">
              Your account is active and you have access to all premium wedding tools.
              Start building your dream wedding experience now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-6 px-10 rounded-2xl shadow-xl transition-all hover:-translate-y-1"
                onClick={() => navigate('/company')}
              >
                Go to Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-200 hover:bg-slate-50 py-6 px-10 rounded-2xl font-semibold"
                onClick={() => navigate('/client')}
              >
                Open Premium Builder
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <WeddingWebHeader />



      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 lg:pt-40 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left Side: Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <div className="inline-block mb-6 px-4 py-2 bg-green-100 rounded-full">
                <span className="text-green-600 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Customizable Pricing
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Build Your Perfect<br />Wedding Package
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                Choose only the features you need. Pay for what you use - transparent pricing with no hidden costs!
              </p>
            </motion.div>

            {/* Right Side: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:ml-auto w-full max-w-[600px] mx-auto"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop"
                  alt="Wedding Planning"
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -left-10 w-full h-full bg-green-200/50 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
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
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${selectedFeatures.has(feature.id)
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
                                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${storageExtraGB === 0
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
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${selectedFeatures.has(feature.id)
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
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${selectedFeatures.has(feature.id)
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
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${selectedFeatures.has(feature.id)
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
                          {(couponDiscount > 0 || fixedDiscount > 0) && discountAmount > 0 && (
                            <div className="flex items-center justify-between text-base text-rose-600">
                              <span className="text-slate-600">
                                Coupon discount ({couponDiscount > 0 ? `${(couponDiscount * 100).toFixed(0)}%` : `₹${fixedDiscount.toLocaleString('en-IN')}`})
                              </span>
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
                              className={`mt-2 text-[11px] ${couponStatus === 'applied' ? 'text-emerald-600' : 'text-rose-500'
                                }`}
                            >
                              {couponStatus === 'applied'
                                ? `Coupon "${couponCode}" applied successfully!`
                                : 'Coupon code invalid.'}
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
                        {paymentStatus === 'success' ? (
                          <div className="flex flex-col items-center gap-3 py-4">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                            <p className="text-lg font-bold text-green-700">Payment Successful!</p>
                            <p className="text-sm text-slate-500">Your premium membership is now active.</p>
                            <Button
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6"
                              size="lg"
                              onClick={() => navigate('/client')}
                            >
                              <Crown className="w-5 h-5 mr-2" />
                              Go to Dashboard
                            </Button>
                          </div>
                        ) : paymentStatus === 'failed' ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-rose-600 mb-1">
                              <XCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Payment failed or cancelled</span>
                            </div>
                            <Button
                              className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                              size="lg"
                              onClick={() => { setPaymentStatus('idle'); handleBookNow(); }}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing…</span>
                              ) : (
                                <span className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Try Again</span>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                            size="lg"
                            onClick={handleBookNow}
                            disabled={isProcessing || selectedFeatures.size === 0}
                          >
                            {isProcessing ? (
                              <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing…</span>
                            ) : (
                              <span className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Book</span>
                            )}
                          </Button>
                        )}
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

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="WeddingWeb Logo" className="w-10 h-10 rounded-xl object-contain bg-white" />
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">WeddingWeb</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Making weddings memorable with cutting-edge technology.
                Built with love in Kerala.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6 text-white">Product</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link to="/company/services" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/company/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/company/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6 text-white">Company</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link to="/company/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/company/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><a href="javascript:void(0)" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6 text-white">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <a
                    href="https://github.com/Kishoreravi2007/Wedding-web-"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Documentation
                  </a>
                </li>
                <li><a href="javascript:void(0)" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link to="/company/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 space-y-2">
            <p>&copy; 2026 WeddingWeb AI Inc. All rights reserved.</p>
            <p className="text-sm flex items-center justify-center gap-2">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in Kerala
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
