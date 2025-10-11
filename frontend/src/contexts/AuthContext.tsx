// This AuthContext has been modified to work with the new in-memory backend authentication.
// User data will not be persistent across server restarts.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In a real app, you would verify the token with the backend
      // For this in-memory setup, we'll just decode it (not secure for production)
      try {
        const decodedUser = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(decodedUser);
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    // Decode token to get user info (for demonstration, not secure for production)
    const decodedUser = JSON.parse(atob(data.accessToken.split('.')[1]));
    setCurrentUser(decodedUser);
  };

  const signup = async (username: string, password: string, role: string) => {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    const data = await response.json();
    // For signup, we don't automatically log in, just return success
    console.log('User registered:', data);
  };

  const logout = async () => {
    localStorage.removeItem('accessToken');
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
