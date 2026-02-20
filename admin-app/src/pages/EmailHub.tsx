import React, { useState, useEffect } from 'react';
import { Mail, Send, Sparkles, Trash2, Search, ArrowLeft, Loader2, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { emailHubService } from '../services/api';
import type { ContactMessage } from '../types';
import { format } from 'date-fns';

const EmailHub: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [replyDraft, setReplyDraft] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');

    const selectedMessage = messages.find(m => m.id === selectedId);

    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            if (isManual) {
                console.log('📡 [Signal Hub] Initiating direct IMAP sync protocol...');
                await emailHubService.sync();
            }
            const data = await emailHubService.getInbox();
            setMessages(data);
        } catch (error) {
            console.error('Failed to load inbox:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleEnhance = async () => {
        if (!selectedId || !replyDraft) return;
        setEnhancing(true);
        try {
            const result = await emailHubService.enhanceReply(selectedId, replyDraft);
            setReplyDraft(result.enhancedText);
        } catch (error) {
            console.error('AI Enhancement failed:', error);
        } finally {
            setEnhancing(false);
        }
    };

    const handleSend = async () => {
        if (!selectedId || !replyDraft) return;
        setSending(true);
        try {
            await emailHubService.sendReply(selectedId, replyDraft);
            // Refresh inbox from database only (no IMAP sync) for instant update
            await fetchInbox(false);
            setReplyDraft('');
            // Toast or success message could go here
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Purge this transmission from the hub?')) return;
        try {
            await emailHubService.delete(id);
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selectedId === id) setSelectedId(null);
        } catch (error) {
            console.error('Purge failed:', error);
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesSearch =
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.message.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            filter === 'all' ||
            (filter === 'new' && (m.status === 'new' || m.status === 'pending')) ||
            (filter === 'replied' && m.status === 'replied');

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 p-2 md:p-6 overflow-hidden">
            {/* List Sidebar */}
            <div className={`flex-1 md:max-w-md flex flex-col gap-4 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Mail className="text-blue-500" />
                        Email Hub
                    </h1>
                    <button
                        onClick={() => fetchInbox(true)}
                        disabled={refreshing || loading}
                        className="p-2 hover:bg-white/10 rounded-full transition-all group active:scale-95 disabled:opacity-50"
                        title="Rescan Frequency"
                    >
                        <RefreshCw className={`w-5 h-5 text-white/60 group-hover:text-white ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                    {(['all', 'new', 'replied'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Scan for signals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse border border-white/5" />
                        ))
                    ) : filteredMessages.length === 0 ? (
                        <div className="text-center py-12 text-white/40">
                            <Mail className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p>No signals found</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => setSelectedId(msg.id)}
                                className={`group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${selectedId === msg.id
                                    ? 'bg-blue-600/20 border-blue-500/50 shadow-lg'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold truncate pr-8">{msg.name}</span>
                                    <span className="text-[10px] text-white/40 whitespace-nowrap">
                                        {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <div className="text-sm font-medium text-blue-400 mb-1 truncate">
                                    {msg.subject || 'No Subject'}
                                </div>
                                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                                    {msg.message}
                                </p>

                                {msg.status === 'replied' && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    </div>
                                )}

                                <button
                                    onClick={(e) => handleDelete(msg.id, e)}
                                    className="absolute bottom-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 rounded-md transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className={`flex-[2] bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col overflow-hidden glass-reflection ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {selectedMessage ? (
                    <>
                        {/* Header */}
                        <div className="p-4 md:p-6 border-bottom border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="md:hidden p-2 hover:bg-white/10 rounded-full transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedMessage.subject || 'Query Signal'}</h2>
                                    <p className="text-sm text-white/40 flex items-center gap-2">
                                        <span className="font-medium text-white/60">{selectedMessage.name}</span>
                                        &lt;{selectedMessage.email}&gt;
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
                                <Clock className="w-3 h-3" />
                                {format(new Date(selectedMessage.created_at), 'eeee, MMMM do yyyy')}
                            </div>
                        </div>

                        {/* Thread Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
                            {/* Original Message */}
                            <div className="max-w-3xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 font-bold text-xs">
                                        {selectedMessage.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-semibold opacity-80">{selectedMessage.name} inquiry</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white/80 leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>

                            {/* Previous Response if exists */}
                            {selectedMessage.response && (
                                <div className="max-w-3xl ml-auto">
                                    <div className="flex items-center justify-end gap-3 mb-4">
                                        <span className="text-sm font-semibold opacity-80">WeddingWeb Admin</span>
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                                            A
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-white/80 leading-relaxed whitespace-pre-wrap shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                                        {selectedMessage.response}
                                    </div>
                                </div>
                            )}

                            {/* Reply Editor */}
                            <div className="max-w-3xl ml-auto pt-8 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-white/40 tracking-wider">COMPOSE RESPONSE</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                                            GEMINI 1.5 FLASH
                                        </span>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <textarea
                                        value={replyDraft}
                                        onChange={(e) => setReplyDraft(e.target.value)}
                                        placeholder="Draft your signal transmission..."
                                        className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner"
                                    />

                                    <button
                                        onClick={handleEnhance}
                                        disabled={!replyDraft || enhancing}
                                        className="absolute bottom-4 right-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 group/ai"
                                    >
                                        {enhancing ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3.5 h-3.5 text-blue-200 group-hover/ai:animate-pulse" />
                                        )}
                                        Refactor with AI
                                    </button>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleSend}
                                        disabled={!replyDraft || sending}
                                        className="flex items-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-xl"
                                    >
                                        {sending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Transmitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Protocol
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/20 p-8">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Mail className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Signal Hub Offline</h3>
                        <p className="max-w-xs text-center text-sm opacity-50">Select a message signal from the frequency list to begin deep-dive analysis and response protocols.</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .glass-reflection {
                    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
                    position: relative;
                }
                .glass-reflection::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom right, transparent 0%, rgba(255,255,255,0.02) 40%, transparent 41%);
                    pointer-events: none;
                }
            `}} />
        </div>
    );
};

export default EmailHub;
