import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Target, 
  Users, 
  Sparkles,
  Award,
  Globe,
  TrendingUp,
  Shield
} from "lucide-react";

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
    { year: "2023", title: "Company Founded", description: "Started with a vision to revolutionize wedding technology" },
    { year: "2023", title: "First 100 Events", description: "Successfully hosted our first 100 weddings" },
    { year: "2024", title: "AI Face Detection", description: "Launched industry-leading face recognition technology" },
    { year: "2024", title: "10K+ Events", description: "Crossed 10,000 successful events worldwide" },
    { year: "2025", title: "Global Expansion", description: "Serving couples in 50+ countries" }
  ];

  const team = [
    {
      name: "Kishore Ravi",
      role: "Founder & CEO",
      description: "Passionate about technology and creating memorable experiences"
    },
    {
      name: "Tech Team",
      role: "Engineering",
      description: "Building innovative solutions with AI and cloud technologies"
    },
    {
      name: "Support Team",
      role: "Customer Success",
      description: "Ensuring every wedding runs smoothly from start to finish"
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
            <Link to="/company/about" className="text-rose-500 font-semibold">About</Link>
            <Link to="/company/services" className="hover:text-rose-500 transition-colors">Services</Link>
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
            <div className="inline-block mb-4 px-4 py-2 bg-rose-100 rounded-full">
              <span className="text-rose-600 font-semibold">Our Story</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Reimagining Weddings Through Technology
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're on a mission to make every wedding moment accessible, memorable, 
              and magical through innovative technology solutions.
            </p>
          </motion.div>
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
                  Today, we've helped thousands of couples and millions of guests create and relive 
                  their special moments. But we're just getting started.
                </p>
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
                  <Heart className="w-32 h-32 text-slate-300" />
                </div>
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
                    To become the world's leading wedding technology platform, bringing joy to 
                    millions of couples and guests through seamless, intelligent, and delightful experiences.
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
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-slate-600">Passionate people building amazing experiences</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 mx-auto">
                      {member.name.charAt(0)}
                    </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-90">Events Hosted</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Users className="w-12 h-12 mx-auto mb-4" />
              <div className="text-5xl font-bold mb-2">5M+</div>
              <div className="text-lg opacity-90">Happy Guests</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Globe className="w-12 h-12 mx-auto mb-4" />
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Countries</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Award className="w-12 h-12 mx-auto mb-4" />
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-lg opacity-90">Satisfaction</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Join Us on This Journey</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Be part of the wedding technology revolution. Let's create unforgettable experiences together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/company/contact">
                <Button size="lg" className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-lg px-8">
                  Get in Touch
                </Button>
              </Link>
              <Link to="/company/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 border-2">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

