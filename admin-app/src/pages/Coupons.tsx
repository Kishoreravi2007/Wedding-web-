import { useState, useEffect } from 'react';
import { couponService } from '../services/api';
import type { Coupon } from '../types';

export default function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: '',
        usage_limit: '100',
        min_purchase: '0',
        expiry_date: '',
        is_unlimited: false
    });

    const fetchCoupons = () => {
        setIsLoading(true);
        couponService.getAll()
            .then(setCoupons)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle extreme numbers to prevent DB overflow
        let finalUsageLimit: number | null = Number(formData.usage_limit);
        if (formData.is_unlimited) {
            finalUsageLimit = 2147483647; // Use a very large number (Int32 max) or just high value
        } else {
            const BIGINT_MAX = 9223372036854775807n;
            try {
                const usageLimitBig = BigInt(formData.usage_limit || '100');
                if (usageLimitBig > BIGINT_MAX) {
                    finalUsageLimit = 999999999999999; // Reasonable high cap
                }
            } catch (e) { }
        }

        try {
            await couponService.create({
                ...formData,
                discount_value: Number(formData.discount_value),
                usage_limit: finalUsageLimit,
                min_purchase: Number(formData.min_purchase)
            });
            setFormData({ code: '', discount_type: 'percentage', discount_value: '', usage_limit: '100', min_purchase: '0', expiry_date: '', is_unlimited: false });
            fetchCoupons();
            alert('Coupon created successfully!');
        } catch (err: any) {
            console.error('Coupon creation error:', err);
            alert(`Failed to create coupon: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await couponService.delete(id);
            fetchCoupons();
        } catch (err) {
            alert('Failed to delete coupon');
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
        try {
            await couponService.update(id, { status: nextStatus as any });
            fetchCoupons();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredCoupons = coupons.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Gift Logic</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">Promotion & Coupon Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass-card !bg-white/5 py-2 px-4 rounded-xl border border-white/10 hidden md:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Global Pulse</p>
                        <p className="text-xs font-black text-emerald-500 uppercase tracking-tighter">Systems Nominal</p>
                    </div>
                </div>
            </div>

            {/* Stats Metrics Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5 group hover:border-primary/40 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:shadow-neon-blue transition-all">
                            <span className="material-symbols-outlined">bolt</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+12% Utilization</span>
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter">{coupons.filter(c => c.status === 'active').length}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Active Codes</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5 group hover:border-secondary/40 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:shadow-neon-purple transition-all">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Registry</span>
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter">{coupons.length}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Database Entries</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5 group hover:border-accent/40 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:shadow-[0_0_15px_rgba(255,0,229,0.4)] transition-all">
                            <span className="material-symbols-outlined">event</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cycle Reference</span>
                    </div>
                    <p className="text-xl font-black text-white tracking-tight uppercase mt-2">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Temporal Timestamp</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Deployment Matrix (Table) */}
                <div className="lg:col-span-8 glass-card p-8 rounded-[2.5rem] border border-white/10 !bg-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Deployment Matrix</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Active distribution nodes</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">search</span>
                                <input
                                    type="text"
                                    placeholder="Hex Search..."
                                    className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary/40 w-40"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 text-slate-400 outline-none hover:text-white transition-colors cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">ALL NODES</option>
                                <option value="active">ONLINE</option>
                                <option value="expired">OFFLINE</option>
                                <option value="disabled">LOCKED</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing matrix...</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <th className="pb-4">Node Identity</th>
                                        <th className="pb-4">Credit Offset</th>
                                        <th className="pb-4">Flow Capacity</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right">Interrupt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredCoupons.map((coupon) => (
                                        <tr key={coupon.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="py-5">
                                                <span className="text-xs font-black font-mono text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/20 shadow-sm transition-all group-hover:scale-105 inline-block">{coupon.code}</span>
                                            </td>
                                            <td className="py-5">
                                                <p className="text-xs font-black text-white uppercase">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} OFF</p>
                                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Static Deduction</p>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex flex-col gap-1.5 w-32">
                                                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                        <span>{coupon.usage_count} COMMITTED</span>
                                                        <span>{coupon.usage_limit > 1000000000 ? 'MAX' : coupon.usage_limit}</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <div
                                                            className="h-full bg-primary shadow-neon-blue transition-all duration-1000 ease-out"
                                                            style={{ width: `${Math.min((coupon.usage_count / (coupon.usage_limit || 1)) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${coupon.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    coupon.status === 'expired' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                    }`}>
                                                    {coupon.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleToggleStatus(coupon.id, coupon.status)}
                                                        className="size-8 rounded-lg glass-card !bg-white/5 border-white/10 hover:border-primary/40 text-slate-500 hover:text-primary flex items-center justify-center transition-all"
                                                        title={coupon.status === 'active' ? 'Kill Node' : 'Revive Node'}
                                                    >
                                                        <span className="material-symbols-outlined text-lg">{coupon.status === 'active' ? 'power_settings_new' : 'bolt'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id)}
                                                        className="size-8 rounded-lg glass-card !bg-white/5 border-white/10 hover:border-red-500/40 text-slate-500 hover:text-red-500 flex items-center justify-center transition-all"
                                                        title="Purge Entry"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete_sweep</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Configuration Hub (Form) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 !bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] pointer-events-none"></div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-8">Node Config</h3>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2 relative z-50">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Unique Identifier</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. SAVE50"
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-slate-600 uppercase relative z-[60]"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Offset Logic</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] font-black text-white outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer uppercase"
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value as any })}
                                    >
                                        <option value="percentage">SCALAR %</option>
                                        <option value="fixed">STATIC ₹</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Power</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="00"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black text-white outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-slate-700"
                                        value={formData.discount_value}
                                        onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center pr-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Bandwidth Limit</label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="accent-primary size-3 rounded-md bg-white/10 border-white/10"
                                            checked={formData.is_unlimited}
                                            onChange={e => setFormData({ ...formData, is_unlimited: e.target.checked })}
                                        />
                                        <span className="text-[9px] font-black text-slate-500 group-hover:text-primary transition-colors uppercase tracking-tighter">Infinity Burst</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    disabled={formData.is_unlimited}
                                    className={`w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black text-white outline-none transition-all ${formData.is_unlimited ? 'opacity-30 grayscale pointer-events-none' : 'focus:ring-1 focus:ring-primary/40'}`}
                                    value={formData.usage_limit}
                                    onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Temporal Cutoff</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] font-black text-white outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer invert brightness-100"
                                    value={formData.expiry_date}
                                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-black font-black py-5 rounded-2xl shadow-neon-blue hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest uppercase"
                            >
                                Deploy Node
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-primary border border-white/10 shadow-neon-blue">
                                <span className="material-symbols-outlined text-xl">security</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Secured</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">SHA-256 Deployment Verification</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
