import { apiCall } from '../lib/api';
import { DashboardStats, Wedding, ContactMessage, PlatformSettings } from '../types/admin';

export const adminService = {
    // Dashboard & Analytics
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            // Fetch stats from analytics endpoint
            const data = await apiCall<any>('/analytics/stats');

            // Transform to DashboardStats interface
            return {
                total_photos: data.totalPhotos || 0,
                total_people: data.totalUsers || 0,
                total_wishes: data.wishesSubmitted || 0,
                storage_used_mb: 0, // Not yet implemented in backend
                total_weddings: 0, // Will be filled by weddings fetch
                pending_feedback: 0 // Will be filled by feedback fetch
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Weddings
    getWeddings: async (status?: string): Promise<Wedding[]> => {
        const query = status ? `?status=${status}` : '';
        const data = await apiCall<any>(`/weddings${query}`);
        return data.weddings || [];
    },

    // Contact Messages
    getContactMessages: async (): Promise<ContactMessage[]> => {
        const data = await apiCall<any>('/contact-messages');
        return data.messages || [];
    },

    updateContactMessage: async (id: number, updates: Partial<ContactMessage>): Promise<ContactMessage> => {
        const data = await apiCall<any>(`/contact-messages/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
        return data.data;
    },

    deleteContactMessage: async (id: number): Promise<void> => {
        await apiCall(`/contact-messages/${id}`, {
            method: 'DELETE'
        });
    },

    sendReply: async (id: number, replyText: string, subject?: string): Promise<ContactMessage> => {
        const data = await apiCall<any>(`/contact-messages/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ replyText, subject })
        });
        return data.data;
    },

    // Settings
    getSettings: async (): Promise<Record<string, any>> => {
        return apiCall<Record<string, any>>('/settings');
    },

    updateSettings: async (settings: Record<string, any>): Promise<void> => {
        await apiCall('/settings/bulk', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    },

    // Feedback (for dashboard counter)
    getPendingFeedbackCount: async (): Promise<number> => {
        try {
            const data = await apiCall<any>('/feedback');
            const feedback = data.feedback || [];
            return feedback.filter((f: any) => f.status === 'new' || f.status === 'pending').length;
        } catch (error) {
            console.error('Error fetching feedback count:', error);
            return 0;
        }
    }
};

