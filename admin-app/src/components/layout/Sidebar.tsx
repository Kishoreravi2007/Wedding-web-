

import { NavLink } from 'react-router-dom';

const navLinks = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/weddings', icon: 'auto_awesome', label: 'Weddings' },
    { path: '/feedback', icon: 'chat_bubble', label: 'Feedback', badge: 12 },
    { path: '/contacts', icon: 'contacts', label: 'Contacts' },
    { path: '/coupons', icon: 'confirmation_number', label: 'Promotions' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen hidden md:flex flex-col z-50 glass-card bg-white/80 dark:!bg-white/5 border-r border-slate-200 dark:!border-white/10 !rounded-none transition-colors duration-500">
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-neon-blue p-1.5 overflow-hidden">
                        <img src="./logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white transition-colors">WeddingWeb</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }: { isActive: boolean }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border border-transparent ${isActive
                                    ? 'bg-primary/10 dark:bg-white/10 text-primary font-bold shadow-sm border-primary/20 dark:border-white/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-medium'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">{link.icon}</span>
                            <span className="text-sm font-bold">{link.label}</span>
                            {link.badge && (
                                <span className="ml-auto bg-primary text-black text-[10px] px-1.5 py-0.5 rounded shadow-neon-blue font-black uppercase">
                                    {link.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-6 mt-auto">
                <div className="glass-card p-4 rounded-3xl flex items-center gap-3 bg-white/50 dark:!bg-white/5 border border-slate-200 dark:border-transparent">
                    <img
                        className="size-10 rounded-full object-cover border-2 border-white/50 shadow-sm"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA49t2CuLcUYubZ4cYoXAThYoQdaSxWtyH14c_wrM6RGpWXxCesa7pXk7aJkglwTX63D4bIBjDbwjQPRZ7Ult1VEpCMs4g0SxXYGT_01FPO2f1gNNqqkAXmfr2w0Lz12Tj_nz39osEO0Nshy2xfid2FFMMRt6FUwjC8ASNix4ZLHzxDPd7O6H9Sc1dpLipHE32czwmrzZbWM34gyFEG8CiPGAqqRwWiQEjzTeu9-oZA8Rw2taR_u_oubbJLPhc2D37JazyQ8Bmhvnmm"
                        alt="Admin"
                    />
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate text-slate-900 dark:text-white transition-colors">Kishore Ravi</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Super Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
