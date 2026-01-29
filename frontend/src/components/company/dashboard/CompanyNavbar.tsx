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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

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
                            {/* Notification Icon */}
                            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                            </Button>

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
