

import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { dashboardService, premiumService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
    const [pendingFeedback, setPendingFeedback] = useState<number>(0);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [adminForm, setAdminForm] = useState({
        username: '',
        password: '',
        email: '',
        fullName: ''
    });
    const [vendorForm, setVendorForm] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        dashboardService.getStats()
            .then(stats => setPendingFeedback(stats.pending_feedbacks))
            .catch(err => console.error("Failed to fetch sidebar stats:", err));
    }, []);

    const handleGenerateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const res = await premiumService.generateAdminCredentials(adminForm);
            alert(res.message || "Admin created successfully!");
            setShowAdminModal(false);
            setAdminForm({ username: '', password: '', email: '', fullName: '' });
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to generate admin");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const res = await premiumService.generateVendorCredentials(vendorForm);
            alert(res.message || "Vendor created successfully!");
            setShowVendorModal(false);
            setVendorForm({ fullName: '', email: '', password: '' });
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to generate vendor");
        } finally {
            setIsGenerating(false);
        }
    };

    const navLinks = [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/weddings', icon: 'auto_awesome', label: 'Weddings' },
        { path: '/purchases', icon: 'payments', label: 'Purchases' },
        { path: '/feedback', icon: 'chat_bubble', label: 'Feedback', badge: pendingFeedback > 0 ? pendingFeedback : undefined },
        { path: '/contacts', icon: 'contacts', label: 'Contacts' },
        { path: '/email', icon: 'mail', label: 'Email Hub' },
        { path: '/coupons', icon: 'confirmation_number', label: 'Promotions' },
        ...(user?.email === 'kishorekailas1@gmail.com' ? [{ path: '/admins', icon: 'admin_panel_settings', label: 'Identity' }] : []),
        { path: '/settings', icon: 'settings', label: 'Settings' },
    ];

    return (
        <aside className="w-64 h-screen hidden md:flex flex-col z-50 glass-card bg-white/80 dark:!bg-white/5 border-r border-slate-200 dark:!border-white/10 !rounded-none transition-colors duration-500">
            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-neon-blue p-1.5 overflow-hidden">
                        <img src="./logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white transition-colors">WeddingWeb</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">Admin Panel</p>
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
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-medium'
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

            <div className="p-6 mt-auto space-y-4">
                {(user?.email === 'kishorekailas1@gmail.com') && (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setShowAdminModal(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <span className="material-symbols-outlined !text-sm">shield_person</span>
                            Spawn Admin
                        </button>
                        <button
                            onClick={() => setShowVendorModal(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <span className="material-symbols-outlined !text-sm">storefront</span>
                            Spawn Vendor
                        </button>
                    </div>
                )}

                <div className="glass-card p-4 rounded-3xl flex items-center gap-3 bg-white/50 dark:!bg-white/5 border border-slate-200 dark:border-transparent">
                    <img
                        className="size-10 rounded-full object-cover border-2 border-white/50 shadow-sm"
                        src={user?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuA49t2CuLcUYubZ4cYoXAThYoQdaSxWtyH14c_wrM6RGpWXxCesa7pXk7aJkglwTX63D4bIBjDbwjQPRZ7Ult1VEpCMs4g0SxXYGT_01FPO2f1gNNqqkAXmfr2w0Lz12Tj_nz39osEO0Nshy2xfid2FFMMRt6FUwjC8ASNix4ZLHzxDPd7O6H9Sc1dpLipHE32czwmrzZbWM34gyFEG8CiPGAqqRwWiQEjzTeu9-oZA8Rw2taR_u_oubbJLPhc2D37JazyQ8Bmhvnmm"}
                        alt={user?.full_name || user?.username || "Admin"}
                    />
                    <div className="overflow-hidden flex-1">
                        <p className="font-bold text-sm truncate text-slate-900 dark:text-white transition-colors">
                            {user?.full_name || (user?.username === 'kishore' ? 'Kishore Ravi' : (user?.username || 'Admin'))}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">{user?.role === 'admin' ? 'Super Admin' : 'Staff'}</p>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="size-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shrink-0"
                        title="Sign Out"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                    </button>
                </div>
            </div>

            {/* Admin Spawner Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdminModal(false)}></div>
                    <div className="relative glass-card border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md animate-in zoom-in duration-300 !bg-slate-900 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Spawn New Admin</h2>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol Level 5 Authorization</p>
                            </div>
                            <button onClick={() => setShowAdminModal(false)} className="size-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleGenerateAdmin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Kishore Ravi"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary/30"
                                    value={adminForm.fullName}
                                    onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email ID</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="admin@weddingweb.ai"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary/30"
                                    value={adminForm.email}
                                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary/30"
                                        value={adminForm.username}
                                        onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary/30"
                                        value={adminForm.password}
                                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-neon-blue hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] transform mt-4 disabled:opacity-50"
                            >
                                {isGenerating ? 'Compiling Protocol...' : 'Confirm Generation'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Vendor Spawner Modal */}
            {showVendorModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowVendorModal(false)}></div>
                    <div className="relative glass-card border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md animate-in zoom-in duration-300 !bg-slate-900 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Spawn New Vendor</h2>
                                <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Vendor Network Protocol</p>
                            </div>
                            <button onClick={() => setShowVendorModal(false)} className="size-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleGenerateVendor} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Business/Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Royal Weddings"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-secondary/30"
                                    value={vendorForm.fullName}
                                    onChange={(e) => setVendorForm({ ...vendorForm, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Vendor Email ID</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="vendor@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-secondary/30"
                                    value={vendorForm.email}
                                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-secondary/30"
                                    value={vendorForm.password}
                                    onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-secondary text-white font-black py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] transform mt-4 disabled:opacity-50"
                            >
                                {isGenerating ? 'Deploying Vendor Profile...' : 'Authorize Vendor'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </aside>
    );
}
