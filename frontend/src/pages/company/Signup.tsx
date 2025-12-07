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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8">
        <Card className="w-full border border-slate-200 shadow-xl">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-3xl font-semibold text-slate-900">Create an account</CardTitle>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">WeddingWeb partner portal</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="signup-email" className="text-slate-700">
                  Email address<span className="ml-1 text-rose-500">*</span>
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-fullname" className="text-slate-700">
                  Full name<span className="ml-1 text-rose-500">*</span>
                </Label>
                <Input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-location" className="text-slate-700">
                  Location
                </Label>
                <Input
                  id="signup-location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Kerala, India"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="signup-bio" className="text-slate-700">
                  Bio
                </Label>
                <Textarea
                  id="signup-bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Tell us a little about you."
                  rows={3}
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="signup-photo" className="text-slate-700">
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-rose-500 file:px-3 file:py-1 file:text-white"
                />
                {photo && (
                  <div className="mt-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    Photo selected
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="signup-password" className="text-slate-700">
                  Password<span className="ml-1 text-rose-500">*</span>
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Strong password"
                  className="bg-white text-slate-900 placeholder:text-slate-400"
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
            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/company/login" className="text-rose-500 underline-offset-2 hover:text-rose-600">
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

