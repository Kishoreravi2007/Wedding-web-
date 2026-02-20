import { useState, useEffect } from 'react';
import { contactService } from '../services/api';
import type { ContactMessage } from '../types';

export default function Contacts() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'read' | 'replied'>('all');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const fetchMessages = () => {
        setIsLoading(true);
        contactService.getAll()
            .then(setMessages)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleUpdateStatus = async (id: string, status: ContactMessage['status']) => {
        try {
            await contactService.updateStatus(id, status);
            fetchMessages();
            if (selectedMessage?.id === id) {
                setSelectedMessage(prev => prev ? { ...prev, status } : null);
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleReply = async (id: string) => {
        const reply = prompt('Enter your reply message:');
        if (!reply) return;

        try {
            await contactService.reply(id, reply);
            fetchMessages();
            alert('Reply sent successfully!');
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
        } catch (err) {
            alert('Failed to send reply');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this inquiry?')) return;
        try {
            await contactService.delete(id);
            fetchMessages();
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
        } catch (err) {
            alert('Failed to delete message');
        }
    };

    const filteredMessages = (messages || []).filter(m => {
        const matchesSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (m.message || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || m.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Lead Uplink</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">External Inquiries & Comms Hub</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-card !bg-white/5 py-2 px-4 rounded-xl border border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Queue Status</p>
                        <p className="text-xs font-black text-primary uppercase tracking-tighter">Synchronized</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">hub</span>
                    <input
                        type="text"
                        placeholder="Scan identities..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-slate-700 uppercase tracking-widest"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar glass-card !bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    {(['all', 'pending', 'read', 'replied'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === s
                                ? 'bg-primary text-black shadow-neon-blue'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center text-slate-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Establishing uplink...</div>
                ) : filteredMessages.map((msg) => (
                    <div key={msg.id} className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5 flex flex-col gap-6 group hover:border-primary/40 transition-all relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 size-32 bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:shadow-neon-blue transition-all">
                                <span className="material-symbols-outlined">person_pin</span>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${msg.status === 'pending' ? 'bg-secondary/10 text-secondary border-secondary/20 shadow-neon-purple' :
                                    msg.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-neon-green' : 'bg-slate-500/10 text-slate-500 border-white/5'
                                    }`}>
                                    {msg.status}
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} className="opacity-0 group-hover:opacity-100 size-8 rounded-lg bg-red-500/5 text-slate-500 hover:text-red-500 flex items-center justify-center transition-all">
                                    <span className="material-symbols-outlined text-base">delete_sweep</span>
                                </button>
                            </div>
                        </div>

                        <div onClick={() => {
                            setSelectedMessage(msg);
                            if (msg.status === 'pending') handleUpdateStatus(msg.id, 'read');
                        }} className="cursor-pointer relative z-10">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">{msg.name}</h3>
                            <p className="text-[10px] font-black text-primary truncate uppercase tracking-widest mt-0.5">{msg.email}</p>

                            <div className="glass-card !bg-black/20 p-5 rounded-2xl border border-white/5 min-h-[100px] flex items-center italic mt-4 hover:bg-black/40 transition-all">
                                <p className="text-xs font-semibold text-slate-400 line-clamp-4 leading-relaxed tracking-wide">
                                    "{msg.message}"
                                </p>
                            </div>
                        </div>

                        {msg.event_date && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest relative z-10">
                                <span className="material-symbols-outlined !text-xs">calendar_month</span>
                                <span>{new Date(msg.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.1em]">{new Date(msg.created_at).toLocaleDateString()}</span>
                            <div className="flex gap-4">
                                {msg.status !== 'replied' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleReply(msg.id); }}
                                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Reply
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* DETAIL MODAL */}
            {selectedMessage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="relative p-8 border-b border-white/5 bg-white/5">
                            <button onClick={() => setSelectedMessage(null)} className="absolute right-6 top-6 size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="size-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-neon-blue">
                                    <span className="material-symbols-outlined text-4xl">person_search</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedMessage.name}</h2>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">Lead Analysis Results</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</p>
                                    <p className="text-sm font-bold text-white break-all">{selectedMessage.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Phone Identity</p>
                                    <p className="text-sm font-bold text-white uppercase">{selectedMessage.phone || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Guest Count</p>
                                    <p className="text-sm font-bold text-white uppercase">{selectedMessage.guest_count || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Target Date</p>
                                    <p className="text-sm font-bold text-white uppercase">
                                        {selectedMessage.event_date ? new Date(selectedMessage.event_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Arrival Timestamp</p>
                                    <p className="text-sm font-bold text-white uppercase">
                                        {new Date(selectedMessage.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Protocol Status</p>
                                    <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border mt-1 ${selectedMessage.status === 'pending' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                        selectedMessage.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-white/5'
                                        }`}>
                                        {selectedMessage.status}
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-full pt-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Transmission Content</p>
                                <div className="glass-card !bg-black/40 p-6 rounded-3xl border border-white/10 italic leading-relaxed text-slate-300">
                                    "{selectedMessage.message}"
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-white/5 border-t border-white/5 flex gap-4">
                            {selectedMessage.status !== 'replied' && (
                                <button
                                    onClick={() => handleReply(selectedMessage.id)}
                                    className="flex-1 bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Transmit Reply
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(selectedMessage.id)}
                                className="px-8 border border-red-500/20 text-red-500 bg-red-500/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all"
                            >
                                Terminate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && filteredMessages.length === 0 && (
                <div className="col-span-full py-20 text-center glass-card !bg-white/5 rounded-[2.5rem] border border-white/10">
                    <span className="material-symbols-outlined text-slate-800 text-5xl mb-4">mail_lock</span>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Communication array empty</p>
                </div>
            )}
        </div>
    );
}
