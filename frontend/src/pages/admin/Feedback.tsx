import React, { useState, useEffect } from 'react';
import AdminLayout from './Layout';
import { API_BASE_URL } from '@/lib/api';

interface Feedback {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  category: string;
  message: string;
  page_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const AdminFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCalling, setIsCalling] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`);
      const data = await response.json();
      if (data.success) {
        setFeedbacks(data.feedback || []);
      } else {
        setError(data.error || 'Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to fetch feedbacks. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const updateFeedbackStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        fetchFeedbacks();
        if (selectedFeedback?.id === id) {
          setSelectedFeedback({ ...selectedFeedback, status });
        }
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        fetchFeedbacks();
        if (selectedFeedback?.id === id) setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const triggerCall = async (feedback: Feedback) => {
    let phoneNumber = prompt('Enter phone number to call (include country code, e.g., +1234567890):');
    if (!phoneNumber || !phoneNumber.trim()) return;
    phoneNumber = phoneNumber.trim();
    if (!confirm(`Send WhatsApp message to ${feedback.name || 'customer'} at ${phoneNumber}?`)) return;

    setIsCalling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/n8n/trigger-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          name: feedback.name || 'Anonymous',
          email: feedback.email,
          feedbackId: feedback.id,
          reason: `Follow up on feedback: ${feedback.category}`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`WhatsApp message sent! Message ID: ${data.messageId}`);
      } else {
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Failed to initiate call. Please check if n8n is configured.');
    } finally {
      setIsCalling(false);
    }
  };

  const filteredFeedbacks = statusFilter === 'all'
    ? feedbacks
    : feedbacks.filter(f => f.status === statusFilter);

  const stats = {
    total: feedbacks.length,
    avgRating: feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : '0.0',
    new: feedbacks.filter(f => f.status === 'new').length,
    read: feedbacks.filter(f => f.status === 'read').length,
    archived: feedbacks.filter(f => f.status === 'archived').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`material-symbols-outlined text-sm ${i < rating ? 'fill-[1] text-amber-400' : 'text-slate-300'}`}
      >star</span>
    ));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'new': return 'bg-primary/10 text-primary';
      case 'read': return 'bg-slate-100 text-slate-600';
      case 'archived': return 'bg-slate-50 text-slate-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getCategoryStyle = (category: string) => {
    const map: Record<string, string> = {
      general: 'bg-blue-50 text-blue-700',
      feature: 'bg-emerald-50 text-emerald-700',
      bug: 'bg-red-50 text-red-700',
      ui: 'bg-purple-50 text-purple-700',
      other: 'bg-slate-50 text-slate-600',
    };
    return map[category] || map.other;
  };

  return (
    <AdminLayout title="Feedback">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Admin</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-900 dark:text-white font-medium">Feedbacks</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Feedback Management</h2>
          </div>
          <button
            onClick={fetchFeedbacks}
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
              <span className="material-symbols-outlined">rate_review</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Feedback</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.total}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined fill-[1]">star</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Rating</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.avgRating}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined">mark_email_unread</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">New</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.new}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined">visibility</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Read</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : stats.read}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'new', 'read', 'archived'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === filter
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">
                ({filter === 'all' ? feedbacks.length : feedbacks.filter(f => f.status === filter).length})
              </span>
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
        ) : filteredFeedbacks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">rate_review</span>
            <p className="text-lg font-bold text-slate-400">No feedbacks found</p>
            <p className="text-sm text-slate-400 mt-1">Customer feedback will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Feedback List (Left 3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              {filteredFeedbacks.map(feedback => (
                <div
                  key={feedback.id}
                  onClick={() => setSelectedFeedback(feedback)}
                  className={`bg-white dark:bg-slate-900 rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${selectedFeedback?.id === feedback.id
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
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{feedback.name || 'Anonymous'}</p>
                        {feedback.email && <p className="text-xs text-slate-500">{feedback.email}</p>}
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusStyle(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center">{getRatingStars(feedback.rating)}</div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryStyle(feedback.category)}`}>
                      {feedback.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{feedback.message}</p>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {formatDate(feedback.created_at)}
                  </p>
                </div>
              ))}
            </div>

            {/* Detail Panel (Right 2 cols) */}
            <div className="lg:col-span-2 sticky top-20 self-start">
              {selectedFeedback ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white">Feedback Details</h3>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusStyle(selectedFeedback.status)}`}>
                      {selectedFeedback.status}
                    </span>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">From</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedFeedback.name || 'Anonymous'}</p>
                      {selectedFeedback.email && (
                        <a href={`mailto:${selectedFeedback.email}`} className="text-xs text-primary hover:underline">{selectedFeedback.email}</a>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rating</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">{getRatingStars(selectedFeedback.rating)}</div>
                        <span className="text-sm font-bold text-slate-600">{selectedFeedback.rating}/5</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryStyle(selectedFeedback.category)}`}>
                        {selectedFeedback.category.charAt(0).toUpperCase() + selectedFeedback.category.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">{selectedFeedback.message}</p>
                    </div>
                    {selectedFeedback.page_url && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Page URL</p>
                        <a href={selectedFeedback.page_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">{selectedFeedback.page_url}</a>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Submitted</p>
                      <p className="text-sm text-slate-600">{formatDate(selectedFeedback.created_at)}</p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <button
                        onClick={() => triggerCall(selectedFeedback)}
                        disabled={isCalling}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                        {isCalling ? 'Sending...' : 'Send WhatsApp'}
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => updateFeedbackStatus(selectedFeedback.id, 'read')}
                          disabled={selectedFeedback.status === 'read'}
                          className="bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:text-primary py-2 rounded-lg text-xs font-bold transition-colors text-slate-600 dark:text-slate-400 disabled:opacity-40"
                        >
                          Mark Read
                        </button>
                        <button
                          onClick={() => updateFeedbackStatus(selectedFeedback.id, 'archived')}
                          disabled={selectedFeedback.status === 'archived'}
                          className="bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:text-primary py-2 rounded-lg text-xs font-bold transition-colors text-slate-600 dark:text-slate-400 disabled:opacity-40"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => deleteFeedback(selectedFeedback.id)}
                          className="bg-slate-50 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 py-2 rounded-lg text-xs font-bold transition-colors text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">touch_app</span>
                  <p className="text-sm font-bold text-slate-400">Select a feedback to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeedback;
