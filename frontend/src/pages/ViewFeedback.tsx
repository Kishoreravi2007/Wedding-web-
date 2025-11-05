import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart, Star, MessageSquare, RefreshCw, Calendar, Mail, User, Tag } from "lucide-react";
import { API_BASE_URL } from '@/lib/api';

const ViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    categories: {} as Record<string, number>
  });

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`);
      const data = await response.json();
      if (data.success) {
        const feedbackList = data.feedback || [];
        setFeedbacks(feedbackList);
        
        // Calculate stats
        const total = feedbackList.length;
        const avgRating = total > 0 
          ? feedbackList.reduce((sum: number, f: any) => sum + f.rating, 0) / total 
          : 0;
        
        const categories = feedbackList.reduce((acc: Record<string, number>, f: any) => {
          acc[f.category] = (acc[f.category] || 0) + 1;
          return acc;
        }, {});
        
        setStats({ total, avgRating, categories });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-blue-100 text-blue-800',
      'feature': 'bg-green-100 text-green-800',
      'bug': 'bg-red-100 text-red-800',
      'ui': 'bg-purple-100 text-purple-800',
      'performance': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['other'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              WeddingWeb
            </span>
          </Link>
          <div className="flex gap-4">
            <Button variant="outline" onClick={fetchFeedbacks} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full">
              <span className="text-purple-600 font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback Dashboard
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Website Feedback
            </h1>
            <p className="text-lg text-slate-600">
              View and manage all feedback submissions
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Feedback</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <MessageSquare className="w-12 h-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-slate-900">{stats.avgRating.toFixed(1)}</p>
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i <= Math.round(stats.avgRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Categories</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {Object.keys(stats.categories).length}
                    </p>
                  </div>
                  <Tag className="w-12 h-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feedback List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-800 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  All Feedback ({feedbacks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-purple-600">Loading feedback...</p>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-purple-800 mb-2">No Feedback Yet</h3>
                    <p className="text-purple-600">
                      Feedback from website visitors will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <Card key={feedback.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span className="font-semibold text-purple-900 text-lg">
                                    {feedback.name || 'Anonymous'}
                                  </span>
                                </div>
                                <Badge className={`${getCategoryColor(feedback.category)}`}>
                                  {feedback.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  ID: {feedback.id}
                                </Badge>
                              </div>
                              
                              {feedback.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{feedback.email}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-5 h-5 ${
                                      i < feedback.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-purple-700">
                                {feedback.rating}/5
                              </span>
                            </div>
                          </div>
                          
                          {/* Message */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-gray-800 whitespace-pre-wrap">{feedback.message}</p>
                          </div>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {feedback.page_url && (
                              <span className="text-xs text-blue-600 hover:underline">
                                <a href={feedback.page_url} target="_blank" rel="noopener noreferrer">
                                  View Page
                                </a>
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ViewFeedback;

