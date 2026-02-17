import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Menu, Camera, Calendar, Users, Zap, Shield, Heart, Star, Check } from "lucide-react";
import { motion } from "framer-motion";

const LandingMinimal = () => {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/pricing", label: "Pricing" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.scrollBehavior = 'smooth';
    }
  }, []);

  // Default brand colors
  const brandColors = {
    primary: '#e11d48', // rose-600
    secondary: '#9333ea', // purple-600
    accent: '#6366f1', // indigo-500
    gradient: 'linear-gradient(135deg, #e11d48, #9333ea)',
    gradientFull: 'linear-gradient(135deg, #e11d48, #9333ea, #6366f1)',
  };

  return (
    <div
      ref={containerRef}
      className="scroll-container"
      style={{
        height: '100vh',
        overflowY: 'auto',
        scrollSnapType: 'y proximity',
        scrollBehavior: 'smooth',
      }}
    >
      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <img src="/logo.png" alt="WeddingWeb" className="w-12 h-12 rounded-xl object-contain transition-transform group-hover:scale-105" />
            <span className="hidden md:block text-2xl font-bold text-slate-900">
              WeddingWeb
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors ${location.pathname === link.to
                  ? "text-rose-500 font-semibold"
                  : "hover:text-rose-500 text-slate-700"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 ml-6">
            {!currentUser ? (
              <Link to="/company/login">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/50"
                >
                  Login
                </Button>
              </Link>
            ) : (
              <Link to="/company/account" title="View or edit profile">
                <Avatar className="h-10 w-10 border border-slate-200 bg-white shadow-lg">
                  {currentUser.profile?.avatar_url ? (
                    <AvatarImage src={currentUser.profile.avatar_url} alt={currentUser.profile.full_name || "Profile"} />
                  ) : (
                    <AvatarFallback>
                      {(currentUser.profile?.full_name?.charAt(0) ||
                        currentUser.email?.charAt(0) ||
                        "U").toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 text-slate-900" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3 text-left">
                  <img src="/logo.png" alt="WeddingWeb" className="w-10 h-10 rounded-xl object-contain" />
                  <span className="text-slate-900 text-xl font-semibold">WeddingWeb</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg font-medium transition-colors py-2 ${location.pathname === link.to
                      ? "text-rose-500 font-bold"
                      : "hover:text-rose-500 text-slate-700"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-slate-200">
                  {!currentUser ? (
                    <Link to="/company/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/50"
                      >
                        Login
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/company/account" onClick={() => setMobileMenuOpen(false)} title="View or edit profile">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200 bg-white shadow-lg">
                          {currentUser.profile?.avatar_url ? (
                            <AvatarImage src={currentUser.profile.avatar_url} alt={currentUser.profile.full_name || "Profile"} />
                          ) : (
                            <AvatarFallback>
                              {(currentUser.profile?.full_name?.charAt(0) ||
                                currentUser.email?.charAt(0) ||
                                "U").toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="text-slate-700 font-medium">Account</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Background Pattern */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          opacity: 0.6,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* Section 1: Hero */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          padding: '2rem',
          background: 'linear-gradient(to br, #fdf2f8, white, #faf5ff)',
          paddingTop: '100px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '900px' }}
        >
          <h1
            className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(3rem, 10vw, 6rem)',
              fontWeight: 900,
              marginBottom: '1rem',
              lineHeight: 1.1,
            }}
          >
            WeddingWeb
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              color: '#64748b',
              marginBottom: '2.5rem',
              fontWeight: 400,
            }}
          >
            Transform Your Wedding Into a Digital Experience
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-lg px-8 py-6 shadow-lg shadow-rose-500/30"
              >
                Get Started Free
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-slate-300 hover:border-rose-500 hover:text-rose-500"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Section 2: About WeddingWeb */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'center',
          padding: '2rem',
          background: 'white',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '900px' }}
        >
          <h2
            className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 900,
              marginBottom: '2rem',
              lineHeight: 1.2,
            }}
          >
            About Us
          </h2>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              color: '#64748b',
              lineHeight: 1.8,
              marginBottom: '2rem',
            }}
          >
            WeddingWeb is Kerala's premier wedding technology company. We specialize in creating
            stunning, personalized wedding websites that help couples share their special moments
            with loved ones around the world. Founded with a passion for love stories and technology,
            we've helped countless couples create memorable digital experiences.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              flexWrap: 'wrap',
              marginTop: '2rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#e11d48' }}>100%</div>
              <div style={{ color: '#64748b', marginTop: '0.5rem' }}>Satisfaction Rate</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#9333ea' }}>AI</div>
              <div style={{ color: '#64748b', marginTop: '0.5rem' }}>Powered Features</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6366f1' }}>24/7</div>
              <div style={{ color: '#64748b', marginTop: '0.5rem' }}>Support Available</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 3: Services */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'center',
          padding: '2rem',
          background: 'linear-gradient(to b, #fdf2f8, white)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '1000px', width: '100%' }}
        >
          <h2
            className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 900,
              marginBottom: '3rem',
              lineHeight: 1.2,
            }}
          >
            What We Offer
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              width: '100%',
            }}
          >
            {[
              { icon: Camera, title: 'Photo Gallery', desc: 'AI-powered smart galleries with face detection', color: '#e11d48' },
              { icon: Calendar, title: 'RSVP System', desc: 'Easy guest management and response tracking', color: '#9333ea' },
              { icon: Users, title: 'Guest Portal', desc: 'Personalized experience for each guest', color: '#6366f1' },
              { icon: Zap, title: 'Live Streaming', desc: 'Share your ceremony with remote guests', color: '#e11d48' },
              { icon: Heart, title: 'Digital Invites', desc: 'Beautiful, shareable wedding invitations', color: '#9333ea' },
              { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected and secure', color: '#6366f1' },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  background: 'white',
                  textAlign: 'left',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              >
                <service.icon style={{ width: '2rem', height: '2rem', color: service.color, marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  {service.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 4: Features Highlight */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'center',
          padding: '2rem',
          background: 'white',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '800px' }}
        >
          <h2
            className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 900,
              marginBottom: '2rem',
              lineHeight: 1.2,
            }}
          >
            Fast. Elegant. Mobile-first.
          </h2>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              color: '#64748b',
              lineHeight: 1.8,
              fontWeight: 400,
              marginBottom: '2rem',
            }}
          >
            We craft premium wedding websites with attention to every detail.
            Your guests will experience a seamless, beautiful interface that
            works flawlessly on any device. Trust us to make your special day
            even more memorable.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            {[
              'Lightning-fast load times',
              'Works on all devices',
              'Offline support available',
              'Multi-language support',
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              >
                <Check style={{ width: '1.25rem', height: '1.25rem', color: '#22c55e' }} />
                <span style={{ fontSize: '1.1rem', color: '#475569' }}>{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 5: Pricing Preview */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'center',
          padding: '2rem',
          background: 'linear-gradient(to b, white, #fdf2f8)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '900px', width: '100%' }}
        >
          <h2
            className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 900,
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Simple Pricing
          </h2>
          <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.1rem' }}>
            Choose the perfect plan for your special day
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              width: '100%',
            }}
          >
            {[
              { name: 'Basic', price: '₹4,999', features: ['Wedding Website', 'Photo Gallery', 'RSVP System', '30 Days Active'] },
              { name: 'Premium', price: '₹9,999', features: ['Everything in Basic', 'AI Face Detection', 'Live Streaming', '1 Year Active'], popular: true },
              { name: 'Enterprise', price: 'Custom', features: ['Everything in Premium', 'Custom Design', 'Dedicated Support', 'Lifetime Access'] },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{
                  padding: '2rem',
                  borderRadius: '16px',
                  background: plan.popular ? 'linear-gradient(135deg, #e11d48, #9333ea)' : 'white',
                  color: plan.popular ? 'white' : '#1e293b',
                  position: 'relative',
                  border: plan.popular ? 'none' : '1px solid #e2e8f0',
                  boxShadow: plan.popular ? '0 20px 40px -12px rgba(225, 29, 72, 0.35)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '20px',
                    background: 'white',
                    color: '#e11d48',
                    padding: '0.25rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    Popular
                  </div>
                )}
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>{plan.price}</div>
                <div style={{ textAlign: 'left' }}>
                  {plan.features.map((feature) => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Check style={{ width: '1rem', height: '1rem', color: plan.popular ? 'white' : '#22c55e' }} />
                      <span style={{ fontSize: '0.9rem', color: plan.popular ? 'rgba(255,255,255,0.9)' : '#64748b' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <Link
            to="/pricing"
            style={{
              display: 'inline-block',
              marginTop: '2rem',
              color: '#e11d48',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View Full Pricing →
          </Link>
        </motion.div>
      </section>

      {/* Section 6: Testimonials */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'center',
          padding: '2rem',
          background: 'white',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '800px' }}
        >
          <h2
            className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 900,
              marginBottom: '3rem',
              lineHeight: 1.2,
            }}
          >
            Loved by Couples
          </h2>
          <div
            style={{
              background: 'linear-gradient(135deg, #fdf2f8, #faf5ff)',
              padding: '2.5rem',
              borderRadius: '20px',
              position: 'relative',
              border: '1px solid #fce7f3',
            }}
          >
            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} style={{ width: '1.5rem', height: '1.5rem', fill: '#fbbf24', color: '#fbbf24' }} />
              ))}
            </div>
            <p
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                color: '#475569',
                lineHeight: 1.8,
                fontStyle: 'italic',
                marginBottom: '1.5rem',
              }}
            >
              "WeddingWeb made our wedding so special! Our guests loved the photo gallery
              with AI face detection - they could easily find all their photos. The live
              streaming feature let our relatives abroad feel like they were right there with us."
            </p>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>Parvathy & Sreedev</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Married January 2025</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 7: Final CTA */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          padding: '2rem',
          background: 'linear-gradient(to br, #fdf2f8, white, #faf5ff)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '800px' }}
        >
          <h2
            className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(3rem, 10vw, 6rem)',
              fontWeight: 900,
              marginBottom: '1.5rem',
              lineHeight: 1.1,
            }}
          >
            Ready to Begin?
          </h2>
          <p style={{ fontSize: '1.3rem', color: '#64748b', marginBottom: '2.5rem' }}>
            Create your dream wedding website today
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-lg px-10 py-7 shadow-xl shadow-rose-500/30"
              >
                Get Started Today
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Footer - pushed to bottom with margin-top auto */}
        <div
          style={{
            marginTop: 'auto',
            paddingBottom: '2rem',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            © 2026 WeddingWeb AI Inc. All rights reserved.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Made with love from Kerala ❤️
          </p>
        </div>
      </section>

      {/* Global Styles */}
      <style>{`
        .scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @media (max-width: 768px) {
          section {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingMinimal;
