import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Camera, 
  Users, 
  Sparkles, 
  Video, 
  Heart, 
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star
} from "lucide-react";

const CompanyLanding = () => {
  const features = [
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
    "Professional admin dashboard",
    "24/7 technical support"
  ];

  const testimonials = [
    {
      name: "Priya & Rahul",
      event: "Wedding • Mumbai",
      text: "The face detection feature was a game-changer! Our 500+ guests could instantly find their photos. Simply amazing!",
      rating: 5
    },
    {
      name: "Sarah & Michael",
      event: "Wedding • Bangalore",
      text: "Our international family could join via live stream. The platform made our wedding truly global and inclusive.",
      rating: 5
    },
    {
      name: "Anjali & Karthik",
      event: "Reception • Chennai",
      text: "The photographer portal made collaboration seamless. We had 10,000+ photos organized perfectly within hours!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              WeddingWeb
            </span>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/company" className="hover:text-rose-500 transition-colors">Home</Link>
            <Link to="/company/about" className="hover:text-rose-500 transition-colors">About</Link>
            <Link to="/company/services" className="hover:text-rose-500 transition-colors">Services</Link>
            <Link to="/company/pricing" className="hover:text-rose-500 transition-colors">Pricing</Link>
            <Link to="/company/portfolio" className="hover:text-rose-500 transition-colors">Portfolio</Link>
            <Link to="/company/contact" className="hover:text-rose-500 transition-colors">Contact</Link>
            <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700">
              Book a Demo
            </Button>
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
              The complete wedding platform with AI face detection, smart galleries, 
              live streaming, and more. Make every moment memorable and accessible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg px-8 py-6"
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:border-rose-500 hover:text-rose-500"
              >
                Watch Demo Video
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
              <div className="text-4xl font-bold text-rose-600">10K+</div>
              <div className="text-slate-600 mt-1">Events Hosted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">99.9%</div>
              <div className="text-slate-600 mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">5M+</div>
              <div className="text-slate-600 mt-1">Photos Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-600">50+</div>
              <div className="text-slate-600 mt-1">Countries</div>
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
                  Trusted by Thousands
                </span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose WeddingWeb?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                We combine cutting-edge technology with intuitive design to create 
                the perfect platform for your special day.
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
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-rose-400 via-purple-400 to-indigo-400 p-1">
                <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center">
                  <Camera className="w-32 h-32 text-slate-300" />
                </div>
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
              Loved by Couples Worldwide
            </h2>
            <p className="text-xl text-slate-600">
              See what our clients say about their experience
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
              Join thousands of couples who trust WeddingWeb to make their special day unforgettable
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
                <li><a href="mailto:help.weddingweb@gmail.com" className="hover:text-white">help.weddingweb@gmail.com</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 WeddingWeb. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CompanyLanding;

