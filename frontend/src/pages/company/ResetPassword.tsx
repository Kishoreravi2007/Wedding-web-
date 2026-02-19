import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const CompanyResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const navigate = useNavigate();

    // Redirect if no token or email
    useEffect(() => {
        if (!token || !email) {
            window.location.href = "https://weddingweb.co.in";
        }
    }, [token, email]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please ensure both passwords are the same.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        if (!token || !email) {
            toast({
                title: "Invalid link",
                description: "Missing token or email. Please request a new reset link.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setIsSuccess(true);
            toast({
                title: "Password reset successful",
                description: "You can now log in with your new password.",
            });
        } catch (error: any) {
            toast({
                title: "Reset failed",
                description: error?.message || "Please try again or request a new link.",
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
                            Securely update your password and get back to planning your perfect day.
                        </p>
                        <div className="mt-8 flex items-center gap-4 text-sm font-medium">
                            <span className="flex items-center gap-1">
                                <CheckCircle size={18} /> Verified Account
                            </span>
                            <span className="flex items-center gap-1">
                                <Lock size={18} /> 256-bit Encryption
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
                                        <Lock className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-[#111318] dark:text-white mb-2">New password</h2>
                                    <p className="text-[#636f88] dark:text-slate-400">
                                        Please enter a new password for <strong className="text-slate-900 dark:text-slate-200">{email}</strong>
                                    </p>
                                </div>

                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    <div>
                                        <Label htmlFor="password" title="password" className="block text-sm font-semibold text-[#111318] dark:text-slate-200 mb-2">
                                            New Password
                                        </Label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="confirmPassword" title="confirmPassword" className="block text-sm font-semibold text-[#111318] dark:text-slate-200 mb-2">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                className="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Updating..." : "Reset Password"}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center md:text-left py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 md:mx-0 mx-auto">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-[#111318] dark:text-white mb-2">All set!</h2>
                                <p className="text-[#636f88] dark:text-slate-400 mb-8">
                                    Your password has been successfully reset. You can now use your new password to sign in.
                                </p>
                                <div className="flex flex-col gap-3">
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
                                Need more help?{" "}
                                <Link to="/company/contact" className="text-primary font-bold hover:underline">
                                    Contact Support
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyResetPassword;
