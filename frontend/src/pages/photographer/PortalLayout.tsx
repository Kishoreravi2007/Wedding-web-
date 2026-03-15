import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Bell, Sparkles, LogOut } from "lucide-react";

export const PortalLayout = ({ children }: { children: React.ReactNode }) => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    // Map navigation items to routes
    const navItems = [
        { label: "Dashboard", href: "/photographer", active: location.pathname === "/photographer" },
        { label: "Manage Photos", href: "/photographer/manage", active: location.pathname === "/photographer/manage" },
        { label: "Live Sync", href: "/photographer/live", active: location.pathname === "/photographer/live" },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111318] min-h-screen flex flex-col font-display">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white px-6 md:px-20 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-1.5 transition-transform group-hover:scale-105">
                            <img src="/logo.png" alt="WeddingWeb" className="h-full w-full object-contain" />
                        </div>
                        <h2 className="text-[#111318] text-xl font-extrabold leading-tight tracking-[-0.015em]">WeddingWeb</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={`text-sm font-bold transition-colors ${item.active
                                    ? "text-primary border-b-2 border-primary pb-1"
                                    : "text-[#636f88] hover:text-primary font-semibold"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-1 justify-end gap-6 items-center">
                    <label className="hidden lg:flex flex-col min-w-40 h-10 max-w-64 relative">
                        <div className="flex w-full flex-1 items-stretch rounded-lg bg-gray-100 border border-transparent focus-within:border-primary/30 transition-all overflow-hidden">
                            <div className="text-[#636f88] flex items-center justify-center pl-3">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                className="form-input flex w-full border-none bg-transparent focus:ring-0 px-3 text-sm outline-none"
                                placeholder="Search events..."
                            />
                        </div>
                    </label>

                    <button className="relative text-[#636f88] hover:text-primary transition-colors">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </button>

                    <div className="relative group">
                        <button className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-9 h-9 border border-gray-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            {currentUser?.profile?.avatar_url ? (
                                <img src={currentUser.profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {currentUser?.email?.substring(0, 2).toUpperCase() || 'PH'}
                                </div>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block border border-gray-100">
                            <button
                                onClick={logout}
                                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-gray-100 bg-white py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 opacity-60">
                        <img src="/logo.png" alt="" className="w-5 h-5 grayscale opacity-70" />
                        <p className="text-sm font-medium">© 2026 WeddingWeb AI. Made with ❤️ in Kerala.</p>
                    </div>
                    <div className="flex gap-6">
                        <Link className="text-sm text-[#636f88] hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link>
                        <Link className="text-sm text-[#636f88] hover:text-primary transition-colors" to="/terms">Terms of Service</Link>
                        <Link className="text-sm text-[#636f88] hover:text-primary transition-colors" to="/company/contact">Support Center</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};
