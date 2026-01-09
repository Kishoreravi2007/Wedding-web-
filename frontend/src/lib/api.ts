// API configuration
// Auto-detect the backend URL based on current hostname
// This ensures it works on both localhost and when accessed from other devices
const getApiBaseUrl = () => {
  // 1. Check for environment variable (Vite replaces this at build time)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Check if we're on localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:5001`;
    }
  }

  // 3. Fallback to localhost for development
  return 'http://localhost:5001';
};

export const API_BASE_URL = getApiBaseUrl();
console.log('🌐 API Base URL:', API_BASE_URL);

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('admin_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to make authenticated API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

