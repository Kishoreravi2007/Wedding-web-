import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Image, Calendar, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useWebsite } from "@/contexts/WebsiteContext";
import { MessageCircle, Heart, UserCheck, Clock } from "lucide-react";
import { getWishes } from "@/services/wishService";

export function StatsCards() {
    const { currentUser } = useAuth();
    const { content } = useWebsite();
    const [counts, setCounts] = useState({ leads: 0, portfolio: 0, wishes: 0, rsvps: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Leads Count (for vendors)
                const leadsRes = await fetch(`${API_BASE_URL}/api/contact-messages`);
                const leadsData = await leadsRes.json();

                // Fetch Portfolio Count
                const photosRes = await fetch(`${API_BASE_URL}/api/photos?limit=1`);
                const photosData = await photosRes.json();

                // Fetch Wishes Count (for clients)
                const wishes = await getWishes();

                setCounts({
                    leads: leadsData.messages ? leadsData.messages.length : 0,
                    portfolio: photosData.total || 0,
                    wishes: wishes ? wishes.length : 0,
                    rsvps: content?.totalGuests || 0 // Placeholder or logic for RSVPs
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, [content]);

    // Unified role logic
    const isProfessional = ['vendor', 'photographer', 'admin'].includes(currentUser?.role || '');
    const isClient = !isProfessional;

    // Days until wedding
    const daysToGo = content?.weddingDate ? Math.max(0, Math.ceil((new Date(content.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

    const stats = isClient ? [
        {
            title: "Guest Wishes",
            value: counts.wishes,
            icon: Heart,
            color: "text-rose-600",
            bg: "bg-rose-50",
            subtext: "Messages from family & friends"
        },
        {
            title: "Wedding Photos",
            value: counts.portfolio,
            icon: Image,
            color: "text-blue-600",
            bg: "bg-blue-50",
            subtext: "Captured memories"
        },
        {
            title: "Guest List",
            value: counts.rsvps,
            icon: UserCheck,
            color: "text-purple-600",
            bg: "bg-purple-50",
            subtext: "Invited wedding guests"
        },
        {
            title: "Days to Go",
            value: daysToGo,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
            subtext: "Until the big day"
        }
    ] : [
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
