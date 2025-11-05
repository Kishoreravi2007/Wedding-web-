import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Calendar,
  Users,
  Sparkles
} from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      description: "Mon-Sat, 9 AM - 8 PM IST",
      value: "+91 XXX-XXX-XXXX",
      link: "tel:+91XXXXXXXXXX",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with our team instantly",
      value: "Start Chat",
      link: "#",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Schedule Demo",
      description: "Book a personalized demo call",
      value: "Book Now",
      link: "#",
      color: "from-rose-500 to-orange-500"
    }
  ];

  const offices = [
    {
      city: "Bangalore",
      address: "HSR Layout, Sector 1",
      country: "India",
      icon: <MapPin className="w-5 h-5" />
    },
    {
      city: "Mumbai",
      address: "Andheri West",
      country: "India",
      icon: <MapPin className="w-5 h-5" />
    },
    {
      city: "Delhi",
      address: "Connaught Place",
      country: "India",
      icon: <MapPin className="w-5 h-5" />
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.');
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
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/company" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              WeddingWeb
            </span>
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/company" className="hover:text-rose-500 transition-colors">Home</Link>
            <Link to="/company/about" className="hover:text-rose-500 transition-colors">About</Link>
            <Link to="/company/services" className="hover:text-rose-500 transition-colors">Services</Link>
            <Link to="/company/pricing" className="hover:text-rose-500 transition-colors">Pricing</Link>
            <Link to="/company/portfolio" className="hover:text-rose-500 transition-colors">Portfolio</Link>
            <Link to="/company/contact" className="text-rose-500 font-semibold">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-blue-600 font-semibold">Get in Touch</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Let's Make Your Wedding
              <br />
              Unforgettable Together
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Have questions? Want to see a demo? We're here to help you create 
              the perfect wedding experience for you and your guests.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                        />
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
                      className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700"
                    >
                      Send Message <Send className="ml-2 w-4 h-4" />
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
              {/* Office Locations */}
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Our Offices</h3>
                  </div>
                  <div className="space-y-4">
                    {offices.map((office, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="text-rose-500 mt-1">{office.icon}</div>
                        <div>
                          <div className="font-semibold">{office.city}</div>
                          <div className="text-sm text-slate-600">{office.address}</div>
                          <div className="text-sm text-slate-500">{office.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                      <span className="text-slate-600">9:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Saturday</span>
                      <span className="text-slate-600">10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Sunday</span>
                      <span className="text-slate-600">Closed</span>
                    </div>
                    <div className="mt-4 p-3 bg-rose-50 rounded-lg">
                      <p className="text-sm text-rose-700">
                        <Sparkles className="w-4 h-4 inline mr-1" />
                        24/7 support available for Premium & Enterprise customers
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Our team is always happy to help. Reach out and we'll get back to you within 24 hours!
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg px-8 py-6"
              asChild
            >
              <a href="mailto:help.weddingweb@gmail.com">
                <Mail className="mr-2 w-5 h-5" />
                Email Us Directly
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

