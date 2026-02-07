import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { PortfolioGrid } from "@/components/company/dashboard/PortfolioGrid";
import { FloatingToolbar } from "@/components/company/dashboard/FloatingToolbar";
import { motion } from "framer-motion";

const ClientGallery = () => {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <CompanyNavbar />
            <main className="container px-4 md:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Wedding Gallery</h1>
                        <p className="text-slate-500 mt-2">Browse and manage all the beautiful moments captured on your special day.</p>
                    </div>

                    <PortfolioGrid />
                </motion.div>
            </main>
            <FloatingToolbar />
        </div>
    );
};

export default ClientGallery;
