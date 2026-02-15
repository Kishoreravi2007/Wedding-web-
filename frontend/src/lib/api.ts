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

  // 3. Fallback to relative path for production (same-origin)
  return '/api';
};

const getDeepFaceApiUrl = () => {
  if (import.meta.env.VITE_DEEPFACE_API_URL) {
    return import.meta.env.VITE_DEEPFACE_API_URL;
  }
  // No localhost fallback in production for security/stability
  return typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8002'
    : '';
};

export const API_BASE_URL = getApiBaseUrl();
export const DEEPFACE_API_URL = getDeepFaceApiUrl();
console.log('🌐 API Base URL:', API_BASE_URL);

// Helper function to get access token from various storage keys
export const getAccessToken = () => {
  let token = localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('admin_token');

  // Robust check for invalid token strings
  if (!token || token === 'undefined' || token === 'null' || token === '[object Object]') {
    return null;
  }
  return token;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = getAccessToken();

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
    // Backend might return { error: "msg" } or { message: "msg" }
    const errorMessage = error.error || error.message || error.description || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

