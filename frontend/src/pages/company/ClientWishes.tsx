import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { FloatingToolbar } from "@/components/company/dashboard/FloatingToolbar";
import { motion } from "framer-motion";
import WishDisplay from "@/components/WishDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

import { useWebsite } from "@/contexts/WebsiteContext";

const ClientWishes = () => {
    const { content } = useWebsite();

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
                        <h1 className="text-3xl font-bold text-slate-900">Guest Wishes</h1>
                        <p className="text-slate-500 mt-2">Read the beautiful messages from your family and friends.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-rose-600 flex items-center gap-2">
                                    <Heart className="w-5 h-5 fill-rose-500" />
                                    For {content.parvathy.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <WishDisplay recipient="parvathy" />
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-rose-600 flex items-center gap-2">
                                    <Heart className="w-5 h-5 fill-rose-500" />
                                    For {content.sreedevi.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <WishDisplay recipient="sreedevi" />
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </main>
            <FloatingToolbar />
        </div>
    );
};

export default ClientWishes;
