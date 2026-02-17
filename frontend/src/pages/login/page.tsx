
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShieldCheck, Camera, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';

const LoginPage = () => {
  const [userType, setUserType] = useState<'couple' | 'photographer'>('couple');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { user } = await loginWithGoogle() as any;
      showSuccess(`Welcome back, ${user.username || 'User'}!`);

      if (user.role === 'photographer') {
        navigate('/photographer');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client');
      }
    } catch (error: any) {
      console.error(error);
      showError(error.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const from = (location.state as any)?.from?.pathname || (userType === 'photographer' ? '/photographer' : '/client');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the unified login from AuthContext
      const { user } = await login(email, password) as any;

      showSuccess(`Welcome back, ${user.username || 'User'}!`);

      if (user.role === 'photographer') {
        navigate('/photographer');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Default to client/couple dashboard
        navigate('/client');
      }

    } catch (error: any) {
      console.error(error);
      showError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 m-0 overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      {/* Main Container: Split Screen Layout */}
      <div className="flex flex-col md:flex-row w-full min-h-screen">

        {/* Left Side: High-Quality Romantic Image */}
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-primary">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJS-IrKc86M45Jsock7s8PTm6sp5R7cRqDXauY37SagQ7Kroe0IDNSnBOps9FSEXob8f9HJbl7pvenkCEsoF6KLki42YvIO1P_N10500_X-JJtXeBMd9ddl2bHhlbCXNo0Kxb4FvVfJ1v71LUknADYf2HgcE7aq6YcXvCPC44QXDOgkczavC8Gdz2yPWVxAUfGhu6pg-q9hTsGdoT0BVjg4cItaaShO9REsnkPbQyRkhJhLPtPdFoLuY3HVXEW2FNvN8AKCy7-mR7F')"
            }}
          >
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Brand Content */}
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
                <img src="/logo.png" alt="WeddingWeb" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">WeddingWeb</h1>
            </div>
            <p className="text-xl font-light max-w-md leading-relaxed opacity-90">
              Capture the magic of your most beautiful moments with the world's leading wedding platform.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck size={18} /> Secure Platform
              </span>
              <span className="flex items-center gap-1">
                <Camera size={18} /> Pro Network
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center bg-white dark:bg-background-dark px-6 py-12 lg:px-20">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex md:hidden items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm border border-slate-100 overflow-hidden">
                <img src="/logo.png" alt="WeddingWeb" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#111318]">WeddingWeb</span>
            </div>

            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl font-extrabold text-[#111318] dark:text-white mb-2">Welcome Back</h2>
              <p className="text-[#636f88] dark:text-slate-400">Please enter your details to access your account.</p>
            </div>

            {/* User Type Toggle */}
            <div className="flex p-1 bg-background-light dark:bg-slate-800/50 rounded-xl mb-8">
              <button
                onClick={() => setUserType('couple')}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${userType === 'couple'
                  ? 'bg-white dark:bg-primary shadow-sm text-primary dark:text-white'
                  : 'text-[#636f88] dark:text-slate-400 hover:text-primary'
                  }`}
              >
                Couple Login
              </button>
              <button
                onClick={() => setUserType('photographer')}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${userType === 'photographer'
                  ? 'bg-white dark:bg-primary shadow-sm text-primary dark:text-white'
                  : 'text-[#636f88] dark:text-slate-400 hover:text-primary'
                  }`}
              >
                Photographer
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#111318] dark:text-slate-200 mb-2" htmlFor="email">
                  {userType === 'photographer' ? 'Username or Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    id="email"
                    type="text"
                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder={userType === 'photographer' ? "photographer_id" : "name@example.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-[#111318] dark:text-slate-200" htmlFor="password">Password</label>
                  <a href="/company/forgot-password" className="text-sm font-semibold text-primary hover:underline">Forgot Password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 py-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="remember">Remember me for 30 days</label>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? 'Signing In...' : <span>Sign In</span>}
                {!loading && <LogIn size={20} />}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-background-dark text-slate-500 font-medium italic">or continue with</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Facebook</span>
              </button>
            </div>

            {/* Sign Up Footer */}
            <p className="mt-10 text-center text-sm text-slate-600 dark:text-slate-400">
              New to WeddingWeb?{' '}
              <a href="/company/signup" className="text-primary font-bold hover:underline">Create an account</a>
            </p>

            {/* Secure Badge */}
            <div className="mt-12 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-bold">
              <Lock size={14} />
              Secure Encryption Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
