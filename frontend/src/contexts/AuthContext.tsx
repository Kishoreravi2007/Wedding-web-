import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

import { API_BASE_URL } from "@/lib/api";

// Backend URL from environment or default
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

interface ProfilePayload {
  full_name?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

interface User {
  id: string;
  email?: string | null;
  username: string;
  role: string;
  profile?: ProfilePayload | null;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile?: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profile
  const fetchUserProfile = useCallback(async (userId: string, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Hydrate user from local storage token
  const hydrateUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (token && storedUser) {
      try {
        // Verify token with backend (optional but recommended for security on load)
        // For now, optimistic loading from local storage to be fast
        const parsedUser = JSON.parse(storedUser);

        // Fetch latest profile
        const profile = await fetchUserProfile(parsedUser.id, token);

        setCurrentUser({
          ...parsedUser,
          profile: profile
        });
      } catch (e) {
        console.error('Error hydrating user', e);
        // If error, maybe clear storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, [fetchUserProfile]);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = async (email: string, password: string) => {
    try {
      // NOTE: Backend expects 'username' but UI uses 'email'. 
      // Adjust backend or frontend to match. 
      // Assuming for this migration we treat email as username or update backend.
      // Let's send email as username for now as that's what backend likely expects if migrated 1:1

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, user } = data;

      // Save to local storage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      // Fetch profile
      const profile = await fetchUserProfile(user.id, token);

      setCurrentUser({
        ...user,
        email: email, // explicit email if not in user object from backend
        profile
      });

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password,
          role: 'company' // Default role for signup
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Auto login often handled here, or return data
      // Supabase returns session data usually.
      // We'll mimic the shape expected by Signup page roughly or return what we have.
      return { data: { user: data.user }, error: null };

    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setCurrentUser(null);
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('auth_token');
    if (currentUser && token) {
      const profile = await fetchUserProfile(currentUser.id, token);
      setCurrentUser(prev => prev ? ({ ...prev, profile }) : null);
    }
  };

  const resetPassword = async (email: string) => {
    // Implement forgot password flow logic here
    // Likely call backend endpoint
    console.log('Reset password request for:', email);
    alert('Password reset functionality not yet implemented in migration.');
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    refreshProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
