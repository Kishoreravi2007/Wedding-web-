import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CompanyNavSimple from "@/components/CompanyNavSimple";
import { 
  Check,
  X,
  Sparkles,
  Crown,
  Rocket,
  HelpCircle
} from "lucide-react";
import { useState } from "react";

type BillingOption = {
  id: 'oneMonth' | 'threeMonths' | 'sixMonths' | 'oneYear';
  label: string;
  durationLabel: string;
  months: number;
  badge?: string;
};

const billingOptions: BillingOption[] = [
  { id: 'oneMonth', label: '1 Month', durationLabel: '1 month', months: 1 },
  { id: 'threeMonths', label: '3 Months', durationLabel: '3 months', months: 3 },
  { id: 'sixMonths', label: '6 Months', durationLabel: '6 months', months: 6 },
  { id: 'oneYear', label: '1 Year', durationLabel: '1 year', months: 12, badge: 'Best Value' }
];

type BillingOptionId = BillingOption['id'];

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingOptionId>('oneYear');
  const selectedBillingOption = billingOptions.find((option) => option.id === billingPeriod) ?? billingOptions[0];

  const plans = [
    {
      name: "Starter",
      icon: <Sparkles className="w-8 h-8" />,
      description: "Perfect for intimate gatherings",
      color: "from-blue-500 to-cyan-500",
      monthlyPrice: 2999,
      yearlyPrice: 9999,
      features: [
        { text: "Build your wedding website", included: true },
        { text: "Up to 100 guests", included: true },
        { text: "5GB photo storage", included: true },
        { text: "AI Face Detection", included: true },
        { text: "Basic photo gallery", included: true },
        { text: "Digital wishes", included: true },
        { text: "Event scheduling", included: true },
        { text: "Email support", included: true },
        { text: "Live streaming", included: false },
        { text: "Photographer portal", included: false },
        { text: "Custom branding", included: false },
        { text: "Priority support", included: false }
      ],
      popular: false
    },
    {
      name: "Professional",
      icon: <Crown className="w-8 h-8" />,
      description: "Most popular for weddings",
      color: "from-rose-500 to-purple-600",
      monthlyPrice: 5999,
      yearlyPrice: 19999,
      features: [
        { text: "Build your wedding website", included: true },
        { text: "Premium templates", included: true },
        { text: "Up to 500 guests", included: true },
        { text: "50GB photo storage", included: true },
        { text: "AI Face Detection", included: true },
        { text: "Premium photo gallery", included: true },
        { text: "Digital wishes", included: true },
        { text: "Event scheduling", included: true },
        { text: "Live streaming (HD)", included: true },
        { text: "Photographer portal", included: true },
        { text: "Custom branding", included: false },
        { text: "24/7 phone support", included: false }
      ],
      popular: true
    },
    {
      name: "Enterprise",
      icon: <Rocket className="w-8 h-8" />,
      description: "For large events & multiple weddings",
      color: "from-purple-500 to-indigo-600",
      monthlyPrice: 14999,
      yearlyPrice: 49999,
      features: [
        { text: "Build your wedding website", included: true },
        { text: "All premium templates", included: true },
        { text: "Custom domain included", included: true },
        { text: "Unlimited guests", included: true },
        { text: "Unlimited storage", included: true },
        { text: "AI Face Detection", included: true },
        { text: "Premium photo gallery", included: true },
        { text: "Digital wishes", included: true },
        { text: "Live streaming (4K)", included: true },
        { text: "Photographer portal", included: true },
        { text: "Custom branding", included: true },
        { text: "24/7 priority support", included: true }
      ],
      popular: false
    }
  ];

  const getPlanPrice = (plan: (typeof plans)[number]) => {
    switch (selectedBillingOption.id) {
      case 'oneMonth':
        return plan.monthlyPrice;
      case 'threeMonths':
        return Math.round((plan.monthlyPrice * 2 + Math.round(plan.yearlyPrice / 2)) / 3);
      case 'sixMonths':
        return Math.round(plan.yearlyPrice / 2);
      case 'oneYear':
      default:
        return plan.yearlyPrice;
    }
  };

  const faqs = [
    {
      question: "How does the one-time payment work?",
      answer: "Pay once and use the service for the duration you choose - 1 month, 3 months, 6 months, or 1 year. No recurring charges, no hidden fees. Just one simple payment!"
    },
    {
      question: "What happens after my plan expires?",
      answer: "Your photos and data remain accessible for 30 days after expiration. You can download everything or purchase an extension to keep access."
    },
    {
      question: "Can I extend my plan later?",
      answer: "Yes! You can purchase additional time at any point. We'll notify you before your plan expires so you don't lose access."
    },
    {
      question: "How does the face detection work?",
      answer: "Our AI automatically detects faces in uploaded photos. Guests can then upload their photo to find all pictures they appear in. It's secure, private, and incredibly accurate."
    },
    {
      question: "Do you offer custom packages?",
      answer: "Absolutely! For unique requirements or multiple events, contact our sales team for a custom quote tailored to your needs."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, Net Banking, and bank transfers. Enterprise clients can also pay via invoice."
    }
  ];

  const addons = [
    {
      name: "Extended Storage",
      description: "Keep your memories accessible for 5 years",
      price: 2999
    },
    {
      name: "Professional Videography",
      description: "Professional video editing and highlights",
      price: 14999
    },
    {
      name: "Custom Domain",
      description: "Use your own custom domain (e.g., ourwedding.com)",
      price: 1499
    },
    {
      name: "Advanced Analytics",
      description: "Detailed insights and engagement reports",
      price: 2499
    }
  ];

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
              <span className="text-green-600 font-semibold">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              From intimate gatherings to grand celebrations, we have a plan for every wedding. 
              One-time payment - no recurring charges!
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-2 bg-slate-100 p-1 rounded-full flex-wrap justify-center">
              {billingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setBillingPeriod(option.id)}
                  className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                    billingPeriod === option.id 
                      ? 'bg-white shadow-md font-semibold' 
                      : 'text-slate-600'
                  }`}
                >
                  {option.label}
                  {option.badge && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      {option.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                <Card className={`h-full border-2 hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'border-rose-500 shadow-xl scale-105' : 'hover:border-slate-300'
                }`}>
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-slate-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          ₹{getPlanPrice(plan).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        One-time payment for {selectedBillingOption.durationLabel}
                      </div>
                    </div>

                    <Link to="/company/contact">
                      <Button 
                        className={`w-full mb-6 ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700' 
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                      >
                        Get Started
                      </Button>
                    </Link>

                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Optional Add-ons</h2>
            <p className="text-xl text-slate-600">Enhance your package with these additional services</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {addons.map((addon, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{addon.name}</h3>
                    <p className="text-sm text-slate-600 mb-4">{addon.description}</p>
                    <div className="text-2xl font-bold text-rose-600">
                      ₹{addon.price.toLocaleString('en-IN')}
                      <span className="text-sm text-slate-500 font-normal">/one-time</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600">Everything you need to know about our pricing</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                        <p className="text-slate-600">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600">
        <div className="container mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Our team is here to help you choose the perfect plan for your special day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/company/contact">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-6"
                >
                  Contact Sales
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Schedule a Call
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;

