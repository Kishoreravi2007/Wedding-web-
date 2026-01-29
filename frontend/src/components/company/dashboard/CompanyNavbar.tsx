import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";
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
    { label: "Overview", href: "#overview" },
    { label: "Leads", href: "#leads" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Services", href: "#services" },
    { label: "Bookings", href: "/company/bookings" }, // Keep as route if page exists or anchor if section
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
        if (href.startsWith('#')) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">

                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/company" className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white">
                            W
                        </div>
                        <span className="hidden md:inline-block bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                            WeddingWeb
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 mx-6">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleScroll(e, item.href)}
                            className={`text-sm font-medium transition-colors hover:text-primary ${location.hash === item.href
                                ? "text-primary font-semibold"
                                : "text-slate-600"
                                }`}
                        >
                            {item.label}
                        </a>
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
                                                {currentUser?.email || "contact@company.com"}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
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
                                <Link to="/company" className="flex items-center gap-2 font-bold text-xl mb-8">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white">
                                        W
                                    </div>
                                    <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                                        WeddingWeb
                                    </span>
                                </Link>
                                <nav className="flex flex-col gap-4">
                                    {navItems.map((item) => (
                                        <a
                                            key={item.href}
                                            href={item.href}
                                            onClick={(e) => handleScroll(e, item.href)}
                                            className="text-lg font-medium transition-colors hover:text-primary text-slate-600"
                                        >
                                            {item.label}
                                        </a>
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
