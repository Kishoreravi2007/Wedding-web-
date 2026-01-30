import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Search, MapPin, Loader2, Sparkles, Mail, Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const CompanySignup = () => {
  const { signup, updateEmailPreference } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Email Opt-in State
  const [showOptInDialog, setShowOptInDialog] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  // Location Search State
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Location Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (location.length < 3) {
        setLocationSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearchingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1&limit=5&featuretype=city`
        );
        const data = await response.json();

        const formatted = data.map((item: any) => ({
          id: item.place_id,
          display: `${item.address.city || item.address.town || item.address.district || item.display_name.split(',')[0]}, ${item.address.state || ''}`,
          fullName: item.display_name
        }));

        setLocationSuggestions(formatted);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Location search failed:", error);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [location]);

  const handleSelectLocation = (loc: any) => {
    setLocation(loc.display);
    setShowSuggestions(false);
  };

  // AI Bio State
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [roughBio, setRoughBio] = useState("");
  const [generatedPreview, setGeneratedPreview] = useState("");

  const handleGenerateBio = async () => {
    if (!roughBio.trim()) return;
    setIsGeneratingBio(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}/api/ai/generate-bio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft: roughBio,
          name: fullName,
          type: "Wedding Professional"
        })
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      setGeneratedPreview(data.bio);
      toast({
        title: "Magic happens!",
        description: data.isMock ? "Generated a sample bio for you." : "Your professional bio is ready.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "Could not reach the AI magic. Please try again.",
      });
      console.error(error);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const applyGeneratedBio = () => {
    setBio(generatedPreview);
    setShowAiDialog(false);
    setGeneratedPreview("");
    setRoughBio("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Full name, email, and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Signup
      const { data, error: signupError } = await signup(email.trim(), password);
      if (signupError) {
        throw signupError;
      }

      if (data?.user?.id) {
        // Use Backend API instead of Supabase Client
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}/api/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: data.user.id,
            email: email.trim(),
            full_name: fullName.trim() || null,
            location: location.trim() || null,
            bio: bio.trim() || null,
            avatar_url: photo,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn("Failed to save profile info after signup", errorData);
        }

        // Show Opt-in Dialog after successful profile creation
        setTempUserId(data.user.id);
        setShowOptInDialog(true);
      }
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to sign you up right now.");
      setIsSubmitting(false);
    }
  };

  const handleOptInChoice = async (optedIn: boolean) => {
    try {
      // In a real scenario, we might need a temporary token or handle this via the register API directly.
      // But since we are showing a popup *after* signup, and usually the user is not automatically logged in 
      // with a token yet in this flow (depends on AuthContext implementation of signup).
      // Our signup returns { data: { user: data.user }, error: null } but doesn't set token in state.
      // Let's check AuthContext signup. It doesn't set token.

      // If the user opted in, we can send a separate request if we have a way to authenticate, 
      // or we just include it in the signup call.
      // Actually, I updated AuthContext's signup to accept emailOptIn. 
      // But I only added it to the API call. I didn't update the Signup.tsx call yet.

      // Let's refine the flow: 
      // 1. User fills form.
      // 2. User clicks "Create Account".
      // 3. Popup appears: "Wait! Can we send you emails?"
      // 4. User clicks Yes/No.
      // 5. Signup API is called with the preference.

      // Let's change the flow to that.
    } catch (err) {
      console.error(err);
    }
  };

  // REFINED SUBMIT FLOW
  const [isOptingIn, setIsOptingIn] = useState(false);

  const startSignupFlow = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Full name, email, and password are required.");
      return;
    }
    setShowOptInDialog(true);
  };

  const completeSignup = async (emailOptIn: boolean) => {
    setShowOptInDialog(false);
    try {
      setIsSubmitting(true);
      const { data, error: signupError } = await signup(email.trim(), password, emailOptIn, fullName.trim());
      if (signupError) {
        throw signupError;
      }

      if (data?.user?.id) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'}/api/profiles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: data.user.id,
            email: email.trim(),
            full_name: fullName.trim() || null,
            location: location.trim() || null,
            bio: bio.trim() || null,
            avatar_url: photo,
          }),
        });
      }

      toast({
        title: "Account Created!",
        description: emailOptIn ? "Registration successful! You'll receive our awesome offers." : "Registration successful!",
      });
      navigate("/company/login");
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to sign you up right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
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
            <form className="space-y-4" onSubmit={startSignupFlow}>
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
              <div className="relative">
                <Label htmlFor="signup-location" className="text-slate-700">
                  Location
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="signup-location"
                    type="text"
                    value={location}
                    onChange={(event) => {
                      setLocation(event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => location.length >= 3 && setShowSuggestions(true)}
                    placeholder="Search location (e.g. Palakkad, Kerala)"
                    className="pl-10 bg-white text-slate-900 placeholder:text-slate-400"
                  />
                  {isSearchingLocation && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                    </div>
                  )}

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[250px] overflow-y-auto"
                      >
                        {locationSuggestions.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => handleSelectLocation(loc)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{loc.display}</p>
                              <p className="text-[10px] text-slate-400 truncate">{loc.fullName}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="signup-bio" className="text-slate-700">
                    Professional Bio
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2 gap-1.5"
                    onClick={() => setShowAiDialog(true)}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Generate with AI</span>
                  </Button>
                </div>
                <Textarea
                  id="signup-bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Tell us about your services..."
                  rows={3}
                  className="bg-white text-slate-900 placeholder:text-slate-400 min-h-[100px]"
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
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Strong password"
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

      {/* AI Bio Generator Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl overflow-hidden p-0 gap-0 border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-rose-500 to-indigo-600 text-white">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5" />
              AI Bio Generator
            </DialogTitle>
            <DialogDescription className="text-rose-100">
              Transform your rough thoughts into a premium professional bio.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6 bg-white">
            {!generatedPreview ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">What should we mention?</Label>
                  <textarea
                    value={roughBio}
                    onChange={(e) => setRoughBio(e.target.value)}
                    placeholder="e.g. 5 years experience in photography, specialize in candid shots, based in Kerala..."
                    className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-sm bg-slate-50 shadow-inner transition-all"
                  />
                  <p className="text-[11px] text-slate-400">Our AI will polish this into a professional summary.</p>
                </div>
                <Button
                  onClick={handleGenerateBio}
                  disabled={!roughBio.trim() || isGeneratingBio}
                  className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white h-11 rounded-xl shadow-lg transition-all"
                >
                  {isGeneratingBio ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Crafting your story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Professional Bio
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Your Polished Bio</Label>
                  <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                    {generatedPreview}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedPreview("");
                      setRoughBio("");
                    }}
                    className="flex-1 rounded-xl border-slate-200"
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={applyGeneratedBio}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                  >
                    Apply this bio
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Opt-in Dialog */}
      <Dialog open={showOptInDialog} onOpenChange={setShowOptInDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden p-0 gap-0 border-none shadow-2xl">
          <div className="p-8 text-center space-y-6 bg-white">
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-rose-500 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Wait! One last thing...</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Can we send you occasional emails about **exclusive offers**, new features, and other information to help your business grow?
              </p>
            </div>

            <div className="flex flex-col gap-3 py-2">
              <Button
                onClick={() => completeSignup(true)}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white h-12 rounded-xl font-semibold shadow-lg shadow-rose-200 transition-all text-base"
                disabled={isSubmitting}
              >
                Yes, send me offers!
              </Button>
              <Button
                variant="ghost"
                onClick={() => completeSignup(false)}
                className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 h-12 rounded-xl font-medium"
                disabled={isSubmitting}
              >
                No, maybe later
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-50">
              <Mail className="w-3.5 h-3.5 text-slate-300" />
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Sent from help.weddingweb@gmail.com
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySignup;
