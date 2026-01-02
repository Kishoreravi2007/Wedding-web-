import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";

const CompanyNavSimple = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  const navLinks = [
    { to: "/company", label: "Home" },
    { to: "/company/about", label: "About" },
    { to: "/company/services", label: "Services" },
    { to: "/company/pricing", label: "Pricing" },
    { to: "/company/portfolio", label: "Portfolio" },
    { to: "/company/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/company" className="flex items-center gap-4">
          <img
            src="https://storage.googleapis.com/sub-projects-483107-wedding-frontend/logo.png"
            alt="WeddingWeb logo"
            className="w-12 h-12 object-contain drop-shadow-lg bg-white rounded-xl p-1 border border-slate-200"
          />
          <span className="hidden md:block text-3xl font-bold text-slate-900">WeddingWeb</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors ${
                isActive(link.to)
                  ? "text-rose-500 font-semibold"
                  : "hover:text-rose-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-4">
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
                  src="https://storage.googleapis.com/sub-projects-483107-wedding-frontend/logo.png"
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
                  className={`text-lg font-medium transition-colors py-2 ${
                    isActive(link.to)
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
  );
};

export default CompanyNavSimple;

