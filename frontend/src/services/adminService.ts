import { API_BASE_URL, getAuthHeaders } from '../lib/api';
import { DashboardStats, Wedding, ContactMessage, PlatformSettings } from '../types/admin';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }
    return response.json();
};

export const adminService = {
    // Dashboard & Analytics
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            // Fetch stats from analytics endpoint
            const response = await fetch(`${API_BASE_URL}/analytics/stats`, {
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);

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
        const response = await fetch(`${API_BASE_URL}/weddings${query}`, {
            headers: getAuthHeaders()
        });
        const data = await handleResponse(response);
        return data.weddings || [];
    },

    // Contact Messages
    getContactMessages: async (): Promise<ContactMessage[]> => {
        const response = await fetch(`${API_BASE_URL}/contact-messages`, {
            headers: getAuthHeaders()
        });
        const data = await handleResponse(response);
        return data.messages || [];
    },

    updateContactMessage: async (id: number, updates: Partial<ContactMessage>): Promise<ContactMessage> => {
        const response = await fetch(`${API_BASE_URL}/contact-messages/${id}`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        const data = await handleResponse(response);
        return data.data;
    },

    deleteContactMessage: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/contact-messages/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        await handleResponse(response);
    },

    sendReply: async (id: number, replyText: string, subject?: string): Promise<ContactMessage> => {
        const response = await fetch(`${API_BASE_URL}/contact-messages/${id}/reply`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ replyText, subject })
        });
        const data = await handleResponse(response);
        return data.data;
    },

    // Settings
    getSettings: async (): Promise<Record<string, any>> => {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    updateSettings: async (settings: Record<string, any>): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/settings/bulk`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        await handleResponse(response);
    },

    // Feedback (for dashboard counter)
    getPendingFeedbackCount: async (): Promise<number> => {
        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                headers: getAuthHeaders()
            });
            const data = await handleResponse(response);
            const feedback = data.feedback || [];
            return feedback.filter((f: any) => f.status === 'new' || f.status === 'pending').length;
        } catch (error) {
            console.error('Error fetching feedback count:', error);
            return 0;
        }
    }
};
