import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import CompanyNavSimple from "@/components/CompanyNavSimple";
import {
  Camera,
  Users,
  Sparkles,
  Video,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Globe,
  Heart,
  FileText
} from "lucide-react";

const CompanyLanding = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  const documentationUrl = `${API_BASE_URL.replace(/\/$/, "")}/backend/docs/WeddingWeb_Customer_Documentation_Final.pdf`;

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Build Your Wedding Website",
      description: "Create a stunning, personalized wedding website in minutes with our drag-and-drop builder",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Face Detection",
      description: "Guests can instantly find their photos using our advanced face recognition technology",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Smart Photo Gallery",
      description: "Organized, searchable galleries that make sharing memories effortless",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Live Streaming",
      description: "Let distant family and friends join the celebration in real-time",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Photographer Portal",
      description: "Dedicated portal for photographers to upload and manage photos seamlessly",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Digital Wishes",
      description: "Collect heartfelt messages from guests in a beautiful digital guestbook",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Event Scheduling",
      description: "Keep guests informed with detailed event schedules and countdown timers",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const benefits = [
    "No app installation required - works on any device",
    "Secure cloud storage for all memories",
    "Multi-language support for diverse guests",
    "Real-time photo uploads during events",
    "Professional dashboards for couples and photographers",
    "24/7 technical support"
  ];

  const testimonials = [
    {
      name: "Sreedevi & Vaishag",
      event: "Wedding • January 11, 2026 • Kerala",
      text: "WeddingWeb made our wedding so special! Our guests loved being able to find their photos instantly using face detection. The website builder was super easy to use!",
      rating: 5
    },
    {
      name: "Parvathy & Hari",
      event: "Wedding • January 04, 2026 • Kerala",
      text: "As early customers, we got amazing personalized service. The team helped us every step of the way. Our families abroad could watch the live stream - it was perfect!",
      rating: 5
    },
    {
      name: "Your Wedding Here",
      event: "Coming Soon",
      text: "Join our growing family! We're offering special early-bird pricing and dedicated support for our next customers. Be part of our success story!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <CompanyNavSimple />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-4 py-2 bg-rose-100 rounded-full">
              <span className="text-rose-600 font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI-Powered Wedding Technology
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Transform Your Wedding
              <br />
              Into a Digital Experience
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Build your own personalized wedding website with AI face detection, smart galleries, 
              live streaming, and more. Join us in revolutionizing wedding experiences!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/company/contact">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg px-8 py-6"
                >
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 text-lg px-8 py-6"
                asChild
              >
                <a href={documentationUrl} target="_blank" rel="noopener noreferrer">
                  View Customer Guide <FileText className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
          >
            <div>
              <div className="text-4xl font-bold text-rose-600">2</div>
              <div className="text-slate-600 mt-1">Happy Couples</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">100%</div>
              <div className="text-slate-600 mt-1">Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">AI</div>
              <div className="text-slate-600 mt-1">Powered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-600">2025</div>
              <div className="text-slate-600 mt-1">Just Started</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to make your wedding unforgettable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-rose-200">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full">
                <span className="text-purple-600 font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Fresh Startup, Big Vision
                </span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose WeddingWeb?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                We're a new startup combining cutting-edge technology with intuitive design. 
                Be one of our early customers and help shape the future of wedding technology!
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-slate-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
                  alt="Happy wedding couple celebration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-indigo-500/10" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border-2 border-slate-100">
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>100% Secure</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Early Customer Reviews
            </h2>
            <p className="text-xl text-slate-600">
              Join our growing community of happy couples
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
                    <div className="border-t pt-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.event}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Create Magic?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Be an early adopter! Get special pricing and help us build the future of wedding technology together
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-6"
              >
                Start Your Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Schedule a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-rose-500" />
                <span className="text-xl font-bold">WeddingWeb</span>
              </div>
              <p className="text-slate-400">
                Making weddings memorable with cutting-edge technology
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/company/services" className="hover:text-white">Features</Link></li>
                <li><Link to="/company/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/company/portfolio" className="hover:text-white">Portfolio</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/company/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/company/contact" className="hover:text-white">Contact</Link></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a
                    href={documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Documentation
                  </a>
                </li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><Link to="/company/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 space-y-2">
            <p>&copy; 2025 WeddingWeb. All rights reserved.</p>
            <p className="text-sm">Made with love from Kerala ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CompanyLanding;

