import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

const LandingMinimal = () => {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/pricing", label: "Pricing" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/contact", label: "Contact" },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="WeddingWeb logo"
              className="w-12 h-12 object-contain drop-shadow-lg bg-white rounded-xl p-1 border border-slate-200"
            />
            <span className="hidden md:block text-3xl font-bold text-slate-900">
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
                    : "hover:text-rose-500"
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
                <SheetTitle className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="WeddingWeb logo"
                    className="w-10 h-10 object-contain drop-shadow-lg bg-white rounded-xl p-1 border border-slate-200"
                  />
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Transform Your Wedding
            <br />
            Into a Digital Experience
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Build your own personalized wedding website with AI face detection, smart galleries,
            live streaming, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button size="lg" className="bg-gradient-to-r from-rose-500 to-purple-600 text-lg px-8 py-6">
                Get Started Free
              </Button>
            </Link>
            {!currentUser && (
              <Link to="/company/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-8 py-6 shadow-2xl shadow-rose-500/40"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Simple Stats */}
      <section className="py-20 px-4 bg-slate-100">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-rose-600">2</div>
              <div className="text-slate-600 mt-1">Happy Couples</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">100%</div>
              <div className="text-slate-600 mt-1">Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">AI</div>
              <div className="text-slate-600 mt-1">Powered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-600">2025</div>
              <div className="text-slate-600 mt-1">Just Started</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p>&copy; 2025 WeddingWeb. All rights reserved.</p>
          <p className="text-slate-400 text-sm">Made with love from Kerala ❤️</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingMinimal;

