import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Users, Settings, LogOut, Star, MessageSquare, RefreshCw, Calendar, Mail, User, Tag, Trash2, Eye, Phone } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchFeedbacks();
        if (selectedFeedback?.id === id) {
          setSelectedFeedback(null);
        }
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      new: { label: 'New', variant: 'default' },
      read: { label: 'Read', variant: 'secondary' },
      archived: { label: 'Archived', variant: 'outline' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800',
      feature: 'bg-green-100 text-green-800',
      bug: 'bg-red-100 text-red-800',
      ui: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={categoryColors[category] || categoryColors.other}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const triggerCall = async (feedback: Feedback) => {
    // Prompt for phone number if not available
    let phoneNumber = prompt('Enter phone number to call (include country code, e.g., +1234567890):');
    
    if (!phoneNumber || !phoneNumber.trim()) {
      return; // User cancelled
    }

    phoneNumber = phoneNumber.trim();

    if (!confirm(`Call ${feedback.name || 'customer'} at ${phoneNumber}?`)) {
      return;
    }

    setIsCalling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/n8n/trigger-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          name: feedback.name || 'Anonymous',
          email: feedback.email,
          feedbackId: feedback.id,
          reason: `Follow up on feedback: ${feedback.category}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Call initiated! Call ID: ${data.callId}\n\nYou will receive an email summary when the call is completed.`);
      } else {
        alert(`Failed to initiate call: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error triggering call:', err);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
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
                <Link to="/admin/feedback">
                  <Button variant="ghost" size="sm" className="bg-gray-100">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Feedbacks
                  </Button>
                </Link>
                <Link to="/admin/call-schedules">
                  <Button variant="ghost" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
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
              <Button variant="ghost" size="sm" onClick={fetchFeedbacks}>
                <RefreshCw className="mr-2 h-4 w-4" />
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

      {/* Main Content */}
      <main className="py-8">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Feedback Management</h2>
            <p className="text-gray-600">View and manage customer feedback</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-gray-600">Total Feedbacks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.avgRating}</div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.new}</div>
                <p className="text-sm text-gray-600">New</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.read}</div>
                <p className="text-sm text-gray-600">Read</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All ({feedbacks.length})
            </Button>
            <Button
              variant={statusFilter === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('new')}
            >
              New ({stats.new})
            </Button>
            <Button
              variant={statusFilter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('read')}
            >
              Read ({stats.read})
            </Button>
            <Button
              variant={statusFilter === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('archived')}
            >
              Archived ({stats.archived})
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading feedbacks...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No feedbacks yet</p>
                <p className="text-gray-500 text-sm mt-2">Customer feedback will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Feedbacks List */}
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <Card
                    key={feedback.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedFeedback?.id === feedback.id ? 'border-rose-500 border-2' : ''
                    }`}
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {feedback.name || 'Anonymous'}
                          </CardTitle>
                          {feedback.email && (
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Mail className="w-3 h-3" />
                              {feedback.email}
                            </CardDescription>
                          )}
                        </div>
                        {getStatusBadge(feedback.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {getRatingStars(feedback.rating)}
                        </div>
                        {getCategoryBadge(feedback.category)}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {feedback.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(feedback.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Feedback Detail */}
              <div className="sticky top-24">
                {selectedFeedback ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>Feedback Details</CardTitle>
                        {getStatusBadge(selectedFeedback.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Name
                        </label>
                        <p className="text-gray-900 mt-1">{selectedFeedback.name || 'Anonymous'}</p>
                      </div>

                      {selectedFeedback.email && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </label>
                          <a
                            href={`mailto:${selectedFeedback.email}`}
                            className="text-blue-600 hover:underline mt-1 block"
                          >
                            {selectedFeedback.email}
                          </a>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Rating
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          {getRatingStars(selectedFeedback.rating)}
                          <span className="text-gray-600">({selectedFeedback.rating}/5)</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Category
                        </label>
                        <div className="mt-1">
                          {getCategoryBadge(selectedFeedback.category)}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </label>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedFeedback.message}</p>
                      </div>

                      {selectedFeedback.page_url && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Page URL</label>
                          <a
                            href={selectedFeedback.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline mt-1 block text-sm break-all"
                          >
                            {selectedFeedback.page_url}
                          </a>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Submitted
                        </label>
                        <p className="text-gray-900 mt-1">{formatDate(selectedFeedback.created_at)}</p>
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <Button 
                          size="lg"
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 mb-2"
                          onClick={() => triggerCall(selectedFeedback)}
                          disabled={isCalling}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {isCalling ? 'Calling...' : 'Call Customer'}
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFeedbackStatus(selectedFeedback.id, 'read')}
                            disabled={selectedFeedback.status === 'read'}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Mark as Read
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFeedbackStatus(selectedFeedback.id, 'archived')}
                            disabled={selectedFeedback.status === 'archived'}
                          >
                            Archive
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteFeedback(selectedFeedback.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select a feedback to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-4 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Wedding Website. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AdminFeedback;

