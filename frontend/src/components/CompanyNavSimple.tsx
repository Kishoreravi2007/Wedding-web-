import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogIn, Sparkles } from "lucide-react";

const CompanyNavSimple = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/company/about", label: "About" },
    { to: "/company/services", label: "Services" },
    { to: "/company/pricing", label: "Pricing" },
    { to: "/company/portfolio", label: "Portfolio" },
    { to: "/company/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-center justify-between p-2 pointer-events-auto">
        <div className="flex items-center gap-3 pl-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-1.5 transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="WeddingWeb" className="h-full w-full object-contain" />
            </div>
            <span className="hidden sm:inline-block text-xl font-bold tracking-tight text-slate-900">
              WeddingWeb
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 px-1 py-1 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-6 py-2.5 text-xs transition-all duration-300 rounded-full whitespace-nowrap tracking-wide font-semibold ${active
                  ? "bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-rose-200/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 pr-2">
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <Link to="/company/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="rounded-full text-slate-600 hover:text-rose-600 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/company/signup">
                <Button
                  size="sm"
                  className="rounded-full bg-slate-900 hover:bg-rose-600 text-white shadow-lg transition-all duration-300 border-0 px-5 text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/company/account" className="relative group">
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-slate-100 shadow-sm hover:border-rose-100 transition-colors">
                <Avatar className="h-full w-full">
                  <AvatarImage src={currentUser?.profile?.avatar_url || "/placeholder-user.jpg"} alt="Profile" />
                  <AvatarFallback className="bg-rose-50 text-rose-600 font-bold text-xs">
                    {(currentUser?.profile?.full_name?.charAt(0) || currentUser?.email?.charAt(0) || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-slate-50 text-slate-500">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="rounded-b-[2.5rem] pt-24 pb-12 px-8">
              <div className="flex flex-col gap-4 items-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg font-medium transition-colors ${isActive(link.to)
                      ? "text-rose-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="w-12 h-0.5 bg-slate-100 my-4 rounded-full" />
                {!currentUser ? (
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Link to="/company/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-12">
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/company/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full border-slate-200 font-semibold h-12">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link to="/company/account" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="rounded-full border-slate-200 font-semibold h-12 px-8">
                      My Account
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default CompanyNavSimple;

