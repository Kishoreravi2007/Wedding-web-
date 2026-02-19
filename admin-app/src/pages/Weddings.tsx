import { useState, useEffect } from 'react';
import { weddingService } from '../services/api';
import type { Wedding, WeddingStatus } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Weddings() {
    const [weddings, setWeddings] = useState<Wedding[]>([]);
    const [filter, setFilter] = useState<WeddingStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchWeddings = () => {
        setIsLoading(true);
        weddingService.getAll()
            .then(setWeddings)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchWeddings();
    }, []);

    const handleArchive = async (id: string) => {
        if (!confirm('Are you sure you want to archive this wedding?')) return;
        try {
            await weddingService.archive(id);
            fetchWeddings();
        } catch (err) {
            alert('Failed to archive wedding');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this wedding?\n\nWARNING: This will delete ALL associated data including photos, guests, and wishes. This action cannot be undone.')) return;
        try {
            await weddingService.delete(id);
            fetchWeddings();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete wedding');
        }
    };

    const filteredWeddings = (weddings || []).filter(w => {
        const bride = w.bride_name || '';
        const groom = w.groom_name || '';
        const code = w.wedding_code || '';
        const matchesSearch = bride.toLowerCase().includes(search.toLowerCase()) ||
            groom.toLowerCase().includes(search.toLowerCase()) ||
            code.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || w.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Weddings Radar</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">Global Event Management</p>
                </div>
                <button className="bg-gradient-to-r from-primary to-secondary text-white font-black px-8 py-4 rounded-2xl shadow-neon-blue hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-sm tracking-widest uppercase">
                    <span className="material-symbols-outlined font-black">add_circle</span>
                    New Registration
                </button>
            </div>

            {/* Filters and Search Hub */}
            <div className="glass-card p-6 rounded-[2rem] !bg-white/5 flex flex-col md:flex-row gap-6">
                <div className="relative md:w-96 group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="ID, Couple or Token..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-slate-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                    {(['all', 'live', 'preparing', 'planning', 'completed', 'archived'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all border ${filter === s
                                ? 'bg-primary text-black border-primary shadow-neon-blue'
                                : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10 hover:text-slate-300'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Table Content */}
            <div className="glass-card p-8 rounded-[2.5rem] !bg-white/5 hidden md:block">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 animate-pulse">
                            <span className="material-symbols-outlined text-primary text-2xl animate-spin">favorite</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing database...</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/10">
                                <th className="pb-4">Couple Name</th>
                                <th className="pb-4">Access Code</th>
                                <th className="pb-4">Wedding Pulse</th>
                                <th className="pb-4">Media Count</th>
                                <th className="pb-4">Connectivity</th>
                                <th className="pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredWeddings.map((w) => (
                                <tr key={w.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-all overflow-hidden p-1 shadow-sm">
                                                <span className="text-[10px] font-black text-primary uppercase">{w.bride_name?.[0]}{w.groom_name?.[0]}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white tracking-tight uppercase group-hover:text-primary transition-colors">{w.bride_name} & {w.groom_name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Unified Event Identity</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20 shadow-[0_0_10px_rgba(0,242,255,0.1)]">{w.wedding_code}</span>
                                    </td>
                                    <td className="py-5">
                                        <p className="text-xs font-black text-slate-300 uppercase tracking-wide">{new Date(w.wedding_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Scheduled Date</p>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-600 !text-sm">photo_library</span>
                                            <span className="text-xs font-black text-white">{(w.photo_count || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${w.status === 'live' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            w.status === 'preparing' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                w.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            }`}>
                                            {w.status === 'live' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>}
                                            <span>{w.status}</span>
                                        </span>
                                    </td>
                                    <td className="py-5 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => navigate(`/weddings/${w.id}`)}
                                                className="size-9 rounded-xl glass-card !bg-white/5 border-white/10 hover:border-primary/40 text-primary flex items-center justify-center hover:shadow-neon-blue transition-all"
                                                title="View Details"
                                            >
                                                <span className="material-symbols-outlined text-xl">open_in_new</span>
                                            </button>
                                            <button
                                                onClick={() => handleArchive(w.id)}
                                                className="size-9 rounded-xl glass-card !bg-white/5 border-white/10 hover:border-amber-400/40 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-all"
                                                title="Archive Event"
                                            >
                                                <span className="material-symbols-outlined text-xl">archive</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(w.id)}
                                                className="size-9 rounded-xl glass-card !bg-white/5 border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all"
                                                title="Hard Delete"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile Cards Redesign */}
            <div className="flex flex-col gap-6 md:hidden pb-20">
                {isLoading ? (
                    <div className="py-20 text-center text-slate-500 font-black uppercase tracking-widest text-[10px]">Syncing...</div>
                ) : filteredWeddings.map((w) => (
                    <div key={w.id} className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border ${w.status === 'live' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                                {w.status}
                            </span>
                            <span className="text-[10px] font-black text-primary font-mono tracking-widest">{w.wedding_code}</span>
                        </div>

                        <div onClick={() => navigate(`/weddings/${w.id}`)} className="mb-6">
                            <h3 className="text-xl font-black text-white tracking-tight leading-tight uppercase">{w.bride_name} & {w.groom_name}</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                {new Date(w.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-5 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 border border-white/10">
                                    <span className="material-symbols-outlined text-base">photo_library</span>
                                </div>
                                <span className="text-xs font-black text-slate-400">{(w.photo_count || 0)} <span className="text-[9px] opacity-60 uppercase">media units</span></span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => navigate(`/weddings/${w.id}`)} className="size-9 rounded-xl glass-card !bg-white/5 border-white/10 text-primary flex items-center justify-center"><span className="material-symbols-outlined text-lg">arrow_forward</span></button>
                                <button onClick={() => handleArchive(w.id)} className="size-9 rounded-xl glass-card !bg-white/5 border-white/10 text-slate-500 flex items-center justify-center"><span className="material-symbols-outlined text-lg">inventory_2</span></button>
                                <button onClick={() => handleDelete(w.id)} className="size-9 rounded-xl glass-card !bg-white/5 border-white/10 text-red-500/60 flex items-center justify-center"><span className="material-symbols-outlined text-lg">delete</span></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
