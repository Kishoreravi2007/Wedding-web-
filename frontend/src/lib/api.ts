// API configuration
// Auto-detect the backend URL based on current hostname
// This ensures it works on both localhost and when accessed from other devices
const getApiBaseUrl = () => {
  // If explicitly set in environment, use that (empty string means same origin)
  if (import.meta.env.VITE_API_BASE_URL !== undefined) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // For browser environment, use the current hostname
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Backend runs on port 5001
    return `${protocol}//${hostname}:5001`;
  }
  
  // Fallback for SSR
  return 'http://localhost:5001';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
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