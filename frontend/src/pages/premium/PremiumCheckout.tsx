import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClockIcon, Sparkles, CreditCard, Music4, Camera, UploadCloud } from "lucide-react";
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
    maximumFractionDigits: 2
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
  const [options, setOptions] = useState<PremiumOptionsResponse | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [checkoutResponse, setCheckoutResponse] = useState<CheckoutResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const base = (selectedFeatures ?? []).reduce((sum, key) => {
      const feature = options?.features?.find((item) => item.key === key);
      return sum + (feature?.price ?? 0);
    }, 0);

    const multiplier = options?.durations?.find((item) => item.months === selectedDuration)?.multiplier ?? 1;
    const total = Number((base * multiplier).toFixed(2));

    return { base, multiplier, total };
  }, [options, selectedFeatures, selectedDuration]);

  const toggleFeature = (featureKey: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureKey) ? prev.filter((key) => key !== featureKey) : [...prev, featureKey]
    );
  };

  const handleDurationChange = (months: number) => {
    setSelectedDuration(months);
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
      showSuccess("Premium membership activated! The builder dashboard is now unlocked.");
      setStatusMessage("Premium access confirmed. Check the dashboard to start customizing.");
    } catch (error: any) {
      showError(error.message || "Activation failed. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRazorpayCheckout = async (response: CheckoutResponse) => {
    if (!response.razorpayOrder?.id || !response.razorpayKeyId) {
      showInfo("Razorpay credentials are not configured. Complete the payment manually.");
      return;
    }

    try {
      await loadRazorpayScript();

      const options = {
        key: response.razorpayKeyId,
        amount: Math.round(response.amount * 100),
        currency: response.currency,
        name: "WeddingWeb Premium Builder",
        description: "Custom wedding website experience",
        order_id: response.razorpayOrder.id,
        handler: async (payload: any) => {
          await confirmActivation(payload);
        },
        notes: {
          duration: `${selectedDuration} month(s)`,
          features: selectedFeatures.join(", ")
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI (instant)",
                instruments: [{ method: "upi" }]
              }
            },
            preferences: {
              show_default_blocks: false
            }
          }
        },
        theme: {
          color: "#c026d3"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      showError(error.message || "Unable to initialize Razorpay.");
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
      setStatusMessage(response.message || "Checkout initialized. Proceed to payment.");

      if (response.razorpayOrder) {
        await startRazorpayCheckout(response);
      } else {
        showInfo("Checkout recorded—please contact us to settle the payment. We'll activate your plan once we receive confirmation.");
      }
    } catch (error: any) {
      showError(error.message || "Failed to create checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const upiId = options?.razorpay?.upiId || import.meta.env.VITE_PREMIUM_UPI_ID;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="bg-gradient-to-br from-purple-900 to-pink-700 shadow-2xl">
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-300" />
              <CardTitle className="text-3xl font-bold">Premium Website Builder</CardTitle>
            </div>
            <p className="text-lg text-rose-100">
              Select your favorite modules, choose how long you want the premium support, and complete the payment instantly via Razorpay
              (UPI included).
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">Live Preview</Badge>
              <Badge variant="outline">Cloud Media</Badge>
              <Badge variant="outline">UPI + Card</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
          <Card className="bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Pick your modules</CardTitle>
              <p className="text-sm text-white/70">We charge per feature + duration multiplier.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {options?.features?.length ? (
                  options.features.map((feature) => (
                    <div
                      key={feature.key}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <Checkbox
                        checked={selectedFeatures.includes(feature.key)}
                        onCheckedChange={() => toggleFeature(feature.key)}
                      />
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold text-white">{feature.label}</p>
                          <span className="text-sm text-emerald-200">{formatCurrency(feature.price)}</span>
                        </div>
                        <p className="text-sm text-white/70">{feature.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/60">Loading premium modules…</p>
                )}
              </div>

              <Separator className="border-white/10" />

              <div className="space-y-3">
                <Label className="text-sm text-white/60">Duration</Label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {options?.durations?.length ? (
                    options.durations.map((plan) => (
                      <Button
                        key={`duration-${plan.months}`}
                        variant={plan.months === selectedDuration ? "secondary" : "outline"}
                        className="text-left"
                        onClick={() => handleDurationChange(plan.months)}
                      >
                        <div className="text-lg font-semibold">{plan.months} month{plan.months > 1 ? "s" : ""}</div>
                        <p className="text-xs text-white/70">x{plan.multiplier} multiplier</p>
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-white/60">Fetching duration plans…</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Base module cost</span>
                  <span>{formatCurrency(summary.base)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60">
                  <span>Duration multiplier</span>
                  <span>{summary.multiplier}x</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-sm text-white/60">Total (INR)</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total, options?.razorpay?.currency)}</p>
                </div>
                <div className="text-sm text-emerald-300">{selectedFeatures.length} feature{selectedFeatures.length === 1 ? "" : "s"}</div>
              </div>

              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={isProcessing || selectedFeatures.length === 0}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    Authorizing…
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay {formatCurrency(summary.total, options?.razorpay?.currency)}
                  </>
                )}
              </Button>
              {statusMessage && <p className="text-sm text-white/70">{statusMessage}</p>}
              {checkoutResponse?.razorpayOrder && (
                <p className="text-xs text-white/70">
                  Razorpay order: <span className="font-semibold">{checkoutResponse.razorpayOrder.id}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">Alternative UPI payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-white/60">
              Prefer scanning a UPI QR or paying from your favorite UPI app? Use the UPI ID below and share the Razorpay payment ID/video with us once the transfer is complete.
            </p>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-white/30 bg-white/10 p-4">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <div className="text-lg font-semibold">{upiId || "UPI ID not configured"}</div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-white/60" />
                Auto-verify merchant payout (Razorpay settles to your linked savings account)
              </span>
              <span className="flex items-center gap-2">
                <Music4 className="w-4 h-4 text-white/60" />
                Builder access enabled instantly once payment is confirmed
              </span>
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-white/60" />
                Upload photos, music, story + publish right after activation
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumCheckout;

