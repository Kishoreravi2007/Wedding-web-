import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface LoginFormProps {
  redirectTo?: string;
}

const emailPattern = /^\S+@\S+\.\S+$/;

const LoginForm = ({ redirectTo = "/" }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
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
      await login(email.trim(), password);
      navigate(redirectTo || "/", { replace: true });
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to sign you in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 shadow-lg">
          <img src="/logo.png" alt="Wedding Web" className="h-10 w-auto object-contain" />
        </div>
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
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="bg-white text-slate-900 placeholder:text-slate-400"
            />
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

