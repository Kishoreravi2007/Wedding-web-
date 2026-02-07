import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { LeadsTable } from "@/components/company/dashboard/LeadsTable";
import { FloatingToolbar } from "@/components/company/dashboard/FloatingToolbar";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Mail, Phone, Calendar } from "lucide-react";

const ClientGuestList = () => {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <CompanyNavbar />
            <main className="container px-4 md:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Guest List & RSVPs</h1>
                            <p className="text-slate-500 mt-2">Track who's coming to your special day and manage their messages.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-rose-500" />
                                    Total Guests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">--</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    New Messages
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">--</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-500" />
                                    Days Until Wedding
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">--</div>
                            </CardContent>
                        </Card>
                    </div>

                    <LeadsTable />
                </motion.div>
            </main>
            <FloatingToolbar />
        </div>
    );
};

export default ClientGuestList;
