import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    username: string;
    email?: string;
    role: string;
    full_name?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://weddingweb.co.in/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
    const [isLoading, setIsLoading] = useState(true);

    const verifyToken = async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = response.data.user || response.data;
            setUser(userData);
        } catch (error) {
            console.error('Auth verification failed:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        verifyToken();
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('admin_token', newToken);
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        await verifyToken();
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
