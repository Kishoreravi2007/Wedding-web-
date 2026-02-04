
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WeddingTemplate } from '@/components/WeddingTemplate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, MonitorPlay, ExternalLink, GripVertical, RefreshCw, Sun, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getAccessToken, API_BASE_URL } from '@/lib/api';
import BackgroundAdjusterModal, { ImageAdjustments } from '@/components/premium/BackgroundAdjusterModal';

const VisualEditor = () => {
    console.log("🛠️ VisualEditor Mounting...");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [weddingData, setWeddingData] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [photos, setPhotos] = useState<any[]>([]);
    const [previewMode, setPreviewMode] = useState(false);

    // Background Adjuster State
    const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);


    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);
                setLoading(true);
                const token = getAccessToken();
                if (!token) {
                    navigate('/company/login');
                    return;
                }

                const headers = { 'Authorization': `Bearer ${token}` };

                // 1. Fetch Wedding Data
                console.log("🔗 Fetching wedding data...");
                const weddingRes = await fetch(`${API_BASE_URL}/api/auth/client/wedding`, { headers });

                if (!weddingRes.ok) {
                    throw new Error(`Server returned ${weddingRes.status}: ${weddingRes.statusText}`);
                }

                const weddingJson = await weddingRes.json();
                console.log("📦 Received wedding data:", weddingJson);

                if (weddingJson && weddingJson.wedding) {
                    // Ensure customizations object exists
                    const data = weddingJson.wedding;
                    if (!data.customizations) data.customizations = {};
                    setWeddingData(data);

                    // 2. Fetch Timeline
                    console.log("🔗 Fetching timeline...");
                    const timelineRes = await fetch(`${API_BASE_URL}/api/timeline`, { headers });
                    if (timelineRes.ok) {
                        const timelineJson = await timelineRes.json();
                        setTimeline(Array.isArray(timelineJson) ? timelineJson : []);
                    }

                    // 3. Fetch Photos
                    // We can add photo fetching here if needed
                } else {
                    console.error("❌ No wedding data in response:", weddingJson);
                    setError("No wedding data found for your account.");
                }
            } catch (err: any) {
                console.error("❌ Failed to load editor data:", err);
                setError(err.message || "An unexpected error occurred while loading the editor.");
                toast.error("Failed to load editor");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleUpdateCustomization = async (key: string, value: string) => {
        if (!weddingData) return;

        // Custom handling for background upload trigger
        if (key === 'triggerBgUpload') {
            document.getElementById('bg-upload-input')?.click();
            return;
        }

        // Determine if it's a core field or a customization
        const coreFields = ['groomName', 'brideName', 'weddingDate', 'venue', 'weddingTime', 'showCountdown', 'guestCount', 'slug'];
        const isCore = coreFields.includes(key);

        // Optimistic Update
        let updatedData;
        if (isCore) {
            updatedData = {
                ...weddingData,
                [key]: value
            };
        } else {
            updatedData = {
                ...weddingData,
                customizations: {
                    ...weddingData.customizations,
                    [key]: value
                }
            };
        }

        setWeddingData(updatedData);

        // Save to Server
        try {
            setSaving(true);
            const token = getAccessToken();
            const res = await fetch(`${API_BASE_URL}/api/auth/client/wedding`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ weddingData: updatedData })
            });

            if (!res.ok) throw new Error("Failed to save");

        } catch (err) {
            console.error("Failed to save customization", err);
            toast.error("Failed to save change");
        } finally {
            setSaving(false);
        }
    };

    const handleEditCurrentBg = async () => {
        const currentBg = weddingData?.customizations?.heroBgImage;
        if (!currentBg) {
            handleUpdateCustomization('triggerBgUpload', 'true');
            return;
        }

        // If it's a remote URL, we need to convert it to base64 to avoid CORS issues in canvas
        if (currentBg.startsWith('http')) {
            const toastId = toast.loading("Fetching current background...");
            try {
                const response = await fetch(currentBg);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedImageSrc(reader.result as string);
                    setIsAdjusterOpen(true);
                    toast.dismiss(toastId);
                };
                reader.readAsDataURL(blob);
            } catch (err) {
                console.error("Failed to fetch current background for editing", err);
                toast.error("Failed to load background for editing", { id: toastId });
                // Fallback: just open upload
                handleUpdateCustomization('triggerBgUpload', 'true');
            }
        } else {
            setSelectedImageSrc(currentBg);
            setIsAdjusterOpen(true);
        }
    };

    const handleResetEditor = async () => {
        if (!weddingData) return;
        if (!window.confirm("Are you sure you want to reset ALL design customizations? This will revert the site to its default state.")) return;

        try {
            setSaving(true);
            const token = getAccessToken();

            // Reset customizations to empty object
            const resetData = {
                ...weddingData,
                customizations: {}
            };

            const res = await fetch(`${API_BASE_URL}/api/auth/client/wedding`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ weddingData: resetData })
            });

            if (!res.ok) throw new Error("Failed to reset");

            setWeddingData(resetData);
            toast.success("Design reset to default");
        } catch (err) {
            console.error("Failed to reset editor", err);
            toast.error("Failed to reset design");
        } finally {
            setSaving(false);
        }
    };

    const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !weddingData) return;

        // Create object URL for the cropper
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImageSrc(reader.result as string);
            setIsAdjusterOpen(true);
        };
        reader.readAsDataURL(file);

        // Reset input so change triggers even for same file
        e.target.value = '';
    };

    const handleAdjustedUpload = async (blob: Blob, adjustments: ImageAdjustments) => {
        if (!weddingData) {
            console.error("❌ No wedding data available for upload");
            return;
        }

        console.log("🚀 Starting upload of processed background. Blob size:", blob.size);
        try {
            setSaving(true);
            const token = getAccessToken();
            const formData = new FormData();

            // Generate a filename
            const filename = `bg_${Date.now()}.jpg`;
            formData.append('photo', blob, filename);
            formData.append('sister', weddingData.slug || 'wedding');
            formData.append('title', 'Hero Background');
            formData.append('eventType', 'hero');

            console.log("📤 Sending photo to /api/photos/public...");
            const uploadRes = await fetch(`${API_BASE_URL}/api/photos/public`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                throw new Error(`Upload failed (${uploadRes.status}): ${errorText}`);
            }

            const uploadJson = await uploadRes.json();
            console.log("✅ Upload response received:", uploadJson);

            if (uploadJson.photo?.publicUrl) {
                // Save both the image URL AND the adjustments
                const updatedCustomizations = {
                    ...weddingData.customizations,
                    heroBgImage: uploadJson.photo.publicUrl,
                    heroBgAdjustments: adjustments
                };

                console.log("💾 Saving updated customizations to DB...");
                const res = await fetch(`${API_BASE_URL}/api/auth/client/wedding`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        weddingData: {
                            ...weddingData,
                            customizations: updatedCustomizations
                        }
                    })
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to save background metadata (${res.status}): ${errorText}`);
                }

                setWeddingData((prev: any) => ({
                    ...prev,
                    customizations: updatedCustomizations
                }));

                toast.success("Background updated!");
                setIsAdjusterOpen(false);
                setSelectedImageSrc(null);
            } else {
                throw new Error("No public URL returned from server");
            }
        } catch (err: any) {
            console.error("❌ Adjusted upload failed:", err);
            toast.error(`Update failed: ${err.message || 'Server error'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-rose-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    </div>
                </div>
                <div className="text-center">
                    <span className="text-gray-600 font-medium block">Loading Visual Editor...</span>
                    <span className="text-gray-400 text-sm italic">Getting your wedding ready for styling</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-rose-100 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                        <ArrowLeft className="w-8 h-8 rotate-45" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Editor Couldn't Load</h2>
                    <p className="text-gray-500 mb-8">{error}</p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => window.location.reload()} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12">
                            Try Again
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/client')} className="text-gray-500 rounded-xl h-12">
                            Go Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!weddingData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <MonitorPlay className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Wedding Data</h2>
                    <p className="text-gray-500 mb-8">We couldn't find any wedding details associated with your account. Please set up your wedding first.</p>
                    <Button onClick={() => navigate('/client')} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12">
                        Setting Up My Wedding
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black/5">
            {/* Main Editor Canvas - Full Screen */}
            <div className={`transition-all duration-500 ${previewMode ? '' : 'pb-24'}`}>
                <WeddingTemplate
                    weddingData={weddingData}
                    timeline={timeline}
                    photos={photos}
                    // If preview mode is ON, isEditing is FALSE (hides pencils)
                    isEditing={!previewMode}
                    onUpdateCustomization={handleUpdateCustomization}
                />
            </div>

            {/* HUD Floating Dock - Draggable */}
            <motion.div
                drag
                dragConstraints={{ left: -500, right: 500, top: -800, bottom: 50 }}
                initial={{ y: 100, x: "-50%", opacity: 0 }}
                animate={{ y: 0, x: "-50%", opacity: 1 }}
                className="fixed bottom-6 left-1/2 z-50 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-black/20 text-white">
                    {/* Drag Handle */}
                    <div className="pl-2 text-white/30">
                        <GripVertical className="w-5 h-5" />
                    </div>

                    <TooltipProvider delayDuration={0}>
                        {/* Exit Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate('/client')}
                                    className="rounded-full w-10 h-10 hover:bg-white/10 hover:text-white text-white/70"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">Exit Editor</TooltipContent>
                        </Tooltip>

                        {/* Edit Current Background */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleEditCurrentBg}
                                    className="rounded-full w-10 h-10 hover:bg-indigo-500/20 hover:text-indigo-400 text-white/70"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">Adjust Background</TooltipContent>
                        </Tooltip>

                        {/* Reset All Designs */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleResetEditor}
                                    className="rounded-full w-10 h-10 hover:bg-rose-500/20 hover:text-rose-400 text-white/70"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">Reset All Designs</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-6 bg-white/20 mx-1"></div>

                        {/* Preview Toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={previewMode ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => setPreviewMode(!previewMode)}
                                    className={`rounded-full w-10 h-10 transition-all ${previewMode ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'hover:bg-white/10 hover:text-white text-white/70'}`}
                                >
                                    {previewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                                {previewMode ? "Exit Preview" : "Preview Mode"}
                            </TooltipContent>
                        </Tooltip>

                        {/* View Live */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(`/w/${weddingData.slug}`, '_blank')}
                                    className="rounded-full w-10 h-10 hover:bg-white/10 hover:text-white text-white/70"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">View Live Site</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-6 bg-white/20 mx-1"></div>

                        {/* Save Status / Live Indicator */}
                        <div className="px-4 flex items-center gap-2">
                            {saving ? (
                                <div className="flex items-center text-xs font-medium text-white/70">
                                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                    Saving...
                                </div>
                            ) : (
                                <div className="flex items-center text-xs font-medium text-emerald-400">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                                    Live Edit
                                </div>
                            )}
                        </div>
                    </TooltipProvider>

                </div>
            </motion.div>

            {/* Hidden BG Upload Input */}
            <input
                id="bg-upload-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleBgUpload}
            />

            {/* Hint Toast (Visible briefly) */}
            {!previewMode && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-sm pointer-events-none animate-in fade-in slide-in-from-top-4 duration-700 delay-500 opacity-0 fill-mode-forwards">
                    Hover over elements to edit
                </div>
            )}

            {/* Background Adjuster Modal */}
            {selectedImageSrc && (
                <BackgroundAdjusterModal
                    isOpen={isAdjusterOpen}
                    onClose={() => {
                        setIsAdjusterOpen(false);
                        setSelectedImageSrc(null);
                    }}
                    imageSrc={selectedImageSrc}
                    onConfirm={handleAdjustedUpload}
                />
            )}
        </div>
    );
};

export default VisualEditor;
