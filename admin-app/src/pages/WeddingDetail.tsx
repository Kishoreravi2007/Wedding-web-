import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { weddingService } from '../services/api';
import type { Wedding } from '../types';

export default function WeddingDetail() {
    const { id } = useParams<{ id: string }>();
    const [wedding, setWedding] = useState<Wedding | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchWedding = () => {
        if (!id) return;
        setIsLoading(true);
        weddingService.getById(id)
            .then(setWedding)
            .catch(err => console.error("Failed to fetch wedding:", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchWedding();
    }, [id]);

    const handleArchive = async () => {
        if (!id || !confirm('Archive this wedding?')) return;
        try {
            await weddingService.archive(id);
            navigate('/weddings');
        } catch (err) {
            alert('Failed to archive wedding');
        }
    };

    if (isLoading) return (
        <div className="flex h-[80vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-neon-blue animate-pulse">
                    <span className="material-symbols-outlined text-primary text-3xl animate-spin">favorite</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Accessing Core Memory...</p>
            </div>
        </div>
    );

    if (!wedding) return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
            <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-black text-white tracking-tight">ENTITY NOT FOUND</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Registry link corrupted or missing</p>
            </div>
            <Link to="/weddings" className="px-6 py-3 glass-card !bg-white/5 border-white/10 text-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Re-initiate Search</Link>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        <Link to="/weddings" className="hover:text-primary transition-colors">Registry</Link>
                        <span className="material-symbols-outlined !text-xs opacity-40">chevron_right</span>
                        <span className="text-primary">{wedding.wedding_code}</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{wedding.bride_name} & {wedding.groom_name}</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_searching</span>
                        Event Signature Verified
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 glass-card !bg-white/5 border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Preview Site</button>
                    <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-black font-black rounded-xl shadow-neon-blue hover:scale-105 transition-all text-[10px] uppercase tracking-widest">Update Protocol</button>
                    <button onClick={handleArchive} className="size-11 rounded-xl glass-card !bg-white/5 border-white/10 text-slate-500 hover:text-red-500 flex items-center justify-center transition-all"><span className="material-symbols-outlined">inventory_2</span></button>
                </div>
            </div>

            {/* Matrix Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl pointer-events-none"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Media Payload</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{(wedding.photo_count || 0).toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="material-symbols-outlined text-emerald-500 !text-xs">check_circle</span>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest tracking-tighter">Integrity Check Pass</span>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-2xl pointer-events-none"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sector Usage</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{((wedding.photo_count || 0) * 0.002).toFixed(2)} <span className="text-xl opacity-40">GB</span></p>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">{Math.min(((wedding.photo_count || 0) * 0.002) / 10 * 100, 100).toFixed(1)}% Partition Capacity</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl pointer-events-none"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Access Token</p>
                    <p className="text-3xl font-black text-primary font-mono tracking-widest mt-1">{wedding.wedding_code}</p>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">Unique Hex Identity</p>
                </div>
                <div className="glass-card p-6 rounded-[2rem] border border-white/10 !bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl pointer-events-none"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Phase</p>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${wedding.status === 'live' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-neon-green' : 'bg-slate-500/10 text-slate-400 border-white/5'}`}>
                            {wedding.status}
                        </span>
                        {wedding.status === 'live' && <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>}
                    </div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">Current System State</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Protocol Settings */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Photographer Uplink */}
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 !bg-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[100px] pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Photographer Uplink</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Asset contribution credentials</p>
                            </div>
                            <span className="material-symbols-outlined text-primary text-3xl opacity-20">camera_alt</span>
                        </div>

                        <div className="space-y-6">
                            <div className="glass-card !bg-white/5 p-6 rounded-2xl border border-white/10 group relative">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active System Key</p>
                                    <button className="text-[9px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest shadow-neon-blue px-3 py-1 rounded-lg border border-primary/20">Rotate Identity</button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <code className="text-sm font-mono font-black text-white break-all bg-black/40 px-4 py-3 rounded-xl border border-white/5 flex-1 select-all">
                                        {wedding.photographer_api_key || 'PROTOCOL_KEY_MISSING'}
                                    </code>
                                    <button className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-primary transition-all">
                                        <span className="material-symbols-outlined">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                        <span className="material-symbols-outlined">verified_user</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Access: Verified</p>
                                        <p className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">Secure Tunnel Enabled</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <span className="material-symbols-outlined">cloud_upload</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Async Upload</p>
                                        <p className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">Background Processing OK</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 !bg-white/5">
                        <h3 className="text-xl font-black text-white tracking-tight mb-8">Interaction Logs</h3>
                        <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center opacity-40">
                                <span className="material-symbols-outlined text-slate-500">bubble_chart</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Buffer Empty</p>
                                <p className="text-[9px] font-bold text-slate-700 uppercase mt-1">Guest interaction tracking offline</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration Hub */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 !bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] pointer-events-none"></div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-8">System Configuration</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Kernel</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Royal v2.6</p>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Vision</p>
                                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black rounded-lg uppercase tracking-widest">ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Layer</p>
                                <span className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-[8px] font-black rounded-lg uppercase tracking-widest">JWT TOKEN</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Publicity</p>
                                <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Private Mesh</p>
                            </div>
                        </div>
                        <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black rounded-2xl hover:bg-white/10 hover:border-primary/40 transition-all uppercase tracking-[0.2em]">Enter Admin Override</button>
                    </div>

                    {/* Infrastructure Stats */}
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 !bg-white/5">
                        <h3 className="text-xl font-black text-white tracking-tight mb-8">Infrastructure</h3>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Processor Load</p>
                                    <span className="text-[9px] font-black text-white">0.4ms</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-secondary shadow-neon-purple w-[15%] transition-all duration-1000"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Memory Cluster</p>
                                    <span className="text-[9px] font-black text-white">HEALTHY</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-emerald-500 shadow-neon-green w-[40%] transition-all duration-1000"></div>
                                </div>
                            </div>
                            <button className="w-full py-4 glass-card !bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Emergency Protocol Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
