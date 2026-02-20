import axios from 'axios';
import type { Wedding, Feedback, ContactMessage, Coupon, DashboardStats, Activity } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-w8zt.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add Authorization header to all requests
api.interceptors.request.use((config) => {
    // Prefer localStorage (actual login) over .env token (dev override)
    const token = localStorage.getItem('admin_token') || import.meta.env.VITE_ADMIN_TOKEN;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const weddingService = {
    getAll: async () => (await api.get<{ success: boolean; weddings: Wedding[] }>('/weddings')).data.weddings,
    getById: async (id: string) => (await api.get<{ success: boolean; wedding: Wedding }>(`/weddings/${id}`)).data.wedding,
    getStats: async (id: string) => (await api.get(`/weddings/${id}/stats`)).data,
    archive: async (id: string) => (await api.post(`/weddings/${id}/archive`)).data,
    delete: async (id: string) => (await api.delete(`/weddings/${id}`)).data,
};

export const feedbackService = {
    getAll: async () => (await api.get<{ success: boolean; feedback: Feedback[] }>('/feedback')).data.feedback,
    updateStatus: async (id: string, status: string) => (await api.patch(`/feedback/${id}`, { status })).data,
    delete: async (id: string) => (await api.delete(`/feedback/${id}`)).data,
};

export const contactService = {
    getAll: async () => (await api.get<{ success: boolean; messages: ContactMessage[] }>('/contact-messages')).data.messages,
    updateStatus: async (id: string, status: string) => (await api.patch(`/contact-messages/${id}`, { status })).data,
    reply: async (id: string, replyText: string) => (await api.post(`/contact-messages/${id}/reply`, { replyText })).data,
    delete: async (id: string) => (await api.delete(`/contact-messages/${id}`)).data,
};

// Mock service for data not yet available in backend
// Dashboard and Analytics
export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        // Fetch from analytics/stats
        const { data } = await api.get('/analytics/stats');

        // Map backend stats to frontend structure
        return {
            online_users: data.totalUsers || 0, // Using total users as proxy for online for now
            total_weddings: data.totalPhotos || 0, // Using photos as proxy or we can add a weddings count to analytics
            pending_feedbacks: data.wishesSubmitted || 0,
            monthly_revenue: 0, // Not yet in analytics.js
            revenue_trends: [
                { month: 'Jan', revenue: 0 },
                { month: 'Feb', revenue: 0 },
                { month: 'Mar', revenue: 0 },
                { month: 'Apr', revenue: 0 },
                { month: 'May', revenue: 0 }
            ]
        };
    },
    getRecentActivity: async (): Promise<Activity[]> => {
        const { data } = await api.get('/analytics/activity');
        return (data || []).map((item: any) => ({
            id: item.id.toString(),
            type: 'login', // Default
            title: item.admin?.username || 'Admin Action',
            description: `${item.action}: ${JSON.stringify(item.details)}`,
            timestamp: new Date(item.created_at).toLocaleTimeString()
        }));
    }
};

export const couponService = {
    getAll: async () => (await api.get<Coupon[]>('/coupons')).data,
    create: async (coupon: Partial<Coupon>) => (await api.post<Coupon>('/coupons', coupon)).data,
    update: async (id: string, updates: Partial<Coupon>) => (await api.patch<Coupon>(`/coupons/${id}`, updates)).data,
    delete: async (id: string) => (await api.delete(`/coupons/${id}`)).data,
};

export const profileService = {
    getProfile: async (userId: string) => (await api.get(`/profiles/${userId}`)).data,
    updateProfile: async (profile: any) => (await api.post('/profiles', profile)).data,
    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return (await api.post('/profiles/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })).data;
    }
};
