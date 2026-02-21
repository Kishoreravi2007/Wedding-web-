import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown, Heart, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { formatDistanceToNow } from 'date-fns';

// Navigation items defined inside the component based on role

export function CompanyNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { currentUser, logout } = useAuth();

    // Unified role logic
    const isProfessional = ['vendor', 'photographer', 'admin'].includes(currentUser?.role || '');
    const isClient = !isProfessional;

    const navItems = isProfessional ? [
        { label: "Overview", href: "/" },
        { label: "Leads", href: "/#leads" },
        { label: "Portfolio", href: "/#portfolio" },
        { label: "Services", href: "/#services" },
        { label: "Bookings", href: "/company/bookings" },
        { label: "Payments", href: "/company/payments" },
        { label: "Settings", href: "/company/settings" },
    ] : [
        { label: "Overview", href: "/" },
        { label: "Services", href: "/company/services" },
        { label: "Pricing", href: "/company/pricing" },
        { label: "Contact", href: "/company/contact" },
        { label: "Settings", href: "/company/settings" },
    ];
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

    const fetchNotifications = async () => {
        if (!currentUser) return;
        setIsLoadingNotifs(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setIsLoadingNotifs(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            }
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/company/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Helper to handle hash scrolling
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        if (href.includes('#')) {
            const [path, hash] = href.split('#');
            const targetHash = `#${hash}`;

            // Check if we are already on the dashboard/root page
            const isDashboard = location.pathname === '/' || location.pathname === '';

            if (isDashboard && (path === '/' || path === '')) {
                e.preventDefault();
                const element = document.querySelector(targetHash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    // Update URL with hash without reload
                    window.history.pushState(null, '', targetHash);
                }
            }
        } else if (href === '/') {
            // Handle scrolling to top when clicking "/" while on "/"
            const isDashboard = location.pathname === '/' || location.pathname === '';
            if (isDashboard) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, '', '/');
            }
        }
    };

    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="w-full max-w-6xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-center justify-between p-2 pointer-events-auto">

                <div className="flex items-center gap-3 pl-4">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-1.5 transition-transform group-hover:scale-105">
                            <img src="/logo.png" alt="WeddingWeb" className="h-full w-full object-contain" />
                        </div>
                        <span className="hidden lg:inline-block text-xl font-bold tracking-tight text-slate-900">
                            WeddingWeb
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 px-1 py-1 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                    {navItems.map((item) => {
                        const isActive = (item.href === '/' && location.pathname === '/' && !location.hash) ||
                            (location.pathname + location.hash === item.href) ||
                            (location.pathname === item.href);
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={(e) => handleScroll(e, item.href)}
                                className={`px-6 py-2.5 text-xs transition-all duration-300 rounded-full whitespace-nowrap tracking-wide font-semibold ${isActive
                                    ? "bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-rose-200/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3 pr-2">
                    {currentUser ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-slate-100 shadow-sm hover:border-rose-100 transition-colors">
                                    <Avatar className="h-full w-full">
                                        <AvatarImage src={currentUser?.profile?.avatar_url || "/placeholder-user.jpg"} alt="Profile" />
                                        <AvatarFallback className="bg-rose-50 text-rose-600 font-bold text-xs">
                                            {currentUser?.profile?.full_name?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{currentUser?.profile?.full_name || "Company Admin"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {currentUser?.email || currentUser?.username || "contact@company.com"}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/company/settings?tab=general">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/company/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-6 mr-4">
                            <Link to="/company/login">Log in</Link>
                        </Button>
                    )}

                    {/* Mobile Menu (Hamburger) */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="pr-0">
                            <div className="px-7">
                                <Link to="/" className="flex items-center gap-3 font-bold text-2xl mb-8">
                                    <img src="/logo.png" alt="WeddingWeb Logo" className="h-10 w-10 rounded-xl object-contain" />
                                    <span className="bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
                                        WeddingWeb
                                    </span>
                                </Link>
                                <nav className="flex flex-col gap-2 mt-4">
                                    {navItems.map((item) => {
                                        const isActive = (item.href === '/' && location.pathname === '/' && !location.hash) ||
                                            (location.pathname + location.hash === item.href) ||
                                            (location.pathname === item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                to={item.href}
                                                onClick={(e) => handleScroll(e, item.href)}
                                                className={`px-4 py-3 text-base rounded-xl transition-all ${isActive
                                                    ? "bg-rose-50 text-rose-600 font-bold border-l-4 border-rose-500"
                                                    : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div >
        </header >
    );
}
