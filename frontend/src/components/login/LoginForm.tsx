import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart, ShieldCheck, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface LoginFormProps {
  redirectTo?: string;
}

const emailPattern = /^\S+@\S+\.\S+$/;

const LoginForm = ({ redirectTo = "/" }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId2FA, setUserId2FA] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await login(email.trim(), password);

      if (result.require2FA) {
        setRequires2FA(true);
        setUserId2FA(result.userId || null);
      } else {
        navigate(redirectTo || "/", { replace: true });
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to sign you in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!userId2FA) throw new Error("Session invalid. Please login again.");
      await verify2FA(userId2FA, otpValue);
      navigate(redirectTo || "/", { replace: true });
    } catch (error: any) {
      setErrorMessage(error?.message || "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requires2FA) {
    return (
      <Card className="bg-white border border-slate-200 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-slate-900">Two-Factor Authentication</CardTitle>
          <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
            Enter the 6-digit code from your authenticator app to verify your identity.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {errorMessage && (
            <Alert variant="destructive" className="text-sm bg-red-50 text-red-700 border-red-200">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerify2FA} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                onChange={(v) => setOtpValue(v)}
                value={otpValue}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="rounded-lg border-slate-300 w-10 h-12 text-lg font-bold" />
                  <InputOTPSlot index={1} className="rounded-lg border-slate-300 w-10 h-12 text-lg font-bold" />
                  <InputOTPSlot index={2} className="rounded-lg border-slate-300 w-10 h-12 text-lg font-bold" />
                  <InputOTPSlot index={3} className="rounded-lg border-slate-300 w-10 h-12 text-lg font-bold" />
                  <InputOTPSlot index={4} className="rounded-lg border-slate-300 w-10 h-12 text-lg font-bold" />
                  <InputOTPSlot index={5} className="rounded-lg border-slate-300 w-10 h-12 text-lg font-bold" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 rounded-xl shadow-lg"
              disabled={isSubmitting || otpValue.length !== 6}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
            </Button>

            <button
              type="button"
              onClick={() => setRequires2FA(false)}
              className="w-full text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <img src="/logo.png" alt="WeddingWeb Logo" className="mx-auto h-20 w-20 object-contain mb-2 rounded-2xl" />
        <CardTitle className="text-3xl font-semibold text-slate-900">Sign in to Wedding Web</CardTitle>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Premium builder dashboard
        </p>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {errorMessage && (
          <Alert variant="destructive" className="text-sm">
            <AlertTitle className="text-base">Login failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm text-slate-700">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm text-slate-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="bg-white text-slate-900 placeholder:text-slate-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-600">
            <Link to="/company/forgot-password" className="font-medium text-slate-700 underline-offset-4 hover:text-rose-500">
              Forgot password?
            </Link>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Secure</span>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-600 text-white font-semibold tracking-wide shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Login"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link to="/company/signup" className="font-semibold text-rose-500 underline-offset-2 hover:text-rose-600">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
