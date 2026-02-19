interface StatCardProps {
    label: string;
    value: string | number;
    trend: string;
    trendUp?: boolean;
    isLive?: boolean;
    variant?: 'holographic' | 'glass';
}

export default function StatCard({ label, value, trend, trendUp, isLive, variant = 'glass' }: StatCardProps) {
    const cardClass = variant === 'holographic'
        ? 'holographic-card p-6 rounded-[2rem] relative overflow-hidden group'
        : 'glass-card p-6 rounded-[2rem] relative overflow-hidden group';

    return (
        <div className={cardClass}>
            {variant === 'holographic' && (
                <div className="absolute -right-4 -top-4 size-20 bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-all"></div>
            )}
            <div className="flex justify-between items-start mb-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${variant === 'holographic' ? 'text-primary/70' : 'text-slate-500'}`}>
                    {label}
                </p>
                {isLive ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse"></div>
                ) : (
                    <div className={`p-2 rounded-lg ${variant === 'holographic' ? 'bg-white/10' : 'bg-white/5'}`}>
                        <span className={`material-symbols-outlined text-xl ${variant === 'holographic' ? 'text-primary' : 'text-slate-400'}`}>
                            {label.toLowerCase().includes('wedding') ? 'event' : label.toLowerCase().includes('user') ? 'person' : 'analytics'}
                        </span>
                    </div>
                )}
            </div>
            <h3 className="text-4xl font-extrabold mb-2 tracking-tighter text-white">{value}</h3>
            <p className={`text-[10px] font-black flex items-center gap-1 mt-2 uppercase tracking-wide ${trendUp ? 'text-primary' : 'text-slate-500'}`}>
                {trendUp && <span className="material-symbols-outlined !text-[14px]">trending_up</span>}
                {trend}
            </p>
        </div>
    );
}
