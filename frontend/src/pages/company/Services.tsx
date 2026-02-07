import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { LandingToolbar } from "@/components/LandingToolbar";
import {
  Camera,
  Sparkles,
  Video,
  Users,
  Clock,
  MessageSquare,
  Shield,
  Globe,
  Zap,
  CheckCircle2,
  BarChart,
  Download,
  Share2,
  Lock,
  Layout,
  Heart,
  FileText
} from "lucide-react";

const Services = () => {
  const documentationUrl = "https://github.com/Kishoreravi2007/Wedding-web-";
  const coreServices = [
    {
      icon: <Layout className="w-12 h-12" />,
      title: "Build Your Own Wedding Website",
      description: "Create a beautiful, personalized wedding website in minutes with our easy-to-use builder",
      color: "from-rose-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
      features: [
        "Drag-and-drop website builder",
        "Beautiful customizable templates",
        "Custom domain support",
        "Mobile-responsive design",
        "No coding required",
        "Real-time preview"
      ]
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: "AI-Powered Face Detection",
      description: "Revolutionary face recognition technology that helps guests find their photos instantly",
      color: "from-purple-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      features: [
        "Advanced facial recognition algorithms",
        "99%+ accuracy rate",
        "Instant photo matching",
        "Privacy-focused processing",
        "Works with any photo quality",
        "Multi-face detection"
      ]
    },
    {
      icon: <Camera className="w-12 h-12" />,
      title: "Smart Photo Gallery",
      description: "Beautiful, organized galleries that make sharing and downloading photos effortless",
      color: "from-blue-500 to-cyan-500",
      image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2070&auto=format&fit=crop",
      features: [
        "Unlimited photo storage",
        "Auto-categorization by event",
        "High-resolution downloads",
        "Mobile-optimized viewing",
        "Bulk download options",
        "Social media sharing"
      ]
    },
    {
      icon: <Video className="w-12 h-12" />,
      title: "Live Streaming",
      description: "Broadcast your special moments to family and friends around the world in real-time",
      color: "from-red-500 to-orange-500",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2073&auto=format&fit=crop",
      features: [
        "HD video streaming",
        "No viewer limits",
        "Multi-camera support",
        "Chat functionality",
        "Recording available",
        "Global CDN delivery"
      ]
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Photographer Portal",
      description: "Professional dashboard for photographers to upload and manage photos seamlessly",
      color: "from-green-500 to-emerald-500",
      image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=2070&auto=format&fit=crop",
      features: [
        "Bulk photo upload",
        "Automatic face processing",
        "Progress tracking",
        "Client management",
        "Analytics dashboard",
        "Secure file transfer"
      ]
    },
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "Digital Wishes",
      description: "Collect heartfelt messages and blessings from your guests in a beautiful digital guestbook",
      color: "from-pink-500 to-rose-500",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop",
      features: [
        "Customizable wish forms",
        "Moderation tools",
        "Multi-language support",
        "Voice message recording",
        "Photo attachments",
        "Download all wishes"
      ]
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: "Event Management",
      description: "Keep guests informed with detailed schedules, countdowns, and real-time updates",
      color: "from-indigo-500 to-purple-500",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
      features: [
        "Interactive event timeline",
        "Countdown timers",
        "Venue information",
        "RSVP management",
        "Push notifications",
        "Calendar integration"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Language",
      description: "Support for 20+ languages worldwide"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized for speed and performance"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Detailed insights and engagement metrics"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Easy Downloads",
      description: "One-click download for all your photos"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Social Sharing",
      description: "Share directly to social media platforms"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Privacy Controls",
      description: "Granular privacy and access controls"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Create Your Wedding Website",
      description: "Sign up and customize your beautiful wedding website with our easy drag-and-drop builder - no coding needed!"
    },
    {
      step: "2",
      title: "Add Your Content",
      description: "Upload photos, set your event schedule, add venue details, and share your love story"
    },
    {
      step: "3",
      title: "Enable AI Features",
      description: "Our smart AI automatically organizes photos and helps guests find themselves using face detection"
    },
    {
      step: "4",
      title: "Go Live & Share",
      description: "Launch your website, share the link with guests, and let them enjoy the magic of instant photo discovery"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Navigation */}
      <CompanyNavbar />

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
              <div className="inline-block mb-6 px-4 py-2 bg-purple-100 rounded-full">
                <span className="text-purple-600 font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Comprehensive Suite
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Everything You Need<br />for Your Perfect Wedding
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                From AI-powered photo discovery to live streaming, we provide all the tools
                to make your wedding unforgettable and accessible to everyone.
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
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
                  alt="Wedding Features"
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -left-10 w-full h-full bg-purple-200/50 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="space-y-16">
            {coreServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-2 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                      <div className={`p-8 md:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-6`}>
                          {service.icon}
                        </div>
                        <h3 className="text-3xl font-bold mb-4">{service.title}</h3>
                        <p className="text-lg text-slate-600 mb-6">{service.description}</p>
                        <div className="space-y-3">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                              <span className="text-slate-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`relative overflow-hidden ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover min-h-[400px]"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-30`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Plus Many More Features</h2>
            <p className="text-xl text-slate-600">Everything you need, all in one platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Get started in 4 simple steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </CardContent>
                </Card>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-rose-500 to-purple-600" />
                  </div>
                )}
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
            className="bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 rounded-[2.5rem] p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Experience the Magic?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Be one of our early customers and experience the future of wedding technology
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/company/pricing">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-6 shadow-xl font-bold transition-transform hover:scale-105"
                  >
                    View Pricing Plans <Share2 className="ml-2 w-5 h-5" />
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
                  <Link
                    to="/company/guide"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Platform Guide
                  </Link>
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

export default Services;

