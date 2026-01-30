import { Button } from "@/components/ui/button";
import {
    LogIn,
    Rocket,
    Phone,
    Share2,
    MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

const actions = [
    { id: 'login', label: "Login", icon: LogIn, color: "text-rose-600", hoverBg: "hover:bg-rose-50" },
    { id: 'signup', label: "Get Started", icon: Rocket, color: "text-purple-600", hoverBg: "hover:bg-purple-50" },
    { id: 'whatsapp', label: "WhatsApp Chat", icon: MessageCircle, color: "text-green-600", hoverBg: "hover:bg-green-50" },
    { id: 'share', label: "Share Page", icon: Share2, color: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
];

export function LandingToolbar() {
    const navigate = useNavigate();

    const handleAction = async (id: string) => {
        switch (id) {
            case 'login':
                navigate('/company/login');
                break;
            case 'signup':
                navigate('/company/signup');
                break;
            case 'whatsapp':
                window.open('https://wa.me/917907177841', '_blank');
                break;
            case 'share':
                try {
                    if (navigator.share) {
                        await navigator.share({
                            title: 'WeddingWeb | AI-Powered Wedding Planning',
                            text: 'Create your perfect wedding website with WeddingWeb. Check it out!',
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
        </TooltipProvider>
    );
}
