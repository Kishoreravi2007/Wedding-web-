


import React from 'react';

export default function TopBar() {
    return (
        <header className="flex items-center justify-between px-5 pt-6 pb-4 bg-transparent sticky top-0 z-10 backdrop-blur-xl border-b border-white/5 dark:border-white/5">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full hidden md:block group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Search data..."
                        className="w-full glass-card bg-white/80 dark:!bg-white/5 border border-slate-200 dark:!border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white transition-all shadow-sm dark:shadow-none"
                    />
                </div>
                <div className="md:hidden flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-neon-blue p-1.5 overflow-hidden">
                        <img src="./logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">WeddingWeb</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Admin Panel</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="relative p-2 text-slate-600 dark:text-primary hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
                </button>
                <div className="size-9 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                    <img
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA49t2CuLcUYubZ4cYoXAThYoQdaSxWtyH14c_wrM6RGpWXxCesa7pXk7aJkglwTX63D4bIBjDbwjQPRZ7Ult1VEpCMs4g0SxXYGT_01FPO2f1gNNqqkAXmfr2w0Lz12Tj_nz39osEO0Nshy2xfid2FFMMRt6FUwjC8ASNix4ZLHzxDPd7O6H9Sc1dpLipHE32czwmrzZbWM34gyFEG8CiPGAqqRwWiQEjzTeu9-oZA8Rw2taR_u_oubbJLPhc2D37JazyQ8Bmhvnmm"
                        alt="Kishore Ravi"
                    />
                </div>
            </div>
        </header>
    );
}
