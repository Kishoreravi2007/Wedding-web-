import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import CompanyNavSimple from "@/components/CompanyNavSimple";
import { LandingToolbar } from "@/components/LandingToolbar";
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
    <div className="min-h-screen bg-slate-50/50">
      {/* Navigation */}
      <CompanyNavSimple />

      {/* Sidebar Toolbar */}
      <LandingToolbar />

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
              <div className="inline-block mb-6 px-4 py-2 bg-rose-100 rounded-full">
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
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                Build your own personalized wedding website with AI face detection, smart galleries,
                live streaming, and more. Join us in revolutionizing wedding experiences!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/company/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg px-8 py-6 h-auto shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all hover:-translate-y-1"
                  >
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-200 text-slate-700 hover:border-rose-200 hover:bg-rose-50 text-lg px-8 py-6 h-auto transition-all hover:-translate-y-1"
                  asChild
                >
                  <a href={documentationUrl} target="_blank" rel="noopener noreferrer">
                    View Customer Guide <FileText className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </div>

              <div className="mt-12 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span>4.9/5 Average Rating</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:ml-auto w-full max-w-[600px] mx-auto"
            >
              {/* Main Banner Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
                  alt="Wedding Couple"
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-8 -top-8 hidden lg:flex h-32 w-32 rounded-full border-2 border-dashed border-rose-200 items-center justify-center opacity-60 pointer-events-none"
              >
                <div className="h-24 w-24 rounded-full bg-rose-50/50 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-rose-400" />
                </div>
              </motion.div>

              {/* Profile Overlay Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 md:bottom-8 md:-left-12 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 max-w-[280px] w-full"
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-rose-50 flex items-center justify-center">
                    <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight text-lg">WeddingWeb</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Globe className="h-3 w-3" />
                      <span>Global Platform</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs font-medium ml-1 text-slate-700">5.0</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100/50">
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
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-rose-100 group">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
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
              <h2 className="text-4xl font-bold mb-6 text-slate-900">
                Why Choose WeddingWeb?
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
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
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="bg-green-100 rounded-full p-1 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    </div>
                    <span className="text-slate-700 font-medium">{benefit}</span>
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
              <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop"
                  alt="Happy wedding couple celebration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center gap-3 text-green-600 font-bold text-lg">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span>100% Secure</span>
                </div>
              </div>
              {/* Abstract decoration */}
              <div className="absolute -z-10 top-10 -left-10 w-full h-full bg-rose-200/50 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-slate-50">
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
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-none shadow-md">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-6 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{testimonial.name}</div>
                        <div className="text-sm text-slate-500">{testimonial.event}</div>
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
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 rounded-[2.5rem] p-12 md:p-24 text-center text-white shadow-2xl"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Ready to Create Magic?
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Be an early adopter! Get special pricing and help us build the future of wedding technology together
              </p>
              <div className="flex justify-center">
                <Link to="/company/signup">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-12 py-6 h-auto shadow-xl font-bold transition-transform hover:scale-105"
                  >
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
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
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6 text-white">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <a
                    href={documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Documentation
                  </a>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link to="/company/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 space-y-2">
            <p>&copy; 2025 WeddingWeb. All rights reserved.</p>
            <p className="text-sm flex items-center justify-center gap-2">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in Kerala
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CompanyLanding;

