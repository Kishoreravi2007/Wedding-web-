import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { WeddingWebHeader } from "@/components/WeddingWebHeader";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Calendar,
  Users,
  Sparkles,
  FileText,
  Heart
} from "lucide-react";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";

// Common country codes
const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+7', country: 'Russia/Kazakhstan', flag: '🇷🇺' },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91', // Default to India
    eventDate: '',
    guestCount: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      description: "Get a response within 24 hours",
      value: "help.weddingweb@gmail.com",
      link: "mailto:help.weddingweb@gmail.com",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      description: "Mon-Fri: After 4:30 PM | Sat-Sun: Anytime",
      value: "+91 79071 77841",
      link: "tel:+917907177841",
      color: "from-green-500 to-emerald-500"
    }
  ];


  const faqs = [
    {
      question: "How quickly can I get started?",
      answer: "You can set up your wedding website in under 10 minutes! Sign up, customize your page, and start inviting guests."
    },
    {
      question: "Do you offer demos?",
      answer: "Yes! We offer personalized demo calls where we walk you through the entire platform and answer all your questions."
    },
    {
      question: "What if I need help on my wedding day?",
      answer: "All plans include dedicated support. Premium and Enterprise plans get 24/7 priority support with a direct line to our team."
    },
    {
      question: "Can I try before I buy?",
      answer: "Absolutely! We offer a 14-day free trial with access to all features. No credit card required."
    }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      // Combine country code with phone number
      const phoneWithCode = formData.phone
        ? `${formData.countryCode} ${formData.phone}`.trim()
        : '';

      const payload = {
        ...formData,
        phone: phoneWithCode,
      };

      const response = await fetch(`${API_BASE_URL}/api/contact-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error or server not responding' }));
        console.error('Server error:', errorData);
        alert(`Error: ${errorData.error || 'Server error. Please check if the backend is running.'}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert('Thank you for contacting us! We\'ll get back to you within 24 hours.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          countryCode: '+91',
          eventDate: '',
          guestCount: '',
          message: ''
        });
      } else {
        console.error('Form submission failed:', data);
        alert(`Error: ${data.error || 'Something went wrong. Please try again or email us directly.'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Network error: Could not connect to server. Please make sure the backend server is running on port 5001.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
              <div className="inline-block mb-6 px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-blue-600 font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Get in Touch
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Let's Make Your<br />Wedding Unforgettable
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                Have questions? Want to see a demo? We're here to help you create
                the perfect wedding experience for you and your guests.
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
                  src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=2070&auto=format&fit=crop"
                  alt="Contact Support"
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -left-10 w-full h-full bg-blue-200/50 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <a href={method.link} className="block">
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-rose-200">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${method.color} flex items-center justify-center text-white mb-4 mx-auto`}>
                        {method.icon}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{method.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{method.description}</p>
                      <p className="text-rose-600 font-semibold">{method.value}</p>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white">
                      <Send className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold">Send us a Message</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700">
                        Your Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John & Jane Doe"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                          Email *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                          Phone
                        </label>
                        <div className="flex gap-2">
                          <Select
                            value={formData.countryCode}
                            onValueChange={(value) =>
                              setFormData({ ...formData, countryCode: value })
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue>
                                {(() => {
                                  const selected = countryCodes.find(c => c.code === formData.countryCode);
                                  return selected ? (
                                    <span className="flex items-center gap-1.5">
                                      <span>{selected.flag}</span>
                                      <span>{selected.code}</span>
                                    </span>
                                  ) : formData.countryCode;
                                })()}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {countryCodes.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  <span className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span className="font-medium">{country.code}</span>
                                    <span className="text-xs text-slate-500 ml-1">
                                      {country.country}
                                    </span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="XXXXX XXXXX"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                          Event Date
                        </label>
                        <Input
                          name="eventDate"
                          type="date"
                          value={formData.eventDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-slate-700">
                          Guest Count
                        </label>
                        <Input
                          name="guestCount"
                          type="number"
                          value={formData.guestCount}
                          onChange={handleChange}
                          placeholder="e.g., 300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700">
                        Your Message *
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your wedding plans and how we can help..."
                        required
                        rows={5}
                        className="w-full"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'} <Send className="ml-2 w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Info Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Business Hours */}
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Business Hours</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Monday - Friday</span>
                      <span className="text-slate-600">After 4:30 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Saturday & Sunday</span>
                      <span className="text-slate-600">Anytime</span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <Sparkles className="w-4 h-4 inline mr-1" />
                        100% online service - No physical offices
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-2 shadow-lg bg-gradient-to-br from-rose-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-left"
                      asChild
                    >
                      <Link to="/company/pricing">
                        <Users className="w-4 h-4 mr-2" />
                        View Pricing Plans
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-left"
                      asChild
                    >
                      <Link to="/company/portfolio">
                        <Sparkles className="w-4 h-4 mr-2" />
                        See Success Stories
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule a Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Quick Answers</h2>
            <p className="text-xl text-slate-600">Common questions before reaching out</p>
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
                    <h3 className="font-bold text-lg mb-2 text-slate-800">{faq.question}</h3>
                    <p className="text-slate-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

export default Contact;

