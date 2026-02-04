
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShieldCheck, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
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
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-serif text-slate-900">Check your phone</h3>
          <p className="text-sm text-slate-500">
            We've sent a 6-digit code to your authenticator app.
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="bg-red-50 text-red-700 border-red-200">
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
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <InputOTPSlot
                    key={idx}
                    index={idx}
                    className="rounded-md border-slate-200 bg-slate-50 w-10 h-12 text-lg font-medium focus:border-rose-500 focus:ring-rose-500"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium h-12 rounded-lg transition-all"
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
      </div>
    );
  }

  return (
    <div className="w-full">
      {errorMessage && (
        <Alert variant="destructive" className="mb-6 bg-red-50 text-red-600 border-red-100">
          <AlertTitle className="font-medium">Login failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="h-11 bg-slate-50 border-slate-200 focus:border-rose-500 focus:ring-rose-500/20 transition-all rounded-lg placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <Link
              to="/company/forgot-password"
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
              tabIndex={-1}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="h-11 bg-slate-50 border-slate-200 focus:border-rose-500 focus:ring-rose-500/20 transition-all rounded-lg placeholder:text-slate-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium h-12 rounded-lg transition-all shadow-sm hover:shadow-md mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
            </div>
          ) : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-8">
        Don't have an account?{" "}
        <Link to="/company/signup" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
