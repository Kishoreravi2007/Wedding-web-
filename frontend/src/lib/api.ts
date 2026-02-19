// API configuration
export const getApiBaseUrl = () => {
  // 1. Check for environment variable (Vite replaces this at build time)
  const envUrl = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL;

  if (envUrl) {
    let url = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    // Strip trailing /api — callers already prepend /api/ in their fetch URLs
    if (url.endsWith('/api')) {
      url = url.slice(0, -4);
    }
    return url;
  }

  // 2. Check if we're on localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:5001`; // Standard root domain for development
    }
  }

  // 3. Fallback to same-origin
  return '';
};

export const getDeepFaceApiUrl = () => {
  if (import.meta.env.VITE_DEEPFACE_API_URL) {
    return import.meta.env.VITE_DEEPFACE_API_URL;
  }
  return typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8002'
    : '';
};

export const API_BASE_URL = getApiBaseUrl();
export const DEEPFACE_API_URL = getDeepFaceApiUrl();
console.log('🌐 API Base URL:', API_BASE_URL);

// Helper function to get access token from various storage keys
export const getAccessToken = () => {
  let token = localStorage.getItem('wedding_auth_token') ||
    localStorage.getItem('auth_token') ||
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

/**
 * Generic API call helper
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Ensure the final URL has /api prefix
  const apiEndpoint = normalizedEndpoint.startsWith('/api')
    ? normalizedEndpoint
    : `/api${normalizedEndpoint}`;
  const finalUrl = `${API_BASE_URL}${apiEndpoint}`;

  const response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    const errorMessage = error.error || error.message || error.description || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}


