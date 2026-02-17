import React from 'react';
import { matchPath, useLocation, Link, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400';
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden p-1.5 transition-transform hover:scale-105">
                        <img src="/logo.png" alt="WeddingWeb" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-tight">WeddingWeb Admin</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Premium Management</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/admin/dashboard')}`}
                    >
                        <span className={`material-symbols-outlined ${location.pathname === '/admin/dashboard' ? 'fill-[1]' : ''}`}>dashboard</span>
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>




                    <Link
                        to="/admin/contact-messages"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/admin/contact-messages')}`}
                    >
                        <span className={`material-symbols-outlined ${location.pathname === '/admin/contact-messages' ? 'fill-[1]' : ''}`}>chat_bubble</span>
                        <span className="text-sm font-medium">Messages</span>
                        {/* Dynamic count badge - placeholder for now */}
                        <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">New</span>
                    </Link>

                    <Link
                        to="/admin/feedback"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/admin/feedback')}`}
                    >
                        <span className={`material-symbols-outlined ${location.pathname === '/admin/feedback' ? 'fill-[1]' : ''}`}>star_rate</span>
                        <span className="text-sm font-medium">Feedbacks</span>
                    </Link>

                    <Link
                        to="/admin/call-schedules"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/admin/call-schedules')}`}
                    >
                        <span className={`material-symbols-outlined ${location.pathname === '/admin/call-schedules' ? 'fill-[1]' : ''}`}>calendar_today</span>
                        <span className="text-sm font-medium">Call Schedules</span>
                    </Link>

                    <div className="pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">System</div>

                    <Link
                        to="/admin/settings"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/admin/settings')}`}
                    >
                        <span className={`material-symbols-outlined ${location.pathname === '/admin/settings' ? 'fill-[1]' : ''}`}>settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                        <div
                            className="w-8 h-8 rounded-full bg-slate-200 bg-cover bg-center"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCZ2fbBS5kwF0c6tl-FNGrO91mtMqEHMcMPQr2qwsbPwADRynwUbhP4T4__53k1VNOxRfqqcYQGyi_ElQDCJ2drOOP7DnJGane-_jHHTeg20NHYtwdFLPK29Ps2OywPDn5in8LLt7yXSSUXPX1ojFGXLmFDQ3haPMGt-i4v0614hZ58C2nzRoawZiPXBT-SkcUYPZgzI-RDiOkksGmWPdlSiVW6JqBhL3SuNohC7sT0OR11bjTytFDHPFOCVXetp4IGKT9Gg72J0nN9')" }}
                        ></div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate">Admin User</p>
                            <p className="text-[10px] text-slate-500 truncate">{JSON.parse(localStorage.getItem('admin_user') || '{}').email || 'admin@weddingweb.co.in'}</p>
                        </div>
                        <button onClick={handleLogout} title="Logout">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 text-sm transition-colors">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Top Header (Optional, mostly for Dashboard) */}
                {/* Some pages might override this or have their own header like messages */}

                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
