
import LoginForm from "@/components/login/LoginForm";
import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";

const LoginPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const redirectFromQuery = searchParams.get("redirect");
  const stateRedirect = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const redirectTo = redirectFromQuery || stateRedirect || "/couple";

  return (
    <div className="min-h-screen w-full flex bg-white text-slate-900 font-sans">
      {/* Visual Side (Left) - Hidden on Mobile */}
      <div className="hidden lg:flex w-1/2 bg-slate-100 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          {/* 
                Placeholder for a high-quality wedding photo. 
                Using a premium Unsplash wedding-themed image.
            */}
          <img
            src="https://images.unsplash.com/photo-1519225468359-2996bc014759?q=80&w=2070&auto=format&fit=crop"
            alt="Wedding Atmosphere"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> Premium Builder
          </div>
          <h2 className="text-5xl font-serif font-medium leading-tight mb-6">
            Design the wedding of your dreams.
          </h2>
          <p className="text-lg text-white/80 font-light leading-relaxed">
            Create, customize, and share your perfect wedding website with our professional builder tools.
          </p>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-block lg:hidden mb-4">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif text-slate-900">Welcome Back</h1>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          <LoginForm redirectTo={redirectTo} />

          <div className="pt-6 relative flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-100"></div>
            <span className="relative bg-white px-4 text-xs uppercase tracking-widest text-slate-400">Wedding Web</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
