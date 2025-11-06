import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Menu } from "lucide-react";

const CompanyNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        <Link to="/company" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            WeddingWeb
          </span>
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
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-500" />
                <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                  WeddingWeb
                </span>
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
                      : "hover:text-rose-500"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default CompanyNav;

