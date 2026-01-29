import { motion } from "framer-motion";
import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, MapPin } from "lucide-react";

const bookings = [
    {
        id: "BK-001",
        clientName: "Rahul & Sneha",
        event: "Wedding Photography",
        date: "2025-06-15",
        time: "10:00 AM",
        location: "Kochi, Kerala",
        status: "Confirmed",
        amount: "₹80,000",
    },
    {
        id: "BK-002",
        clientName: "Arjun & Meera",
        event: "Engagement Shoot",
        date: "2025-07-20",
        time: "04:00 PM",
        location: "Palakkad, Kerala",
        status: "Pending",
        amount: "₹25,000",
    },
    {
        id: "BK-003",
        clientName: "Vivek & Anjali",
        event: "Pre-Wedding Shoot",
        date: "2025-08-05",
        time: "06:00 AM",
        location: "Munnar, Kerala",
        status: "Confirmed",
        amount: "₹45,000",
    }
];

const Bookings = () => {
    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            <CompanyNavbar />

            <main className="container px-4 md:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
                            <p className="text-slate-500">Manage your upcoming wedding events and schedules.</p>
                        </div>
                        <div className="flex gap-3">
                            <Badge variant="outline" className="bg-white px-4 py-1">Total: {bookings.length}</Badge>
                            <Badge className="bg-rose-500 hover:bg-rose-600 px-4 py-1">Upcoming: 2</Badge>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="bg-slate-900 text-white p-6 md:w-48 flex flex-col justify-center items-center text-center">
                                                <div className="text-sm uppercase tracking-wider opacity-60 mb-1">Date</div>
                                                <div className="text-2xl font-bold">{new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                                                <div className="text-sm opacity-60">{booking.time}</div>
                                            </div>
                                            <div className="p-6 flex-1 grid md:grid-cols-3 gap-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                        <User className="w-4 h-4" />
                                                        Client
                                                    </div>
                                                    <div className="font-bold text-lg text-slate-900">{booking.clientName}</div>
                                                    <div className="text-sm text-rose-600 font-medium">{booking.event}</div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                        <MapPin className="w-4 h-4" />
                                                        Location
                                                    </div>
                                                    <div className="text-slate-700">{booking.location}</div>
                                                    <div className="text-sm font-bold text-slate-900">{booking.amount}</div>
                                                </div>

                                                <div className="flex flex-col justify-between items-end">
                                                    <Badge className={booking.status === 'Confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}>
                                                        {booking.status}
                                                    </Badge>
                                                    <button className="text-sm font-semibold text-rose-500 hover:text-rose-600 underline underline-offset-4">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Bookings;
