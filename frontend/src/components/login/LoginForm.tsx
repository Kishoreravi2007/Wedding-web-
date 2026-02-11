
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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Please enter your email or username and password.");
      return;
    }

    // Only enforce email pattern if it looks like an email (contains @)
    // This allows photographer usernames (like photo_kishoreravi) to pass
    if (identifier.includes("@") && !emailPattern.test(identifier.trim())) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { user } = await login(identifier.trim(), password) as any;

      // Role-based redirection
      if (user?.role === 'photographer') {
        navigate("/photographer", { replace: true });
      } else {
        navigate(redirectTo || "/client", { replace: true });
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to sign you in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Label htmlFor="identifier" className="text-sm font-medium text-slate-700">
            Email or Username
          </Label>
          <Input
            id="identifier"
            type="text"
            placeholder="Email or photographer ID"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
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
