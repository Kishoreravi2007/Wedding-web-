import { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { dashboardService, weddingService } from '../services/api';
import type { DashboardStats, Activity, Wedding } from '../types';
import StatCard from '../components/ui/StatCard';
import ActivityItem from '../components/ui/ActivityItem';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [recentWeddings, setRecentWeddings] = useState<Wedding[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        dashboardService.getStats().then(setStats);
        dashboardService.getRecentActivity().then(setActivities);
        weddingService.getAll().then(weddings => setRecentWeddings(weddings.slice(0, 5)));
    }, []);

    if (!stats) return (
        <div className="flex h-[80vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-neon-blue animate-pulse">
                    <span className="material-symbols-outlined text-primary text-3xl animate-spin">favorite</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Initializing Overview...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-display px-2 md:px-0">
            {/* Header section moved to TopBar, but we can add secondary title here */}
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Overview</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Real-time Performance & Metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Online Users"
                    value={stats.online_users.toLocaleString()}
                    trend="+12% live pulse"
                    trendUp
                    isLive
                    variant="holographic"
                />
                <StatCard
                    label="Total Weddings"
                    value={stats.total_weddings.toLocaleString()}
                    trend="+5% this month"
                    trendUp
                />
                <StatCard
                    label="Pending Feeds"
                    value={stats.pending_feedbacks}
                    trend="Requires attention"
                />
                <StatCard
                    label="Monthly growth"
                    value={`${(stats.monthly_revenue).toLocaleString()}%`}
                    trend="+18% vs last month"
                    trendUp
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Trends and Table */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Revenue Trends Chart */}
                    <div className="glass-card p-8 rounded-[2.5rem] !bg-white/5">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">System Growth</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Twelve month pulse analytics</p>
                            </div>
                            <div className="glass-card !bg-white/5 p-1 rounded-xl flex gap-1">
                                <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-white transition-colors">Weekly</button>
                                <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary text-black shadow-neon-blue">Monthly</button>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenue_trends}>
                                    <defs>
                                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(10, 14, 23, 0.8)',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backdropFilter: 'blur(20px)',
                                            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                                        }}
                                        itemStyle={{ fontSize: '10px', fontWeight: '900', color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                        labelStyle={{ color: '#64748b', fontSize: '9px', fontWeight: '900', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#00f2ff"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorGrowth)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Weddings Table */}
                    <div className="glass-card p-8 rounded-[2.5rem] !bg-white/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Registrations</h3>
                            <button onClick={() => navigate('/weddings')} className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/30 hover:border-primary transition-all">View All Active</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/10">
                                        <th className="pb-4">Couple</th>
                                        <th className="pb-4">Event Context</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right">Interactive</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentWeddings.map(wedding => (
                                        <tr key={wedding.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-all">
                                                        <span className="text-[10px] font-black text-primary">{wedding.bride_name[0]}{wedding.groom_name[0]}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{wedding.bride_name} & {wedding.groom_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <p className="text-xs font-bold text-slate-300">{new Date(wedding.wedding_date).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{wedding.wedding_code}</p>
                                            </td>
                                            <td className="py-5">
                                                <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${wedding.status === 'live' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    wedding.status === 'preparing' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                    }`}>
                                                    {wedding.status === 'live' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                                                    <span>{wedding.status}</span>
                                                </span>
                                            </td>
                                            <td className="py-5 text-right">
                                                <button
                                                    onClick={() => navigate(`/weddings/${wedding.id}`)}
                                                    className="size-8 rounded-full glass-card !bg-white/5 flex items-center justify-center text-primary border-white/10 shadow-neon-blue hover:scale-110 active:scale-95 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity & Quick Actions */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Quick Control Hub */}
                    <div className="glass-card p-8 rounded-[2.5rem] !bg-white/5">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Control Hub</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => navigate('/coupons')} className="p-4 glass-card !bg-white/5 border-white/10 hover:border-primary/40 transition-all group flex flex-col items-center gap-3">
                                <div className="size-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-primary border border-white/10 group-hover:shadow-neon-blue">
                                    <span className="material-symbols-outlined">confirmation_number</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Gift</p>
                            </button>
                            <button onClick={() => navigate('/weddings')} className="p-4 glass-card !bg-white/5 border-white/10 hover:border-primary/40 transition-all group flex flex-col items-center gap-3">
                                <div className="size-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-primary border border-white/10 group-hover:shadow-neon-blue">
                                    <span className="material-symbols-outlined">favorite</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active</p>
                            </button>
                            <button className="p-4 glass-card !bg-white/5 border-white/10 hover:border-secondary/40 transition-all group flex flex-col items-center gap-3">
                                <div className="size-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-secondary border border-white/10 group-hover:shadow-neon-purple">
                                    <span className="material-symbols-outlined">chat_bubble</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Broadcast</p>
                            </button>
                            <button onClick={() => navigate('/settings')} className="p-4 glass-card !bg-white/5 border-white/10 hover:border-accent/40 transition-all group flex flex-col items-center gap-3">
                                <div className="size-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-accent border border-white/10 group-hover:shadow-[0_0_15px_rgba(255,0,229,0.4)]">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</p>
                            </button>
                        </div>
                    </div>

                    {/* Real-time Pulse Feed */}
                    <div className="glass-card p-8 rounded-[2.5rem] !bg-white/5">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">System Pulse</h3>
                            <div className="size-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        </div>
                        <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                            {activities.map(activity => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
