import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { HeroSection } from "@/components/company/dashboard/HeroSection";
import { FloatingToolbar } from "@/components/company/dashboard/FloatingToolbar";
import { StatsCards } from "@/components/company/dashboard/StatsCards";
import { LeadsTable } from "@/components/company/dashboard/LeadsTable";
import { PortfolioGrid } from "@/components/company/dashboard/PortfolioGrid";
import { ServicesCards } from "@/components/company/dashboard/ServicesCards";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

const CompanyDashboard = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            <CompanyNavbar />

            <main className="relative">
                <HeroSection />

                {/* Floating Toolbar - Fixed relative to viewport */}
                <FloatingToolbar />

                {/* Dashboard Content Sections */}
                <div className="container px-4 md:px-6 py-12 space-y-20 pb-24 md:pb-12">

                    {/* Section A: Quick Stats */}
                    <section id="overview">
                        <StatsCards />
                    </section>

                    {/* Section B: Recent Leads */}
                    <section id="leads">
                        <LeadsTable />
                    </section>

                    {/* Section C: Portfolio */}
                    <section id="portfolio">
                        <PortfolioGrid />
                    </section>

                    {/* Section D: Services */}
                    <section id="services">
                        <ServicesCards />
                    </section>

                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>© 2025 WeddingWeb Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-900">Terms of Service</Link>
                        <Link to="/company/contact" className="hover:text-slate-900">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CompanyDashboard;
