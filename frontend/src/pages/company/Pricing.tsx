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
  HelpCircle,
  Calendar,
  Clock,
  Phone,
  UserRound,
  Mail,
  Globe
} from "lucide-react";
import { useState, ChangeEvent, FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

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

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    timezone: 'Asia/Kolkata',
    message: ''
  });
  const { toast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const timezoneOptions = [
    'Asia/Kolkata',
    'Asia/Dubai',
    'Asia/Singapore',
    'Europe/London',
    'America/New_York'
  ];

  const handleScheduleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/call-schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...scheduleForm,
          preferredDate: scheduleForm.preferredDate,
          preferredTime: scheduleForm.preferredTime,
          source: 'pricing-page'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Call scheduled!',
          description: 'Our team will reach out to confirm the meeting.'
        });
        setScheduleForm({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '',
          timezone: 'Asia/Kolkata',
          message: ''
        });
        setScheduleDialogOpen(false);
      } else {
        if (data.error === 'CALL_SCHEDULES_TABLE_MISSING') {
          toast({
            title: 'Setup required in Supabase',
            description: 'Create the "call_schedules" table by running SUPABASE_CALL_SCHEDULES_SETUP.sql.',
            variant: 'destructive'
          });
          return;
        }
        toast({
          title: 'Something went wrong',
          description: data.error || 'Please try again later.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsScheduling(false);
    }
  };

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
              <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                  >
                    Schedule a Call
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule a Live Demo Call</DialogTitle>
                    <DialogDescription>
                      Tell us a bit about your wedding and we’ll confirm a call within 24 hours.
                    </DialogDescription>
                  </DialogHeader>

                  <form className="space-y-4" onSubmit={handleScheduleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schedule-name" className="flex items-center gap-2">
                          <UserRound className="w-4 h-4" />
                          Name *
                        </Label>
                        <Input
                          id="schedule-name"
                          name="name"
                          value={scheduleForm.name}
                          onChange={handleScheduleChange}
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="schedule-email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email *
                        </Label>
                        <Input
                          id="schedule-email"
                          name="email"
                          type="email"
                          value={scheduleForm.email}
                          onChange={handleScheduleChange}
                          placeholder="you@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schedule-phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone / WhatsApp
                        </Label>
                        <Input
                          id="schedule-phone"
                          name="phone"
                          value={scheduleForm.phone}
                          onChange={handleScheduleChange}
                          placeholder="+91 95441 43072"
                        />
                      </div>
                      <div>
                        <Label htmlFor="schedule-timezone" className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Timezone
                        </Label>
                        <select
                          id="schedule-timezone"
                          name="timezone"
                          value={scheduleForm.timezone}
                          onChange={handleScheduleChange}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {timezoneOptions.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schedule-date" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Preferred Date *
                        </Label>
                        <Input
                          id="schedule-date"
                          name="preferredDate"
                          type="date"
                          value={scheduleForm.preferredDate}
                          onChange={handleScheduleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="schedule-time" className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Preferred Time
                        </Label>
                        <Input
                          id="schedule-time"
                          name="preferredTime"
                          type="time"
                          value={scheduleForm.preferredTime}
                          onChange={handleScheduleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="schedule-message" className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Anything specific you’d like to see?
                      </Label>
                      <Textarea
                        id="schedule-message"
                        name="message"
                        value={scheduleForm.message}
                        onChange={handleScheduleChange}
                        placeholder="Share your priorities, guest size, or custom requirements..."
                        rows={4}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <Button 
                        type="submit" 
                        size="lg"
                        className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 flex-1"
                        disabled={isScheduling}
                      >
                        {isScheduling ? 'Booking your slot...' : 'Confirm Call'}
                      </Button>
                      <p className="text-sm text-slate-500">
                        We typically respond within 12 hours.
                      </p>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;

