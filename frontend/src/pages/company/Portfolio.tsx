import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Star,
  Users,
  Camera,
  TrendingUp,
  MapPin,
  Calendar,
  Quote
} from "lucide-react";

const Portfolio = () => {
  const caseStudies = [
    {
      couple: "Sreedevi & Vaishag",
      location: "Kerala, India",
      date: "January 11, 2026",
      guests: 300,
      photos: 3500,
      image: "/sister-b-gallery/10.jpeg",
      testimonial: "We were one of WeddingWeb's first customers, and the experience was incredible! The AI face detection worked beautifully, and the team was super responsive. Excited to see where they go!",
      rating: 5,
      highlights: [
        "3,500 photos processed smoothly",
        "AI face detection worked perfectly",
        "300+ guests found their photos easily",
        "Personalized support throughout"
      ],
      metrics: {
        engagement: "92%",
        downloads: "4,200+",
        wishes: "180+"
      }
    },
    {
      couple: "Parvathy & Hari",
      location: "Kerala, India",
      date: "January 04, 2026",
      guests: 250,
      photos: 2800,
      image: "/WhatsApp Image 2025-10-19 at 8.16.44 PM.jpeg",
      testimonial: "As early adopters, we loved being part of WeddingWeb's journey! The live streaming kept our international family connected. The platform exceeded our expectations!",
      rating: 5,
      highlights: [
        "Live streamed to family abroad",
        "2,800 photos organized perfectly",
        "Smooth experience from start to finish",
        "Great early-bird pricing"
      ],
      metrics: {
        engagement: "95%",
        downloads: "3,800+",
        wishes: "150+"
      }
    }
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

  const stats = [
    { number: "2", label: "Successful Events", icon: <Heart className="w-6 h-6" /> },
    { number: "5,000+", label: "Photos Managed", icon: <Camera className="w-6 h-6" /> },
    { number: "500+", label: "Happy Guests", icon: <Users className="w-6 h-6" /> },
    { number: "100%", label: "Client Satisfaction", icon: <Star className="w-6 h-6" /> }
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
            <Link to="/company/services" className="hover:text-rose-500 transition-colors">Services</Link>
            <Link to="/company/pricing" className="hover:text-rose-500 transition-colors">Pricing</Link>
            <Link to="/company/portfolio" className="text-rose-500 font-semibold">Portfolio</Link>
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
            <div className="inline-block mb-4 px-4 py-2 bg-amber-100 rounded-full">
              <span className="text-amber-600 font-semibold">🎉 Our First 2 Success Stories</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Our First Success Stories
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Meet our pioneering couples who trusted WeddingWeb to make their special day magical. 
              Join them in shaping the future of wedding technology!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white mb-3 mx-auto">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{stat.number}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our First 2 Weddings</h2>
            <p className="text-xl text-slate-600">Detailed look at how we helped our pioneering couples</p>
          </motion.div>

          <div className="space-y-20">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-2 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative aspect-[4/3] md:aspect-auto">
                        <img 
                          src={study.image} 
                          alt={`${study.couple} wedding`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                          <div className="text-white">
                            <h3 className="text-3xl font-bold mb-2">{study.couple}</h3>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {study.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {study.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 md:p-12">
                        <div className="flex gap-1 mb-4">
                          {[...Array(study.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>

                        <div className="relative mb-6">
                          <Quote className="w-8 h-8 text-rose-500 opacity-20 absolute -top-2 -left-2" />
                          <p className="text-lg text-slate-700 italic pl-6">
                            "{study.testimonial}"
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-rose-600">{study.metrics.engagement}</div>
                            <div className="text-xs text-slate-600">Engagement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{study.metrics.downloads}</div>
                            <div className="text-xs text-slate-600">Downloads</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{study.metrics.wishes}</div>
                            <div className="text-xs text-slate-600">Wishes</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-slate-700 mb-3">Key Highlights:</h4>
                          {study.highlights.map((highlight, hIndex) => (
                            <div key={hIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                              <span className="text-slate-600">{highlight}</span>
                            </div>
                          ))}
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

      {/* More Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Early Customer Reviews</h2>
            <p className="text-xl text-slate-600">Hear from our first customers and be the next!</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4">"{testimonial.text}"</p>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-slate-800">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.event}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Early Results</h2>
            <p className="text-xl text-slate-600">Our first events showed promising results</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-slate-800 mb-2">93%</div>
                  <div className="text-slate-600">Average Guest Engagement</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <Camera className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-slate-800 mb-2">2 hrs</div>
                  <div className="text-slate-600">Average Processing Time</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-slate-800 mb-2">5/5</div>
                  <div className="text-slate-600">Client Satisfaction Score</div>
                </CardContent>
              </Card>
            </motion.div>
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
              Be Our Next Success Story!
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join our pioneering customers and get exclusive early-bird pricing plus personalized support
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
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;

