import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CompanyNavSimple from "@/components/CompanyNavSimple";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Check,
  Sparkles,
  Camera,
  Users,
  Video,
  Globe,
  Zap,
  Heart,
  Shield,
  Calendar,
  Image,
  MessageSquare,
  Radio,
  Music,
  Gift,
  Bell,
  FileText,
  Download,
  Cloud,
  Smartphone,
  Mail,
  Phone,
  Star
} from "lucide-react";
import { useState } from "react";

interface PricingFeature {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  category: 'core' | 'features' | 'addons' | 'premium';
  popular?: boolean;
}

const pricingFeatures: PricingFeature[] = [
  // Core Features - Essential
  {
    id: 'website',
    name: 'Wedding Website',
    description: 'Beautiful, responsive wedding website with custom domain',
    price: 4999,
    icon: <Globe className="w-5 h-5" />,
    category: 'core',
    popular: true
  },
  {
    id: 'photo-gallery',
    name: 'Photo Gallery',
    description: 'Unlimited photo storage (up to 100GB) with organized galleries',
    price: 2999,
    icon: <Image className="w-5 h-5" />,
    category: 'core',
    popular: true
  },
  {
    id: 'event-schedule',
    name: 'Event Schedule',
    description: 'Interactive timeline with multiple events and RSVP',
    price: 1999,
    icon: <Calendar className="w-5 h-5" />,
    category: 'core'
  },
  {
    id: 'wishes',
    name: 'Digital Wishes',
    description: 'Guest wish collection with moderation and display',
    price: 1499,
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'core'
  },
  {
    id: 'music-player',
    name: 'Music Player',
    description: 'Background music player with custom playlist',
    price: 999,
    icon: <Music className="w-5 h-5" />,
    category: 'core'
  },
  
  // Advanced Features
  {
    id: 'face-detection',
    name: 'AI Face Detection',
    description: 'Smart face recognition - guests find their photos instantly',
    price: 4999,
    icon: <Sparkles className="w-5 h-5" />,
    category: 'features',
    popular: true
  },
  {
    id: 'live-streaming',
    name: 'Live Streaming (HD)',
    description: 'HD live streaming for up to 500 concurrent viewers',
    price: 6999,
    icon: <Video className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'photographer-portal',
    name: 'Photographer Portal',
    description: 'Dedicated portal for photographers to upload & manage photos',
    price: 3999,
    icon: <Camera className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'live-sync',
    name: 'Live Photo Sync',
    description: 'Real-time photo upload from cameras via desktop app',
    price: 5999,
    icon: <Radio className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'photo-booth',
    name: 'Photo Booth',
    description: 'Interactive photo booth with instant sharing',
    price: 3499,
    icon: <Camera className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'guest-management',
    name: 'Guest Management',
    description: 'Guest list management with RSVP tracking',
    price: 2499,
    icon: <Users className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'notifications',
    name: 'Push Notifications',
    description: 'Send updates and reminders to guests',
    price: 1999,
    icon: <Bell className="w-5 h-5" />,
    category: 'features'
  },
  
  // Premium Features
  {
    id: 'custom-branding',
    name: 'Custom Branding',
    description: 'Fully customized design, colors, fonts, and logo',
    price: 8999,
    icon: <Heart className="w-5 h-5" />,
    category: 'premium'
  },
  {
    id: 'custom-domain',
    name: 'Custom Domain',
    description: 'Use your own domain (e.g., ourwedding.com)',
    price: 1999,
    icon: <Globe className="w-5 h-5" />,
    category: 'premium'
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Native iOS & Android app for your wedding',
    price: 14999,
    icon: <Smartphone className="w-5 h-5" />,
    category: 'premium'
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Detailed insights, engagement reports, and visitor stats',
    price: 2999,
    icon: <FileText className="w-5 h-5" />,
    category: 'premium'
  },
  
  // Add-ons
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: '24/7 priority customer support with dedicated manager',
    price: 3999,
    icon: <Shield className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'extended-storage',
    name: 'Extended Storage (5 years)',
    description: 'Keep all photos accessible for 5 years',
    price: 4999,
    icon: <Cloud className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'backup-restore',
    name: 'Backup & Restore',
    description: 'Automatic backups and easy data restoration',
    price: 2499,
    icon: <Download className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    description: 'Send beautiful email invitations and updates',
    price: 2999,
    icon: <Mail className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'sms-notifications',
    name: 'SMS Notifications',
    description: 'Send SMS updates to guests (1000 messages)',
    price: 1999,
    icon: <Phone className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'gift-registry',
    name: 'Gift Registry',
    description: 'Create and manage your wedding gift registry',
    price: 3499,
    icon: <Gift className="w-5 h-5" />,
    category: 'addons'
  }
];

const Pricing = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

  const toggleFeature = (featureId: string) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId);
    } else {
      newSelected.add(featureId);
    }
    setSelectedFeatures(newSelected);
  };

  const calculateSubtotal = () => {
    let subtotal = 0;
    selectedFeatures.forEach((featureId) => {
      const feature = pricingFeatures.find((f) => f.id === featureId);
      if (feature) {
        subtotal += feature.price;
      }
    });
    return subtotal;
  };

  const calculateGST = (subtotal: number) => {
    return Math.round(subtotal * 0.18);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const gst = calculateGST(subtotal);
    return subtotal + gst;
  };

  const getFeaturesByCategory = (category: 'core' | 'features' | 'addons' | 'premium') => {
    return pricingFeatures.filter((f) => f.category === category);
  };

  const subtotal = calculateSubtotal();
  const gst = calculateGST(subtotal);
  const total = calculateTotal();

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
              <span className="text-green-600 font-semibold">Customizable Pricing</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Build Your Perfect Package
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Choose only the features you need. Pay for what you use - transparent pricing with no hidden costs!
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-2 border-rose-100">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-rose-500" />
                    Core Features
                    <Badge variant="secondary" className="ml-auto">Essential</Badge>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Essential features for your wedding website</p>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {getFeaturesByCategory('core').map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        selectedFeatures.has(feature.id)
                          ? 'border-rose-500 bg-rose-50 shadow-md'
                          : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <Checkbox
                        checked={selectedFeatures.has(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-rose-500">{feature.icon}</div>
                          <h3 className="font-semibold text-lg">{feature.name}</h3>
                          {feature.popular && (
                            <Badge className="bg-rose-500 text-white text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                        <p className="text-xl font-bold text-rose-600">
                          ₹{feature.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Advanced Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Zap className="w-6 h-6 text-purple-500" />
                    Advanced Features
                    <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Powerful features to enhance your wedding experience</p>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {getFeaturesByCategory('features').map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        selectedFeatures.has(feature.id)
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <Checkbox
                        checked={selectedFeatures.has(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-purple-500">{feature.icon}</div>
                          <h3 className="font-semibold text-lg">{feature.name}</h3>
                          {feature.popular && (
                            <Badge className="bg-purple-500 text-white text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                        <p className="text-xl font-bold text-purple-600">
                          ₹{feature.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-2 border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Star className="w-6 h-6 text-indigo-500" />
                    Premium Features
                    <Badge variant="secondary" className="ml-auto">Luxury</Badge>
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Premium features for an extraordinary wedding experience</p>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {getFeaturesByCategory('premium').map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        selectedFeatures.has(feature.id)
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <Checkbox
                        checked={selectedFeatures.has(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-indigo-500">{feature.icon}</div>
                          <h3 className="font-semibold text-lg">{feature.name}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                        <p className="text-xl font-bold text-indigo-600">
                          ₹{feature.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Add-ons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Heart className="w-6 h-6 text-slate-500" />
                    Optional Add-ons
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Extra services to make your wedding even more special</p>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {getFeaturesByCategory('addons').map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        selectedFeatures.has(feature.id)
                          ? 'border-slate-500 bg-slate-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <Checkbox
                        checked={selectedFeatures.has(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-slate-500">{feature.icon}</div>
                          <h3 className="font-semibold text-lg">{feature.name}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                        <p className="text-xl font-bold text-slate-600">
                          ₹{feature.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="sticky top-24"
            >
              <Card className="border-2 border-rose-200 shadow-2xl bg-gradient-to-br from-white to-rose-50/30">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Your Package
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {selectedFeatures.size === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="font-medium">Select features to build your package</p>
                      <p className="text-sm mt-2">Start with Core Features for best value</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {Array.from(selectedFeatures).map((featureId) => {
                          const feature = pricingFeatures.find((f) => f.id === featureId);
                          if (!feature) return null;
                          return (
                            <div
                              key={featureId}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">{feature.name}</span>
                              </div>
                              <span className="text-sm font-bold text-rose-600 ml-2 flex-shrink-0">
                                ₹{feature.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t-2 border-slate-200 pt-4 space-y-3 bg-white rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-base">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-semibold text-slate-800">
                              ₹{subtotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-base">
                            <span className="text-slate-600">GST (18%)</span>
                            <span className="font-semibold text-slate-800">
                              ₹{gst.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="border-t-2 border-rose-200 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-slate-900">Total Amount</span>
                            <span className="text-3xl font-bold text-rose-600">
                              ₹{total.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            One-time payment • No recurring charges • All prices in INR
                          </p>
                        </div>
                        <Link to="/company/contact" className="block">
                          <Button
                            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                            size="lg"
                          >
                            Get Started Now
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full border-2"
                          onClick={() => setSelectedFeatures(new Set())}
                        >
                          Clear All
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600">
        <div className="container mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Need Help Choosing?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Our team is here to help you build the perfect package for your special day
            </p>
            <Link to="/company/contact">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-6"
              >
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
