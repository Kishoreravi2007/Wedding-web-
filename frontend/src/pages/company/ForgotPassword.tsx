import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";

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
      toast({
        title: "Check your inbox",
        description: "We sent a reset link if that email exists.",
      });
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
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Check your email</h2>
                <p className="text-slate-600 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and follow the instructions.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSuccess(false)}
                  >
                    Try a different email
                  </Button>
                  <Link to="/company/login" className="block">
                    <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                      Return to Login
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
                <Mail className="w-7 h-7 text-rose-600" />
              </div>
              <p className="text-sm uppercase tracking-[0.5em] text-slate-500 mb-2">Password Recovery</p>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Reset your password
              </CardTitle>
              <CardDescription className="text-slate-600">
                Enter the email address tied to your WeddingWeb account and we'll send you a secure reset link.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-4">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 border-slate-300 focus:border-rose-400 focus:ring-rose-400"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sending link...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send reset link
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-500">
                  Remember your password?{" "}
                  <Link to="/company/login" className="text-rose-600 font-medium hover:text-rose-700 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CompanyForgotPassword;
