import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { HeroSection } from "@/components/company/dashboard/HeroSection";
import { FloatingToolbar } from "@/components/company/dashboard/FloatingToolbar";
import { StatsCards } from "@/components/company/dashboard/StatsCards";
import { LeadsTable } from "@/components/company/dashboard/LeadsTable";
import { PortfolioGrid } from "@/components/company/dashboard/PortfolioGrid";
import { ServicesCards } from "@/components/company/dashboard/ServicesCards";
import { motion } from "framer-motion";

const CompanyDashboard = () => {
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
                        <a href="#" className="hover:text-slate-900">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-900">Terms of Service</a>
                        <a href="#" className="hover:text-slate-900">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CompanyDashboard;
