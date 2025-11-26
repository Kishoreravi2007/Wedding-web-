import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const CompanySignup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Full name, email, and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error: signupError } = await signup(email.trim(), password);
      if (signupError) {
        throw signupError;
      }

      if (data?.user?.id) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          user_id: data.user.id,
          full_name: fullName.trim() || null,
          location: location.trim() || null,
          bio: bio.trim() || null,
          avatar_url: photo,
          email: email.trim(),
        });
        if (profileError) {
          console.warn("Failed to save profile info after signup", profileError);
        }
      }
      toast({
        title: "Check your inbox",
        description: "We saved your profile info and sent a confirmation email.",
      });
      navigate("/company/login");
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to sign you up right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#1b0d3c] to-[#030512] px-4 py-12 text-white">
      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(12,12,55,0.8)]">
        <Card className="w-full bg-white/10 border-white/20 backdrop-blur-xl">
          <CardHeader className="space-y-3 text-center text-white">
            <CardTitle className="text-3xl font-semibold text-white">Create an account</CardTitle>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">WeddingWeb partner portal</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-400 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="signup-email" className="text-white/70">
                  Email address<span className="ml-1 text-rose-400">*</span>
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="bg-white/10 text-white placeholder-white/50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-fullname" className="text-white/70">
                  Full name<span className="ml-1 text-rose-400">*</span>
                </Label>
                <Input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  className="bg-white/10 text-white placeholder-white/50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-location" className="text-white/70">
                  Location
                </Label>
                <Input
                  id="signup-location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Kerala, India"
                  className="bg-white/10 text-white placeholder-white/50"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-bio" className="text-white/70">
                  Bio
                </Label>
                <Textarea
                  id="signup-bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Tell us a little about you."
                  rows={3}
                  className="bg-white/10 text-white placeholder-white/50"
                />
              </div>
              <div>
                <Label htmlFor="signup-photo" className="text-white/70">
                  Profile photo
                </Label>
                <input
                  id="signup-photo"
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setPhoto(null);
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPhoto(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-rose-500/80 file:px-3 file:py-1 file:text-white"
                />
                {photo && (
                  <div className="mt-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
                    Photo selected
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="signup-password" className="text-white/70">
                  Password<span className="ml-1 text-rose-400">*</span>
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Strong password"
                  className="bg-white/10 text-white placeholder-white/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up…" : "Create account"}
              </Button>
            </form>
            <p className="text-center text-sm text-white/70">
              Already have an account?{" "}
              <Link to="/company/login" className="text-white underline-offset-2 hover:text-rose-200">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySignup;

