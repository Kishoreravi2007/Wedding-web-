import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown, Heart } from "lucide-react";
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

const navItems = [
    { label: "Overview", href: "/" },
    { label: "Weddings", href: "/weddings" },
    { label: "Leads", href: "/#leads" },
    { label: "Portfolio", href: "/#portfolio" },
    { label: "Services", href: "/#services" },
    { label: "Bookings", href: "/company/bookings" },
    { label: "Payments", href: "/company/payments" },
    { label: "Settings", href: "/company/settings" },
];

export function CompanyNavbar() {
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { currentUser, logout } = useAuth();
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
            window.location.href = '/company/login';
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
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">

                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-3 font-bold">
                        <img src="/logo.png" alt="WeddingWeb Logo" className="h-10 w-10 rounded-xl object-contain" />
                        <span className="hidden md:inline-block text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
                            WeddingWeb
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 mx-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={(e) => handleScroll(e, item.href)}
                            className={`text-sm font-medium transition-colors hover:text-primary ${(item.href === '/' && location.pathname === '/' && !location.hash) ||
                                (location.pathname + location.hash === item.href) ||
                                (location.pathname === item.href)
                                ? "text-rose-600 font-semibold"
                                : "text-slate-600"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Search Input (Desktop) */}
                    <div className="relative hidden lg:block w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-full pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        />
                    </div>

                    {currentUser ? (
                        <>
                            {/* Notification Icon & Popover */}
                            <Popover onOpenChange={(open) => open && fetchNotifications()}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 md:w-96 p-0 mr-4 md:mr-0 z-50 rounded-2xl shadow-2xl border-slate-100" align="end" sideOffset={10}>
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight">Notifications</h3>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                                                {unreadCount} UNREAD ALERTS
                                            </p>
                                        </div>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full text-[11px] font-bold"
                                                onClick={markAllAsRead}
                                            >
                                                Mark all read
                                            </Button>
                                        )}
                                    </div>
                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <Bell className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <h4 className="text-sm font-semibold text-slate-900">All caught up!</h4>
                                                <p className="text-xs text-slate-500 mt-1 max-w-[180px]">No new notifications or activity to show right now.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-4 transition-all hover:bg-slate-50/80 flex gap-3 relative group ${!notification.is_read ? 'bg-rose-50/20' : ''}`}
                                                    >
                                                        <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border ${notification.category === 'marketing'
                                                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                                            }`}>
                                                            {notification.category === 'marketing' ? <Sparkles className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className="text-sm font-bold text-slate-900 leading-tight">{notification.title}</h4>
                                                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 leading-relaxed pr-6">{notification.message}</p>
                                                            {notification.link && (
                                                                <Link
                                                                    to={notification.link}
                                                                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 inline-flex items-center gap-1 mt-1 uppercase tracking-wider"
                                                                    onClick={() => markAsRead(notification.id)}
                                                                >
                                                                    View Details →
                                                                </Link>
                                                            )}
                                                        </div>
                                                        {!notification.is_read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Mark as read"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center rounded-b-2xl">
                                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                                            WeddingWeb Notification Center
                                        </p>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10 border shadow-sm">
                                            <AvatarImage src={currentUser?.profile?.avatar_url || "/placeholder-user.jpg"} alt="Profile" />
                                            <AvatarFallback className="bg-gradient-to-br from-rose-100 to-purple-100 text-rose-600 font-medium">
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
                        </>
                    ) : (
                        <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-6">
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
                                <nav className="flex flex-col gap-4">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            onClick={(e) => handleScroll(e, item.href)}
                                            className="text-lg font-medium transition-colors hover:text-rose-600 text-slate-600"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
