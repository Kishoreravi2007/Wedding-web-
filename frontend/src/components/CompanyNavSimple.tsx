import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const CompanyNavSimple = () => {
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
        <Link to="/company" className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="WeddingWeb logo"
            className="w-12 h-12 object-contain drop-shadow-lg bg-white rounded-xl p-1 border border-slate-200"
          />
          <span className="text-3xl font-bold text-slate-900">WeddingWeb</span>
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
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
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
        </div>
      )}
    </nav>
  );
};

export default CompanyNavSimple;

