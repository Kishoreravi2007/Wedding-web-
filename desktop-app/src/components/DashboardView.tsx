import React from 'react';
import { Camera, FolderOpen, ChevronRight, Upload, Clock, CheckCircle, XCircle, RefreshCw, Trash2 } from 'lucide-react';

interface DashboardViewProps {
    config: any;
    isWatching: boolean;
    isConnected: boolean;
    queueStats: any;
    recentUploads: any[];
    onSelectFolder: () => void;
    onStartWatching: () => void;
    onStopWatching: () => void;
    onRetryFailed: () => void;
    onClearCompleted: () => void;
}

export default function DashboardView({
    config,
    isWatching,
    isConnected,
    queueStats,
    recentUploads,
    onSelectFolder,
    onStartWatching,
    onStopWatching,
    onRetryFailed,
    onClearCompleted
}: DashboardViewProps) {
    return (
        <main className="flex-1 overflow-y-auto p-8 relative animate-in fade-in duration-500">
            {/* Top Bar: Status and Toggle */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-white mb-1">
                        Photographer <span className="text-accent-gold font-medium">Dashboard</span>
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Session: <span className="text-gray-200">{config.eventId || 'NO_EVENT_SELECTED'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Engine Status</div>
                        <div className="flex items-center gap-2 justify-end">
                            <span className={`text-xs font-medium ${isWatching ? 'text-success-green' : 'text-gray-500'}`}>
                                {isWatching ? 'LIVE SYNC ACTIVE' : 'ENGINE STANDBY'}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${isWatching ? 'bg-success-green status-pulse' : 'bg-gray-700'}`}></div>
                        </div>
                    </div>

                    <button
                        onClick={isWatching ? onStopWatching : onStartWatching}
                        className={`relative inline-flex h-12 w-24 items-center rounded-full glass-panel transition-all focus:outline-none ${!config.watchedFolder || !config.apiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!config.watchedFolder || !config.apiKey}
                    >
                        <span className={`inline-block h-10 w-10 transform rounded-full bg-accent-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform duration-300 ${isWatching ? 'translate-x-12' : 'translate-x-1'}`}></span>
                        <span className={`absolute left-3 text-[10px] font-bold ${!isWatching ? 'text-white' : 'text-gray-500'}`}>OFF</span>
                        <span className={`absolute right-3 text-[10px] font-bold ${isWatching ? 'text-white' : 'text-gray-500'}`}>ON</span>
                    </button>
                </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 group hover:bg-white/10 transition-all cursor-default relative overflow-hidden">
                    <div className="p-4 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue">
                        <FolderOpen className="w-8 h-8" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Hot Folder</h3>
                        <p className="text-xs text-gray-500 truncate mt-1">
                            {config.watchedFolder || 'No folder selected...'}
                        </p>
                    </div>
                    <button
                        onClick={onSelectFolder}
                        className="px-3 py-1.5 text-xs font-semibold bg-white/5 rounded-lg border border-white/10 hover:bg-white/20 transition-all"
                    >
                        Change
                    </button>
                </div>

                <div className="glass-panel rounded-2xl p-6 flex justify-around items-center">
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Network</div>
                        <div className="flex gap-1 items-end h-6">
                            <div className={`w-1.5 h-2 rounded-full ${isConnected ? 'bg-success-green opacity-60' : 'bg-gray-700'}`}></div>
                            <div className={`w-1.5 h-3 rounded-full ${isConnected ? 'bg-success-green opacity-70' : 'bg-gray-700'}`}></div>
                            <div className={`w-1.5 h-4 rounded-full ${isConnected ? 'bg-success-green opacity-80' : 'bg-gray-700'}`}></div>
                            <div className={`w-1.5 h-5 rounded-full ${isConnected ? 'bg-success-green shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-700'}`}></div>
                        </div>
                        <span className="text-[10px] mt-1 text-gray-400">{isConnected ? 'Optimized' : 'Offline'}</span>
                    </div>
                    <div className="w-[1px] h-10 bg-glass-border"></div>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Watcher</div>
                        <div className="flex items-center gap-2">
                            <Camera className={`w-5 h-5 ${isWatching ? 'text-success-green' : 'text-gray-600'}`} />
                            <span className="text-[10px] text-gray-400">{isWatching ? 'Stable' : 'Idle'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard label="Synchronized" value={queueStats.completed} color="accent-gold" subtext={`+${queueStats.completed} total`} />
                <StatCard label="In Queue" value={queueStats.pending + queueStats.uploading} color="accent-blue" subtext="Pending Processing" />
                <StatCard label="Success Rate" value={queueStats.total > 0 ? `${Math.round((queueStats.completed / queueStats.total) * 100)}%` : '100%'} color="success-green" subtext={`${queueStats.total} Total`} />
                <StatCard label="Issues" value={queueStats.failed} color="error-red" subtext={queueStats.failed > 0 ? 'Action required' : 'System healthy'} />
            </div>

            {/* Transmission Stream */}
            <section className="glass-panel rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="px-6 py-4 border-b border-glass-border bg-white/5 flex justify-between items-center">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest font-bold">Transmission Stream</h2>
                    <div className="flex items-center gap-4">
                        {queueStats.failed > 0 && (
                            <button onClick={onRetryFailed} className="text-[10px] font-bold text-accent-gold hover:text-white transition-colors flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> RETRY FAILED
                            </button>
                        )}
                        <button onClick={onClearCompleted} className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors">CLEAR LOG</button>
                    </div>
                </div>
                <div className="p-4 space-y-3 font-mono text-[11px] h-64 overflow-y-auto custom-scrollbar">
                    {recentUploads.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 opacity-50">
                            <Clock className="w-8 h-8" />
                            <p>No activity detected</p>
                        </div>
                    ) : (
                        recentUploads.map(item => (
                            <div key={item.id} className={`flex items-center gap-4 p-2 rounded-lg border transition-all ${item.status === 'failed' ? 'bg-error-red/10 border-error-red/20' : 'bg-white/5 border-white/5'
                                }`}>
                                <span className="text-gray-600 w-16">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                <span className="flex-1 text-gray-300 truncate">{item.fileName}</span>
                                <div className="flex items-center gap-2">
                                    {item.status === 'uploading' && <div className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />}
                                    <span className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${item.status === 'completed' ? 'text-success-green' :
                                            item.status === 'failed' ? 'text-error-red' :
                                                item.status === 'uploading' ? 'text-accent-blue' : 'text-gray-500'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Background Visual Accents */}
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full -z-10"></div>
            <div className="fixed bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-accent-blue/5 blur-[150px] rounded-full -z-10"></div>
        </main>
    );
}

function StatCard({ label, value, color, subtext }: { label: string; value: string | number; color: string; subtext: string }) {
    const borderColors: any = {
        'accent-gold': 'border-accent-gold',
        'accent-blue': 'border-accent-blue',
        'success-green': 'border-success-green',
        'error-red': 'border-error-red'
    };

    const textColors: any = {
        'accent-gold': 'text-accent-gold',
        'accent-blue': 'text-accent-blue',
        'success-green': 'text-success-green',
        'error-red': 'text-error-red'
    };

    return (
        <div className={`glass-panel rounded-xl p-5 border-l-4 ${borderColors[color]}`}>
            <div className="text-xs text-gray-400 mb-1 font-bold">{label}</div>
            <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
            <div className={`text-[10px] mt-1 font-bold ${textColors[color]}`}>{subtext}</div>
        </div>
    );
}
