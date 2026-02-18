/**
 * Authentication Context - Backend API Auth
 * 
 * Provides authentication using the backend SQL auth system (auth-new.js).
 * All ~25 consumer components import useAuth() from this file.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { API_BASE_URL } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    uid: string;
    email: string | null;
    username: string | null;
    displayName: string | null;
    role: string;
    profile?: any;
    is_2fa_enabled?: boolean;
    email_offers_opt_in?: boolean;
    has_premium_access?: boolean;
    premium_features?: string[];
    wedding_id?: string | null;
}

export interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    signup: (...args: any[]) => Promise<any>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<any>;
    resetPassword: (email: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
    enable2FA: (enabled: boolean, secret?: string) => Promise<void>;
    updateEmailPreference: (enabled: boolean) => Promise<void>;
    signIn: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Alias for photographer login compatibility
export const useFirebaseAuth = useAuth;

interface AuthProviderProps {
    children: ReactNode;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const getStoredToken = (): string | null => {
    return localStorage.getItem('auth_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        null;
};

const storeToken = (token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('token', token);
};

const clearTokens = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
};

const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getStoredToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}/api/auth${endpoint}`;
    const response = await fetch(url, { ...options, headers });
    return response;
};

// ─── Normalise user response ──────────────────────────────────────────────────

const normalizeUser = (raw: any): User => ({
    id: String(raw.id || raw.uid || ''),
    uid: String(raw.id || raw.uid || ''),
    email: raw.email || raw.username || null,
    username: raw.username || raw.email || null,
    displayName: raw.displayName || raw.full_name || raw.username?.split?.('@')?.[0] || null,
    role: raw.role || 'user',
    profile: raw.profile,
    is_2fa_enabled: raw.is_2fa_enabled ?? false,
    email_offers_opt_in: raw.email_offers_opt_in ?? false,
    has_premium_access: raw.has_premium_access ?? false,
    premium_features: raw.premium_features || [],
    wedding_id: raw.wedding_id || null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session from stored token on mount
    useEffect(() => {
        const restoreSession = async () => {
            const token = getStoredToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await authFetch('/profile', { method: 'GET' });
                if (res.ok) {
                    const userData = await res.json();
                    setCurrentUser(normalizeUser(userData));
                    console.log('✅ Session restored for:', userData.username || userData.email);
                } else {
                    // Token is invalid/expired – clear it
                    clearTokens();
                    setCurrentUser(null);
                }
            } catch {
                clearTokens();
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // ── Login ─────────────────────────────────────────────────────────────────

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await authFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            // Store token
            const token = data.token || data.accessToken;
            if (token) storeToken(token);

            const user = normalizeUser(data.user);
            setCurrentUser(user);
            console.log('✅ Login successful:', user.email);

            return { user, token };
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
        }
    }, []);

    // Alias for photographer LoginFirebase.tsx compatibility
    const signIn = login;

    // ── Signup ────────────────────────────────────────────────────────────────

    const signup = useCallback(async (...args: any[]) => {
        // Support both calling conventions:
        // 1. signup(email, password, emailOptIn, fullName, location, bio, photo) — Signup.tsx
        // 2. signup(email, password, displayName, role) — older callers
        const email = args[0] as string;
        const password = args[1] as string;

        let fullName: string | undefined;
        let role = 'user';
        let emailOptIn = false;
        let locationStr: string | undefined;
        let bio: string | undefined;
        let avatarUrl: string | undefined;

        if (typeof args[2] === 'boolean') {
            // Convention 1: signup(email, password, emailOptIn, fullName, location, bio, photo)
            emailOptIn = args[2];
            fullName = args[3] as string | undefined;
            locationStr = args[4] as string | undefined;
            bio = args[5] as string | undefined;
            avatarUrl = args[6] as string | undefined;
        } else {
            // Convention 2: signup(email, password, displayName, role)
            fullName = args[2] as string | undefined;
            role = (args[3] as string) || 'user';
        }

        try {
            const res = await authFetch('/register', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    username: email,
                    password,
                    fullName,
                    role,
                    email_offers_opt_in: emailOptIn,
                    location: locationStr,
                    bio,
                    avatarUrl,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            // Auto-login after signup
            const token = data.token || data.accessToken;
            if (token) storeToken(token);

            const user = normalizeUser(data.user);
            setCurrentUser(user);
            console.log('✅ Signup successful:', user.email);

            // Return { data, error } shape for Signup.tsx compatibility
            return { data: { user, token }, error: null };
        } catch (error: any) {
            console.error('Signup error:', error);
            // Return { data, error } shape for Signup.tsx compatibility
            return { data: null, error: new Error(error.message || 'Signup failed') };
        }
    }, []);

    // ── Logout ────────────────────────────────────────────────────────────────

    const logout = useCallback(async () => {
        clearTokens();
        setCurrentUser(null);
        console.log('✅ Logout successful');
    }, []);

    // ── Google Login (stub) ───────────────────────────────────────────────────

    const loginWithGoogle = useCallback(async () => {
        throw new Error('Google login is not available in the current configuration. Please use email/password login.');
    }, []);

    // ── Password Reset ────────────────────────────────────────────────────────

    const resetPassword = useCallback(async (email: string) => {
        const res = await authFetch('/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
    }, []);

    // ── Refresh Profile ───────────────────────────────────────────────────────

    const refreshProfile = useCallback(async () => {
        try {
            const res = await authFetch('/profile', { method: 'GET' });
            if (res.ok) {
                const userData = await res.json();
                setCurrentUser(normalizeUser(userData));
            }
        } catch (error) {
            console.error('Refresh profile error:', error);
        }
    }, []);

    // ── 2FA Toggle ────────────────────────────────────────────────────────────

    const enable2FA = useCallback(async (enabled: boolean, secret?: string) => {
        const res = await authFetch('/2fa/toggle', {
            method: 'POST',
            body: JSON.stringify({ enabled, secret }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update 2FA');
        // Refresh user state
        await refreshProfile();
    }, [refreshProfile]);

    // ── Email Preference ──────────────────────────────────────────────────────

    const updateEmailPreference = useCallback(async (enabled: boolean) => {
        const res = await authFetch('/preferences/email', {
            method: 'POST',
            body: JSON.stringify({ enabled }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update email preference');
        await refreshProfile();
    }, [refreshProfile]);

    // ── Context Value ─────────────────────────────────────────────────────────

    const value: AuthContextType = {
        currentUser,
        loading,
        login,
        signup,
        logout,
        loginWithGoogle,
        resetPassword,
        refreshProfile,
        enable2FA,
        updateEmailPreference,
        signIn,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
