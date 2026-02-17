import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import {
  Heart,
  Target,
  Users,
  Sparkles,
  Award,
  Globe,
  TrendingUp,
  Shield,
  FileText
} from "lucide-react";
import { LandingToolbar } from "@/components/LandingToolbar";

const About = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion for Memories",
      description: "We believe every wedding moment deserves to be captured and cherished forever"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Innovation First",
      description: "We leverage cutting-edge AI and technology to solve real wedding challenges"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Customer Obsessed",
      description: "Your success is our success. We're committed to making your event perfect"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Security",
      description: "Your memories are precious. We ensure top-tier security and privacy"
    }
  ];

  const milestones = [
    { year: "2025", title: "Company Founded", description: "Started with a vision to revolutionize wedding technology" },
    { year: "2025", title: "Platform Development", description: "Built our MVP with AI-powered face recognition and event management" },
    { year: "2025", title: "First Customers", description: "Successfully launched with our first 2 wedding events" },
    { year: "2025", title: "Beta Testing", description: "Gathering feedback and continuously improving our platform" }
  ];

  const team = [
    {
      name: "Kishore Ravi",
      role: "Founder & CEO",
      description: "Passionate about technology and creating memorable experiences",
      photo: "/kishore-photo.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
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
              <div className="inline-block mb-6 px-4 py-2 bg-rose-100 rounded-full">
                <span className="text-rose-600 font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Our Story
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                A Fresh Start in<br />Wedding Technology
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                We're a new startup on a mission to make every wedding moment accessible and
                magical through innovative AI-powered technology. Just getting started, and excited for what's ahead!
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
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                  alt="Team Collaboration"
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -left-10 w-full h-full bg-rose-200/50 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">How It All Started</h2>
              <div className="space-y-4 text-lg text-slate-600">
                <p>
                  WeddingWeb was born from a simple observation: wedding photos are precious,
                  but finding YOUR photos among thousands is frustrating. Guests would spend
                  hours scrolling through galleries, often giving up before finding their best moments.
                </p>
                <p>
                  We asked ourselves: "What if guests could find their photos instantly using their face?"
                  That question sparked the creation of WeddingWeb - a comprehensive platform that
                  combines AI-powered face detection with beautiful galleries, live streaming, and more.
                </p>
                <p>
                  We're a fresh startup on a mission to transform the wedding experience. With our first
                  successful events completed, we're excited to help more couples create and relive
                  their special moments. We're just getting started on this incredible journey.
                </p>
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
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
                  alt="Wedding celebration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-indigo-500/20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 border-rose-200 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white mb-6">
                    <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-lg text-slate-600">
                    To empower couples and photographers with innovative technology that makes
                    wedding moments instantly accessible, beautifully organized, and eternally memorable.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-2 border-purple-200 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white mb-6">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-lg text-slate-600">
                    To grow into a trusted wedding technology platform that brings joy to
                    couples and guests through seamless, intelligent, and delightful experiences.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-slate-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white mb-4 mx-auto">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-slate-600">Key milestones in our growth story</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-8 pb-12 border-l-2 border-rose-300 last:pb-0"
              >
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-rose-500 -translate-x-[9px]" />
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-rose-600 font-bold text-sm mb-2">{milestone.year}</div>
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-slate-600">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Meet the Founder</h2>
            <p className="text-xl text-slate-600">Building amazing wedding experiences with technology</p>
          </motion.div>

          <div className="flex justify-center max-w-md mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    {member.photo ? (
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-gradient-to-br from-rose-400 to-purple-600 shadow-lg">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 mx-auto">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <div className="text-rose-600 font-semibold mb-3">{member.role}</div>
                    <p className="text-slate-600">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Journey So Far</h2>
            <p className="text-lg opacity-90">Small beginnings, big dreams</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <div className="text-5xl font-bold mb-2">2</div>
              <div className="text-lg opacity-90">Happy Couples</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Users className="w-12 h-12 mx-auto mb-4" />
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Guests Served</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <div className="text-5xl font-bold mb-2">AI</div>
              <div className="text-lg opacity-90">Powered Tech</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Award className="w-12 h-12 mx-auto mb-4" />
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-lg opacity-90">Satisfaction</div>
            </motion.div>
          </div>
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
                <li><a href="javascript:void(0)" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6 text-white">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <a
                    href="https://github.com/Kishoreravi2007/Wedding-web-"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Documentation
                  </a>
                </li>
                <li><a href="javascript:void(0)" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link to="/company/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 space-y-2">
            <p>&copy; 2026 WeddingWeb AI Inc. All rights reserved.</p>
            <p className="text-sm flex items-center justify-center gap-2">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in Kerala
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;

