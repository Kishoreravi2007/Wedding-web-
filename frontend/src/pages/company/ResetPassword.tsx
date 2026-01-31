import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
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

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900">
                <div className="flex min-h-screen flex-col">
                    <header className="flex items-center justify-between px-6 py-6 sm:px-10">
                        <Link
                            to="/company/login"
                            className="flex items-center gap-2 text-lg font-semibold tracking-wide text-slate-700 transition hover:text-rose-500"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </header>

                    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10 sm:px-6">
                        <Card className="border-slate-200 shadow-xl">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Password Reset!</h2>
                                <p className="text-slate-600 mb-6">
                                    Your password has been successfully updated. You can now log in with your new credentials.
                                </p>
                                <div className="space-y-3">
                                    <Link to="/company/login" className="block">
                                        <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                                            Go to Login
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900">
            <div className="flex min-h-screen flex-col">
                <header className="flex items-center justify-between px-6 py-6 sm:px-10">
                    <Link
                        to="/company/login"
                        className="flex items-center gap-2 text-lg font-semibold tracking-wide text-slate-700 transition hover:text-rose-500"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </header>

                <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10 sm:px-6">
                    <Card className="border-slate-200 shadow-xl">
                        <CardHeader className="text-center pb-2">
                            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                                <Lock className="w-7 h-7 text-rose-600" />
                            </div>
                            <p className="text-sm uppercase tracking-[0.5em] text-slate-500 mb-2">Security Update</p>
                            <CardTitle className="text-2xl font-semibold text-slate-900">
                                Set new password
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                Please enter a new password for your account associated with <strong>{email}</strong>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 pt-4">
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-700 font-medium">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 border-slate-300 focus:border-rose-400 focus:ring-rose-400 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-12 border-slate-300 focus:border-rose-400 focus:ring-rose-400 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            Updating password...
                                        </>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default CompanyResetPassword;
