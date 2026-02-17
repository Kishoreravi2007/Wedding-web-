import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './Layout';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/lib/api';

type CallScheduleStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'deleted';

interface CallSchedule {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferred_date: string;
  preferred_time?: string;
  timezone?: string;
  message?: string;
  status: CallScheduleStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const statusStyles: Record<CallScheduleStatus, { label: string; style: string; icon: string }> = {
  pending: { label: 'Pending', style: 'bg-amber-50 text-amber-700', icon: 'schedule' },
  confirmed: { label: 'Confirmed', style: 'bg-purple-50 text-purple-700', icon: 'check_circle' },
  completed: { label: 'Completed', style: 'bg-emerald-50 text-emerald-700', icon: 'task_alt' },
  cancelled: { label: 'Cancelled', style: 'bg-slate-100 text-slate-500', icon: 'cancel' },
  deleted: { label: 'Deleted', style: 'bg-red-50 text-red-600', icon: 'delete' },
};

const CallSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<CallSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<CallSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/call-schedules`);
      const data = await response.json();
      if (data.success) {
        const sorted = [...data.schedules].sort(
          (a: CallSchedule, b: CallSchedule) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setSchedules(sorted);
      } else {
        setError('Failed to load schedules');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const updateStatus = async (id: string, status: CallScheduleStatus) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/call-schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Status updated', description: `Marked as ${status}.` });
        fetchSchedules();
      } else {
        toast({ title: 'Failed to update', description: data.error || 'Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to update', description: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const permanentlyDelete = async (schedule: CallSchedule) => {
    if (!confirm('Permanently delete this scheduled call?')) return;
    if (deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/call-schedules/${schedule.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Deleted', description: 'Schedule removed successfully.' });
        if (selectedSchedule?.id === schedule.id) setSelectedSchedule(null);
        fetchSchedules();
      } else {
        toast({ title: 'Failed to delete', description: data.error || 'Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to delete', description: 'Network error.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredSchedules = useMemo(() => {
    const list = statusFilter === 'all' ? schedules : schedules.filter(s => s.status === statusFilter);
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [schedules, statusFilter]);

  useEffect(() => {
    if (!filteredSchedules.length) { setSelectedSchedule(null); return; }
    if (!selectedSchedule || (statusFilter !== 'all' && selectedSchedule.status !== statusFilter)) {
      setSelectedSchedule(filteredSchedules[0]);
    } else {
      const match = filteredSchedules.find(s => s.id === selectedSchedule.id);
      if (!match) setSelectedSchedule(filteredSchedules[0]);
      else if (match !== selectedSchedule) setSelectedSchedule(match);
    }
  }, [filteredSchedules, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const stats = {
    total: schedules.length,
    pending: schedules.filter(s => s.status === 'pending').length,
    confirmed: schedules.filter(s => s.status === 'confirmed').length,
    completed: schedules.filter(s => s.status === 'completed').length,
  };

  return (
    <AdminLayout title="Call Schedules">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Admin</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-900 dark:text-white font-medium">Call Schedules</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Scheduled Calls</h2>
          </div>
          <button
            onClick={fetchSchedules}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Calls</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.total}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.pending}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Confirmed</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.confirmed}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.completed}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === filter
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">calendar_month</span>
            <p className="text-lg font-bold text-slate-400">No calls scheduled</p>
            <p className="text-sm text-slate-400 mt-1">Demo requests will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Schedule List (Left 3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              {filteredSchedules.map(schedule => {
                const ss = statusStyles[schedule.status];
                return (
                  <div
                    key={schedule.id}
                    onClick={() => setSelectedSchedule(schedule)}
                    className={`bg-white dark:bg-slate-900 rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${selectedSchedule?.id === schedule.id
                        ? 'border-primary shadow-md ring-1 ring-primary/20'
                        : 'border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <span className="material-symbols-outlined text-lg">person</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{schedule.name}</p>
                          <p className="text-xs text-slate-500">{schedule.email}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${ss.style}`}>
                        {ss.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        {new Date(schedule.preferred_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {schedule.preferred_time || 'Any time'}
                      </span>
                      {schedule.timezone && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">public</span>
                          {schedule.timezone}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail Panel (Right 2 cols) */}
            <div className="lg:col-span-2 sticky top-20 self-start">
              {selectedSchedule ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white">Call Details</h3>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyles[selectedSchedule.status].style}`}>
                      {statusStyles[selectedSchedule.status].label}
                    </span>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedSchedule.name}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                      <a href={`mailto:${selectedSchedule.email}`} className="text-sm text-primary hover:underline">{selectedSchedule.email}</a>
                    </div>
                    {selectedSchedule.phone && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone / WhatsApp</p>
                        <a href={`tel:${selectedSchedule.phone}`} className="text-sm text-primary hover:underline">{selectedSchedule.phone}</a>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Preferred Slot</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {new Date(selectedSchedule.preferred_date).toLocaleDateString()} • {selectedSchedule.preferred_time || 'Flexible'}
                        {selectedSchedule.timezone && ` (${selectedSchedule.timezone})`}
                      </p>
                    </div>
                    {selectedSchedule.message && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">{selectedSchedule.message}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Created</p>
                      <p className="text-sm text-slate-600">{formatDate(selectedSchedule.created_at)}</p>
                    </div>

                    {/* Status Actions */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Update Status</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['confirmed', 'completed', 'pending', 'cancelled'] as CallScheduleStatus[]).map(status => {
                          const ss = statusStyles[status];
                          const isActive = selectedSchedule.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => updateStatus(selectedSchedule.id, status)}
                              disabled={updatingStatus || isActive}
                              className={`py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${isActive
                                  ? 'bg-primary text-white'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary disabled:opacity-40'
                                }`}
                            >
                              <span className="material-symbols-outlined text-sm">{ss.icon}</span>
                              {ss.label}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => permanentlyDelete(selectedSchedule)}
                        disabled={deleting}
                        className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 py-2.5 rounded-lg text-xs font-bold transition-colors text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete Request
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">touch_app</span>
                  <p className="text-sm font-bold text-slate-400">Select a request to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CallSchedules;
