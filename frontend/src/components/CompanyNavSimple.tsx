import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogIn, Sparkles } from "lucide-react";

const CompanyNavSimple = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/weddings", label: "Weddings" },
    { to: "/company/about", label: "About" },
    { to: "/company/services", label: "Services" },
    { to: "/company/pricing", label: "Pricing" },
    { to: "/company/portfolio", label: "Portfolio" },
    { to: "/company/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`mx-auto max-w-7xl pointer-events-auto transition-all duration-300 rounded-[2rem] border-2 shadow-2xl overflow-hidden
          ${scrolled
            ? "bg-white/70 backdrop-blur-2xl border-white/50 py-2 px-4 md:px-8 mt-2"
            : "bg-white border-slate-100 py-4 px-6 md:px-10"
          }`}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 p-0.5 transition-transform duration-300 group-hover:scale-110 shadow-lg">
              <img src="/logo.png" alt="WeddingWeb" className="w-10 h-10 rounded-[10px] object-contain bg-white" />
            </div>
            <span className="hidden sm:block text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent group-hover:from-rose-600 group-hover:to-purple-600 transition-all duration-300">
              WeddingWeb
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 items-center bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-5 py-2 text-sm font-medium transition-all duration-300 rounded-full
                  ${isActive(link.to)
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
              >
                {isActive(link.to) && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <Link to="/company/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="rounded-full text-slate-600 hover:text-rose-600">
                    Sign In
                  </Button>
                </Link>
                <Link to="/company/signup">
                  <Button
                    size="sm"
                    className="rounded-full bg-slate-900 hover:bg-rose-600 text-white shadow-lg transition-all duration-300 border-0 px-6"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/company/account" className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
                <Avatar className="h-10 w-10 border-2 border-white bg-white shadow-md relative z-10">
                  {currentUser.profile?.avatar_url ? (
                    <AvatarImage src={currentUser.profile.avatar_url} alt={currentUser.profile.full_name || "Profile"} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-rose-100 to-purple-50 text-rose-600 text-xs font-bold">
                      {(currentUser.profile?.full_name?.charAt(0) ||
                        currentUser.email?.charAt(0) ||
                        "U").toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-slate-100">
                  <Menu className="h-6 w-6 text-slate-900" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-0 border-l-0">
                <div className="h-full flex flex-col bg-white">
                  <SheetHeader className="p-6 border-b border-slate-100">
                    <SheetTitle className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-rose-500 to-purple-600 p-0.5 rounded-lg shadow-md">
                        <img src="/logo.png" alt="WeddingWeb" className="w-8 h-8 rounded-md bg-white" />
                      </div>
                      <span className="text-slate-900 text-xl font-bold">WeddingWeb</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-2xl text-lg transition-all duration-300
                          ${isActive(link.to)
                            ? "bg-rose-50 text-rose-600 font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    {!currentUser ? (
                      <div className="flex flex-col gap-3">
                        <Link to="/company/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                          <Button
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-xl font-bold py-6 text-lg"
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Get Started
                          </Button>
                        </Link>
                        <Link to="/company/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold py-6 text-lg"
                          >
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Link to="/company/account" onClick={() => setMobileMenuOpen(false)} className="block p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border border-slate-200">
                            {currentUser.profile?.avatar_url ? (
                              <AvatarImage src={currentUser.profile.avatar_url} />
                            ) : (
                              <AvatarFallback className="bg-rose-100 text-rose-600 font-bold">
                                {(currentUser.profile?.full_name?.charAt(0) || "U").toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">My Profile</span>
                            <span className="text-xs text-slate-500">Edit Settings</span>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>
    </div>
  );
};

export default CompanyNavSimple;

