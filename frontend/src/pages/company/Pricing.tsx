import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CompanyNavSimple from "@/components/CompanyNavSimple";
import { Checkbox } from "@/components/ui/checkbox";
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
  Radio
} from "lucide-react";
import { useState } from "react";

interface PricingFeature {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  category: 'core' | 'features' | 'addons';
}

const pricingFeatures: PricingFeature[] = [
  // Core Features
  {
    id: 'website',
    name: 'Wedding Website',
    description: 'Beautiful, customizable wedding website',
    price: 2999,
    icon: <Globe className="w-5 h-5" />,
    category: 'core'
  },
  {
    id: 'photo-gallery',
    name: 'Photo Gallery',
    description: 'Unlimited photo storage and gallery',
    price: 1999,
    icon: <Image className="w-5 h-5" />,
    category: 'core'
  },
  {
    id: 'event-schedule',
    name: 'Event Schedule',
    description: 'Interactive event timeline and schedule',
    price: 999,
    icon: <Calendar className="w-5 h-5" />,
    category: 'core'
  },
  {
    id: 'wishes',
    name: 'Digital Wishes',
    description: 'Guest wish collection and display',
    price: 499,
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'core'
  },
  
  // Advanced Features
  {
    id: 'face-detection',
    name: 'AI Face Detection',
    description: 'Smart face recognition for photo search',
    price: 2999,
    icon: <Sparkles className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'live-streaming',
    name: 'Live Streaming',
    description: 'HD live streaming for remote guests',
    price: 3999,
    icon: <Video className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'photographer-portal',
    name: 'Photographer Portal',
    description: 'Dedicated portal for photographers',
    price: 2499,
    icon: <Camera className="w-5 h-5" />,
    category: 'features'
  },
  {
    id: 'live-sync',
    name: 'Live Photo Sync',
    description: 'Real-time photo upload from cameras',
    price: 3499,
    icon: <Radio className="w-5 h-5" />,
    category: 'features'
  },
  
  // Add-ons
  {
    id: 'custom-domain',
    name: 'Custom Domain',
    description: 'Use your own domain name',
    price: 1499,
    icon: <Globe className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'custom-branding',
    name: 'Custom Branding',
    description: 'Fully customized design and colors',
    price: 4999,
    icon: <Heart className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: '24/7 priority customer support',
    price: 1999,
    icon: <Shield className="w-5 h-5" />,
    category: 'addons'
  },
  {
    id: 'extended-storage',
    name: 'Extended Storage (5 years)',
    description: 'Keep photos accessible for 5 years',
    price: 2999,
    icon: <Zap className="w-5 h-5" />,
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

  const calculateTotal = () => {
    let total = 0;
    selectedFeatures.forEach((featureId) => {
      const feature = pricingFeatures.find((f) => f.id === featureId);
      if (feature) {
        total += feature.price;
      }
    });
    return total;
  };

  const getFeaturesByCategory = (category: 'core' | 'features' | 'addons') => {
    return pricingFeatures.filter((f) => f.category === category);
  };

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
              Choose only the features you need. Pay for what you use - no hidden costs!
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Core Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-rose-500" />
                    Core Features
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Essential features for your wedding website</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getFeaturesByCategory('core').map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:border-rose-300 hover:bg-rose-50/50 transition-all cursor-pointer"
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
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                        <p className="text-lg font-bold text-rose-600">
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Zap className="w-6 h-6 text-purple-500" />
                    Advanced Features
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Powerful features to enhance your wedding experience</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getFeaturesByCategory('features').map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer"
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
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                        <p className="text-lg font-bold text-purple-600">
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
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Heart className="w-6 h-6 text-indigo-500" />
                    Optional Add-ons
                  </CardTitle>
                  <p className="text-slate-600 mt-2">Extra services to make your wedding even more special</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getFeaturesByCategory('addons').map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer"
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
                        <p className="text-lg font-bold text-indigo-600">
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
              transition={{ duration: 0.6, delay: 0.4 }}
              className="sticky top-24"
            >
              <Card className="border-2 border-rose-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedFeatures.size === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>Select features to build your package</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Array.from(selectedFeatures).map((featureId) => {
                          const feature = pricingFeatures.find((f) => f.id === featureId);
                          if (!feature) return null;
                          return (
                            <div
                              key={featureId}
                              className="flex items-center justify-between p-2 bg-slate-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium">{feature.name}</span>
                              </div>
                              <span className="text-sm font-bold text-rose-600">
                                ₹{feature.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-2xl text-rose-600">
                            ₹{total.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          One-time payment • No recurring charges
                        </p>
                        <Link to="/company/contact" className="block">
                          <Button
                            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg py-6"
                            size="lg"
                          >
                            Get Started
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedFeatures(new Set())}
                        >
                          Clear Selection
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
