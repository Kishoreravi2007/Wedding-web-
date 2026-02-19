import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle, ShieldCheck, Heart } from "lucide-react";

const CompanyForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setIsSuccess(true);
    } catch (error: any) {
      toast({
        title: "Unable to send link",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 m-0 overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      {/* Main Container: Split Screen Layout */}
      <div className="flex flex-col md:flex-row w-full min-h-screen">

        {/* Left Side: Brand Image */}
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-primary">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJS-IrKc86M45Jsock7s8PTm6sp5R7cRqDXauY37SagQ7Kroe0IDNSnBOps9FSEXob8f9HJbl7pvenkCEsoF6KLki42YvIO1P_N10500_X-JJtXeBMd9ddl2bHhlbCXNo0Kxb4FvVfJ1v71LUknADYf2HgcE7aq6YcXvCPC44QXDOgkczavC8Gdz2yPWVxAUfGhu6pg-q9hTsGdoT0BVjg4cItaaShO9REsnkPbQyRkhJhLPtPdFoLuY3HVXEW2FNvN8AKCy7-mR7F')"
            }}
          >
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm overflow-hidden text-primary">
                <img src="/logo.png" alt="WeddingWeb" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">WeddingWeb</h1>
            </div>
            <p className="text-xl font-light max-w-md leading-relaxed opacity-90">
              Recover access to your account and keep the celebration going.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck size={18} /> Secure Recovery
              </span>
              <span className="flex items-center gap-1">
                <Heart size={18} /> Friendly Support
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center bg-white dark:bg-background-dark px-6 py-12 lg:px-20">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex md:hidden items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm border border-slate-100 overflow-hidden text-primary">
                <img src="/logo.png" alt="WeddingWeb" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#111318]">WeddingWeb</span>
            </div>

            <Link
              to="/company/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            {!isSuccess ? (
              <>
                <div className="text-center md:text-left mb-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary md:mx-0 mx-auto">
                    <Mail className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#111318] dark:text-white mb-2">Reset password</h2>
                  <p className="text-[#636f88] dark:text-slate-400">
                    Enter your email address and we'll send you a secure reset link.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="email" className="block text-sm font-semibold text-[#111318] dark:text-slate-200 mb-2">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending link..." : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center md:text-left py-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 md:mx-0 mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#111318] dark:text-white mb-2">Check your inbox</h2>
                <p className="text-[#636f88] dark:text-slate-400 mb-8">
                  We've sent a password reset link to <strong className="text-slate-900 dark:text-slate-200">{email}</strong>.
                  Follow the instructions in the email.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="py-6 rounded-xl border-slate-200"
                    onClick={() => setIsSuccess(false)}
                  >
                    Try a different email
                  </Button>
                  <Link to="/company/login">
                    <Button className="w-full bg-primary hover:bg-blue-700 py-6 rounded-xl font-bold">
                      Return to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Remember your password?{" "}
                <Link to="/company/login" className="text-primary font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyForgotPassword;
