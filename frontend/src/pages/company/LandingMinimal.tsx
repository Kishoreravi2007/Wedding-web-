import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";

const LandingMinimal = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/company" className="hover:text-rose-500">Home</Link>
            <Link to="/company/about" className="hover:text-rose-500">About</Link>
            <Link to="/company/services" className="hover:text-rose-500">Services</Link>
            <Link to="/company/pricing" className="hover:text-rose-500">Pricing</Link>
            <Link to="/company/portfolio" className="hover:text-rose-500">Portfolio</Link>
            <Link to="/company/contact" className="hover:text-rose-500">Contact</Link>
            <Link to="/company/contact">
              <Button className="bg-gradient-to-r from-rose-500 to-purple-600">
                Book a Demo
              </Button>
            </Link>
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
              <Link 
                to="/company" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-rose-500 transition-colors py-2"
              >
                Home
              </Link>
              <Link 
                to="/company/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-rose-500 transition-colors py-2"
              >
                About
              </Link>
              <Link 
                to="/company/services" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-rose-500 transition-colors py-2"
              >
                Services
              </Link>
              <Link 
                to="/company/pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-rose-500 transition-colors py-2"
              >
                Pricing
              </Link>
              <Link 
                to="/company/portfolio" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-rose-500 transition-colors py-2"
              >
                Portfolio
              </Link>
              <Link 
                to="/company/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-rose-500 transition-colors py-2"
              >
                Contact
              </Link>
              <Link 
                to="/company/contact" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full bg-gradient-to-r from-rose-500 to-purple-600">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        )}
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
          <Link to="/company/contact">
            <Button size="lg" className="bg-gradient-to-r from-rose-500 to-purple-600 text-lg px-8 py-6">
              Get Started Free
            </Button>
          </Link>
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
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 WeddingWeb. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingMinimal;

