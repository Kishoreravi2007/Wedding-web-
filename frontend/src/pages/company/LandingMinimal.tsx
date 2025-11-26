import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const LandingMinimal = () => {
  const { currentUser } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-5 flex justify-center md:justify-between items-center">
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
          <div className="hidden md:flex flex-1 justify-center gap-6 items-center">
            <Link to="/" className="hover:text-rose-500">Home</Link>
            <Link to="/about" className="hover:text-rose-500">About</Link>
            <Link to="/services" className="hover:text-rose-500">Services</Link>
            <Link to="/pricing" className="hover:text-rose-500">Pricing</Link>
            <Link to="/portfolio" className="hover:text-rose-500">Portfolio</Link>
            <Link to="/contact" className="hover:text-rose-500">Contact</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
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

