import { motion } from "framer-motion";
import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const payments = [
    {
        id: "TR-1024",
        client: "Rahul & Sneha",
        type: "Advance",
        amount: "₹20,000",
        date: "2025-01-20",
        status: "Completed",
    },
    {
        id: "TR-1025",
        client: "Arjun & Meera",
        type: "Booking Fee",
        amount: "₹5,000",
        date: "2025-01-25",
        status: "Pending",
    }
];

const Payments = () => {
    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            <CompanyNavbar />

            <main className="container px-4 md:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Payments</h1>
                    <p className="text-slate-500 mb-8">Track your earnings and transaction history.</p>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <Card className="bg-slate-900 text-white border-none shadow-xl">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <Badge className="bg-green-500 border-none">+12.5%</Badge>
                                </div>
                                <div className="text-sm opacity-60 mb-1">Total Revenue</div>
                                <div className="text-3xl font-bold">₹2,45,000</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                                        <ArrowDownLeft className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500 mb-1">Pending</div>
                                <div className="text-3xl font-bold text-slate-900">₹45,000</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500 mb-1">Transactions</div>
                                <div className="text-3xl font-bold text-slate-900">24</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 font-semibold text-slate-700">Transaction ID</th>
                                        <th className="p-4 font-semibold text-slate-700">Client</th>
                                        <th className="p-4 font-semibold text-slate-700">Type</th>
                                        <th className="p-4 font-semibold text-slate-700">Amount</th>
                                        <th className="p-4 font-semibold text-slate-700">Date</th>
                                        <th className="p-4 font-semibold text-slate-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((tx) => (
                                        <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-mono text-sm text-slate-600">{tx.id}</td>
                                            <td className="p-4 font-medium text-slate-900">{tx.client}</td>
                                            <td className="p-4 text-slate-600">{tx.type}</td>
                                            <td className="p-4 font-bold text-slate-900">{tx.amount}</td>
                                            <td className="p-4 text-slate-500">{tx.date}</td>
                                            <td className="p-4">
                                                <Badge className={tx.status === 'Completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}>
                                                    {tx.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default Payments;
