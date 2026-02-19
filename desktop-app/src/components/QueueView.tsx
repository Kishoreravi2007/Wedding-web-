import React, { useState } from 'react';
import { Cloud, PlayCircle, PauseCircle, Trash2, CheckCircle2, AlertCircle, Image as ImageIcon, Search } from 'lucide-react';

interface QueueViewProps {
    queueStats: any;
    recentUploads: any[];
    onRetryFailed: () => void;
    onClearCompleted: () => void;
}

export default function QueueView({
    queueStats,
    recentUploads,
    onRetryFailed,
    onClearCompleted
}: QueueViewProps) {
    const [activeTab, setActiveTab] = useState<'current' | 'history' | 'errors'>('current');

    const filteredItems = recentUploads.filter(item => {
        if (activeTab === 'current') return item.status === 'uploading' || item.status === 'pending';
        if (activeTab === 'history') return item.status === 'completed';
        if (activeTab === 'errors') return item.status === 'failed';
        return true;
    });

    return (
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-8 py-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Background Decorative Gradients */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-orange/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-orange/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Upload Queue</h1>
                    <div className="flex items-center gap-3">
                        <span className={`flex h-2.5 w-2.5 rounded-full bg-primary-orange ${queueStats.uploading > 0 ? 'animate-pulse' : ''}`}></span>
                        <p className="text-gray-400 text-sm">
                            Syncing {queueStats.uploading} photos <span className="mx-2 text-gray-700">|</span> {queueStats.pending} pending
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-orange/50 text-primary-orange font-bold text-sm hover:bg-primary-orange/10 transition-all">
                        <PauseCircle className="w-5 h-5" /> Pause All
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-orange text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary-orange/20">
                        <PlayCircle className="w-5 h-5" /> Resume All
                    </button>
                    <button
                        onClick={onClearCompleted}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel text-gray-300 font-bold text-sm hover:bg-white/10 transition-all"
                    >
                        <Trash2 className="w-5 h-5" /> Clear Completed
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl">
                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-white/5">
                    <TabButton
                        active={activeTab === 'current'}
                        onClick={() => setActiveTab('current')}
                        label="Current Queue"
                        count={queueStats.pending + queueStats.uploading}
                    />
                    <TabButton
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                        label="History"
                        count={queueStats.completed}
                    />
                    <TabButton
                        active={activeTab === 'errors'}
                        onClick={() => setActiveTab('errors')}
                        label="Errors"
                        count={queueStats.failed}
                        isRed={queueStats.failed > 0}
                    />
                </div>

                {/* Upload List */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[600px] custom-scrollbar">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                            <Cloud className="w-16 h-16" />
                            <p className="text-lg font-bold">No items found</p>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <QueueItem key={item.id} item={item} onRetry={onRetryFailed} />
                        ))
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-4 border-t border-white/5 bg-white/5 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Cloud className="w-4 h-4 text-primary-orange" />
                            <span className="text-xs font-bold">Cloud Sync Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-success-green" />
                            <span className="text-xs font-bold">{queueStats.completed} Synced</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-500">Concurrency: 3</span>
                        <div className="h-4 w-[1px] bg-white/10"></div>
                        <span className="text-xs font-medium text-gray-500">v2.4.0 PRO</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, count, isRed }: { active: boolean; onClick: () => void; label: string; count: number; isRed?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`px-8 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${active
                    ? 'text-primary-orange border-primary-orange bg-primary-orange/5'
                    : 'text-gray-500 border-transparent hover:text-white'
                } ${isRed && !active ? 'text-error-red/70' : ''}`}
        >
            {label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-primary-orange/20' : 'bg-white/5 text-gray-500'}`}>
                {count}
            </span>
        </button>
    );
}

function QueueItem({ item, onRetry }: { item: any; onRetry: () => void }) {
    const isFailed = item.status === 'failed';
    const isUploading = item.status === 'uploading';

    return (
        <div className={`glass-panel rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/5 ${isFailed ? 'bg-error-red/5 border-error-red/20' : ''
            }`}>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center overflow-hidden ${isFailed ? 'bg-error-red/20 text-error-red' : 'bg-primary-orange/20 text-primary-orange'
                }`}>
                <ImageIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm font-bold truncate pr-4 ${isFailed ? 'text-error-red/90' : 'text-gray-200'}`}>
                        {item.fileName}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isFailed ? 'bg-error-red/20 text-error-red' :
                            isUploading ? 'bg-primary-orange/20 text-primary-orange' : 'bg-white/5 text-gray-500'
                        }`}>
                        {item.status}
                    </span>
                </div>
                {isUploading && (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-primary-orange h-full w-[45%] rounded-full shadow-[0_0_8px_rgba(236,91,19,0.5)] animate-pulse"></div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 min-w-[35px]">Syncing...</span>
                    </div>
                )}
                {isFailed && (
                    <p className="text-[10px] text-error-red/70 font-medium mt-1">
                        Network error. Re-attempting in 30s...
                    </p>
                )}
            </div>
            {isFailed && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-orange text-white text-[10px] font-bold hover:opacity-90 transition-all"
                >
                    Retry Now
                </button>
            )}
        </div>
    );
}
