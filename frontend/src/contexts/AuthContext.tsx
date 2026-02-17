import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from "@/lib/api";

interface ProfilePayload {
  full_name?: string | null;
  location?: string | null;
  bio?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface User {
  id: string;
  email?: string | null;
  username: string;
  role: string;
  profile?: ProfilePayload | null;
  is_2fa_enabled?: boolean;
  email_offers_opt_in?: boolean;
  has_premium_access?: boolean;
  premium_features?: string[];
  wedding_id?: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ require2FA?: boolean; userId?: string }>;
  verify2FA: (userId: string, code: string) => Promise<void>;
  enable2FA: (enabled: boolean, secret?: string) => Promise<void>;
  signup: (email: string, password: string, emailOptIn?: boolean, fullName?: string, location?: string, bio?: string, avatarUrl?: string | null) => Promise<any>;
  updateEmailPreference: (enabled: boolean) => Promise<void>;
  verifyStepUp2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile?: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<any>;
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Verify token with backend to get FRESH user data
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (response.ok && data.valid && data.user) {
        setToken(token);
        const user = data.user;

        // Save fresh user data back to localStorage
        localStorage.setItem('auth_user', JSON.stringify(user));

        // Fetch profile
        const profile = await fetchUserProfile(user.id, token);

        setCurrentUser({
          ...user,
          profile: profile
        });
      } else {
        // Token invalid or expired
        console.warn('Auth token invalid or expired during hydration');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('Error hydrating user:', e);
      // Fail gracefully - maybe keep what we have in localStorage if offline?
      // For now, let's just clear to be safe
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login response data:', data); // Debugging

      const { token: authToken, user } = data;

      if (!user || !user.id) {
        console.error('Invalid login response: missing user or user.id', data);
        throw new Error('Invalid server response during login');
      }

      // Save to local storage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(user));
      setToken(authToken);

      // Fetch profile
      const profile = await fetchUserProfile(user.id, authToken);

      setCurrentUser({
        ...user,
        email: identifier.includes('@') ? identifier : user.email,
        profile
      });

      return { require2FA: false, user };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          user: {
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      const { token: authToken, user } = data;

      // Save to local storage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(user));
      setToken(authToken);

      // Fetch profile
      const profile = await fetchUserProfile(user.id, authToken);

      setCurrentUser({
        ...user,
        profile
      });

      return { user };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const verifyStepUp2FA = async (code: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/auth/step-up-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // We could set a flag in state if we want to "remember" they verified,
      // but for this implementation we'll just return success.
      return;

    } catch (error) {
      console.error('Step-up 2FA error:', error);
      throw error;
    }
  };

  const verify2FA = async (userId: string, code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      const { token, user } = data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      const profile = await fetchUserProfile(user.id, token);

      setCurrentUser({ ...user, profile });

    } catch (error) {
      console.error('2FA Verification error:', error);
      throw error;
    }
  };

  const enable2FA = async (enabled: boolean, secret?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/auth/2fa/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled, secret })
      });

      if (!response.ok) {
        throw new Error('Failed to update 2FA settings');
      }

      // Update local user state
      if (currentUser) {
        const updatedUser = { ...currentUser, is_2fa_enabled: enabled };
        setCurrentUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser)); // Persist locally too
      }

    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  };

  const updateEmailPreference = async (enabled: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/auth/preferences/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update email preferences');
      }

      // Update local user state
      if (currentUser) {
        const updatedUser = { ...currentUser, email_offers_opt_in: enabled };
        setCurrentUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }

    } catch (error) {
      console.error('Update email preference error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, emailOptIn: boolean = false, fullName?: string, location?: string, bio?: string, avatarUrl?: string | null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password,
          role: 'company',
          email_offers_opt_in: emailOptIn,
          fullName,
          location,
          bio,
          avatarUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

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
    setToken(null);
    navigate('/company/login');
  };
  const refreshProfile = async () => {
    const token = localStorage.getItem('auth_token');
    if (currentUser && token) {
      const profile = await fetchUserProfile(currentUser.id, token);
      setCurrentUser(prev => prev ? ({ ...prev, profile }) : null);
    }
  };

  const resetPassword = async (email: string) => {
    console.log('Reset password request for:', email);

    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  };

  const value: AuthContextType = {
    currentUser,
    token,
    loading,
    login,
    verify2FA,
    enable2FA,
    signup,
    updateEmailPreference,
    verifyStepUp2FA,
    refreshProfile,
    resetPassword,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
