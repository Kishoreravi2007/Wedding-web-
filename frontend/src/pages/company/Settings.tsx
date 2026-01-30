import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";
import * as OTPAuth from "otpauth";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import {
    Settings as SettingsIcon,
    Bell,
    Shield,
    Palette,
    User,
    Mail,
    Lock,
    Eye,
    Moon,
    Sun,
    Smartphone,
    CheckCircle2,
    Loader2,
    Sparkles,
    Search,
    MapPin
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

const Settings = () => {
    const { currentUser, enable2FA, refreshProfile, logout, updateEmailPreference } = useAuth();
    const { theme, setTheme } = useTheme();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
    const [is2FAEnabled, setIs2FAEnabled] = useState(currentUser?.is_2fa_enabled || false);
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [tfaStep, setTfaStep] = useState(1);
    const [otpValue, setOtpValue] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // AI Bio State
    const [showAiDialog, setShowAiDialog] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const [roughBio, setRoughBio] = useState("");
    const [fullName, setFullName] = useState(currentUser?.profile?.full_name || "");
    const [bioText, setBioText] = useState(currentUser?.profile?.bio || "Wedding Photographer & Content Creator");
    const [generatedPreview, setGeneratedPreview] = useState("");

    // Location Search State
    const [locationText, setLocationText] = useState(currentUser?.profile?.location || "");
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [emailOptIn, setEmailOptIn] = useState(currentUser?.email_offers_opt_in || false);

    // Sync state with currentUser when it changes
    useEffect(() => {
        if (currentUser?.email_offers_opt_in !== undefined) {
            setEmailOptIn(currentUser.email_offers_opt_in);
        }
    }, [currentUser]);

    const handleEmailOptInChange = async (enabled: boolean) => {
        try {
            await updateEmailPreference(enabled);
            setEmailOptIn(enabled);
            toast.success(`Email notifications ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error("Failed to update email preferences");
        }
    };

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Location Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (locationText.length < 3) {
                setLocationSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setIsSearchingLocation(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}&addressdetails=1&limit=5&featuretype=city`
                );
                const data = await response.json();

                // Format: "City/District, State, Country"
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
    }, [locationText]);

    const handleSelectLocation = (loc: any) => {
        setLocationText(loc.display);
        setShowSuggestions(false);
    };

    const handleGenerateBio = async () => {
        if (!roughBio.trim()) return;
        setIsGeneratingBio(true);
        try {
            const { API_BASE_URL, getAuthHeaders } = await import("@/lib/api");

            const response = await fetch(`${API_BASE_URL}/api/ai/generate-bio`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    draft: roughBio,
                    name: currentUser?.profile?.full_name || currentUser?.username,
                    type: "Wedding Professional" // Could be dynamic
                })
            });

            if (!response.ok) throw new Error("Failed to generate");

            const data = await response.json();
            setGeneratedPreview(data.bio);

            if (data.isMock) {
                toast.info(data.message);
            } else {
                toast.success("Bio generated successfully!");
            }

        } catch (error) {
            toast.error("Failed to generate bio. Please try again.");
            console.error(error);
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const applyGeneratedBio = () => {
        setBioText(generatedPreview);
        setShowAiDialog(false);
        setGeneratedPreview("");
        setRoughBio("");
    };

    const getWordCount = (text: string) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const handleSave = async () => {
        const wordCount = getWordCount(bioText);
        if (wordCount > 500) {
            toast.error(`Bio is too long! Please keep it under 500 words (Current: ${wordCount})`);
            return;
        }

        try {
            const { API_BASE_URL, getAuthHeaders } = await import("@/lib/api");

            const response = await fetch(`${API_BASE_URL}/api/profiles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    user_id: currentUser?.id,
                    full_name: fullName,
                    location: locationText,
                    bio: bioText,
                    email: currentUser?.email || currentUser?.username
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Save failed:", response.status, errorData);

                if (response.status === 403) {
                    toast.error("Session expired. Please log out and log in again.");
                    return;
                }
                throw new Error(errorData.message || "Failed to save profile");
            }

            toast.success("Profile updated successfully!");

            if (refreshProfile) {
                await refreshProfile();
            }
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "Failed to save profile. Please try again.");
        }
    };

    const handleEnable2FA = () => {
        setIsVerifying(true);

        // Create TOTP object for verification
        const totp = new OTPAuth.TOTP({
            issuer: "WeddingWeb",
            label: currentUser?.email || "user@example.com",
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: "KR577WEDDINGWEB2FA"
        });

        // Simulate network delay for UX
        setTimeout(async () => {
            // Verify the token (allows for a small window of drift)
            const delta = totp.validate({ token: otpValue, window: 1 });

            if (delta !== null) {
                try {
                    // Save to backend
                    await enable2FA(true, "KR577WEDDINGWEB2FA");

                    setIs2FAEnabled(true);
                    setTfaStep(3);
                    toast.success("2FA Enabled successfully!");
                } catch (error) {
                    toast.error("Failed to save 2FA settings.");
                } finally {
                    setIsVerifying(false);
                }
            } else {
                setIsVerifying(false);
                toast.error("Invalid verification code. Please try again.");
            }
        }, 1500);
    };

    const reset2FA = () => {
        setShow2FADialog(false);
        setTfaStep(1);
        setOtpValue("");
    };

    const tabs = [
        { id: "general", label: "General", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
        { id: "appearance", label: "Appearance", icon: Palette },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            <CompanyNavbar />

            <main className="container px-4 md:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-rose-500" />
                        Settings
                    </h1>
                    <p className="text-slate-500 mb-8">Manage your WeddingWeb account preferences and security.</p>

                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="md:col-span-1 space-y-2">
                            {tabs.map((tab) => (
                                <Button
                                    key={tab.id}
                                    variant="ghost"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full justify-start rounded-xl h-12 transition-all ${activeTab === tab.id
                                        ? "text-rose-600 bg-rose-50 font-bold shadow-sm ring-1 ring-rose-100"
                                        : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? "text-rose-500" : "text-slate-400"}`} />
                                    {tab.label}
                                </Button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="md:col-span-3">
                            <AnimatePresence mode="wait">
                                {activeTab === "general" && (
                                    <motion.div
                                        key="general"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-6"
                                    >
                                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                                            <CardHeader className="bg-slate-50 border-b border-slate-100">
                                                <CardTitle className="text-xl">Profile Information</CardTitle>
                                                <CardDescription>Update your personal details and bio.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">Full Name</Label>
                                                        <Input
                                                            placeholder="Enter your name"
                                                            value={fullName}
                                                            onChange={(e) => setFullName(e.target.value)}
                                                            className="rounded-xl border-slate-200 focus:ring-rose-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">Email Address</Label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                            <Input
                                                                readOnly
                                                                defaultValue={currentUser?.email || currentUser?.username || ""}
                                                                className="pl-10 rounded-xl bg-slate-50 border-slate-200 cursor-not-allowed"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-slate-700">Bio / Professional Summary</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 gap-1.5"
                                                            onClick={() => setShowAiDialog(true)}
                                                        >
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                            <span className="text-xs font-semibold">Generate with AI</span>
                                                        </Button>
                                                    </div>
                                                    <div className="relative">
                                                        <Textarea
                                                            placeholder="Tell us about yourself (describe your experience, style, and what makes your service unique)"
                                                            value={bioText}
                                                            onChange={(e) => setBioText(e.target.value)}
                                                            className={`rounded-xl border-slate-200 focus:ring-rose-500 min-h-[150px] resize-none ${getWordCount(bioText) > 500 ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                        />
                                                        <div className={`mt-1.5 text-[11px] font-medium flex justify-end ${getWordCount(bioText) > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                                                            {getWordCount(bioText)} / 500 words
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-slate-700">Location</Label>
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                        <Input
                                                            placeholder="Search location (e.g. Palakkad, Kerala)"
                                                            value={locationText}
                                                            onChange={(e) => {
                                                                setLocationText(e.target.value);
                                                                setShowSuggestions(true);
                                                            }}
                                                            onFocus={() => locationText.length >= 3 && setShowSuggestions(true)}
                                                            className="pl-10 rounded-xl border-slate-200 focus:ring-rose-500"
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
                                                                    className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden"
                                                                >
                                                                    {locationSuggestions.map((loc) => (
                                                                        <button
                                                                            key={loc.id}
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
                                                <Button onClick={handleSave} className="bg-rose-500 hover:bg-rose-600 text-white px-8 rounded-xl h-11 shadow-lg shadow-rose-200">
                                                    Save Changes
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-rose-100 bg-rose-50/30 overflow-hidden">
                                            <CardHeader>
                                                <CardTitle className="text-rose-600 flex items-center gap-2">
                                                    <Shield className="w-5 h-5" />
                                                    Danger Zone
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 pt-0">
                                                <p className="text-sm text-slate-600 mb-4">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="destructive" className="bg-rose-100 text-rose-600 hover:bg-rose-200 border-none shadow-none rounded-xl">
                                                            Delete Account
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-md rounded-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Delete Account?</DialogTitle>
                                                            <DialogDescription>
                                                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex justify-end gap-3 mt-4">
                                                            <DialogClose asChild>
                                                                <Button variant="outline" className="rounded-xl">Cancel</Button>
                                                            </DialogClose>
                                                            <Button
                                                                variant="destructive"
                                                                className="rounded-xl bg-red-600 hover:bg-red-700"
                                                                onClick={async () => {
                                                                    try {
                                                                        const { API_BASE_URL, getAuthHeaders } = await import("@/lib/api");
                                                                        const response = await fetch(`${API_BASE_URL}/api/auth/delete`, {
                                                                            method: 'DELETE',
                                                                            headers: getAuthHeaders()
                                                                        });

                                                                        if (response.ok) {
                                                                            toast.success("Account deleted successfully");
                                                                            // Force logout and redirect
                                                                            if (logout) logout();
                                                                            window.location.href = '/';
                                                                        } else {
                                                                            throw new Error('Failed to delete');
                                                                        }
                                                                    } catch (error) {
                                                                        toast.error("Failed to delete account. Please try again.");
                                                                        console.error(error);
                                                                    }
                                                                }}
                                                            >
                                                                Yes, Delete Account
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {activeTab === "notifications" && (
                                    <motion.div
                                        key="notifications"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-6"
                                    >
                                        <Card className="border-slate-200 shadow-sm">
                                            <CardHeader className="bg-slate-50 border-b border-slate-100">
                                                <CardTitle className="text-xl">Notification Preferences</CardTitle>
                                                <CardDescription>Control how you receive updates and alerts.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-base font-semibold">Email Notifications</Label>
                                                            <p className="text-sm text-slate-500">Receive leads and booking alerts via email.</p>
                                                        </div>
                                                        <Switch defaultChecked />
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-base font-semibold">Push Notifications</Label>
                                                            <p className="text-sm text-slate-500">Enable real-time alerts in your browser/mobile.</p>
                                                        </div>
                                                        <Switch defaultChecked />
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-base font-semibold">Marketing Emails</Label>
                                                            <p className="text-sm text-slate-500">New features and platform updates.</p>
                                                        </div>
                                                        <Switch />
                                                    </div>
                                                </div>
                                                <Button onClick={handleSave} className="bg-rose-500 hover:bg-rose-600 text-white px-8 rounded-xl">
                                                    Update Preferences
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {activeTab === "security" && (
                                    <motion.div
                                        key="security"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-6"
                                    >
                                        <Card className="border-slate-200 shadow-sm">
                                            <CardHeader className="bg-slate-50 border-b border-slate-100">
                                                <CardTitle className="text-xl">Security Settings</CardTitle>
                                                <CardDescription>Keep your account secure with these options.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">Current Password</Label>
                                                        <Input type="password" placeholder="••••••••" className="rounded-xl border-slate-200" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700">New Password</Label>
                                                        <Input type="password" placeholder="Min 8 characters" className="rounded-xl border-slate-200" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl scale-110 ${is2FAEnabled ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"}`}>
                                                            <Smartphone className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                                                                {is2FAEnabled && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>}
                                                            </div>
                                                            <p className="text-xs text-slate-500">Recommended for advanced account protection.</p>
                                                        </div>
                                                    </div>

                                                    <Dialog open={show2FADialog} onOpenChange={(open) => {
                                                        setShow2FADialog(open);
                                                        if (!open) reset2FA();
                                                    }}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant={is2FAEnabled ? "outline" : "default"}
                                                                className={`rounded-xl px-6 ${is2FAEnabled ? "border-slate-200 text-slate-600" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
                                                                onClick={() => {
                                                                    if (is2FAEnabled) {
                                                                        // Disable 2FA
                                                                        enable2FA(false).then(() => {
                                                                            setIs2FAEnabled(false);
                                                                            toast.success("2FA Disabled");
                                                                        }).catch(() => {
                                                                            toast.error("Failed to disable 2FA");
                                                                        });
                                                                    } else {
                                                                        setShow2FADialog(true);
                                                                    }
                                                                }}
                                                            >
                                                                {is2FAEnabled ? "Disable" : "Enable"}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
                                                            <DialogHeader className="sr-only">
                                                                <DialogTitle>2FA Setup</DialogTitle>
                                                                <DialogDescription>Setup Two-Factor Authentication</DialogDescription>
                                                            </DialogHeader>
                                                            <div className="bg-rose-500 p-8 text-white">
                                                                <div className="text-2xl font-bold flex items-center gap-3">
                                                                    <Shield className="w-8 h-8" />
                                                                    2FA Setup
                                                                </div>
                                                                <p className="opacity-90 mt-2">Secure your account with two-factor authentication.</p>
                                                            </div>

                                                            <div className="p-8">
                                                                {tfaStep === 1 && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        className="space-y-6 text-center"
                                                                    >
                                                                        <div className="mx-auto w-48 h-48 bg-white rounded-3xl flex items-center justify-center border-4 border-white shadow-inner relative overflow-hidden group p-4">
                                                                            <QRCode
                                                                                value={`otpauth://totp/WeddingWeb:${currentUser?.email || "user@example.com"}?secret=KR577WEDDINGWEB2FA&issuer=WeddingWeb`}
                                                                                size={160}
                                                                                level="M"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <p className="text-slate-900 font-bold">Scan QR Code</p>
                                                                            <p className="text-sm text-slate-500 px-4">Use Google Authenticator or Authy to scan this code.</p>
                                                                        </div>
                                                                        <Button onClick={() => setTfaStep(2)} className="w-full bg-rose-500 hover:bg-rose-600 h-12 rounded-xl text-lg group">
                                                                            I've Scanned It
                                                                        </Button>
                                                                    </motion.div>
                                                                )}

                                                                {tfaStep === 2 && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, x: 20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        className="space-y-6 text-center"
                                                                    >
                                                                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                                                            <Lock className="w-8 h-8" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <p className="text-slate-900 font-bold">Verify Code</p>
                                                                            <p className="text-sm text-slate-500">Enter the 6-digit code from your app.<br /><span className="text-[10px] font-mono mt-1 block opacity-50">(Demo code: 123456)</span></p>
                                                                        </div>
                                                                        <div className="flex justify-center py-4">
                                                                            <InputOTP
                                                                                maxLength={6}
                                                                                onChange={(v) => setOtpValue(v)}
                                                                                value={otpValue}
                                                                            >
                                                                                <InputOTPGroup className="gap-2">
                                                                                    <InputOTPSlot index={0} className="rounded-xl border-slate-200 w-12 h-14 text-xl font-bold" />
                                                                                    <InputOTPSlot index={1} className="rounded-xl border-slate-200 w-12 h-14 text-xl font-bold" />
                                                                                    <InputOTPSlot index={2} className="rounded-xl border-slate-200 w-12 h-14 text-xl font-bold" />
                                                                                    <InputOTPSlot index={3} className="rounded-xl border-slate-200 w-12 h-14 text-xl font-bold" />
                                                                                    <InputOTPSlot index={4} className="rounded-xl border-slate-200 w-12 h-14 text-xl font-bold" />
                                                                                    <InputOTPSlot index={5} className="rounded-xl border-slate-200 w-12 h-14 text-xl font-bold" />
                                                                                </InputOTPGroup>
                                                                            </InputOTP>
                                                                        </div>
                                                                        <Button
                                                                            onClick={handleEnable2FA}
                                                                            disabled={otpValue.length !== 6 || isVerifying}
                                                                            className="w-full bg-rose-500 hover:bg-rose-600 h-12 rounded-xl text-lg disabled:opacity-50"
                                                                        >
                                                                            {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Enable"}
                                                                        </Button>
                                                                        <Button variant="ghost" onClick={() => setTfaStep(1)} className="text-slate-500 text-sm">Back to QR Code</Button>
                                                                    </motion.div>
                                                                )}

                                                                {tfaStep === 3 && (
                                                                    <motion.div
                                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        className="py-8 text-center space-y-6"
                                                                    >
                                                                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-green-50/50">
                                                                            <CheckCircle2 className="w-12 h-12" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
                                                                            <p className="text-slate-500">2FA is now active on your account.</p>
                                                                        </div>
                                                                        <Button onClick={reset2FA} className="w-full bg-slate-900 hover:bg-slate-800 h-12 rounded-xl text-lg">
                                                                            Done
                                                                        </Button>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>

                                                <Button onClick={handleSave} className="bg-rose-500 hover:bg-rose-600 text-white px-8 rounded-xl">
                                                    Update Security
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {activeTab === "appearance" && (
                                    <motion.div
                                        key="appearance"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-6"
                                    >
                                        <Card className="border-slate-200 shadow-sm">
                                            <CardHeader className="bg-slate-50 border-b border-slate-100">
                                                <CardTitle className="text-xl">Display & Theme</CardTitle>
                                                <CardDescription>Customize your dashboard experience.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-8">
                                                <div className="space-y-4">
                                                    <Label className="text-base font-semibold">Theme Mode</Label>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <button
                                                            onClick={() => setTheme("light")}
                                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-rose-500 bg-white shadow-sm ring-2 ring-rose-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                                                        >
                                                            <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-rose-500' : 'text-slate-400'}`} />
                                                            <span className="text-sm font-medium">Light</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setTheme("dark")}
                                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-rose-500 bg-white shadow-sm ring-2 ring-rose-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                                                        >
                                                            <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-rose-500' : 'text-slate-400'}`} />
                                                            <span className="text-sm font-medium">Dark</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setTheme("system")}
                                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-rose-500 bg-white shadow-sm ring-2 ring-rose-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                                                        >
                                                            <Smartphone className={`w-6 h-6 ${theme === 'system' ? 'text-rose-500' : 'text-slate-400'}`} />
                                                            <span className="text-sm font-medium">System</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="text-base font-semibold">Sidebar Layout</Label>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                                <Eye className="w-5 h-5 text-slate-500" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">Compact Sidebar icons</p>
                                                                <p className="text-xs text-slate-500">Show only icons when menu is collapsed.</p>
                                                            </div>
                                                        </div>
                                                        <Switch defaultChecked />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                                    <Label className="text-base font-semibold">Email Notifications</Label>
                                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                                                                <Bell className="w-5 h-5 text-rose-500" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">Marketing & Offers</p>
                                                                <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                                                                    Receive exclusive deals, tips, and feature updates.
                                                                    <span className="block mt-0.5 text-rose-500/80 font-medium">Sent from help.weddingweb@gmail.com</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={emailOptIn}
                                                            onCheckedChange={handleEmailOptInChange}
                                                        />
                                                    </div>
                                                </div>
                                                <Button onClick={handleSave} className="bg-rose-500 hover:bg-rose-600 text-white px-8 rounded-xl">
                                                    Save Appearance
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* AI Bio Generator Dialog */}
                            <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
                                <DialogContent className="sm:max-w-lg rounded-2xl overflow-hidden p-0 gap-0 border-none shadow-2xl">
                                    <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
                                        <DialogTitle className="flex items-center gap-2 text-xl">
                                            <Sparkles className="w-5 h-5" />
                                            AI Bio Generator
                                        </DialogTitle>
                                        <DialogDescription className="text-violet-100">
                                            Transform your rough ideas into a professional bio.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="p-6 space-y-6 bg-white overflow-y-auto max-h-[70vh]">
                                        {!generatedPreview ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-slate-700">Rough Draft</Label>
                                                    <textarea
                                                        value={roughBio}
                                                        onChange={(e) => setRoughBio(e.target.value)}
                                                        placeholder="e.g. I have been taking photos for 5 years. I love candid shots and making people feel comfortable..."
                                                        className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm"
                                                    />
                                                    <p className="text-xs text-slate-500">Just type your key points. The AI will do the rest.</p>
                                                </div>
                                                <Button
                                                    onClick={handleGenerateBio}
                                                    disabled={!roughBio.trim() || isGeneratingBio}
                                                    className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11 rounded-xl"
                                                >
                                                    {isGeneratingBio ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Magically Writing...
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
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                                <div className="space-y-2">
                                                    <Label className="text-slate-700">Generated Bio</Label>
                                                    <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 text-slate-700 text-sm leading-relaxed">
                                                        {generatedPreview}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button variant="outline" onClick={() => setGeneratedPreview("")} className="h-11 rounded-xl border-slate-200">
                                                        Try Again
                                                    </Button>
                                                    <Button onClick={applyGeneratedBio} className="h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white">
                                                        Use This Bio
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Settings;
