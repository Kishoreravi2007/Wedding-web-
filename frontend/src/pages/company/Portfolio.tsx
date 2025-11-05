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
      couple: "Priya & Rahul",
      location: "Mumbai, India",
      date: "December 2024",
      guests: 500,
      photos: 8500,
      image: "/sister-b-gallery/1.jpeg",
      testimonial: "WeddingWeb's face detection was absolutely magical! Our 500 guests could instantly find their photos. The photographer portal made coordination seamless.",
      rating: 5,
      highlights: [
        "8,500 photos processed in 2 hours",
        "99.2% face detection accuracy",
        "500+ guests served",
        "Live streaming to 15 countries"
      ],
      metrics: {
        engagement: "94%",
        downloads: "12,000+",
        wishes: "350+"
      }
    },
    {
      couple: "Sarah & Michael",
      location: "Bangalore, India",
      date: "November 2024",
      guests: 300,
      photos: 5000,
      image: "/sister-b-gallery/2.jpeg",
      testimonial: "Our families are spread across the globe. The live streaming feature brought everyone together. It felt like they were right there with us!",
      rating: 5,
      highlights: [
        "Live streamed to 25 countries",
        "5,000 photos organized perfectly",
        "Zero technical issues",
        "300 satisfied guests"
      ],
      metrics: {
        engagement: "91%",
        downloads: "8,500+",
        wishes: "280+"
      }
    },
    {
      couple: "Anjali & Karthik",
      location: "Chennai, India",
      date: "October 2024",
      guests: 800,
      photos: 12000,
      image: "/sister-b-gallery/3.jpeg",
      testimonial: "Managing 12,000 photos seemed impossible until we found WeddingWeb. The AI organized everything automatically. Our three photographers loved the portal!",
      rating: 5,
      highlights: [
        "12,000 photos from 3 photographers",
        "Coordinated multi-day events",
        "800+ guests across 4 venues",
        "Instant photo discovery for all"
      ],
      metrics: {
        engagement: "96%",
        downloads: "18,000+",
        wishes: "620+"
      }
    }
  ];

  const testimonials = [
    {
      name: "Divya & Arjun",
      event: "Wedding • Kerala",
      text: "The multilingual support was perfect for our diverse family. English, Hindi, Malayalam - everyone could navigate easily!",
      rating: 5
    },
    {
      name: "Meera & Sanjay",
      event: "Reception • Delhi",
      text: "Our elderly relatives could use it without any help. The interface is so intuitive and beautiful!",
      rating: 5
    },
    {
      name: "Riya & Vikram",
      event: "Wedding • Jaipur",
      text: "The admin dashboard gave us complete control. We could see everything happening in real-time.",
      rating: 5
    },
    {
      name: "Pooja & Amit",
      event: "Destination Wedding • Goa",
      text: "Worth every penny! Our guests are still talking about how easy it was to find their photos.",
      rating: 5
    },
    {
      name: "Shreya & Rohan",
      event: "Wedding • Hyderabad",
      text: "The customer support team was amazing. They helped us every step of the way.",
      rating: 5
    },
    {
      name: "Kavya & Aditya",
      event: "Wedding • Pune",
      text: "We had 10,000+ photos and the AI organized them all perfectly. Simply incredible!",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Successful Events", icon: <Heart className="w-6 h-6" /> },
    { number: "5M+", label: "Photos Managed", icon: <Camera className="w-6 h-6" /> },
    { number: "2M+", label: "Happy Guests", icon: <Users className="w-6 h-6" /> },
    { number: "99.9%", label: "Client Satisfaction", icon: <Star className="w-6 h-6" /> }
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
              <span className="text-amber-600 font-semibold">Success Stories</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Real Weddings, Real Results
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how couples around the world are creating magical wedding experiences 
              with WeddingWeb's innovative platform.
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
            <h2 className="text-4xl font-bold mb-4">Featured Case Studies</h2>
            <p className="text-xl text-slate-600">In-depth looks at how WeddingWeb transformed these celebrations</p>
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
            <h2 className="text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-xl text-slate-600">Join thousands of happy couples</p>
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
            <h2 className="text-4xl font-bold mb-4">Proven Results</h2>
            <p className="text-xl text-slate-600">The numbers speak for themselves</p>
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
                  <div className="text-4xl font-bold text-slate-800 mb-2">94%</div>
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
                  <div className="text-4xl font-bold text-slate-800 mb-2">4.9/5</div>
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
              Ready to Create Your Success Story?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of couples who made their weddings unforgettable with WeddingWeb
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

