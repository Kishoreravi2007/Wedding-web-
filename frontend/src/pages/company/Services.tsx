import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Heart, 
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
  Lock
} from "lucide-react";

const Services = () => {
  const coreServices = [
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: "AI-Powered Face Detection",
      description: "Revolutionary face recognition technology that helps guests find their photos instantly",
      color: "from-purple-500 to-pink-500",
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
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Admin Portal",
      description: "Comprehensive admin dashboard for full control"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Sign Up & Setup",
      description: "Create your account and customize your wedding website in minutes"
    },
    {
      step: "2",
      title: "Invite Your Photographer",
      description: "Give your photographer access to upload photos directly"
    },
    {
      step: "3",
      title: "AI Processing",
      description: "Our AI automatically detects faces and organizes photos"
    },
    {
      step: "4",
      title: "Share with Guests",
      description: "Guests can find their photos instantly using their face"
    }
  ];

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
            <Link to="/company/services" className="text-rose-500 font-semibold">Services</Link>
            <Link to="/company/pricing" className="hover:text-rose-500 transition-colors">Pricing</Link>
            <Link to="/company/portfolio" className="hover:text-rose-500 transition-colors">Portfolio</Link>
            <Link to="/company/contact" className="hover:text-rose-500 transition-colors">Contact</Link>
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
            <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full">
              <span className="text-purple-600 font-semibold">Our Services</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Everything You Need<br />for Your Perfect Wedding
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From AI-powered photo discovery to live streaming, we provide all the tools 
              to make your wedding unforgettable and accessible to everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-20 px-4">
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
                      <div className={`bg-gradient-to-br ${service.color} flex items-center justify-center p-12 ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                        <div className="text-white text-8xl opacity-20">
                          {service.icon}
                        </div>
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
      <section className="py-20 px-4 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600">
        <div className="container mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Experience the Magic?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of couples who chose WeddingWeb for their special day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/company/pricing">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-6"
                >
                  View Pricing Plans
                </Button>
              </Link>
              <Link to="/company/contact">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  Request a Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;

