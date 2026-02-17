import { Link } from "react-router-dom";
import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export const WeddingWebHeader = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { to: "/company/services", label: "Product" },
        { to: "/company/about", label: "Company" },
        { to: "/company/contact", label: "Support" },
        { to: "/company/pricing", label: "Pricing" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#f0f2f4] px-6 md:px-20 lg:px-40 py-4">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 text-primary">
                    <img src="/logo.png" alt="WeddingWeb" className="w-10 h-10 rounded-xl object-contain" />
                    <h2 className="text-[#111318] text-xl font-extrabold tracking-tight font-display">WeddingWeb AI Inc.</h2>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="text-[#111318] text-sm font-semibold hover:text-primary transition-colors font-display"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link to="/company/login" className="hidden sm:flex">
                        <button className="min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#f0f2f4] text-[#111318] text-sm font-bold hover:bg-gray-200 transition-all font-display">
                            Sign In
                        </button>
                    </Link>
                    <Link to="/company/signup">
                        <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-display">
                            Get Started
                        </button>
                    </Link>

                    {/* Mobile Menu Trigger */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="pt-20">
                            <div className="flex flex-col gap-6">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-lg font-semibold text-[#111318]"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <hr />
                                <Link to="/company/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Sign In</Button>
                                </Link>
                                <Link to="/company/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full bg-primary text-white">Get Started</Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

