import { useState, useEffect } from 'react';
import { premiumService } from '../services/api';
import type { Purchase } from '../types';

export default function Purchases() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        setIsLoading(true);
        try {
            const data = await premiumService.getPurchases();
            setPurchases(data);
        } catch (error) {
            console.error('Failed to fetch purchases:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPurchases = (purchases || []).filter(p =>
        p.customer_email.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        (p.payment_gateway || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = (purchases || [])
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financial Ledger</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">Global Revenue Tracking</p>
                </div>
                <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-4 border border-white/10">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gross Revenue</p>
                        <p className="text-xl font-black text-primary">₹{(totalRevenue / 100).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="material-symbols-outlined text-primary">payments</span>
                    </div>
                </div>
            </div>

            {/* Search Hub */}
            <div className="glass-card p-6 rounded-[2rem] !bg-white/5 flex flex-col md:flex-row gap-6">
                <div className="relative md:w-96 group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Search by Email, ID or Gateway..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-slate-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Table Content */}
            <div className="glass-card p-8 rounded-[2.5rem] !bg-white/5 hidden md:block">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 animate-pulse">
                            <span className="material-symbols-outlined text-primary text-2xl animate-spin">sync</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing ledger...</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/10">
                                <th className="pb-4">Transaction Details</th>
                                <th className="pb-4">Customer</th>
                                <th className="pb-4">Plan & Features</th>
                                <th className="pb-4">Amount</th>
                                <th className="pb-4">Gateway</th>
                                <th className="pb-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPurchases.map((p) => (
                                <tr key={p.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-all overflow-hidden p-1 shadow-sm">
                                                <span className="material-symbols-outlined text-primary text-sm">receipt_long</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-mono font-black text-slate-900 dark:text-white tracking-tight uppercase group-hover:text-primary transition-colors">{p.id.substring(0, 8)}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{new Date(p.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[150px]">{p.customer_email}</p>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wedding ID: {p.wedding_id || 'N/A'}</p>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase">{p.duration} Month(s)</span>
                                            {p.features?.map(f => (
                                                <span key={f} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400 uppercase">{f}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">₹{(Number(p.amount) / 100).toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="py-5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.payment_gateway || 'Offline'}</span>
                                    </td>
                                    <td className="py-5 text-right">
                                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            p.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {p.status === 'completed' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>}
                                            <span>{p.status}</span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile View */}
            <div className="flex flex-col gap-6 md:hidden pb-20">
                {isLoading ? (
                    <div className="py-20 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">Syncing Ledger...</div>
                ) : filteredPurchases.map((p) => (
                    <div key={p.id} className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border ${p.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                                {p.status}
                            </span>
                            <span className="text-[10px] font-black text-primary font-mono tracking-widest">ID: {p.id.substring(0, 8)}</span>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-black text-white truncate">{p.customer_email}</h3>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">₹{(Number(p.amount) / 100).toLocaleString('en-IN')} • {p.duration} Months</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {p.features?.slice(0, 3).map(f => (
                                <span key={f} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-bold text-slate-400 uppercase">{f}</span>
                            ))}
                            {p.features?.length > 3 && <span className="text-[8px] text-slate-500">+{p.features.length - 3} more</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
