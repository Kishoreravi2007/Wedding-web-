import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CalendarClock, 
  Home, 
  Users, 
  Mail, 
  Phone, 
  Clock, 
  Globe, 
  MessageSquare, 
  Settings, 
  LogOut, 
  RefreshCcw, 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Trash2 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

const statusMap: Record<CallScheduleStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-blue-500' },
  confirmed: { label: 'Confirmed', color: 'bg-purple-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500' },
  deleted: { label: 'Deleted', color: 'bg-red-500' }
};

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
  }

  return 'https://wedding-backend.onrender.com';
};

const CallSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<CallSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<CallSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'confirmed', label: 'Conformed' },
    { id: 'completed', label: 'Complated' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'deleted', label: 'Deleted' }
  ] as const;
  type StatusFilter = typeof statusFilters[number]['id'];
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const API_BASE_URL = resolveApiBaseUrl();

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/call-schedules`);
      const data = await response.json();

      if (data.success) {
        const sorted = [...data.schedules].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setSchedules(sorted);
        setSelectedSchedule((prev) => {
          if (!sorted.length) return null;
          if (prev) {
            const stillExists = sorted.find((schedule) => schedule.id === prev.id);
            if (stillExists && (statusFilter === 'all' || stillExists.status === statusFilter)) {
              return stillExists;
            }
          }
          const firstMatch =
            sorted.find((schedule) => statusFilter === 'all' || schedule.status === statusFilter) ||
            sorted[0];
          return firstMatch || null;
        });
      } else {
        setError('Failed to load schedules');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const updateStatus = async (id: string, status: CallScheduleStatus) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/call-schedules/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Status updated',
          description: `Marked as ${status}.`
        });
        fetchSchedules();
      } else {
        console.error('Failed to update schedule status', data.error);
        toast({
          title: 'Failed to update',
          description: data.error || 'Please try again.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error updating schedule status:', err);
      toast({
        title: 'Failed to update',
        description: 'Network error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const permanentlyDeleteSchedule = async (schedule: CallSchedule) => {
    if (!confirm('Permanently delete this scheduled call?')) return;
    if (deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/call-schedules/${schedule.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Deleted',
          description: 'Schedule removed successfully.'
        });
        fetchSchedules();
      } else {
        toast({
          title: 'Failed to delete',
          description: data.error || 'Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Failed to delete',
        description: 'Network error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSchedules = useMemo(() => {
    const list =
      statusFilter === 'all'
        ? schedules
        : schedules.filter((schedule) => schedule.status === statusFilter);
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [schedules, statusFilter]);

  useEffect(() => {
    if (!filteredSchedules.length) {
      setSelectedSchedule(null);
      return;
    }
    if (
      !selectedSchedule ||
      (statusFilter !== 'all' && selectedSchedule.status !== statusFilter)
    ) {
      setSelectedSchedule(filteredSchedules[0]);
    } else {
      // ensure reference updated to sorted entry
      const match = filteredSchedules.find((s) => s.id === selectedSchedule.id);
      if (!match) {
        setSelectedSchedule(filteredSchedules[0]);
      } else if (match !== selectedSchedule) {
        setSelectedSchedule(match);
      }
    }
  }, [filteredSchedules, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Wedding Website Admin
              </h1>
              <nav className="flex gap-4 ml-8">
                <Link to="/admin/dashboard">
                  <Button variant="ghost" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Weddings
                  </Button>
                </Link>
                <Link to="/admin/contact-messages">
                  <Button variant="ghost" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </Link>
                <Link to="/admin/call-schedules">
                  <Button variant="ghost" size="sm" className="bg-gray-100">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Call Schedules
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    View Site
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={fetchSchedules}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Link to="/admin/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Calls</h2>
            <p className="text-gray-600">Track all demo requests from the website</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {statusFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={statusFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading schedules...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No calls found</p>
                <p className="text-gray-500 text-sm mt-2">Try switching the filter to view other statuses.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {filteredSchedules.map((schedule) => (
                  <Card
                    key={schedule.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedSchedule?.id === schedule.id ? 'border-rose-500 border-2' : ''
                    }`}
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" />
                            {schedule.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3" />
                            {schedule.email}
                          </CardDescription>
                        </div>
                        <Badge className={statusMap[schedule.status].color}>
                          {statusMap[schedule.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {schedule.preferred_time || 'Any time'} on{' '}
                          {new Date(schedule.preferred_date).toLocaleDateString()}
                        </p>
                        {schedule.timezone && (
                          <p className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {schedule.timezone}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="sticky top-24">
                {selectedSchedule ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Call Details</CardTitle>
                          <CardDescription>Created {formatDate(selectedSchedule.created_at)}</CardDescription>
                        </div>
                        <Badge className={statusMap[selectedSchedule.status].color}>
                          {statusMap[selectedSchedule.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Name
                        </p>
                        <p className="text-gray-900">{selectedSchedule.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </p>
                        <a href={`mailto:${selectedSchedule.email}`} className="text-blue-600 hover:underline">
                          {selectedSchedule.email}
                        </a>
                      </div>
                      {selectedSchedule.phone && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone / WhatsApp
                          </p>
                          <a href={`tel:${selectedSchedule.phone}`} className="text-blue-600 hover:underline">
                            {selectedSchedule.phone}
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <CalendarClock className="w-4 h-4" />
                          Preferred Slot
                        </p>
                        <p className="text-gray-900">
                          {new Date(selectedSchedule.preferred_date).toLocaleDateString()} •{' '}
                          {selectedSchedule.preferred_time || 'Flexible'} ({selectedSchedule.timezone || 'Timezone not specified'})
                        </p>
                      </div>
                      {selectedSchedule.message && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Notes
                          </p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                            {selectedSchedule.message}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 border-t pt-4">
                        <p className="text-sm font-semibold text-gray-700">Update Status</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={selectedSchedule.status === 'confirmed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus(selectedSchedule.id, 'confirmed')}
                            disabled={updatingStatus}
                          >
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Confirmed
                          </Button>
                          <Button
                            variant={selectedSchedule.status === 'completed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus(selectedSchedule.id, 'completed')}
                            disabled={updatingStatus}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Completed
                          </Button>
                          <Button
                            variant={selectedSchedule.status === 'pending' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus(selectedSchedule.id, 'pending')}
                            disabled={updatingStatus}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Pending
                          </Button>
                          <Button
                            variant={selectedSchedule.status === 'cancelled' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateStatus(selectedSchedule.id, 'cancelled')}
                            disabled={updatingStatus}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelled
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => permanentlyDeleteSchedule(selectedSchedule)}
                        disabled={deleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Request
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12 text-gray-600">
                      Select a request to view details
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CallSchedules;

