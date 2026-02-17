import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Search, MapPin, Loader2, Sparkles, User, Camera, Heart, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CompanySignup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Email Opt-in State
  const [showOptInDialog, setShowOptInDialog] = useState(false);

  // Location Search State
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // AI Bio State
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [roughBio, setRoughBio] = useState("");
  const [generatedPreview, setGeneratedPreview] = useState("");

  // --- Location Logic (Same as before) ---
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

  // --- AI Bio Logic (Same as before) ---
  const handleGenerateBio = async () => {
    if (!roughBio.trim()) return;
    setIsGeneratingBio(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-bio`, {
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
        description: "Could not reach the AI magic.",
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

  // --- Signup Logic ---
  const startSignupFlow = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Full name, email, and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setShowOptInDialog(true);
  };

  const completeSignup = async (emailOptIn: boolean) => {
    setShowOptInDialog(false);
    try {
      setIsSubmitting(true);
      const { data, error: signupError } = await signup(
        email.trim(),
        password,
        emailOptIn,
        fullName.trim(),
        location.trim() || undefined,
        bio.trim() || undefined,
        photo
      );

      if (signupError) {
        throw signupError;
      }

      toast({
        title: "Account Created!",
        description: "Welcome to WeddingWeb!",
      });
      navigate("/company/login");
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to sign you up right now.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-0 m-0 overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      {/* Main Container: Split Screen Layout */}
      <div className="flex flex-col md:flex-row w-full min-h-screen">

        {/* Left Side: Image (Same as Login Page) */}
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-primary">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJS-IrKc86M45Jsock7s8PTm6sp5R7cRqDXauY37SagQ7Kroe0IDNSnBOps9FSEXob8f9HJbl7pvenkCEsoF6KLki42YvIO1P_N10500_X-JJtXeBMd9ddl2bHhlbCXNo0Kxb4FvVfJ1v71LUknADYf2HgcE7aq6YcXvCPC44QXDOgkczavC8Gdz2yPWVxAUfGhu6pg-q9hTsGdoT0BVjg4cItaaShO9REsnkPbQyRkhJhLPtPdFoLuY3HVXEW2FNvN8AKCy7-mR7F')"
            }}
          >
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="WeddingWeb" className="w-12 h-12 rounded-xl object-contain bg-white/20 p-1" />
              <h1 className="text-3xl font-extrabold tracking-tight">WeddingWeb</h1>
            </div>
            <p className="text-xl font-light max-w-md leading-relaxed opacity-90">
              Join the elite network of wedding professionals.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck size={18} /> Verified Network
              </span>
              <span className="flex items-center gap-1">
                <Camera size={18} /> Pro Tools
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center bg-white dark:bg-background-dark px-6 py-12 lg:px-20 overflow-y-auto max-h-screen">
          <div className="w-full max-w-md py-8">
            {/* Mobile Logo */}
            <div className="flex md:hidden items-center justify-center gap-3 mb-8 text-primary">
              <img src="/logo.png" alt="WeddingWeb" className="w-10 h-10 rounded-xl object-contain border border-primary/10" />
              <span className="text-2xl font-bold tracking-tight">WeddingWeb</span>
            </div>

            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl font-extrabold text-[#111318] dark:text-white mb-2">Create Account</h2>
              <p className="text-[#636f88] dark:text-slate-400">Join us to manage your events perfectly.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={startSignupFlow}>

              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <label htmlFor="signup-photo" className="absolute inset-0 cursor-pointer">
                    <input
                      id="signup-photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        // Client-side compression
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 400;
                            const MAX_HEIGHT = 400;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                              if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                              }
                            } else {
                              if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                              }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            // Set high quality but capped width/height
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                            setPhoto(dataUrl);
                          };
                          img.src = reader.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <div>
                  <Label className="font-semibold block">Profile Photo</Label>
                  <p className="text-xs text-slate-500">Optional. Click to upload.</p>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signup-fullname" className="text-sm font-semibold mb-2 block">Full Name</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="py-3.5 rounded-xl border-slate-200"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email" className="text-sm font-semibold mb-2 block">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-3.5 rounded-xl border-slate-200"
                    placeholder="jane@example.com"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Label htmlFor="signup-location" className="text-sm font-semibold mb-2 block">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    id="signup-location"
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => location.length >= 3 && setShowSuggestions(true)}
                    className="pl-11 py-3.5 rounded-xl border-slate-200"
                    placeholder="City, State"
                  />
                  {/* Location Suggestions Dropdown (Simplified for this view) */}
                  <AnimatePresence>
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[150px] overflow-y-auto"
                      >
                        {locationSuggestions.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => handleSelectLocation(loc)}
                            className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-start gap-2 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <span className="text-sm text-slate-700">{loc.display}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>


              {/* Bio & AI Button */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="signup-bio" className="text-sm font-semibold">Bio</Label>
                  <button type="button" onClick={() => setShowAiDialog(true)} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                    <Sparkles size={12} /> AI Generate
                  </button>
                </div>
                <Textarea
                  id="signup-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-xl border-slate-200 min-h-[80px]"
                  placeholder="Tell us about yourself..."
                />
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="signup-password" className="text-sm font-semibold mb-2 block">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 py-3.5 rounded-xl border-slate-200"
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Label htmlFor="confirm-password" className="text-sm font-semibold mb-2 block">Confirm</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 py-3.5 rounded-xl border-slate-200"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all mt-4"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Sign Up"}
              </Button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/company/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {/* AI Bio Generator Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl overflow-hidden p-0 gap-0 border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-primary to-blue-600 text-white">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5" />
              AI Bio Generator
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              Let AI write your professional bio.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6 bg-white">
            {!generatedPreview ? (
              <div className="space-y-4">
                <textarea
                  value={roughBio}
                  onChange={(e) => setRoughBio(e.target.value)}
                  placeholder="e.g. 5 years experience in photography, based in California..."
                  className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm bg-slate-50"
                />
                <Button
                  onClick={handleGenerateBio}
                  disabled={!roughBio.trim() || isGeneratingBio}
                  className="w-full bg-primary text-white h-11 rounded-xl"
                >
                  {isGeneratingBio ? "Generating..." : "Generate"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-700 text-sm">
                  {generatedPreview}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => { setGeneratedPreview(""); setRoughBio(""); }} className="flex-1 rounded-xl">Try Again</Button>
                  <Button onClick={applyGeneratedBio} className="flex-1 bg-primary text-white rounded-xl">Apply</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Opt-in Dialog */}
      <Dialog open={showOptInDialog} onOpenChange={setShowOptInDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Stay Updated?</h3>
            <p className="text-slate-600 text-sm">Receive exclusive offers and updates.</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => completeSignup(true)} className="bg-primary text-white rounded-xl">Yes, please!</Button>
              <Button variant="ghost" onClick={() => completeSignup(false)} className="rounded-xl">No, thanks</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CompanySignup;
