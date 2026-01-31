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
    CheckCircle2, RefreshCw, EyeOff
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
        shareUrl: `weddingweb.co.in/w/${currentUser?.username?.split('@')[0] || 'your-wedding'}`
    });

    const [previewTheme, setPreviewTheme] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(currentUser?.profile?.full_name || "");
    const [bioText, setBioText] = useState(currentUser?.profile?.bio || "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const [roughBio, setRoughBio] = useState("");
    const [showAiDialog, setShowAiDialog] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalTab, setModalTab] = useState<'profile' | 'notifications' | 'security' | 'advanced'>('profile');
    const [generatedPreview, setGeneratedPreview] = useState("");

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
        }
    }, [currentUser]);

    // Sync editForm with weddingData when it's loaded
    useEffect(() => {
        setEditForm({
            groomName: weddingData.groomName,
            brideName: weddingData.brideName,
            weddingDate: weddingData.weddingDate,
            weddingTime: weddingData.weddingTime,
            showCountdown: weddingData.showCountdown,
            venue: weddingData.venue,
            guestCount: weddingData.guestCount
        });
    }, [weddingData.groomName, weddingData.brideName, weddingData.weddingDate, weddingData.weddingTime, weddingData.showCountdown, weddingData.venue, weddingData.guestCount]);

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
        guestCount: weddingData.guestCount
    });

    const [guests, setGuests] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
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
                        slug: data.wedding.wedding_code || prev.slug
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
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

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
        } catch (error) {
            console.error('Error fetching Phase 2 data:', error);
        } finally {
            setIsLoadingData(false);
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
            showError('Failed to add guest');
        }
        return false;
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
                throw new Error('Failed to save changes');
            }

            setIsEditing(false);
            showSuccess('Website updated successfully!');
        } catch (error) {
            console.error(error);
            showError('Failed to save changes');
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
                                    <DropdownMenuItem onClick={() => navigate(`/w/${weddingData.slug}`)}>
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Banner */}
                <Card className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white border-0 shadow-xl mb-8 overflow-hidden relative">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-white/80 backdrop-blur-sm rounded-xl p-1">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Layout className="w-4 h-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="builder" className="flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Builder</span>
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            <span className="hidden sm:inline">Gallery</span>
                        </TabsTrigger>
                        <TabsTrigger value="guests" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Guests</span>
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="hidden sm:inline">Timeline</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Quick Actions */}
                            <Card className="bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('builder')}>
                                        <Edit3 className="w-5 h-5 text-rose-500" />
                                        <span className="text-sm">Edit Website</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('gallery')}>
                                        <Camera className="w-5 h-5 text-green-500" />
                                        <span className="text-sm">Upload Photos</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('guests')}>
                                        <Users className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm">Manage Guests</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={handleCopyLink}>
                                        <Share2 className="w-5 h-5 text-purple-500" />
                                        <span className="text-sm">Share Invite</span>
                                    </Button>
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
                                                    value={`http://localhost:3001/w/${weddingData.slug}`}
                                                    readOnly
                                                    className="bg-gray-50 font-mono text-xs h-8"
                                                />
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    navigator.clipboard.writeText(`http://localhost:3001/w/${weddingData.slug}`);
                                                    showSuccess('Local URL copied');
                                                }}>
                                                    <Copy className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => window.open(`http://localhost:3001/w/${weddingData.slug}`, '_blank')}>
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
                                                    value={`https://weddingweb.co.in/w/${weddingData.slug}`}
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
                            <CardHeader className="flex flex-row items-center justify-between">
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

                        {/* Theme Selector */}
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-purple-500" />
                                    Theme Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        'Modern Elegance', 'Classic Romance', 'Rustic Charm', 'Minimalist',
                                        'Vintage Glamour', 'Boho Chic', 'Beach Bliss', 'Royal Luxury'
                                    ].map((theme) => (
                                        <div
                                            key={theme}
                                            className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all ${weddingData.theme === theme
                                                ? 'border-rose-500 bg-rose-50'
                                                : 'border-gray-200 hover:border-rose-300'
                                                }`}
                                            onClick={() => setWeddingData(prev => ({ ...prev, theme }))}
                                        >
                                            <div className="h-20 rounded bg-gradient-to-br from-rose-100 to-pink-200 mb-2 group-hover:opacity-80 transition-opacity"></div>
                                            <p className="text-sm font-medium text-center">{theme}</p>

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

                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex flex-col">
                                            {/* Mock Browser Header */}
                                            <div className="bg-gray-800 h-8 flex items-center px-4 gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <div className="flex-1 text-center">
                                                    <div className="bg-gray-700 rounded h-5 w-1/2 mx-auto text-[10px] text-gray-400 flex items-center justify-center">weddingweb.co.in</div>
                                                </div>
                                            </div>

                                            {/* Mock Website Content */}
                                            <div className="flex-1 bg-white overflow-y-auto relative">
                                                {/* Hero Section */}
                                                <div className={`h-48 flex items-center justify-center text-center p-6 ${previewTheme === 'Modern Elegance' ? 'bg-slate-900 text-white' :
                                                    previewTheme === 'Classic Romance' ? 'bg-rose-100 text-rose-900' :
                                                        previewTheme === 'Rustic Charm' ? 'bg-amber-100 text-amber-900' :
                                                            previewTheme === 'Beach Bliss' ? 'bg-cyan-50 text-cyan-900' :
                                                                'bg-gray-50 text-gray-900'
                                                    }`}>
                                                    <div>
                                                        <h1 className="text-2xl font-serif mb-2">{weddingData.groomName} & {weddingData.brideName}</h1>
                                                        <p className="text-sm opacity-80">{weddingData.weddingDate}</p>
                                                    </div>
                                                </div>

                                                {/* Content Placeholders */}
                                                <div className="p-8 space-y-6">
                                                    <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto"></div>
                                                    <div className="h-32 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                                        [Theme Specific Gallery Layout]
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="h-20 bg-gray-100 rounded"></div>
                                                        <div className="h-20 bg-gray-100 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setPreviewTheme(null)}>Close</Button>
                                            <Button
                                                onClick={() => {
                                                    setWeddingData(prev => ({ ...prev, theme: previewTheme || 'Modern Elegance' }));
                                                    setPreviewTheme(null);
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
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-green-500" />
                                    Photo Gallery
                                </CardTitle>
                                <CardDescription>Upload and manage your wedding photos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-rose-400 transition-colors cursor-pointer">
                                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Upload Photos</h3>
                                    <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select photos</p>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Select Photos
                                    </Button>
                                </div>

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
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        Guest Management
                                    </CardTitle>
                                    <CardDescription>Manage your guest list and track RSVPs</CardDescription>
                                </div>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Guest
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {guests.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Guests Yet</h3>
                                        <p className="text-sm text-gray-500 mb-4">Start by adding your first guest or importing a list</p>
                                        <div className="flex gap-3 justify-center">
                                            <Button variant="outline">
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
                                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteGuest(guest.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
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

                </Tabs>

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
        </div >
    );
};

export default ClientDashboard;
