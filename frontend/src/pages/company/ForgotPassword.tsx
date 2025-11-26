import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const CompanyForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.6em] text-white/70">Company portal</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Reset your access</h1>
        <p className="mt-3 text-white/70">
          Enter the email address tied to your WeddingWeb account and we'll send you a secure reset link.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="bg-white/10 text-white placeholder-white/40"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-purple-600" disabled={isSubmitting}>
            {isSubmitting ? "Sending link…" : "Send reset link"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompanyForgotPassword;

