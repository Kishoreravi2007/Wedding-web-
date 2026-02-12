/**
 * Client Dashboard - Premium Builder Dashboard
 * 
 * Main dashboard for wedding clients after login.
 * Features: Overview, Wedding Builder, Photo Gallery, Guests, Timeline
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from "react-qr-code";
import * as OTPAuth from "otpauth";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Heart, LogOut, Users, Image, Calendar, Gift, Camera, Star,
    MessageCircle, Settings, Eye, Share2, Edit3, Palette, Music,
    Clock, MapPin, Phone, Mail, ExternalLink, Copy, QrCode, Plus,
    Check, Sparkles, Layout, Bell, Crown, Trash2, User, Loader2, Shield, Settings2, Lock,
    CheckCircle2, RefreshCw, EyeOff, X, Upload, Search, Download
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken, API_BASE_URL } from '@/lib/api';
import ClockPicker from '@/components/premium/ClockPicker';
import CountdownTimer from '@/components/premium/CountdownTimer';

// --- Advanced Theme Engine (Shared Config) ---
type ThemeLayout = 'minimal-split' | 'luxury-serif' | 'rustic-overlay' | 'boho-frame' | 'modern-glass' | 'classic-centered';

interface ThemeConfig {
    layout: ThemeLayout;
    fontHeading: string;
    fontBody: string;
    colors: {
        bg: string;
        text: string;
        accent: string;
        secondary: string;
    };
    radius: string;
    decoration: 'none' | 'floral' | 'geometric' | 'gold-border';
}

const themeConfigs: Record<string, ThemeConfig> = {
    // --- Originals ---
    'Modern Elegance': {
        layout: 'minimal-split',
        fontHeading: 'font-playfair',
        fontBody: 'font-montserrat',
        colors: { bg: 'bg-slate-900', text: 'text-white', accent: 'text-rose-400', secondary: 'text-gray-400' },
        radius: 'rounded-none',
        decoration: 'geometric'
    },
    'Classic Romance': {
        layout: 'classic-centered',
        fontHeading: 'font-playfair',
        fontBody: 'font-lato',
        colors: { bg: 'bg-rose-50', text: 'text-rose-900', accent: 'text-rose-500', secondary: 'text-rose-700' },
        radius: 'rounded-xl',
        decoration: 'floral'
    },
    'Rustic Charm': {
        layout: 'rustic-overlay',
        fontHeading: 'font-cinzel',
        fontBody: 'font-cormorant',
        colors: { bg: 'bg-stone-100', text: 'text-stone-800', accent: 'text-amber-600', secondary: 'text-stone-600' },
        radius: 'rounded-2xl',
        decoration: 'none'
    },
    'Royal Luxury': {
        layout: 'luxury-serif',
        fontHeading: 'font-cinzel',
        fontBody: 'font-montserrat',
        colors: { bg: 'bg-purple-950', text: 'text-purple-50', accent: 'text-yellow-400', secondary: 'text-purple-200' },
        radius: 'rounded-md',
        decoration: 'gold-border'
    },

    // --- Nature ---
    'Forest Fern': {
        layout: 'rustic-overlay',
        fontHeading: 'font-playfair',
        fontBody: 'font-lato',
        colors: { bg: 'bg-emerald-900', text: 'text-emerald-50', accent: 'text-emerald-300', secondary: 'text-emerald-200' },
        radius: 'rounded-lg',
        decoration: 'none'
    },
    'Ocean Breeze': {
        layout: 'minimal-split',
        fontHeading: 'font-montserrat',
        fontBody: 'font-lato',
        colors: { bg: 'bg-sky-50', text: 'text-sky-900', accent: 'text-sky-500', secondary: 'text-sky-700' },
        radius: 'rounded-3xl',
        decoration: 'none'
    },
    'Sunset Glow': { layout: 'minimal-split', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-orange-50', text: 'text-orange-900', accent: 'text-orange-500', secondary: 'text-orange-700' }, radius: 'rounded-lg', decoration: 'none' },
    'Mountain Mist': { layout: 'rustic-overlay', fontHeading: 'font-raleway', fontBody: 'font-sans', colors: { bg: 'bg-gray-100', text: 'text-slate-800', accent: 'text-slate-500', secondary: 'text-slate-600' }, radius: 'rounded-sm', decoration: 'none' },
    'Desert Bloom': { layout: 'boho-frame', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-rose-100', text: 'text-stone-800', accent: 'text-stone-500', secondary: 'text-stone-600' }, radius: 'rounded-2xl', decoration: 'none' },

    // --- Classic ---
    'Gold & Ivory': {
        layout: 'luxury-serif',
        fontHeading: 'font-alex-brush',
        fontBody: 'font-poppins',
        colors: { bg: 'bg-[#fffff0]', text: 'text-[#c5a059]', accent: 'text-[#d4af37]', secondary: 'text-[#8a7e5f]' },
        radius: 'rounded-sm',
        decoration: 'gold-border'
    },
    'Black Tie': {
        layout: 'minimal-split',
        fontHeading: 'font-playfair',
        fontBody: 'font-lato',
        colors: { bg: 'bg-neutral-950', text: 'text-white', accent: 'text-neutral-400', secondary: 'text-neutral-500' },
        radius: 'rounded-none',
        decoration: 'geometric'
    },
    'Silver Soiree': { layout: 'luxury-serif', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-slate-50', text: 'text-slate-600', accent: 'text-slate-400', secondary: 'text-slate-500' }, radius: 'rounded-md', decoration: 'none' },
    'Pearl White': { layout: 'classic-centered', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-white', text: 'text-stone-500', accent: 'text-stone-400', secondary: 'text-stone-300' }, radius: 'rounded-full', decoration: 'none' },
    'Champagne Toast': { layout: 'luxury-serif', fontHeading: 'font-alex-brush', fontBody: 'font-poppins', colors: { bg: 'bg-[#f7e7ce]', text: 'text-[#5c5346]', accent: 'text-[#8e7e6a]', secondary: 'text-[#a69886]' }, radius: 'rounded-lg', decoration: 'none' },

    // --- Modern ---
    'City Lights': {
        layout: 'modern-glass',
        fontHeading: 'font-montserrat',
        fontBody: 'font-lato',
        colors: { bg: 'bg-zinc-950', text: 'text-yellow-50', accent: 'text-yellow-400', secondary: 'text-zinc-400' },
        radius: 'rounded-none',
        decoration: 'none'
    },
    'Midnight Blue': {
        layout: 'modern-glass',
        fontHeading: 'font-cormorant',
        fontBody: 'font-montserrat',
        colors: { bg: 'bg-[#0f172a]', text: 'text-blue-50', accent: 'text-blue-400', secondary: 'text-blue-200' },
        radius: 'rounded-xl',
        decoration: 'geometric'
    },
    'Charcoal & Rose': { layout: 'minimal-split', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-stone-800', text: 'text-rose-200', accent: 'text-rose-400', secondary: 'text-stone-600' }, radius: 'rounded-none', decoration: 'none' },
    'Monochrome': { layout: 'minimal-split', fontHeading: 'font-montserrat', fontBody: 'font-lato', colors: { bg: 'bg-white', text: 'text-black', accent: 'text-gray-800', secondary: 'text-gray-400' }, radius: 'rounded-none', decoration: 'geometric' },
    'Geometric Pop': { layout: 'modern-glass', fontHeading: 'font-raleway', fontBody: 'font-lato', colors: { bg: 'bg-white', text: 'text-indigo-600', accent: 'text-indigo-400', secondary: 'text-indigo-200' }, radius: 'rounded-lg', decoration: 'geometric' },

    // --- Romantic ---
    'Blushing Bride': {
        layout: 'boho-frame',
        fontHeading: 'font-great-vibes',
        fontBody: 'font-raleway',
        colors: { bg: 'bg-pink-50', text: 'text-pink-900', accent: 'text-pink-400', secondary: 'text-pink-700' },
        radius: 'rounded-[3rem]',
        decoration: 'floral'
    },
    'Lavender Haze': {
        layout: 'boho-frame',
        fontHeading: 'font-alex-brush',
        fontBody: 'font-lato',
        colors: { bg: 'bg-purple-50', text: 'text-purple-900', accent: 'text-purple-400', secondary: 'text-purple-700' },
        radius: 'rounded-2xl',
        decoration: 'floral'
    },
    'Peachy Keen': { layout: 'boho-frame', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-orange-100', text: 'text-orange-800', accent: 'text-orange-500', secondary: 'text-orange-600' }, radius: 'rounded-3xl', decoration: 'none' },
    'Red Velvet': { layout: 'luxury-serif', fontHeading: 'font-cinzel', fontBody: 'font-lato', colors: { bg: 'bg-red-900', text: 'text-rose-50', accent: 'text-rose-200', secondary: 'text-red-700' }, radius: 'rounded-md', decoration: 'none' },
    'Sweetheart Pink': { layout: 'classic-centered', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-rose-200', text: 'text-rose-900', accent: 'text-rose-600', secondary: 'text-rose-800' }, radius: 'rounded-xl', decoration: 'none' },

    // --- Cultural ---
    'Royal Red': {
        layout: 'luxury-serif',
        fontHeading: 'font-cinzel',
        fontBody: 'font-poppins',
        colors: { bg: 'bg-red-900', text: 'text-amber-50', accent: 'text-amber-400', secondary: 'text-red-200' },
        radius: 'rounded-none',
        decoration: 'gold-border'
    },
    'Teal & Gold': {
        layout: 'luxury-serif',
        fontHeading: 'font-cormorant',
        fontBody: 'font-raleway',
        colors: { bg: 'bg-teal-900', text: 'text-teal-50', accent: 'text-amber-300', secondary: 'text-teal-200' },
        radius: 'rounded-lg',
        decoration: 'gold-border'
    },
    'Saffron Sun': { layout: 'rustic-overlay', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-yellow-500', text: 'text-red-900', accent: 'text-red-700', secondary: 'text-yellow-700' }, radius: 'rounded-lg', decoration: 'none' },
    'Magenta Magic': { layout: 'modern-glass', fontHeading: 'font-montserrat', fontBody: 'font-lato', colors: { bg: 'bg-fuchsia-800', text: 'text-fuchsia-100', accent: 'text-fuchsia-300', secondary: 'text-fuchsia-600' }, radius: 'rounded-xl', decoration: 'none' },
    'Emerald Elegance': { layout: 'luxury-serif', fontHeading: 'font-playfair', fontBody: 'font-lato', colors: { bg: 'bg-emerald-800', text: 'text-emerald-100', accent: 'text-emerald-400', secondary: 'text-emerald-600' }, radius: 'rounded-md', decoration: 'none' }
};

const ClientDashboard = () => {
    const navigate = useNavigate();
    const { currentUser, logout, refreshProfile, enable2FA } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Initialize with real user data
    const [weddingData, setWeddingData] = useState({
        groomName: currentUser?.profile?.full_name?.split('&')[0]?.trim() || currentUser?.username?.split('@')[0] || 'Groom',
        brideName: currentUser?.profile?.full_name?.split('&')[1]?.trim() || 'Bride',
        weddingDate: '2026-03-15', // Default for now
        weddingTime: '10:00',
        showCountdown: true,
        venue: currentUser?.profile?.location || 'Venue TBD',
        guestCount: 0,
        photosCount: 0,
        wishesCount: 0,
        galleryViews: 0,
        theme: 'Modern Elegance',
        slug: currentUser?.username?.split('@')[0] || 'your-wedding',
        shareUrl: `weddingweb.co.in/weddings/${currentUser?.username?.split('@')[0] || 'your-wedding'}`,
        musicEnabled: false,
        musicUrl: null as string | null,
        musicSource: 'upload', // 'upload' | 'spotify' | 'youtube' | 'applemusic'
        playlistUrl: null as string | null,
        volume: 50
    });

    const [previewTheme, setPreviewTheme] = useState<string | null>(null);
    const [themeSearch, setThemeSearch] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(currentUser?.profile?.full_name || "");
    const [bioText, setBioText] = useState(currentUser?.profile?.bio || "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [roughBio, setRoughBio] = useState("");
    const [showAiDialog, setShowAiDialog] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalTab, setModalTab] = useState<'profile' | 'notifications' | 'security' | 'photographer' | 'advanced'>('profile');
    const [generatedPreview, setGeneratedPreview] = useState("");

    // Photographer Management State
    const [photoPassword, setPhotoPassword] = useState("");
    const [photoUsername, setPhotoUsername] = useState("");
    const [isManagingPhoto, setIsManagingPhoto] = useState(false);

    // 2FA State
    const [is2FAEnabled, setIs2FAEnabled] = useState(currentUser?.is_2fa_enabled || false);
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [tfaStep, setTfaStep] = useState(1);
    const [otpValue, setOtpValue] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [loginSessions, setLoginSessions] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Sync profile state when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setFullName(currentUser.profile?.full_name || "");
            setBioText(currentUser.profile?.bio || "");
            setIs2FAEnabled(currentUser.is_2fa_enabled || false);
            if (currentUser.role === 'photographer') {
                // Should not happen on ClientDashboard due to AuthGuard, but for safety
                navigate('/photographer');
            }
        }
    }, [currentUser, navigate]);

    // Sync editForm with weddingData when it's loaded
    useEffect(() => {
        if (!isEditing) {
            setEditForm({
                groomName: weddingData.groomName,
                brideName: weddingData.brideName,
                weddingDate: weddingData.weddingDate,
                weddingTime: weddingData.weddingTime,
                showCountdown: weddingData.showCountdown,
                venue: weddingData.venue,
                guestCount: weddingData.guestCount,
                musicEnabled: weddingData.musicEnabled,
                musicUrl: weddingData.musicUrl,
                musicSource: weddingData.musicSource,
                playlistUrl: weddingData.playlistUrl,
                volume: weddingData.volume,
                slug: weddingData.slug || ''
            });
        }
    }, [weddingData, isEditing]); // Now checks isEditing to prevent overwriting during edits

    const fetchLoginActivity = useCallback(async () => {
        setIsLoadingSessions(true);
        try {
            const token = getAccessToken();
            const res = await fetch(`${API_BASE_URL}/api/auth/login-activity`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('📡 Login activity response status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('✅ Fetched login activity:', data);
                setLoginSessions(Array.isArray(data) ? data : []);
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error('❌ Failed to fetch login activity:', errData);
                showError('Failed to load login activity');
            }
        } catch (error) {
            console.error('❌ Error fetching login activity:', error);
            showError('Connection error while loading activity');
        } finally {
            setIsLoadingSessions(false);
        }
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showError('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const token = getAccessToken();
            const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                    confirmPassword: passwordForm.confirmPassword
                })
            });

            if (res.ok) {
                showSuccess('Password updated successfully');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                fetchLoginActivity(); // Refresh activity
            } else {
                const data = await res.json();
                showError(data.message || 'Failed to update password');
            }
        } catch (error) {
            showError('Connection error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    useEffect(() => {
        if (showProfileModal && modalTab === 'security') {
            fetchLoginActivity();
        }
    }, [showProfileModal, modalTab, fetchLoginActivity]);

    const handleManagePhotographer = async () => {
        if (!photoPassword || photoPassword.length < 4) {
            showError("Password must be at least 4 characters");
            return;
        }

        setIsManagingPhoto(true);
        try {
            const token = getAccessToken();
            const res = await fetch(`${API_BASE_URL}/api/auth/photographer/credentials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: photoPassword })
            });

            if (res.ok) {
                const data = await res.json();
                setPhotoUsername(data.credentials.username);
                showSuccess("Photographer credentials updated!");
            } else {
                const data = await res.json();
                showError(data.message || "Failed to update photographer credentials");
            }
        } catch (error) {
            showError("Connection error");
        } finally {
            setIsManagingPhoto(false);
        }
    };

    const handleProfileUpdate = async () => {
        setIsSavingProfile(true);
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/profiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: fullName || currentUser?.username,
                    bio: bioText,
                    location: weddingData?.venue || 'Not specified',
                    email: currentUser?.username
                })
            });

            if (res.ok) {
                if (refreshProfile) await refreshProfile();
                showSuccess('Profile updated successfully');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            showError('Failed to update profile');
        } finally {
            setIsSavingProfile(false);
        }
    };


    const handleEnable2FA = () => {
        setIsVerifying(true);
        const totp = new OTPAuth.TOTP({
            issuer: "WeddingWeb",
            label: currentUser?.username || "user@example.com",
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: "KR577WEDDINGWEB2FA"
        });

        setTimeout(async () => {
            const delta = totp.validate({ token: otpValue, window: 1 });
            if (delta !== null) {
                try {
                    await enable2FA(true, "KR577WEDDINGWEB2FA");
                    setIs2FAEnabled(true);
                    setTfaStep(3);
                    showSuccess("2FA Enabled successfully!");
                    if (refreshProfile) await refreshProfile();
                } catch (error) {
                    showError("Failed to save 2FA settings.");
                } finally {
                    setIsVerifying(false);
                }
            } else {
                setIsVerifying(false);
                showError("Invalid verification code. Please try again.");
            }
        }, 1500);
    };

    const reset2FA = () => {
        setTfaStep(1);
        setOtpValue("");
    };

    const handleGenerateBio = async () => {
        if (!roughBio.trim()) return;
        setIsGeneratingBio(true);
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/ai/generate-bio`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    draft: roughBio,
                    name: fullName || currentUser?.username,
                    type: "Wedding Host"
                })
            });
            const data = await res.json();
            if (res.ok) {
                setGeneratedPreview(data.bio);
                showSuccess("Bio generated!");
            } else {
                console.error('AI Bio Generation Error:', data);
                showError(data.message || "Failed to generate bio. Please try again.");
            }
        } catch (error) {
            console.error('AI Bio Generation Network Error:', error);
            showError("Network error: Could not reach AI service.");
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const [editForm, setEditForm] = useState({
        groomName: weddingData.groomName,
        brideName: weddingData.brideName,
        weddingDate: weddingData.weddingDate,
        weddingTime: weddingData.weddingTime,
        showCountdown: weddingData.showCountdown,
        venue: weddingData.venue,
        guestCount: weddingData.guestCount,
        musicEnabled: weddingData.musicEnabled,
        musicUrl: weddingData.musicUrl,
        musicSource: weddingData.musicSource,
        playlistUrl: weddingData.playlistUrl,
        volume: weddingData.volume,
        slug: weddingData?.slug || '' // Add slug to state
    });



    const [isUploadingMusic, setIsUploadingMusic] = useState(false);

    const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        setIsUploadingMusic(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('music', file);
        formData.append('sister', weddingData.slug);

        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;

            const res = await fetch(`${apiUrl}/api/music/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                showSuccess('Music uploaded successfully');

                // Parse existing URLs
                let currentUrls: string[] = [];
                try {
                    const rawUrl = isEditing ? editForm.musicUrl : weddingData.musicUrl;
                    if (rawUrl) {
                        if (rawUrl.startsWith('[')) {
                            currentUrls = JSON.parse(rawUrl);
                        } else {
                            currentUrls = [rawUrl];
                        }
                    }
                } catch (e) {
                    console.log("Error parsing existing music URLs", e);
                    // Fallback to simpler logic or empty
                }

                // Add new URL
                const newUrls = [...currentUrls, data.url];
                const newUrlString = JSON.stringify(newUrls);

                setEditForm(prev => ({ ...prev, musicUrl: newUrlString }));
                setIsEditing(true); // Automatically enable save button on upload
            } else {
                showError('Failed to upload music');
            }
        } catch (error) {
            console.error('Music upload error:', error);
            showError('Error uploading music');
        } finally {
            setIsUploadingMusic(false);
            e.target.value = '';
        }
    };

    const handleRemoveMusic = (indexToRemove: number) => {
        let currentUrls: string[] = [];
        const rawUrl = isEditing ? editForm.musicUrl : weddingData.musicUrl;

        if (rawUrl) {
            try {
                if (rawUrl.startsWith('[')) {
                    currentUrls = JSON.parse(rawUrl);
                } else {
                    currentUrls = [rawUrl];
                }
            } catch (e) {
                currentUrls = [rawUrl];
            }
        }

        const newUrls = currentUrls.filter((_, index) => index !== indexToRemove);
        const newUrlString = newUrls.length > 0 ? JSON.stringify(newUrls) : null;

        setEditForm(prev => ({ ...prev, musicUrl: newUrlString }));
        setIsEditing(true); // Always enable save button on removal
    };

    const [guests, setGuests] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Fetch Guests & Timeline
    useEffect(() => {
        fetchWeddingData();
        fetchPhase2Data();
    }, [currentUser]);

    const fetchWeddingData = async () => {
        if (!currentUser) return;
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const response = await fetch(`${apiUrl}/api/auth/client/wedding`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.wedding) {
                    setWeddingData(prev => ({
                        ...prev,
                        ...data.wedding,
                        // Convert DB snake_case to frontend camelCase if needed
                        groomName: data.wedding.groom_name || prev.groomName,
                        brideName: data.wedding.bride_name || prev.brideName,
                        weddingDate: data.wedding.wedding_date ? new Date(data.wedding.wedding_date).toISOString().split('T')[0] : prev.weddingDate,
                        weddingTime: data.wedding.wedding_time || prev.weddingTime,
                        showCountdown: data.wedding.show_countdown !== null ? data.wedding.show_countdown : prev.showCountdown,
                        guestCount: data.wedding.guest_count || prev.guestCount,
                        theme: data.wedding.theme || prev.theme,

                        slug: data.wedding.wedding_code || prev.slug,
                        shareUrl: `weddingweb.co.in/weddings/${data.wedding.wedding_code || prev.slug}`,
                        musicEnabled: data.wedding.musicEnabled !== undefined ? data.wedding.musicEnabled : prev.musicEnabled,
                        musicUrl: data.wedding.musicUrl || prev.musicUrl,
                        musicSource: data.wedding.musicSource || prev.musicSource,
                        playlistUrl: data.wedding.playlistUrl || prev.playlistUrl,
                        volume: data.wedding.volume !== null ? data.wedding.volume : prev.volume
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching wedding data:', error);
        }
    };

    const [eventForm, setEventForm] = useState<{
        id: string;
        date: string;
        time: string;
        title: string;
        location: string;
        locationMapUrl: string;
        photoFile: File | null;
        photoUrl: string; // For display only
        description: string;
        sortOrder: number;
    }>({
        id: '', // Add ID for editing
        date: weddingData.weddingDate || new Date().toISOString().split('T')[0],
        time: '10:00',
        title: '',
        location: '',
        locationMapUrl: '',
        photoFile: null,
        photoUrl: '',
        description: '',
        sortOrder: 0
    });
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [showEventDialog, setShowEventDialog] = useState(false);

    // Auto-sync event date with wedding date when it's loaded
    useEffect(() => {
        if (weddingData.weddingDate) {
            setEventForm(prev => ({
                ...prev,
                date: weddingData.weddingDate
            }));
        }
    }, [weddingData.weddingDate]);

    const fetchPhase2Data = async () => {
        if (!currentUser) return;
        setIsLoadingData(true);
        const token = getAccessToken();
        const apiUrl = API_BASE_URL;

        try {
            // Fetch Guests
            const gRes = await fetch(`${apiUrl}/api/guests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const gData = await gRes.json();
            if (gData.success) setGuests(gData.guests);

            // Fetch Timeline
            const tRes = await fetch(`${apiUrl}/api/timeline`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tData = await tRes.json();
            if (tData.success) setTimeline(tData.timeline);

            // Fetch Gallery Photos
            if (weddingData.id) {
                const pRes = await fetch(`${apiUrl}/api/photos?weddingId=${weddingData.id}&limit=50`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (pRes.ok) {
                    const pData = await pRes.json();
                    setGalleryPhotos(pData.photos || []);
                }
            }

        } catch (error) {
            console.error('Error fetching Phase 2 data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !weddingData.slug) return;

        setIsUploadingGallery(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('sister', weddingData.slug);
        if (weddingData.id) {
            formData.append('wedding_id', weddingData.id);
        }
        formData.append('title', 'Photographer Upload');
        formData.append('description', 'Uploaded via Dashboard');
        formData.append('eventType', 'wedding');
        // formData.append('tags', JSON.stringify(['official'])); 

        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;

            const res = await fetch(`${apiUrl}/api/photos`, { // Authenticated upload
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                // Add new photo to start of list (assuming backend returns full photo object or we construct it)
                // Re-fetch to be safe and get processed URLs/faces
                const pRes = await fetch(`${apiUrl}/api/photos?weddingId=${weddingData.id}&limit=50`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (pRes.ok) {
                    const pData = await pRes.json();
                    setGalleryPhotos(pData.photos || []);
                }
                showSuccess('Photo uploaded successfully');
            } else {
                showError('Failed to upload photo');
            }
        } catch (error) {
            console.error('Gallery upload error:', error);
            showError('Error uploading photo');
        } finally {
            setIsUploadingGallery(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDeletePhoto = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;

        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/photos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setGalleryPhotos(prev => prev.filter(p => p.id !== id));
                showSuccess('Photo deleted');
                // Update stats
                setWeddingData(prev => ({
                    ...prev,
                    photosCount: Math.max(0, (prev.photosCount || 0) - 1)
                }));
            } else {
                showError('Failed to delete photo');
            }
        } catch (error) {
            console.error('Delete photo error:', error);
            showError('Error deleting photo');
        }
    };

    const handleDownloadAll = async () => {
        if (!weddingData.slug) {
            showError('Wedding slug not found. Please save your settings first.');
            return;
        }

        try {
            setIsDownloadingAll(true);
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const response = await fetch(`${apiUrl}/api/photos/download-all?sister=${weddingData.slug}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `wedding_photos_${weddingData.slug}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showSuccess('Gallery download started!');
        } catch (err) {
            console.error('Download failed:', err);
            showError('Failed to download gallery package.');
        } finally {
            setIsDownloadingAll(false);
        }
    };

    const handleAddGuest = async (newGuest: any) => {
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/guests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newGuest)
            });
            const data = await res.json();
            if (data.success) {
                setGuests(prev => [data.guest, ...prev]);
                showSuccess('Guest added successfully');
                return true;
            }
        } catch (error) {
            console.error('Add guest error:', error);
            showError('Error adding guest');
        }
        return false;
    };

    const handleSendWhatsApp = async (guestId: string) => {
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/guests/${guestId}/send-whatsapp`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('WhatsApp invitation sent!');
            } else {
                showError(data.error || 'Failed to send WhatsApp');
            }
        } catch (error) {
            console.error('WhatsApp send error:', error);
            showError('Error sending WhatsApp invitation');
        }
    };

    const handleSendWhatsAppAll = async () => {
        if (!window.confirm(`Are you sure you want to send WhatsApp invitations to all guests with phone numbers?`)) return;

        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/guests/send-whatsapp-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showSuccess(`Started sending ${data.count} invitations in the background!`);
            } else {
                showError(data.error || 'Failed to trigger bulk invitations');
            }
        } catch (error) {
            console.error('Bulk WhatsApp error:', error);
            showError('Error triggering bulk WhatsApp invitations');
        }
    };

    const handleResetAllGuests = async () => {
        if (!window.confirm('Are you sure you want to delete ALL guests? This action cannot be undone.')) return;

        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/guests`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setGuests([]);
                showSuccess('All guests removed');
                // Update stats
                setWeddingData(prev => ({
                    ...prev,
                    guestCount: 0
                }));
            } else {
                showError('Failed to reset guests');
            }
        } catch (error) {
            console.error('Reset all guests error:', error);
            showError('Error resetting guest list');
        }
    };

    const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            // Simple CSV parser supporting common delimiters and quoted fields (basic)
            const rows = text.split(/\r?\n/).filter(line => line.trim()).map(row => {
                // Handle basic comma separation (no complex CSV support like quotes with commas for now)
                return row.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
            });

            if (rows.length < 2) {
                showError('Invalid CSV format. Need at least a header and one row.');
                return;
            }

            const headers = rows[0].map(h => h.toLowerCase());
            const guestRows = rows.slice(1);

            const guestData = guestRows.map(row => {
                const guest: any = {};
                headers.forEach((header, index) => {
                    const value = row[index];
                    if (!value) return;

                    if (header.includes('name')) guest.name = value;
                    else if (header.includes('email')) guest.email = value;
                    else if (header.includes('phone')) guest.phone = value;
                    else if (header.includes('group')) guest.group_name = value;
                    else if (header.includes('diet')) guest.dietary_requirements = value;
                });
                return guest;
            }).filter(g => g.name);

            if (guestData.length === 0) {
                showError('No valid guest data found in CSV (Names are required)');
                return;
            }

            try {
                const token = getAccessToken();
                const apiUrl = API_BASE_URL;
                const res = await fetch(`${apiUrl}/api/guests/bulk`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ guests: guestData })
                });

                const data = await res.json();
                if (data.success) {
                    showSuccess(data.message || `Imported ${data.count} guests`);
                    // Refresh guests list
                    const gRes = await fetch(`${apiUrl}/api/guests`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (gRes.ok) {
                        const gData = await gRes.json();
                        setGuests(gData.guests || []);
                    }
                } else {
                    showError(data.error || 'Failed to import guests');
                }
            } catch (error) {
                showError('Error importing guests');
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteGuest = async (id: string) => {
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/guests/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setGuests(prev => prev.filter(g => g.id !== id));
                showSuccess('Guest removed');
            }
        } catch (error) {
            showError('Failed to delete guest');
        }
    };

    const handleAddEvent = async (newEvent: any) => {
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;

            const formData = new FormData();
            formData.append('event_date', newEvent.event_date);
            formData.append('event_time', newEvent.event_time);
            formData.append('title', newEvent.title);
            formData.append('description', newEvent.description);
            formData.append('location', newEvent.location);
            formData.append('location_map_url', newEvent.location_map_url);
            formData.append('sort_order', newEvent.sort_order.toString());
            // Send photo_url as well, so if no file is uploaded but URL exists (or is cleared), it's handled
            formData.append('photo_url', newEvent.photoUrl || '');

            if (newEvent.photoFile) {
                formData.append('photo', newEvent.photoFile);
            }

            const res = await fetch(`${apiUrl}/api/timeline`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setTimeline(prev => [...prev, data.event].sort((a, b) => {
                    const dateA = a.event_date || '';
                    const dateB = b.event_date || '';
                    if (dateA !== dateB) return dateA.localeCompare(dateB);
                    return a.event_time.localeCompare(b.event_time);
                }));
                showSuccess('Event added to timeline');
                return true;
            }
        } catch (error) {
            showError('Failed to add event');
        }
        return false;
    };

    const handleUpdateEvent = async (id: string, updatedEvent: any) => {
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;

            const formData = new FormData();
            formData.append('event_date', updatedEvent.event_date);
            formData.append('event_time', updatedEvent.event_time);
            formData.append('title', updatedEvent.title);
            formData.append('description', updatedEvent.description);
            formData.append('location', updatedEvent.location);
            formData.append('location_map_url', updatedEvent.location_map_url);
            formData.append('sort_order', updatedEvent.sort_order.toString());
            // Send photo_url as well, so if no file is uploaded but URL exists (or is cleared), it's handled
            formData.append('photo_url', updatedEvent.photoUrl || '');

            if (updatedEvent.photoFile) {
                formData.append('photo', updatedEvent.photoFile);
            }

            const res = await fetch(`${apiUrl}/api/timeline/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setTimeline(prev => prev.map(e => e.id === id ? data.event : e).sort((a, b) => {
                    const dateA = a.event_date || '';
                    const dateB = b.event_date || '';
                    if (dateA !== dateB) return dateA.localeCompare(dateB);
                    return a.event_time.localeCompare(b.event_time);
                }));
                showSuccess('Event updated successfully');
                return true;
            }
        } catch (error) {
            showError('Failed to update event');
        }
        return false;
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/timeline/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTimeline(prev => prev.filter(e => e.id !== id));
                showSuccess('Event removed');
            }
        } catch (error) {
            showError('Failed to delete event');
        }
    };


    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action is permanent and all your wedding data will be lost.")) {
            return;
        }

        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;
            const res = await fetch(`${apiUrl}/api/auth/account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                showSuccess('Account deleted successfully');
                await logout();
                navigate('/company/login');
            } else {
                throw new Error('Failed to delete account');
            }
        } catch (error) {
            showError('Failed to delete account. Please contact support.');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://${weddingData.shareUrl}`);
        showSuccess('Link copied to clipboard!');
    };

    const handleSaveChanges = async () => {
        // Slug Validation
        if (editForm.slug) {
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(editForm.slug)) {
                showError("Personalized Link can only contain lowercase letters, numbers, and hyphens.");
                return;
            }
            if (editForm.slug.length < 3) {
                showError("Personalized Link must be at least 3 characters long.");
                return;
            }
        }

        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;

            // Only update local state first
            setWeddingData(prev => ({
                ...prev,
                ...editForm
            }));

            // Prepare data for backend
            const updatedWeddingData = {
                ...weddingData, // Include current theme, etc.
                ...editForm,    // Overwrite with edited fields
                theme: weddingData.theme // Ensure theme matches current state (if edited elsewhere)
            };

            console.log('📝 [handleSaveChanges] Sending updatedWeddingData:', updatedWeddingData);

            // Call API
            const response = await fetch(`${apiUrl}/api/auth/client/wedding`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ weddingData: updatedWeddingData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 409) {
                    showError(errorData.message);
                    return;
                }
                throw new Error(errorData.message || 'Failed to save changes');
            }

            // Update local state with confirmed slug
            setWeddingData(prev => ({
                ...prev,
                ...editForm,
                slug: editForm.slug,
                shareUrl: `weddingweb.co.in/weddings/${editForm.slug}`
            }));

            setIsEditing(false);
            showSuccess('Website updated successfully!');
        } catch (error: any) {
            console.error(error);
            showError(error.message || 'Failed to save changes');
        }
    };

    const handleThemeChange = async (newTheme: string) => {
        // Optimistic update
        setWeddingData(prev => ({ ...prev, theme: newTheme }));
        setEditForm(prev => ({ ...prev, theme: newTheme })); // Sync edit form too

        try {
            const token = getAccessToken();
            const apiUrl = API_BASE_URL;

            // Construct payload directly to ensure we use newTheme
            const updatedWeddingData = {
                ...weddingData,
                ...editForm,
                theme: newTheme
            };

            const response = await fetch(`${apiUrl}/api/auth/client/wedding`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ weddingData: updatedWeddingData })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to save theme');
            }

            showSuccess(`Theme applied: ${newTheme}`);
        } catch (error: any) {
            console.error(error);
            showError(error.message || 'Failed to save theme');
        }
    };

    // Premium features list
    const premiumFeatures = [
        { icon: Camera, name: 'Photo Gallery', desc: 'Unlimited uploads with face recognition', active: true },
        { icon: Music, name: 'Music Player', desc: 'Custom playlist for your wedding', active: false },
        { icon: Palette, name: 'Custom Theme', desc: 'Premium themes and customization', active: true },
        { icon: Gift, name: 'Digital RSVP', desc: 'Track guest responses in real-time', active: false },
        { icon: Bell, name: 'Notifications', desc: 'Send reminders to guests', active: false },
        { icon: QrCode, name: 'QR Invites', desc: 'Scannable invitation codes', active: true }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-rose-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    WeddingWeb
                                </h1>
                                <p className="text-xs text-gray-500">Premium Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="hidden sm:flex items-center gap-1 border-amber-300 text-amber-700 bg-amber-50 mr-2">
                                <Crown className="w-3 h-3" />
                                Premium
                            </Badge>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-rose-100 hover:border-rose-300 transition-all">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={currentUser?.profile?.avatar_url} alt={currentUser?.username} />
                                            <AvatarFallback className="bg-rose-100 text-rose-700 font-bold">
                                                {(fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{fullName || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {currentUser?.username}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>My Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/weddings/${weddingData.slug}`)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>View Website</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setActiveTab('overview')}>
                                        <Layout className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area with Sidebar */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sidebar Navigation - Hidden on Mobile, Fixed Sidebar on Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 bg-white/80 backdrop-blur-md rounded-2xl border border-rose-100 p-4 sticky top-24 z-30 shadow-sm">
                        <div className="space-y-1">
                            {[
                                { id: 'overview', label: 'Dashboard', icon: Layout },
                                { id: 'builder', label: 'Website Builder', icon: Edit3 },
                                { id: 'gallery', label: 'Photo Gallery', icon: Camera },
                                { id: 'guests', label: 'Guest Management', icon: Users },
                                { id: 'timeline', label: 'Event Timeline', icon: Clock },
                                { id: 'music', label: 'Music Settings', icon: Music },
                                { id: 'photographer', label: 'Photographer', icon: Camera },
                            ].map((item) => (
                                <Button
                                    key={item.id}
                                    variant={activeTab === item.id ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 transition-all ${activeTab === item.id
                                        ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 font-bold border-l-4 border-rose-500 rounded-l-none'
                                        : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                                        }`}
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-rose-600' : 'text-gray-400'}`} />
                                    <span className="text-sm">{item.label}</span>
                                </Button>
                            ))}
                        </div>

                        {/* Sidebar Progress Indicator */}
                        <div className="mt-8 pt-6 border-t border-rose-50">
                            <div className="px-3 mb-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Setup Progress</p>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="font-semibold text-rose-600">85% Complete</span>
                                    <Crown className="w-3 h-3 text-amber-500" />
                                </div>
                                <div className="h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                                        style={{ width: '85%' }}
                                    ></div>
                                </div>
                            </div>

                            <div className="px-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-[10px] h-8 border-rose-200 text-rose-600 hover:bg-rose-50"
                                    onClick={() => window.open(`https://${weddingData.shareUrl}`, '_blank')}
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Live Preview
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 w-full">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            {/* Photographer Tab */}
                            <TabsContent value="photographer" className="space-y-6">
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                <Camera className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">Photographer Access</CardTitle>
                                                <CardDescription>Manage credentials for your professional photographer</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-w-2xl space-y-6">
                                            <div className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50/30">
                                                <div className="space-y-4">
                                                    <p className="text-sm text-indigo-900/70 leading-relaxed">
                                                        Enable a dedicated portal for your photographer to manage uploads,
                                                        organize gallery photos, and use face recognition tools. They will
                                                        not have access to your premium builder settings or guest lists.
                                                    </p>

                                                    {photoUsername && (
                                                        <div className="p-4 bg-white border border-indigo-100 rounded-xl space-y-3 animate-fade-in shadow-sm">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Assigned Username</span>
                                                                <Badge variant="outline" className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700">Ready for share</Badge>
                                                            </div>
                                                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                <code className="text-base font-mono text-indigo-600 font-bold">{photoUsername}</code>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(photoUsername);
                                                                        showSuccess("Username copied to clipboard!");
                                                                    }}
                                                                >
                                                                    <Copy className="w-4 h-4 mr-2" />
                                                                    Copy
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-3 pt-2">
                                                        <Label className="text-sm font-bold text-gray-700">Set Access Password</Label>
                                                        <div className="flex gap-3">
                                                            <Input
                                                                type="text"
                                                                placeholder="Minimum 4 characters"
                                                                className="h-11 bg-white border-indigo-100 focus:ring-indigo-500"
                                                                value={photoPassword}
                                                                onChange={(e) => setPhotoPassword(e.target.value)}
                                                            />
                                                            <Button
                                                                onClick={handleManagePhotographer}
                                                                disabled={isManagingPhoto || photoPassword.length < 4}
                                                                className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 shadow-lg shadow-indigo-100"
                                                            >
                                                                {isManagingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : photoUsername ? "Update Credentials" : "Generate Access"}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 mt-6 border-t border-indigo-100">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sharing Instructions</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {[
                                                                { step: '1', text: 'Share the username and password with your photographer.' },
                                                                { step: '2', text: 'They should log in at weddingweb.co.in/login.' },
                                                                { step: '3', text: 'They will be redirected to their professional portal.' }
                                                            ].map((item) => (
                                                                <div key={item.step} className="flex gap-3">
                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{item.step}</span>
                                                                    <p className="text-xs text-slate-500 leading-tight">{item.text}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            {/* Horizontal Tabs - Only show on Mobile */}
                            <div className="lg:hidden mb-6 sticky top-[72px] z-40 bg-gray-50/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-rose-100">
                                <TabsList className="flex overflow-x-auto bg-white/80 rounded-xl p-1 no-scrollbar border border-rose-100 shadow-sm">
                                    <TabsTrigger value="overview" className="flex-shrink-0 text-xs px-4">Dashboard</TabsTrigger>
                                    <TabsTrigger value="builder" className="flex-shrink-0 text-xs px-4">Builder</TabsTrigger>
                                    <TabsTrigger value="gallery" className="flex-shrink-0 text-xs px-4">Gallery</TabsTrigger>
                                    <TabsTrigger value="guests" className="flex-shrink-0 text-xs px-4">Guests</TabsTrigger>
                                    <TabsTrigger value="timeline" className="flex-shrink-0 text-xs px-4">Timeline</TabsTrigger>
                                    <TabsTrigger value="music" className="flex-shrink-0 text-xs px-4">Music</TabsTrigger>
                                    <TabsTrigger value="photographer" className="flex-shrink-0 text-xs px-4">Photographer</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="overview" className="space-y-6">
                                {/* Welcome Banner */}
                                <Card className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white border-0 shadow-xl overflow-hidden relative">
                                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
                                    <CardContent className="p-6 sm:p-8 relative">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{weddingData.groomName} & {weddingData.brideName}</h2>
                                                <div className="flex flex-wrap items-center gap-3 text-pink-100">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(weddingData.weddingDate).toLocaleDateString('en-US', {
                                                            month: 'long', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {weddingData.venue}
                                                    </span>
                                                </div>
                                            </div>

                                            {weddingData.showCountdown && (
                                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                                                    <p className="text-[10px] text-pink-100 uppercase tracking-widest font-bold mb-2 text-center md:text-left">The Big Day In</p>
                                                    <CountdownTimer targetDate={weddingData.weddingDate} targetTime={weddingData.weddingTime} theme={weddingData.theme} />
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                                                    onClick={() => window.open(`https://${weddingData.shareUrl}`, '_blank')}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Preview
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                                                    onClick={handleCopyLink}
                                                >
                                                    <Share2 className="w-4 h-4 mr-1" />
                                                    Share
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { icon: Users, value: weddingData.guestCount, label: 'Guests', color: 'text-blue-500' },
                                        { icon: Image, value: weddingData.photosCount, label: 'Photos', color: 'text-green-500' },
                                        { icon: MessageCircle, value: weddingData.wishesCount, label: 'Wishes', color: 'text-pink-500' },
                                        { icon: Eye, value: weddingData.galleryViews, label: 'Views', color: 'text-purple-500' }
                                    ].map((stat) => (
                                        <Card key={stat.label} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 text-center">
                                                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                                <p className="text-sm text-gray-500">{stat.label}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* Steps for Editing the Website */}
                                    <Card className="bg-white/80 backdrop-blur-sm border-amber-100 shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-xl font-serif">
                                                <Sparkles className="w-5 h-5 text-amber-500" />
                                                Steps to Edit Your Website
                                            </CardTitle>
                                            <CardDescription>
                                                Follow these simple steps to launch your dream wedding site.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {[
                                                {
                                                    id: 'step-theme',
                                                    title: '1. Select Your Theme',
                                                    desc: 'Choose a design that matches your aesthetic.',
                                                    icon: Palette,
                                                    color: 'text-purple-500',
                                                    bgColor: 'bg-purple-50',
                                                    action: () => {
                                                        setActiveTab('builder');
                                                        setTimeout(() => document.getElementById('theme-selection-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                                    }
                                                },
                                                {
                                                    id: 'step-details',
                                                    title: '2. Basic Details',
                                                    desc: 'Update names, date, and your wedding venue.',
                                                    icon: Calendar,
                                                    color: 'text-rose-500',
                                                    bgColor: 'bg-rose-50',
                                                    action: () => {
                                                        setActiveTab('builder');
                                                        setTimeout(() => document.getElementById('basic-details-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                                    }
                                                },
                                                {
                                                    id: 'step-visual',
                                                    title: '3. Visual HUD Editor',
                                                    desc: 'Edit text directly on your live site preview.',
                                                    icon: Edit3,
                                                    color: 'text-indigo-500',
                                                    bgColor: 'bg-indigo-50',
                                                    action: () => {
                                                        const width = 1200;
                                                        const height = 800;
                                                        const left = (window.screen.width / 2) - (width / 2);
                                                        const top = (window.screen.height / 2) - (height / 2);
                                                        window.open('/client/editor', 'VisualEditor', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`);
                                                    }
                                                },
                                                {
                                                    id: 'step-share',
                                                    title: '4. Launch & Share',
                                                    desc: 'Copy your unique link and send to guests.',
                                                    icon: Share2,
                                                    color: 'text-emerald-500',
                                                    bgColor: 'bg-emerald-50',
                                                    action: handleCopyLink
                                                }
                                            ].map((step, idx) => (
                                                <div
                                                    key={step.id}
                                                    className="group flex items-start gap-4 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-gray-100"
                                                    onClick={step.action}
                                                >
                                                    <div className={`p-2.5 rounded-lg ${step.bgColor} ${step.color} shrink-0 group-hover:scale-110 transition-transform`}>
                                                        <step.icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors flex items-center gap-2">
                                                            {step.title}
                                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">{step.desc}</p>
                                                    </div>
                                                    <div className="self-center">
                                                        <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold text-gray-400 group-hover:text-rose-500">
                                                            Go
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Premium Features */}
                                    <Card className="bg-white/80 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Crown className="w-5 h-5 text-amber-500" />
                                                Premium Features
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {premiumFeatures.map((feature) => (
                                                <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <feature.icon className="w-5 h-5 text-gray-600" />
                                                        <div>
                                                            <p className="font-medium text-sm">{feature.name}</p>
                                                            <p className="text-xs text-gray-500">{feature.desc}</p>
                                                        </div>
                                                    </div>
                                                    {feature.active ? (
                                                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="text-xs">
                                                            Unlock
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Share URL Card */}
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ExternalLink className="w-5 h-5 text-blue-500" />
                                            Your Wedding Website
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-white border border-rose-100 rounded-lg shadow-sm">
                                                <div className="flex-1">
                                                    <p className="text-[10px] uppercase tracking-wider text-rose-500 font-bold mb-1">Local Development URL</p>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={`http://localhost:3001/weddings/${weddingData.slug}`}
                                                            readOnly
                                                            className="bg-gray-50 font-mono text-xs h-8"
                                                        />
                                                        <Button size="sm" variant="ghost" onClick={() => {
                                                            navigator.clipboard.writeText(`http://localhost:3001/weddings/${weddingData.slug}`);
                                                            showSuccess('Local URL copied');
                                                        }}>
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => window.open(`http://localhost:3001/weddings/${weddingData.slug}`, '_blank')}>
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg opacity-60">
                                                <div className="flex-1">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Production URL (Live Site)</p>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={`https://weddingweb.co.in/weddings/${weddingData.slug}`}
                                                            readOnly
                                                            className="bg-white/50 font-mono text-xs h-8"
                                                        />
                                                        <Badge variant="outline" className="text-[9px] h-5 bg-blue-50">Production</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Builder Tab */}
                            <TabsContent value="builder" className="space-y-6">
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader id="basic-details-section" className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Wedding Details</CardTitle>
                                            <CardDescription>Customize your wedding website content</CardDescription>
                                        </div>
                                        {!isEditing ? (
                                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                                <Edit3 className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">Cancel</Button>
                                                <Button onClick={handleSaveChanges} size="sm">
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Save
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Groom's Name</Label>
                                                <Input
                                                    value={isEditing ? editForm.groomName : weddingData.groomName}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, groomName: e.target.value }))}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Bride's Name</Label>
                                                <Input
                                                    value={isEditing ? editForm.brideName : weddingData.brideName}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, brideName: e.target.value }))}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Wedding Date</Label>
                                                <Input
                                                    type="date"
                                                    value={isEditing ? editForm.weddingDate : weddingData.weddingDate}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, weddingDate: e.target.value }))}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Venue</Label>
                                                <Input
                                                    value={isEditing ? editForm.venue : weddingData.venue}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, venue: e.target.value }))}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Expected Guests</Label>
                                                <Input
                                                    type="number"
                                                    value={isEditing ? editForm.guestCount : weddingData.guestCount}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, guestCount: parseInt(e.target.value) }))}
                                                    disabled={!isEditing}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Ceremony Time</Label>
                                                {isEditing ? (
                                                    <ClockPicker
                                                        value={editForm.weddingTime || '10:00'}
                                                        onChange={(val) => setEditForm(prev => ({ ...prev, weddingTime: val }))}
                                                    />
                                                ) : (
                                                    <Input value={weddingData.weddingTime} disabled className="bg-gray-50/50" />
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Personalized Wedding Link</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-muted px-3 py-2 rounded-l-md border border-r-0 text-muted-foreground text-sm whitespace-nowrap">
                                                        weddingweb.co.in/weddings/
                                                    </div>
                                                    <Input
                                                        value={isEditing ? editForm.slug : weddingData.slug}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                                                        disabled={!isEditing}
                                                        className="rounded-l-none font-mono text-sm"
                                                        placeholder="my-wedding-name"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-base text-rose-900 font-bold">Wedding Countdown</Label>
                                                <p className="text-sm text-gray-500 italic">Show a live countdown timer on your website</p>
                                            </div>
                                            <Switch
                                                checked={isEditing ? editForm.showCountdown : weddingData.showCountdown}
                                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, showCountdown: checked }))}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Visual Editor Callout */}
                                <Card className="bg-gradient-to-r from-rose-500 to-purple-600 text-white border-none overflow-hidden relative shadow-lg transform transition-all hover:scale-[1.01]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                                    <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between relative z-10 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                                                <h3 className="text-xl font-bold">Visual Website Editor</h3>
                                            </div>
                                            <p className="text-rose-100 opacity-90 max-w-xl text-sm leading-relaxed">
                                                Want to change "The Wedding Of" or "Captured Moments"? Click below to edit text,
                                                titles, and labels directly on your wedding site preview.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => navigate('/client/editor')}
                                            className="bg-white text-rose-600 hover:bg-gray-100 font-bold shadow-xl shrink-0 border-0"
                                            size="lg"
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" /> Open Visual Editor
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Theme Selector */}
                                <Card className="bg-white/80 backdrop-blur-sm" id="theme-selection-section">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Palette className="w-5 h-5 text-purple-500" />
                                            Theme Selection
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-6 relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search themes (e.g., 'Gold', 'Blue', 'Modern')..."
                                                value={themeSearch}
                                                onChange={(e) => setThemeSearch(e.target.value)}
                                                className="pl-9 bg-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2">
                                            {[
                                                // Originals
                                                'Modern Elegance', 'Classic Romance', 'Rustic Charm', 'Minimalist',
                                                'Vintage Glamour', 'Boho Chic', 'Beach Bliss', 'Royal Luxury',

                                                // Nature
                                                'Forest Fern', 'Ocean Breeze', 'Sunset Glow', 'Mountain Mist', 'Desert Bloom',

                                                // Classic
                                                'Gold & Ivory', 'Silver Soiree', 'Pearl White', 'Black Tie', 'Champagne Toast',

                                                // Modern
                                                'City Lights', 'Midnight Blue', 'Charcoal & Rose', 'Monochrome', 'Geometric Pop',

                                                // Romantic
                                                'Blushing Bride', 'Lavender Haze', 'Peachy Keen', 'Red Velvet', 'Sweetheart Pink',

                                                // Cultural
                                                'Royal Red', 'Saffron Sun', 'Teal & Gold', 'Magenta Magic', 'Emerald Elegance'
                                            ].filter(t => t.toLowerCase().includes(themeSearch.toLowerCase())).map((theme) => (
                                                <div
                                                    key={theme}
                                                    className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all ${weddingData.theme === theme
                                                        ? 'border-rose-500 bg-rose-50'
                                                        : 'border-gray-200 hover:border-rose-300'
                                                        }`}
                                                    onClick={() => handleThemeChange(theme)}
                                                >
                                                    <div className={`h-20 rounded mb-2 group-hover:opacity-80 transition-opacity ${theme === 'Modern Elegance' ? 'bg-slate-900' :
                                                        theme === 'Classic Romance' ? 'bg-rose-100' :
                                                            theme === 'Rustic Charm' ? 'bg-amber-100' :
                                                                theme === 'Minimalist' ? 'bg-white border' :
                                                                    theme === 'Vintage Glamour' ? 'bg-[#e5dcd6]' :
                                                                        theme === 'Boho Chic' ? 'bg-[#fdf6e3]' :
                                                                            theme === 'Beach Bliss' ? 'bg-cyan-50' :
                                                                                theme === 'Royal Luxury' ? 'bg-purple-900' :

                                                                                    theme === 'Forest Fern' ? 'bg-emerald-50' :
                                                                                        theme === 'Ocean Breeze' ? 'bg-sky-50' :
                                                                                            theme === 'Sunset Glow' ? 'bg-orange-50' :
                                                                                                theme === 'Mountain Mist' ? 'bg-gray-100' :
                                                                                                    theme === 'Desert Bloom' ? 'bg-rose-100' :

                                                                                                        theme === 'Gold & Ivory' ? 'bg-[#fffff0]' :
                                                                                                            theme === 'Silver Soiree' ? 'bg-slate-50' :
                                                                                                                theme === 'Pearl White' ? 'bg-white' :
                                                                                                                    theme === 'Black Tie' ? 'bg-black' :
                                                                                                                        theme === 'Champagne Toast' ? 'bg-[#f7e7ce]' :

                                                                                                                            theme === 'City Lights' ? 'bg-zinc-900' :
                                                                                                                                theme === 'Midnight Blue' ? 'bg-[#1a237e]' :
                                                                                                                                    theme === 'Charcoal & Rose' ? 'bg-stone-800' :
                                                                                                                                        theme === 'Monochrome' ? 'bg-white border-4 border-black' :
                                                                                                                                            theme === 'Geometric Pop' ? 'bg-indigo-50' :

                                                                                                                                                theme === 'Blushing Bride' ? 'bg-pink-100' :
                                                                                                                                                    theme === 'Lavender Haze' ? 'bg-purple-100' :
                                                                                                                                                        theme === 'Peachy Keen' ? 'bg-orange-100' :
                                                                                                                                                            theme === 'Red Velvet' ? 'bg-red-900' :
                                                                                                                                                                theme === 'Sweetheart Pink' ? 'bg-rose-200' :

                                                                                                                                                                    theme === 'Royal Red' ? 'bg-red-700' :
                                                                                                                                                                        theme === 'Saffron Sun' ? 'bg-yellow-500' :
                                                                                                                                                                            theme === 'Teal & Gold' ? 'bg-teal-700' :
                                                                                                                                                                                theme === 'Magenta Magic' ? 'bg-fuchsia-800' :
                                                                                                                                                                                    theme === 'Emerald Elegance' ? 'bg-emerald-800' :
                                                                                                                                                                                        'bg-gray-100'
                                                        }`}></div>
                                                    <p className="text-sm font-medium text-center truncate" title={theme}>{theme}</p>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPreviewTheme(theme);
                                                        }}
                                                        className="absolute top-2 right-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-600 hover:text-rose-600"
                                                        title="Preview Theme"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <Dialog open={!!previewTheme} onOpenChange={(open) => !open && setPreviewTheme(null)}>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>Theme Preview: {previewTheme}</DialogTitle>
                                                    <DialogDescription>
                                                        This is how your wedding website will look with the <strong>{previewTheme}</strong> theme.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                {previewTheme && themeConfigs[previewTheme] && (
                                                    <div className={`w-full aspect-video flex-1 flex flex-col overflow-hidden relative ${themeConfigs[previewTheme].colors.bg} ${themeConfigs[previewTheme].colors.text} ${themeConfigs[previewTheme].fontBody}`}>
                                                        {/* Font Styles Inject */}
                                                        {fontStyles}

                                                        {/* Hero Mini-View */}
                                                        {(() => {
                                                            const config = themeConfigs[previewTheme];
                                                            switch (config.layout) {
                                                                case 'minimal-split':
                                                                    return (
                                                                        <div className="flex-1 flex flex-row h-full">
                                                                            <div className="flex-1 bg-gray-200 relative">
                                                                                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-400 text-xs">Image</div>
                                                                            </div>
                                                                            <div className={`flex-1 flex flex-col items-center justify-center p-4 text-center space-y-2 ${config.colors.bg}`}>
                                                                                <p className={`text-[0.5rem] tracking-[0.2em] uppercase opacity-60 ${config.colors.accent}`}>The Wedding Of</p>
                                                                                <h1 className={`text-xl ${config.fontHeading} leading-tight`}>
                                                                                    {weddingData.groomName} <br /> <span className="opacity-50 text-[0.6rem]">&</span> {weddingData.brideName}
                                                                                </h1>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                case 'rustic-overlay':
                                                                    return (
                                                                        <div className="flex-1 flex items-center justify-center p-4 text-center relative text-white bg-stone-800">
                                                                            <div className="absolute inset-0 bg-black/40 z-10"></div>
                                                                            <div className="relative z-20 border border-white/30 p-6 backdrop-blur-sm rounded">
                                                                                <h1 className={`text-2xl ${config.fontHeading} drop-shadow-lg`}>
                                                                                    {weddingData.groomName} & {weddingData.brideName}
                                                                                </h1>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                case 'luxury-serif':
                                                                    return (
                                                                        <div className={`flex-1 flex items-center justify-center p-6 text-center border-8 ${config.colors.secondary} border-opacity-10 m-2`}>
                                                                            <div className="space-y-4">
                                                                                <div className={`w-12 h-12 mx-auto rounded-full border ${config.colors.accent} flex items-center justify-center text-lg ${config.fontHeading}`}>
                                                                                    {weddingData.groomName.charAt(0)}{weddingData.brideName.charAt(0)}
                                                                                </div>
                                                                                <h1 className={`text-2xl ${config.fontHeading} tracking-widest uppercase`}>
                                                                                    {weddingData.groomName} <span className="opacity-50 mx-1 normal-case italic text-xs">and</span> {weddingData.brideName}
                                                                                </h1>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                case 'modern-glass':
                                                                    return (
                                                                        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                                                                            <div className={`absolute top-[-20%] left-[-10%] w-32 h-32 rounded-full blur-[40px] opacity-40 ${config.colors.bg === 'bg-slate-900' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                                                                            <div className={`absolute bottom-[-20%] right-[-10%] w-40 h-40 rounded-full blur-[50px] opacity-40 ${config.colors.bg === 'bg-slate-900' ? 'bg-purple-600' : 'bg-teal-400'}`}></div>
                                                                            <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-xl shadow-lg text-center">
                                                                                <h1 className={`text-3xl ${config.fontHeading} bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70`}>
                                                                                    {weddingData.groomName} <br /> {weddingData.brideName}
                                                                                </h1>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                case 'boho-frame':
                                                                    return (
                                                                        <div className="flex-1 flex items-center justify-center p-4">
                                                                            <div className={`p-8 border-2 ${config.colors.secondary} border-double rounded-t-full rounded-b-[4rem] bg-white/50 backdrop-blur-sm`}>
                                                                                <h1 className={`text-2xl ${config.fontHeading} rotate-[-2deg]`}>
                                                                                    {weddingData.groomName} & {weddingData.brideName}
                                                                                </h1>
                                                                            </div>
                                                                        </div>
                                                                    );

                                                                default:
                                                                    return (
                                                                        <div className="flex-1 flex items-center justify-center text-center p-6">
                                                                            <div>
                                                                                <h1 className={`text-2xl ${config.fontHeading} mb-2`}>{weddingData.groomName} & {weddingData.brideName}</h1>
                                                                                <p className="text-sm opacity-75">{new Date(weddingData.weddingDate).toDateString()}</p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                            }
                                                        })()}
                                                    </div>
                                                )}

                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setPreviewTheme(null)}>Close</Button>
                                                    <Button
                                                        onClick={() => {
                                                            if (previewTheme) {
                                                                handleThemeChange(previewTheme);
                                                                setPreviewTheme(null);
                                                            }
                                                        }}
                                                        className="bg-rose-600 hover:bg-rose-700"
                                                    >
                                                        Apply Theme
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Gallery Tab */}
                            <TabsContent value="gallery" className="space-y-6">
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Camera className="w-5 h-5 text-green-500" />
                                                Photo Gallery
                                            </CardTitle>
                                            <CardDescription>Upload and manage your wedding photos</CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadAll}
                                            disabled={galleryPhotos.length === 0 || isDownloadingAll}
                                        >
                                            {isDownloadingAll ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4 mr-2" />
                                            )}
                                            {isDownloadingAll ? 'Preparing ZIP...' : 'Download All'}
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-rose-400 transition-colors cursor-pointer relative bg-slate-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={handleGalleryUpload}
                                                disabled={isUploadingGallery}
                                            />
                                            {isUploadingGallery ? (
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
                                                    <p className="text-sm text-gray-500">Uploading...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Upload Photos</h3>
                                                    <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select photos</p>
                                                    <Button variant="outline" className="pointer-events-none">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Select Photos
                                                    </Button>
                                                </>
                                            )}
                                        </div>

                                        {/* Gallery Grid */}
                                        {galleryPhotos.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                                {galleryPhotos.map((photo) => (
                                                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100 border border-gray-200">
                                                        <img
                                                            src={photo.publicUrl}
                                                            alt={photo.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-white hover:bg-white/20"
                                                                onClick={() => window.open(photo.publicUrl, '_blank')}
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-white hover:bg-rose-500/20 hover:text-rose-400"
                                                                onClick={() => handleDeletePhoto(photo.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {weddingData.photosCount === 0 && (
                                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-700">
                                                    <strong>Pro Tip:</strong> Upload photos and we'll automatically detect faces for easy tagging and guest photo finding!
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Guests Tab */}
                            <TabsContent value="guests" className="space-y-6">
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <input
                                        type="file"
                                        id="guest-csv-upload"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleCsvImport}
                                    />
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="w-5 h-5 text-blue-500" />
                                                Guest Management
                                            </CardTitle>
                                            <CardDescription>Manage your guest list and track RSVPs</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            {guests.length > 0 && (
                                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-rose-500" onClick={handleResetAllGuests}>
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Reset All
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => document.getElementById('guest-csv-upload')?.click()}>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Import CSV
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Guest
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add New Guest</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label>Guest Name</Label>
                                                            <Input id="guestNameHeader" placeholder="Full Name" />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Email</Label>
                                                                <Input id="guestEmailHeader" type="email" placeholder="email@example.com" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Phone</Label>
                                                                <Input id="guestPhoneHeader" placeholder="+91..." />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>RSVP Status</Label>
                                                            <select id="guestRsvpHeader" className="w-full p-2 border rounded-md">
                                                                <option value="pending">Pending</option>
                                                                <option value="attending">Attending</option>
                                                                <option value="declined">Declined</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button onClick={async () => {
                                                                const name = (document.getElementById('guestNameHeader') as HTMLInputElement).value;
                                                                const email = (document.getElementById('guestEmailHeader') as HTMLInputElement).value;
                                                                const phone = (document.getElementById('guestPhoneHeader') as HTMLInputElement).value;
                                                                const rsvp_status = (document.getElementById('guestRsvpHeader') as HTMLSelectElement).value;
                                                                if (name) await handleAddGuest({ name, email, phone, rsvp_status });
                                                            }}>Add Guest</Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                            {guests.length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                    onClick={handleSendWhatsAppAll}
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-2" />
                                                    Send to All
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {guests.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-700 mb-2">No Guests Yet</h3>
                                                <p className="text-sm text-gray-500 mb-4">Start by adding your first guest or importing a list</p>
                                                <div className="flex gap-3 justify-center">
                                                    <Button variant="outline" onClick={() => document.getElementById('guest-csv-upload')?.click()}>
                                                        Import CSV
                                                    </Button>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button>
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Add Guest
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Add New Guest</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="space-y-2">
                                                                    <Label>Guest Name</Label>
                                                                    <Input id="guestName" placeholder="Full Name" />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Email</Label>
                                                                        <Input id="guestEmail" type="email" placeholder="email@example.com" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Phone</Label>
                                                                        <Input id="guestPhone" placeholder="+91..." />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>RSVP Status</Label>
                                                                    <select id="guestRsvp" className="w-full p-2 border rounded-md">
                                                                        <option value="pending">Pending</option>
                                                                        <option value="attending">Attending</option>
                                                                        <option value="declined">Declined</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <DialogClose asChild>
                                                                    <Button onClick={async () => {
                                                                        const name = (document.getElementById('guestName') as HTMLInputElement).value;
                                                                        const email = (document.getElementById('guestEmail') as HTMLInputElement).value;
                                                                        const phone = (document.getElementById('guestPhone') as HTMLInputElement).value;
                                                                        const rsvp_status = (document.getElementById('guestRsvp') as HTMLSelectElement).value;
                                                                        if (name) await handleAddGuest({ name, email, phone, rsvp_status });
                                                                    }}>Add Guest</Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider">
                                                        <tr>
                                                            <th className="px-4 py-3">Name</th>
                                                            <th className="px-4 py-3">Contact</th>
                                                            <th className="px-4 py-3">RSVP</th>
                                                            <th className="px-4 py-3">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {guests.map((guest) => (
                                                            <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 font-medium">{guest.name}</td>
                                                                <td className="px-4 py-3 text-gray-500">{guest.email || guest.phone || '-'}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${guest.rsvp_status === 'attending' ? 'bg-green-100 text-green-700' :
                                                                        guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-700' :
                                                                            'bg-amber-100 text-amber-700'
                                                                        }`}>
                                                                        {guest.rsvp_status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                            onClick={() => handleSendWhatsApp(guest.id)}
                                                                            title="Send WhatsApp Invitation"
                                                                        >
                                                                            <MessageCircle className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteGuest(guest.id)}>
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Timeline Tab */}
                            <TabsContent value="timeline" className="space-y-6">
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-amber-500" />
                                                Event Timeline
                                            </CardTitle>
                                            <CardDescription>Plan your wedding day schedule</CardDescription>
                                        </div>
                                        <Dialog open={showEventDialog} onOpenChange={(open) => {
                                            setShowEventDialog(open);
                                            if (!open) {
                                                setIsEditingEvent(false);
                                                setEventForm({
                                                    id: '',
                                                    date: weddingData.weddingDate,
                                                    time: '10:00',
                                                    title: '',
                                                    location: '',
                                                    locationMapUrl: '',
                                                    photoFile: null,
                                                    photoUrl: '',
                                                    description: '',
                                                    sortOrder: 0
                                                });
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button onClick={() => setIsEditingEvent(false)}>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Event
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{isEditingEvent ? 'Edit Timeline Event' : 'Add Timeline Event'}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Event Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={eventForm.date}
                                                                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Time</Label>
                                                            <ClockPicker
                                                                value={eventForm.time}
                                                                onChange={(val) => setEventForm(prev => ({ ...prev, time: val }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Event Title</Label>
                                                        <Input
                                                            value={eventForm.title}
                                                            onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                                                            placeholder="e.g. Wedding Ceremony"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Location (Optional)</Label>
                                                        <Input
                                                            value={eventForm.location}
                                                            onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                                                            placeholder="e.g. Grand Ballroom"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-rose-500" />
                                                            Location Map Link (URL)
                                                        </Label>
                                                        <Input
                                                            value={eventForm.locationMapUrl}
                                                            onChange={(e) => setEventForm(prev => ({ ...prev, locationMapUrl: e.target.value }))}
                                                            placeholder="e.g. https://maps.google.com/..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="flex items-center gap-2">
                                                            <Image className="w-4 h-4 text-purple-500" />
                                                            Event Photo
                                                        </Label>
                                                        <div className="flex flex-col gap-2">
                                                            {eventForm.photoUrl && !eventForm.photoFile && (
                                                                <div className="relative w-fit">
                                                                    <img src={eventForm.photoUrl} alt="Preview" className="h-20 w-auto rounded border" />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                                                                        onClick={() => setEventForm(prev => ({ ...prev, photoUrl: '' }))}
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        setEventForm(prev => ({
                                                                            ...prev,
                                                                            photoFile: e.target.files![0]
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                            <p className="text-[10px] text-gray-500">Supported formats: JPEG, PNG, WEBP (Max 5MB)</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Description</Label>
                                                        <textarea
                                                            className="w-full p-2 border rounded-md text-sm"
                                                            rows={3}
                                                            value={eventForm.description}
                                                            onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                                                            placeholder="Tell guests what to expect..."
                                                        ></textarea>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={async () => {
                                                        const { id, date: event_date, time: event_time, title, description, location, locationMapUrl: location_map_url, photoFile, sortOrder: sort_order } = eventForm;
                                                        if (event_time && title) {
                                                            let success = false;
                                                            if (isEditingEvent && id) {
                                                                success = await handleUpdateEvent(id, { event_date, event_time, title, description, location, location_map_url, photoFile, sort_order });
                                                            } else {
                                                                success = await handleAddEvent({ event_date, event_time, title, description, location, location_map_url, photoFile, sort_order });
                                                            }

                                                            if (success) {
                                                                setShowEventDialog(false);
                                                                setEventForm({
                                                                    id: '',
                                                                    date: weddingData.weddingDate,
                                                                    time: '10:00',
                                                                    title: '',
                                                                    location: '',
                                                                    locationMapUrl: '',
                                                                    photoFile: null,
                                                                    photoUrl: '',
                                                                    description: '',
                                                                    sortOrder: 0
                                                                });
                                                                setIsEditingEvent(false);
                                                            }
                                                        } else {
                                                            showError('Time and title are required');
                                                        }
                                                    }}>{isEditingEvent ? 'Update Event' : 'Add Event'}</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {timeline.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500 italic">
                                                    No events added to the timeline yet.
                                                </div>
                                            ) : (
                                                timeline.map((item) => (
                                                    <div key={item.id} className="flex gap-4 items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                        <div className="text-center min-w-[100px] border-r border-gray-100 pr-4">
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                                {item.event_date ? new Date(item.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Date TBD'}
                                                            </p>
                                                            <p className="font-bold text-rose-600">{item.event_time}</p>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium">{item.title}</p>
                                                            <p className="text-sm text-gray-500">{item.description}</p>
                                                            {item.location && <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                {item.location_map_url ? (
                                                                    <a
                                                                        href={item.location_map_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium bg-blue-50 px-2 py-0.5 rounded"
                                                                    >
                                                                        <MapPin className="w-3 h-3" /> {item.location}
                                                                    </a>
                                                                ) : (
                                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3" /> {item.location}
                                                                    </p>
                                                                )}
                                                            </div>}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-amber-500"
                                                                onClick={() => {
                                                                    setEventForm({
                                                                        id: item.id,
                                                                        date: item.event_date ? new Date(item.event_date).toISOString().split('T')[0] : weddingData.weddingDate,
                                                                        time: item.event_time,
                                                                        title: item.title,
                                                                        location: item.location || '',
                                                                        locationMapUrl: item.location_map_url || '',
                                                                        photoFile: null,
                                                                        photoUrl: item.photo_url || '', // Set existing URL for display
                                                                        description: item.description || '',
                                                                        sortOrder: item.sort_order || 0
                                                                    });
                                                                    setIsEditingEvent(true);
                                                                    setShowEventDialog(true);
                                                                }}
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteEvent(item.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Music Tab */}
                            <TabsContent value="music" className="space-y-6">
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Music className="w-5 h-5 text-pink-500" />
                                            Background Music
                                        </CardTitle>
                                        <CardDescription>Set the mood for your wedding website</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="space-y-0.5">
                                                <Label className="text-base font-bold">Enable Music</Label>
                                                <p className="text-sm text-gray-500">Play music when guests visit your site</p>
                                            </div>
                                            <Switch
                                                checked={isEditing ? editForm.musicEnabled : weddingData.musicEnabled}
                                                onCheckedChange={(checked) => {
                                                    if (isEditing) {
                                                        setEditForm(prev => ({ ...prev, musicEnabled: checked }));
                                                    } else {
                                                        // If not in explicit edit mode, update state and trigger save
                                                        setWeddingData(prev => ({ ...prev, musicEnabled: checked }));
                                                        setEditForm(prev => ({ ...prev, musicEnabled: checked }));
                                                        // We need to trigger save manually or assume user will click save somewhere?
                                                        // Let's force "Edit Mode" if they change it?
                                                        // Or just toggle it and provide a specific "Save" button if not in global edit mode.
                                                        // For now, let's auto-enable editing if they toggle it?
                                                        setIsEditing(true);
                                                        setEditForm(prev => ({ ...prev, musicEnabled: checked })); // Ensure edit form catches it
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            {/* Source Selection */}
                                            <div className="space-y-3">
                                                <Label>Music Source</Label>
                                                <div className="flex gap-4">
                                                    <div onClick={() => setEditForm(prev => ({ ...prev, musicSource: 'upload' }))}
                                                        className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${editForm.musicSource === 'upload' ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-200'}`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${editForm.musicSource === 'upload' ? 'border-rose-500' : 'border-gray-300'}`}>
                                                                {editForm.musicSource === 'upload' && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                                                            </div>
                                                            <span className="font-medium">Upload Song</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">Upload your own MP3 file</p>
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Spotify Section */}


                                            {/* Upload Section */}
                                            {editForm.musicSource === 'upload' && (
                                                <div className="space-y-4">
                                                    <Label>Custom Playlist (MP3)</Label>

                                                    {/* List of uploaded songs */}
                                                    {(() => {
                                                        const rawUrl = isEditing ? editForm.musicUrl : weddingData.musicUrl;
                                                        let urls: string[] = [];
                                                        if (rawUrl) {
                                                            try {
                                                                if (rawUrl.startsWith('[')) {
                                                                    urls = JSON.parse(rawUrl);
                                                                } else {
                                                                    urls = [rawUrl];
                                                                }
                                                            } catch (e) {
                                                                urls = [rawUrl];
                                                            }
                                                        }

                                                        if (urls.length > 0) {
                                                            return (
                                                                <div className="space-y-2 mb-4">
                                                                    {urls.map((url, index) => (
                                                                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                                                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                                                <span className="text-xs font-bold">{index + 1}</span>
                                                                            </div>
                                                                            <div className="flex-1 overflow-hidden">
                                                                                <p className="text-sm font-medium text-green-800 truncate">
                                                                                    {url.split('/').pop()?.split('_').slice(1).join('_') || `Song ${index + 1}`}
                                                                                </p>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                                                                onClick={() => handleRemoveMusic(index)}
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    {/* Upload Dropzone */}
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                                                        <div className="flex flex-col items-center">
                                                            {isUploadingMusic ? (
                                                                <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-2" />
                                                            ) : (
                                                                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                                            )}
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {isUploadingMusic ? 'Uploading...' : 'Add a Song'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mb-4">MP3, WAV, or M4A (Max 15MB)</p>
                                                            <Input
                                                                type="file"
                                                                accept="audio/*"
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                onChange={handleMusicUpload}
                                                                disabled={isUploadingMusic}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Playlist Section */}
                                            {editForm.musicSource === 'playlist' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Playlist URL (Embed Link)</Label>
                                                        <Input
                                                            value={isEditing ? editForm.playlistUrl || '' : weddingData.playlistUrl || ''}
                                                            onChange={(e) => {
                                                                setEditForm(prev => ({ ...prev, playlistUrl: e.target.value }));
                                                                if (!isEditing) setIsEditing(true);
                                                            }}
                                                            placeholder="https://open.spotify.com/embed/playlist/..."
                                                        />
                                                        <p className="text-[10px] text-gray-500">
                                                            Paste the <strong>embed code src</strong> or embed URL from Spotify, YouTube, or SoundCloud.
                                                        </p>
                                                    </div>

                                                    {editForm.playlistUrl && (
                                                        <div className="aspect-video w-full rounded-lg overflow-hidden border bg-gray-100">
                                                            <iframe
                                                                src={editForm.playlistUrl}
                                                                width="100%"
                                                                height="100%"
                                                                frameBorder="0"
                                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                                loading="lazy"
                                                            ></iframe>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Volume Control */}
                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <Label>Background Volume</Label>
                                                    <span className="text-sm font-medium text-gray-500">{editForm.volume || 50}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={isEditing ? editForm.volume || 0 : weddingData.volume || 0}
                                                    onChange={(e) => {
                                                        const newVal = parseInt(e.target.value);
                                                        setEditForm(prev => ({ ...prev, volume: newVal }));
                                                        if (!isEditing) setIsEditing(true);
                                                    }}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                                />
                                            </div>
                                        </div>

                                        {(isEditing) && (
                                            <div className="flex justify-end sticky bottom-4">
                                                <Button onClick={handleSaveChanges} className="shadow-lg">
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </Tabs>
                    </div>
                </div>


                {/* Profile Management Modal */}
                <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-rose-500" />
                                My Profile & Account
                            </DialogTitle>
                            <DialogDescription>
                                Manage your personal information and security settings.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col md:flex-row gap-0 -mx-6 -mb-6 border-t">
                            {/* Sidebar */}
                            <div className="w-full md:w-48 bg-gray-50/50 border-r border-gray-100 p-2 md:min-h-[450px]">
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => setModalTab('profile')}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${modalTab === 'profile' ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <User className="w-3.5 h-3.5" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => setModalTab('notifications')}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${modalTab === 'notifications' ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <Bell className="w-3.5 h-3.5" />
                                        Notifications
                                    </button>
                                    <button
                                        onClick={() => setModalTab('security')}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${modalTab === 'security' ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                        Security
                                    </button>
                                    <button
                                        onClick={() => setModalTab('advanced')}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${modalTab === 'advanced' ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <Settings2 className="w-3.5 h-3.5" />
                                        Advanced
                                    </button>
                                </nav>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {modalTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[11px] uppercase tracking-wider text-gray-400">Full Name</Label>
                                                <Input
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="e.g. Kishore Ravi"
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] uppercase tracking-wider text-gray-400">Email Address</Label>
                                                <Input value={currentUser?.username} disabled className="bg-gray-50 italic h-9 text-sm" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[11px] uppercase tracking-wider text-gray-400">Your Story / Bio</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-rose-600 hover:text-rose-700 h-7 text-xs gap-1 px-2"
                                                    onClick={() => setShowAiDialog(true)}
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    AI Imagine
                                                </Button>
                                            </div>
                                            <Textarea
                                                value={bioText}
                                                onChange={(e) => setBioText(e.target.value)}
                                                placeholder="Share your wedding story..."
                                                className="min-h-[120px] text-sm"
                                            />
                                        </div>

                                        <Button
                                            onClick={async () => {
                                                await handleProfileUpdate();
                                                setShowProfileModal(false);
                                            }}
                                            disabled={isSavingProfile}
                                            className="w-full bg-rose-600 hover:bg-rose-700"
                                        >
                                            {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Save Profile
                                        </Button>
                                    </div>
                                )}

                                {modalTab === 'notifications' && (
                                    <div className="space-y-6">
                                        <div className="text-center py-12">
                                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Bell className="w-6 h-6 text-rose-500" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900">Notification Settings</h3>
                                            <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">Configure how you receive updates about your wedding.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                                                <div>
                                                    <p className="text-xs font-bold">Email Notifications</p>
                                                    <p className="text-[10px] text-gray-500">Get RSVP updates via email</p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px]">Active</Badge>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 opacity-50">
                                                <div>
                                                    <p className="text-xs font-bold">WhatsApp Alerts</p>
                                                    <p className="text-[10px] text-gray-500">Instant updates on WhatsApp</p>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalTab === 'security' && (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-rose-100 flex items-center justify-center shadow-sm">
                                                    <Shield className="w-5 h-5 text-rose-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h3>
                                                    <p className="text-[10px] text-gray-500">Add an extra layer of security</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-t border-rose-100">
                                                <span className="text-xs font-medium text-gray-700">Status</span>
                                                {is2FAEnabled ? (
                                                    <Badge className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100 border-0">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">Disabled</Badge>
                                                )}
                                            </div>

                                            <Dialog open={show2FADialog} onOpenChange={(open) => {
                                                setShow2FADialog(open);
                                                if (!open) reset2FA();
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant={is2FAEnabled ? "destructive" : "outline"}
                                                        className={`w-full text-xs h-9 ${is2FAEnabled ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-100" : "border-rose-200 text-rose-700 hover:bg-rose-100/50"}`}
                                                        onClick={(e) => {
                                                            if (is2FAEnabled) {
                                                                e.preventDefault();
                                                                if (confirm("Disable Two-Factor Authentication? This will reduce your account security.")) {
                                                                    enable2FA(false).then(() => {
                                                                        setIs2FAEnabled(false);
                                                                        showSuccess("2FA Disabled successfully");
                                                                    }).catch(() => showError("Failed to disable 2FA"));
                                                                }
                                                            } else {
                                                                setShow2FADialog(true);
                                                            }
                                                        }}
                                                    >
                                                        {is2FAEnabled ? "Disable 2FA Security" : "Setup 2FA Security"}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                                                    <div className="bg-rose-600 p-6 text-white text-center">
                                                        <Shield className="w-10 h-10 mx-auto mb-2" />
                                                        <h3 className="text-lg font-bold">2FA Setup</h3>
                                                        <p className="text-xs opacity-90">Secure your account with a mobile authenticator</p>
                                                    </div>
                                                    <div className="p-6">
                                                        {tfaStep === 1 && (
                                                            <div className="space-y-6 text-center">
                                                                <div className="mx-auto w-40 h-40 bg-white p-2 border rounded-xl flex items-center justify-center">
                                                                    <QRCode
                                                                        value={`otpauth://totp/WeddingWeb:${currentUser?.username || "user@example.com"}?secret=KR577WEDDINGWEB2FA&issuer=WeddingWeb`}
                                                                        size={140}
                                                                        level="M"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-bold text-gray-900">Scan QR Code</p>
                                                                    <p className="text-xs text-gray-500">Open your authenticator app and scan this code.</p>
                                                                </div>
                                                                <Button onClick={() => setTfaStep(2)} className="w-full bg-rose-600 hover:bg-rose-700">
                                                                    I've Scanned It
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {tfaStep === 2 && (
                                                            <div className="space-y-6 text-center">
                                                                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                                                                    <Lock className="w-6 h-6" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-bold text-gray-900">Verify Code</p>
                                                                    <p className="text-xs text-gray-500">Enter the 6-digit code from your app.</p>
                                                                </div>
                                                                <div className="flex justify-center">
                                                                    <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                                                                        <InputOTPGroup className="gap-1">
                                                                            <InputOTPSlot index={0} className="w-10 h-12 text-lg font-bold" />
                                                                            <InputOTPSlot index={1} className="w-10 h-12 text-lg font-bold" />
                                                                            <InputOTPSlot index={2} className="w-10 h-12 text-lg font-bold" />
                                                                            <InputOTPSlot index={3} className="w-10 h-12 text-lg font-bold" />
                                                                            <InputOTPSlot index={4} className="w-10 h-12 text-lg font-bold" />
                                                                            <InputOTPSlot index={5} className="w-10 h-12 text-lg font-bold" />
                                                                        </InputOTPGroup>
                                                                    </InputOTP>
                                                                </div>
                                                                <Button
                                                                    onClick={handleEnable2FA}
                                                                    disabled={otpValue.length !== 6 || isVerifying}
                                                                    className="w-full bg-rose-600 hover:bg-rose-700"
                                                                >
                                                                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                                    Verify & Enable
                                                                </Button>
                                                                <Button variant="ghost" onClick={() => setTfaStep(1)} className="text-xs text-gray-400">Back</Button>
                                                            </div>
                                                        )}
                                                        {tfaStep === 3 && (
                                                            <div className="py-6 text-center space-y-6">
                                                                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                                                    <CheckCircle2 className="w-8 h-8" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h3 className="text-xl font-bold text-gray-900">All Set!</h3>
                                                                    <p className="text-xs text-gray-500">Two-Factor Authentication is now active.</p>
                                                                </div>
                                                                <Button onClick={() => setShow2FADialog(false)} className="w-full bg-gray-900 hover:bg-black font-bold">
                                                                    Awesome
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Change Password</h4>
                                            <form onSubmit={handleChangePassword} className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-gray-400">Current Password</label>
                                                    <div className="relative">
                                                        <Input
                                                            type={showCurrentPass ? "text" : "password"}
                                                            className="h-8 text-xs bg-white pr-8"
                                                            placeholder="••••••••"
                                                            value={passwordForm.currentPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showCurrentPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-gray-400">New Password</label>
                                                        <div className="relative">
                                                            <Input
                                                                type={showNewPass ? "text" : "password"}
                                                                className="h-8 text-xs bg-white pr-8"
                                                                placeholder="••••••••"
                                                                value={passwordForm.newPassword}
                                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowNewPass(!showNewPass)}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {showNewPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-gray-400">Confirm Password</label>
                                                        <div className="relative">
                                                            <Input
                                                                type={showConfirmPass ? "text" : "password"}
                                                                className="h-8 text-xs bg-white pr-8"
                                                                placeholder="••••••••"
                                                                value={passwordForm.confirmPassword}
                                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {showConfirmPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={isUpdatingPassword}
                                                    className="w-full h-8 text-[10px] font-bold bg-gray-900 hover:bg-black"
                                                >
                                                    {isUpdatingPassword ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                                    Update Password
                                                </Button>
                                            </form>
                                        </div>

                                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Login Activity</h4>
                                                <Button
                                                    variant="ghost"
                                                    className="h-6 px-2 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                    onClick={fetchLoginActivity}
                                                    disabled={isLoadingSessions}
                                                >
                                                    {isLoadingSessions ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                                                    Refresh
                                                </Button>
                                            </div>

                                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                                {loginSessions.length > 0 ? (
                                                    loginSessions.map((session: any, idx: number) => (
                                                        <div key={session.id || idx} className="p-2 rounded-lg bg-white border border-gray-100 flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className="w-7 h-7 bg-gray-50 rounded-md flex items-center justify-center shrink-0">
                                                                    <Settings2 className="w-3.5 h-3.5 text-gray-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] font-bold text-gray-900 truncate">
                                                                        {session.action?.replace(/_/g, ' ') || 'Login'} • {session.ip_address || 'Unknown IP'}
                                                                    </p>
                                                                    <p className="text-[9px] text-gray-400">
                                                                        {new Date(session.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline" className="text-[8px] h-4 px-1 text-gray-400 border-gray-100 font-normal shrink-0">
                                                                {session.details?.user_agent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                                                            </Badge>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-6">
                                                        <p className="text-[10px] text-gray-400 italic">No recent activity found</p>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-[9px] text-gray-400 mt-3 flex items-center gap-1">
                                                <Shield className="w-2.5 h-2.5" />
                                                Only successful logins are shown here.
                                            </p>
                                        </div>
                                    </div>
                                )}



                                {modalTab === 'advanced' && (
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30">
                                            <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                                                <Settings2 className="w-4 h-4" />
                                                Data Control
                                            </h3>
                                            <p className="text-xs text-amber-700/80 mb-4">Export your guest list and wedding data for your records.</p>
                                            <Button variant="outline" className="w-full text-xs h-9 border-amber-200 text-amber-700 hover:bg-amber-100" disabled>
                                                Export Wedding Data (.csv)
                                            </Button>
                                        </div>

                                        <div className="p-4 rounded-xl border border-red-100 bg-red-50/30">
                                            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2 mb-2">
                                                <Trash2 className="w-4 h-4" />
                                                Danger Zone
                                            </h3>
                                            <p className="text-xs text-red-500/80 mb-4">Permanently delete your account and all associated wedding data. This cannot be undone.</p>
                                            <Button
                                                variant="destructive"
                                                className="w-full text-xs h-9 bg-red-500 hover:bg-red-600"
                                                onClick={handleDeleteAccount}
                                            >
                                                Delete My Account Permanently
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* AI Bio Dialog */}
                <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-rose-600">
                                <Sparkles className="w-5 h-5" />
                                Imagine Your Story
                            </DialogTitle>
                            <DialogDescription>
                                Tell us a few words about your journey, and we'll craft a beautiful wedding bio for you.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Textarea
                                placeholder="e.g., We met in college 5 years ago, love traveling and hiking..."
                                value={roughBio}
                                onChange={(e) => setRoughBio(e.target.value)}
                                className="min-h-[100px]"
                            />
                            {generatedPreview && (
                                <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                                    <p className="text-sm italic text-gray-700">{generatedPreview}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 text-rose-600 h-7 text-xs"
                                        onClick={() => {
                                            setBioText(generatedPreview);
                                            setShowAiDialog(false);
                                            setGeneratedPreview("");
                                            setRoughBio("");
                                        }}
                                    >
                                        Use this story
                                    </Button>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowAiDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerateBio}
                                disabled={isGeneratingBio || !roughBio.trim()}
                                className="bg-rose-600 hover:bg-rose-700"
                            >
                                {isGeneratingBio ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Generate Story
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>

            {/* Footer */}
            <footer className="bg-white/80 border-t border-gray-200 py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
                    <p>© 2026 WeddingWeb Premium. Need help? <a href="/company/contact" className="text-rose-600 hover:underline">Contact Support</a></p>
                </div>
            </footer>
        </div>
    );
};

export default ClientDashboard;
