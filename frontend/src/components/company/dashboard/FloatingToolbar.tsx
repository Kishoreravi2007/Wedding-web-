import { Button } from "@/components/ui/button";
import {
    Pencil,
    Briefcase,
    ImagePlus,
    Phone,
    Share2,
    Plus,
    Users,
    MessageCircle,
    Calendar,
    Sparkles,
    Zap,
    CreditCard,
    Mail
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UploadPhotoModal } from "./UploadPhotoModal";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

// Custom WhatsApp Icon since Lucide might not have the brand icon in this version, or standard Phone is fine.
// Using MessageCircle as a proxy for WhatsApp if needed, or stick to generic icons.

// Actions are now defined inside the component based on role

export function FloatingToolbar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Unified role logic
    const isProfessional = ['vendor', 'photographer', 'admin'].includes(currentUser?.role || '');
    const isClient = !isProfessional;

    const actions = useMemo(() => {
        if (isProfessional) {
            return [
                { id: 'edit', label: "Edit Profile", icon: Pencil, color: "text-slate-600", hoverBg: "hover:bg-slate-100" },
                { id: 'service', label: "Add Service", icon: Briefcase, color: "text-blue-600", hoverBg: "hover:bg-blue-50" },
                { id: 'photo', label: "Add Photos", icon: ImagePlus, color: "text-rose-600", hoverBg: "hover:bg-rose-50" },
                { id: 'whatsapp', label: "WhatsApp", icon: Phone, color: "text-green-600", hoverBg: "hover:bg-green-50" },
                { id: 'share', label: "Share", icon: Share2, color: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
            ];
        } else {
            const baseActions = [
                { id: 'edit', label: "Settings", icon: Pencil, color: "text-slate-600", hoverBg: "hover:bg-slate-100" },
                { id: 'pricing', label: "Pricing", icon: CreditCard, color: "text-purple-600", hoverBg: "hover:bg-purple-50" },
                { id: 'contact', label: "Contact", icon: Mail, color: "text-rose-600", hoverBg: "hover:bg-rose-50" },
            ];

            if (!currentUser?.has_premium_access) {
                baseActions.push({ id: 'upgrade', label: "Upgrade", icon: Zap, color: "text-amber-600", hoverBg: "hover:bg-amber-50" });
            } else {
                baseActions.push({ id: 'builder', label: "Enter Premium Builder", icon: Sparkles, color: "text-indigo-600", hoverBg: "hover:bg-indigo-50" });
            }

            baseActions.push({ id: 'share', label: "Share", icon: Share2, color: "text-indigo-600", hoverBg: "hover:bg-indigo-50" });
            return baseActions;
        }
    }, [isProfessional, currentUser?.has_premium_access]);

    const handleAction = async (id: string) => {
        switch (id) {
            case 'upgrade':
            case 'pricing':
                navigate('/company/pricing');
                break;
            case 'contact':
                navigate('/company/contact');
                break;
            case 'edit':
                toast.info("Opening account settings...");
                navigate('/company/account');
                break;
            case 'service':
                const el = document.getElementById('services');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                } else {
                    toast.info("Navigate to services section");
                }
                break;
            case 'photo':
                setIsUploadOpen(true);
                break;
            case 'whatsapp':
                window.open('https://wa.me/917907177841', '_blank');
                break;
            case 'guests':
                navigate('/company/guests');
                break;
            case 'wishes':
                navigate('/company/wishes');
                break;
            case 'builder':
                if (currentUser?.has_premium_access) {
                    navigate('/client');
                } else {
                    navigate('/company/pricing');
                }
                break;
            case 'share':
                try {
                    if (navigator.share) {
                        await navigator.share({
                            title: 'WeddingWeb | Wedding Photography & Planning',
                            text: 'Capture your perfect moments with WeddingWeb. Check out the portfolio!',
                            url: window.location.href,
                        });
                    } else {
                        await navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied to clipboard!");
                    }
                } catch (err) {
                    console.error("Share failed", err);
                }
                break;
        }
    };
    return (
        <TooltipProvider>
            {/* Desktop: Right Fixed Vertical Toolbar */}
            <div className="hidden md:flex flex-col gap-2 fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                {actions.map((action, index) => (
                    <Tooltip key={index} delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAction(action.id)}
                                className={`h-12 w-12 rounded-xl transition-all ${action.color} ${action.hoverBg}`}
                            >
                                <action.icon className="h-6 w-6" />
                                <span className="sr-only">{action.label}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="font-semibold" sideOffset={10}>
                            {action.label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>

            {/* Mobile: Bottom Fixed Horizontal Toolbar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 pb-8 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center max-w-sm mx-auto">
                    {actions.map((action, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAction(action.id)}
                                className={`h-10 w-10 rounded-full ${action.color} ${action.hoverBg} bg-slate-50`}
                            >
                                <action.icon className="h-5 w-5" />
                            </Button>
                            <span className="text-[10px] font-medium text-slate-500">{action.label.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>
            <UploadPhotoModal open={isUploadOpen} onOpenChange={setIsUploadOpen} />
        </TooltipProvider>
    );
}
