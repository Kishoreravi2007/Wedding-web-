
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WeddingTemplate } from '@/components/WeddingTemplate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, MonitorPlay, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getAccessToken, API_BASE_URL } from '@/lib/api';

const VisualEditor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [weddingData, setWeddingData] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [photos, setPhotos] = useState<any[]>([]);
    const [previewMode, setPreviewMode] = useState(false);


    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getAccessToken();
                if (!token) {
                    navigate('/company/login');
                    return;
                }

                const headers = { 'Authorization': `Bearer ${token}` };

                // 1. Fetch Wedding Data
                const weddingRes = await fetch(`${API_BASE_URL}/api/auth/client/wedding`, { headers });
                const weddingJson = await weddingRes.json();

                if (weddingJson.wedding) {
                    // Ensure customizations object exists
                    const data = weddingJson.wedding;
                    if (!data.customizations) data.customizations = {};
                    setWeddingData(data);

                    // 2. Fetch Timeline
                    const timelineRes = await fetch(`${API_BASE_URL}/api/timeline`, { headers });
                    if (timelineRes.ok) {
                        const timelineJson = await timelineRes.json();
                        setTimeline(timelineJson);
                    }

                    // 3. Fetch Photos (Placeholder/Basic fetch if endpoints enabled)
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to load editor data", err);
                toast.error("Failed to load editor");
                navigate('/dashboard');
            }
        };

        fetchData();
    }, [navigate]);

    const handleUpdateCustomization = async (key: string, value: string) => {
        if (!weddingData) return;

        // Optimistic Update
        const updatedData = {
            ...weddingData,
            customizations: {
                ...weddingData.customizations,
                [key]: value
            }
        };
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

            // Silent save success or very subtle indicator (handled by button state)

        } catch (err) {
            console.error("Failed to save customization", err);
            toast.error("Failed to save change");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                <span className="ml-2 text-gray-500">Loading Editor...</span>
            </div>
        );
    }

    if (!weddingData) return null;

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

            {/* HUD Floating Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="flex items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-black/20 text-white">

                    <TooltipProvider delayDuration={0}>
                        {/* Exit Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate('/dashboard')}
                                    className="rounded-full w-10 h-10 hover:bg-white/10 hover:text-white text-white/70"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">Exit Editor</TooltipContent>
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
            </div>

            {/* Hint Toast (Visible briefly) */}
            {!previewMode && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-sm pointer-events-none animate-in fade-in slide-in-from-top-4 duration-700 delay-500 opacity-0 fill-mode-forwards">
                    Hover over text to edit
                </div>
            )}
        </div>
    );
};

export default VisualEditor;
