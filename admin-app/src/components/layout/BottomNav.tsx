import { NavLink } from 'react-router-dom';

const navLinks = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dash' },
    { path: '/weddings', icon: 'favorite', label: 'Wed' },
    { path: '/feedback', icon: 'chat_bubble', label: 'Chat' },
    { path: '/coupons', icon: 'confirmation_number', label: 'Gift' },
];

export default function BottomNav() {
    return (
        <nav className="absolute bottom-6 left-6 right-6 glass-card rounded-2xl px-6 py-3 flex justify-between items-center z-20 border-white/20 shadow-2xl md:hidden">
            {navLinks.map((link) => (
                <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }: { isActive: boolean }) =>
                        `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-slate-400 opacity-40 hover:opacity-100'
                        }`
                    }
                >
                    {({ isActive }: { isActive: boolean }) => (
                        <>
                            <span className={`material-symbols-outlined text-[24px] ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]' : ''}`}>
                                {link.icon}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-tighter">{link.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
