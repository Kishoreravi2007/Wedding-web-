import React, { useEffect, useState } from 'react';
import AdminLayout from './Layout';
import { adminService } from '../../services/adminService';
import { DashboardStats, Wedding } from '../../types/admin';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_photos: 0,
    total_people: 0,
    total_wishes: 0,
    storage_used_mb: 0,
    total_weddings: 0,
    pending_feedback: 0
  });
  const [clients, setClients] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, feedbackCount, weddingsList] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getPendingFeedbackCount(),
          adminService.getWeddings()
        ]);

        setStats({
          ...statsData,
          total_weddings: weddingsList.length,
          pending_feedback: feedbackCount
        });
        setClients(weddingsList);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <AdminLayout title="Dashboard">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-900 dark:text-white font-medium">Overview</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Customer Management</h2>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">favorite</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Weddings</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.total_weddings}</p>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <span className="material-symbols-outlined text-xs">trending_up</span> Active Clients
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">cloud_done</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Photos</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.total_photos.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <span className="material-symbols-outlined text-xs">image</span> across all events
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Feedback</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.pending_feedback}</p>
              <p className="text-xs text-orange-600 font-bold flex items-center gap-0.5 mt-1">
                <span className="material-symbols-outlined text-xs">error</span> Requires attention
              </p>
            </div>
          </div>
        </div>

        {/* Client Grid */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Clients</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse h-[260px]"></div>
            ))
          ) : (
            clients.map((client) => (
              <ClientCard
                key={client.id}
                name={`${client.bride_name} & ${client.groom_name}`}
                date={new Date(client.wedding_date).toLocaleDateString()}
                status={client.status}
                statusColor={client.status === 'active' ? 'emerald' : client.status === 'upcoming' ? 'blue' : 'gray'}
                storage="0 GB"
                percentage={0}
                photos={client.photo_count || 0}
              />
            ))
          )}

          {/* Add Customer Card */}
          <div className="bg-white/40 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 flex flex-col items-center justify-center min-h-[260px] cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800 transition-all group">
            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-4xl mb-2 transition-colors">add_circle</span>
            <p className="text-sm font-bold text-slate-400 group-hover:text-primary transition-colors">Add Customer</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const ClientCard = ({ name, date, status, statusColor, storage, percentage, photos, isHighUsage }: any) => {
  const statusBg = {
    emerald: 'bg-emerald-100 text-emerald-700',
    primary: 'bg-primary/10 text-primary',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-slate-100 text-slate-700'
  }[statusColor as string] || 'bg-slate-100 text-slate-700';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug truncate max-w-[180px]" title={name}>{name}</h4>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <span className="material-symbols-outlined text-xs">calendar_month</span>
              {date}
            </div>
          </div>
          <span className={`px-2 py-0.5 ${statusBg} text-[10px] font-bold rounded uppercase`}>{status}</span>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-slate-500">Storage Usage</span>
              <span className={`font-bold ${isHighUsage ? 'text-orange-600' : 'text-slate-700 dark:text-slate-300'}`}>
                {storage} / 10 GB
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isHighUsage ? 'bg-orange-500' : 'bg-primary'}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-primary text-base">photo_library</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{photos}</span>
            <span className="text-slate-500 text-xs">Photos uploaded</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button className="bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:text-primary py-2 rounded-lg text-xs font-bold transition-colors text-slate-600 dark:text-slate-400">Edit</button>
          <button className="bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:text-primary py-2 rounded-lg text-xs font-bold transition-colors text-slate-600 dark:text-slate-400">Gallery</button>
          <button className="bg-slate-50 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 py-2 rounded-lg text-xs font-bold transition-colors text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-base">archive</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
