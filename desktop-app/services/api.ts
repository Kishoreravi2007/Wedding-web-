/**
 * API Service
 * 
 * Handles communication with WeddingWeb backend API
 */

import axios, { AxiosInstance } from 'axios';

interface Wedding {
    id: string;
    wedding_code: string;
    bride_name: string;
    groom_name: string;
    wedding_date?: string;
}

interface ApiKeyValidation {
    valid: boolean;
    photographerId?: string;
    error?: string;
}

let apiClient: AxiosInstance | null = null;

export function initializeApi(baseUrl: string, apiKey: string): AxiosInstance {
    apiClient = axios.create({
        baseURL: baseUrl,
        timeout: 30000,
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    });
    return apiClient;
}

export function getApiClient(): AxiosInstance | null {
    return apiClient;
}

/**
 * Validate API key by making a test request
 */
export async function validateApiKey(baseUrl: string, apiKey: string): Promise<ApiKeyValidation> {
    try {
        const response = await axios.get(`${baseUrl}/api/live/photos?sister=sister-a&limit=1`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            timeout: 10000,
        });

        return { valid: true };
    } catch (error: any) {
        if (error.response?.status === 401) {
            return { valid: false, error: 'Invalid or expired API key' };
        }
        if (error.code === 'ECONNREFUSED') {
            return { valid: false, error: 'Cannot connect to server' };
        }
        return { valid: false, error: error.message };
    }
}

/**
 * Fetch weddings assigned to the photographer
 */
export async function fetchWeddings(baseUrl: string, apiKey: string): Promise<Wedding[]> {
    try {
        // For now, fetch from a simple endpoint
        // In production, this would be filtered by photographer
        const response = await axios.get(`${baseUrl}/api/weddings`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            timeout: 10000,
        });

        return response.data.weddings || response.data || [];
    } catch (error: any) {
        console.error('Error fetching weddings:', error.message);
        return [];
    }
}

/**
 * Check server connectivity
 */
export async function checkConnection(baseUrl: string): Promise<boolean> {
    try {
        await axios.get(`${baseUrl}/api/health`, { timeout: 5000 });
        return true;
    } catch {
        try {
            // Fallback - try the base URL
            await axios.get(baseUrl, { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }
}
