import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import {
  Sparkles, CreditCard, Shield, Check, ArrowLeft, Loader2, Clock,
  Crown, Zap, Star
} from "lucide-react";
import { apiCall } from "@/lib/api";
import { showError, showInfo, showSuccess } from "@/utils/toast";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type PremiumFeature = {
  key: string;
  label: string;
  description?: string;
  price: number;
};

type PremiumDuration = {
  months: number;
  multiplier: number;
};

type PremiumOptionsResponse = {
  features: PremiumFeature[];
  durations: PremiumDuration[];
  razorpay: {
    keyId?: string | null;
    currency?: string;
    upiId?: string | null;
  };
};

type CheckoutResponse = {
  checkoutId: string;
  amount: number;
  base: number;
  multiplier: number;
  currency: string;
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  } | null;
  razorpayKeyId: string | null;
  features: string[];
  message?: string;
};

const formatCurrency = (value: number, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
};

const loadRazorpayScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      return resolve();
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });
};

const PremiumCheckout = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<PremiumOptionsResponse | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [checkoutResponse, setCheckoutResponse] = useState<CheckoutResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await apiCall("/api/premium/options");
        setOptions(result);

        const firstDuration = result?.durations?.[0]?.months ?? 1;
        setSelectedDuration(firstDuration);

        const defaults = result?.features?.slice(0, 2).map((feature: PremiumFeature) => feature.key) ?? [];
        setSelectedFeatures(defaults);
      } catch (error: any) {
        showError(error.message || "Unable to load premium options. Please log in first.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const base = (selectedFeatures ?? []).reduce((sum, key) => {
      const feature = options?.features?.find((item) => item.key === key);
      return sum + (feature?.price ?? 0);
    }, 0);

    const multiplier = options?.durations?.find((item) => item.months === selectedDuration)?.multiplier ?? 1;
    const total = Number((base * selectedDuration * multiplier).toFixed(2));

    return { base, multiplier, total };
  }, [options, selectedFeatures, selectedDuration]);

  const toggleFeature = (featureKey: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureKey) ? prev.filter((key) => key !== featureKey) : [...prev, featureKey]
    );
  };

  const confirmActivation = async (payload: any) => {
    if (!checkoutResponse?.checkoutId) return;
    try {
      setIsProcessing(true);
      await apiCall("/api/premium/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: checkoutResponse.checkoutId,
          razorpay_payment_id: payload.razorpay_payment_id,
          razorpay_order_id: payload.razorpay_order_id,
          razorpay_signature: payload.razorpay_signature
        })
      });
      showSuccess("Premium membership activated! Your builder dashboard is now unlocked.");
      setPaymentSuccess(true);
    } catch (error: any) {
      showError(error.message || "Activation failed. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRazorpayCheckout = async (response: CheckoutResponse) => {
    if (!response.razorpayOrder?.id || !response.razorpayKeyId) {
      showInfo("Razorpay is not configured. Please contact support to complete payment.");
      return;
    }

    try {
      await loadRazorpayScript();

      const rzpOptions = {
        key: response.razorpayKeyId,
        amount: response.razorpayOrder.amount,
        currency: response.currency,
        name: "WeddingWeb",
        description: "Premium Website Builder",
        order_id: response.razorpayOrder.id,
        handler: async (payload: any) => {
          await confirmActivation(payload);
        },
        prefill: {},
        notes: {
          duration: `${selectedDuration} month(s)`,
          features: selectedFeatures.join(", ")
        },
        theme: {
          color: "#e11d48"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(rzpOptions);
      razorpay.open();
    } catch (error: any) {
      showError(error.message || "Unable to initialize Razorpay.");
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (selectedFeatures.length === 0) {
      showError("Please select at least one premium feature.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiCall("/api/premium/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: selectedFeatures,
          duration: selectedDuration
        })
      });

      setCheckoutResponse(response);

      if (response.razorpayOrder) {
        await startRazorpayCheckout(response);
      } else {
        showInfo("Checkout recorded. Please contact us to settle the payment and activate your plan.");
        setIsProcessing(false);
      }
    } catch (error: any) {
      showError(error.message || "Failed to create checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const getDurationLabel = (months: number) => {
    if (months === 1) return "1 Month";
    if (months === 3) return "3 Months";
    if (months === 6) return "6 Months";
    if (months === 12) return "1 Year";
    return `${months} Months`;
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
        <CompanyNavbar />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Successful!</h1>
            <p className="text-lg text-slate-600 mb-8">
              Your premium membership has been activated. You now have access to the premium website builder.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
                onClick={() => navigate("/client")}
              >
                <Crown className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/company")}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
      <CompanyNavbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-semibold text-rose-600">Secure Checkout</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Complete Your Order
            </h1>
            <p className="text-slate-600 max-w-xl mx-auto">
              Review your selected features, choose a duration, and pay securely via Razorpay
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-4" />
              <p className="text-slate-500">Loading checkout options…</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1.4fr,1fr] gap-8">
              {/* Left Column — Feature Selection */}
              <div className="space-y-6">
                {/* Features */}
                <Card className="border-2 border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-500" />
                      Select Features
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Choose the premium modules you need</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {options?.features?.length ? (
                      options.features.map((feature) => {
                        const isSelected = selectedFeatures.includes(feature.key);
                        return (
                          <div
                            key={feature.key}
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                              ? "border-rose-400 bg-rose-50/60 shadow-sm"
                              : "border-slate-200 hover:border-rose-200 hover:bg-rose-50/30"
                              }`}
                            onClick={() => toggleFeature(feature.key)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleFeature(feature.key)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-semibold text-slate-900">{feature.label}</h3>
                                <span className="text-sm font-bold text-rose-600 whitespace-nowrap">
                                  {formatCurrency(feature.price)}
                                </span>
                              </div>
                              {feature.description && (
                                <p className="text-sm text-slate-500 mt-1">{feature.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-400 py-4 text-center">No features available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Duration */}
                <Card className="border-2 border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      Select Duration
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Longer durations include a discount multiplier</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {options?.durations?.length ? (
                        options.durations.map((plan) => {
                          const isActive = plan.months === selectedDuration;
                          return (
                            <button
                              key={`duration-${plan.months}`}
                              onClick={() => setSelectedDuration(plan.months)}
                              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-4 py-4 text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 ${isActive
                                ? "border-rose-500 bg-rose-50 text-rose-700 shadow-md"
                                : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50/30"
                                }`}
                            >
                              {plan.multiplier < 1 && (
                                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5">
                                  Save {Math.round((1 - plan.multiplier) * 100)}%
                                </Badge>
                              )}
                              <span className="text-lg font-bold">{getDurationLabel(plan.months)}</span>
                              <span className="text-xs text-slate-400">{plan.multiplier}x multiplier</span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-sm text-slate-400 col-span-full text-center py-2">Loading…</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column — Order Summary */}
              <div className="lg:sticky lg:top-24 self-start">
                <Card className="border-2 border-rose-200 shadow-xl bg-gradient-to-br from-white to-rose-50/50">
                  <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-t-lg pb-5">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* Selected items */}
                    {selectedFeatures.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <CreditCard className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">No features selected</p>
                        <p className="text-sm mt-1">Select features from the left panel</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {selectedFeatures.map((featureKey) => {
                            const feature = options?.features?.find((f) => f.key === featureKey);
                            if (!feature) return null;
                            return (
                              <div
                                key={featureKey}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-sm font-medium text-slate-700 truncate">
                                    {feature.label}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-rose-600 ml-2 whitespace-nowrap">
                                  {formatCurrency(feature.price)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <Separator />

                        {/* Pricing breakdown */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Base cost</span>
                            <span className="font-medium text-slate-700">{formatCurrency(summary.base)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Duration multiplier</span>
                            <span className="font-medium text-slate-700">{summary.multiplier}x</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Duration</span>
                            <span className="font-medium text-slate-700">{getDurationLabel(selectedDuration)}</span>
                          </div>
                        </div>

                        <div className="border-t-2 border-rose-200 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-slate-900">Total</span>
                            <span className="text-2xl font-bold text-rose-600">
                              {formatCurrency(summary.total, options?.razorpay?.currency)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">One-time payment • All prices in INR</p>
                        </div>

                        {/* Pay Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                          size="lg"
                          onClick={handleCheckout}
                          disabled={isProcessing || selectedFeatures.length === 0}
                        >
                          {isProcessing ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing…
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5" />
                              Pay {formatCurrency(summary.total, options?.razorpay?.currency)}
                            </span>
                          )}
                        </Button>

                        {/* Razorpay order info */}
                        {checkoutResponse?.razorpayOrder && (
                          <p className="text-xs text-slate-400 text-center">
                            Order ID: <span className="font-mono">{checkoutResponse.razorpayOrder.id}</span>
                          </p>
                        )}

                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-4 pt-2">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Secure Payment</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <img
                              src="https://razorpay.com/favicon.png"
                              alt="Razorpay"
                              className="w-3.5 h-3.5"
                            />
                            <span>Powered by Razorpay</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumCheckout;
