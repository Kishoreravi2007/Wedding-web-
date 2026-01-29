import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Image, Calendar, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export function StatsCards() {
    const [counts, setCounts] = useState({ leads: 0, portfolio: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Leads Count
                const leadsRes = await fetch(`${API_BASE_URL}/api/contact-messages`);
                const leadsData = await leadsRes.json();

                // Fetch Portfolio Count
                const photosRes = await fetch(`${API_BASE_URL}/api/photos?limit=1`);
                const photosData = await photosRes.json();

                setCounts({
                    leads: leadsData.messages ? leadsData.messages.length : 0,
                    portfolio: photosData.total || 0
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        {
            title: "Total Leads",
            value: counts.leads,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            subtext: "Total inquiries received"
        },
        {
            title: "Portfolio Items",
            value: counts.portfolio,
            icon: Image,
            color: "text-rose-600",
            bg: "bg-rose-50",
            subtext: "Photos in gallery"
        },
        {
            title: "Bookings",
            value: "0",
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-50",
            subtext: "Confirmed events"
        },
        {
            title: "Earnings",
            value: "₹0",
            icon: Wallet,
            color: "text-green-600",
            bg: "bg-green-50",
            subtext: "Total revenue"
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                >
                    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stat.subtext}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
