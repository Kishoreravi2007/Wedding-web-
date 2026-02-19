import { useState, useEffect } from 'react';
import { feedbackService } from '../services/api';
import type { Feedback } from '../types';

export default function FeedbackList() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchFeedback = () => {
        setIsLoading(true);
        feedbackService.getAll()
            .then(setFeedback)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleUpdateStatus = async (id: string, status: Feedback['status']) => {
        try {
            await feedbackService.updateStatus(id, status);
            fetchFeedback();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this feedback?')) return;
        try {
            await feedbackService.delete(id);
            fetchFeedback();
        } catch (err) {
            alert('Failed to delete feedback');
        }
    };

    const filteredFeedback = (feedback || []).filter(f => {
        const matchesSearch = (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (f.message || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || f.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Vibe Intelligence</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">User Satisfaction & Signal Analysis</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-card !bg-white/5 py-2.5 px-5 rounded-2xl border border-white/10 flex items-center gap-3">
                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-neon-green"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stream Online</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Control Deck */}
                <div className="lg:col-span-12 flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-primary">radar</span>
                        <input
                            type="text"
                            placeholder="Interrogate Signal Database..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-black text-white outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-slate-700 uppercase tracking-widest"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar glass-card !bg-white/5 p-1.5 rounded-2xl border border-white/10">
                        {(['all', 'new', 'reviewed', 'resolved'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s
                                    ? 'bg-primary text-black shadow-neon-blue'
                                    : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Signals Feed */}
                <div className="lg:col-span-12 space-y-6">
                    {isLoading ? (
                        <div className="py-20 text-center text-slate-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Scanning frequencies...</div>
                    ) : filteredFeedback.map((item) => (
                        <div key={item.id} className="glass-card p-8 rounded-[2.5rem] border border-white/10 !bg-white/5 group hover:border-primary/40 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all"></div>

                            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                                {item.name}
                                                {item.status === 'new' && <span className="size-2 bg-primary rounded-full animate-ping"></span>}
                                            </h3>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{item.category} Vector</p>
                                        </div>
                                        <div className="flex gap-1 bg-black/20 p-2 rounded-xl border border-white/5">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`material-symbols-outlined text-sm ${i < item.rating ? 'text-primary' : 'text-slate-800'}`}>
                                                    {i < item.rating ? 'noise_control_off' : 'radio_button_unchecked'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-card !bg-black/20 p-6 rounded-2xl border border-white/5 italic">
                                        <p className="text-sm font-medium text-slate-300 leading-relaxed tracking-wide">
                                            "{item.message}"
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6 pt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-600 !text-xs">schedule</span>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${item.status === 'new' ? 'bg-primary/10 text-primary border-primary/20' :
                                            item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-white/5'
                                            }`}>
                                            {item.status}
                                        </span>

                                        <div className="ml-auto flex gap-4">
                                            {item.status !== 'resolved' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(item.id, 'resolved')}
                                                    className="px-4 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                >
                                                    Solve Logic
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="px-4 py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                            >
                                                Purge Signal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!isLoading && filteredFeedback.length === 0 && (
                        <div className="py-20 text-center glass-card !bg-white/5 rounded-[2.5rem] border border-white/10">
                            <span className="material-symbols-outlined text-slate-700 text-5xl mb-4">settings_input_antenna</span>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No valid signals detected in this sector</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
