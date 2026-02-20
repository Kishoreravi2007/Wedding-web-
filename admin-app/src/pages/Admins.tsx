import { useState, useEffect } from 'react';
import { premiumService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Admins() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const data = await premiumService.listAdmins();
            setAdmins(data);
        } catch (err) {
            console.error('Failed to fetch admins:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleDelete = async (id: string) => {
        if (id === user?.id) {
            alert("You cannot delete yourself!");
            return;
        }

        if (!confirm('Are you sure you want to delete this administrator? This action cannot be undone.')) {
            return;
        }

        try {
            await premiumService.deleteAdmin(id);
            alert('Admin deleted successfully');
            fetchAdmins();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete admin');
        }
    };

    if (user?.email !== 'kishorekailas1@gmail.com') {
        return (
            <div className="p-8 text-center text-red-500 font-bold">
                Access Denied. Super Admin only.
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Personnel</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and monitor administrative access protocols</p>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white/50 dark:!bg-white/5 backdrop-blur-xl shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 transition-colors">
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">Identity</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">Access Level</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400">Deployed On</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-8">
                                            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        No secondary admins found
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    className="size-10 rounded-full object-cover border-2 border-slate-200 dark:border-white/20 shadow-sm"
                                                    src={admin.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuA49t2CuLcUYubZ4cYoXAThYoQdaSxWtyH14c_wrM6RGpWXxCesa7pXk7aJkglwTX63D4bIBjDbwjQPRZ7Ult1VEpCMs4g0SxXYGT_01FPO2f1gNNqqkAXmfr2w0Lz12Tj_nz39osEO0Nshy2xfid2FFMMRt6FUwjC8ASNix4ZLHzxDPd7O6H9Sc1dpLipHE32czwmrzZbWM34gyFEG8CiPGAqqRwWiQEjzTeu9-oZA8Rw2taR_u_oubbJLPhc2D37JazyQ8Bmhvnmm"}
                                                    alt={admin.username}
                                                />
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white transition-colors capitalize">
                                                        {admin.full_name || admin.username}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium">{admin.email || admin.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
                                                {admin.email === 'kishorekailas1@gmail.com' ? 'Super Admin' : 'Administrator'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium">
                                            {new Date(admin.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {admin.email !== 'kishorekailas1@gmail.com' && (
                                                <button
                                                    onClick={() => handleDelete(admin.id)}
                                                    className="size-9 rounded-xl flex items-center justify-center text-red-500 bg-red-500/10 border border-red-500/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white ml-auto"
                                                    title="Revoke Admin Auth"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete_forever</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
