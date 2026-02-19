/**
 * Authentication Context - Supabase Auth Integration
 * 
 * Provides authentication using Supabase Auth.
 * Enables Google Login and native session management.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase, GOOGLE_AUTH_CONFIG } from '../lib/supabase';
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
    loginWithGithub: () => Promise<any>;
    loginWithDiscord: () => Promise<any>;
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

export const useFirebaseAuth = useAuth;

interface AuthProviderProps {
    children: ReactNode;
}

// ─── Normalise user response ──────────────────────────────────────────────────

const normalizeUser = (backendUser: any): User => {
    if (!backendUser) return null as any;

    // The backend returns user data directly, sometimes with weddingData in profile
    const profile = backendUser.profile || {};
    const weddingData = profile.weddingData || {};

    return {
        id: backendUser.id,
        uid: backendUser.id,
        email: backendUser.username || null, // Backend uses username as primary identifier (which is the email)
        username: backendUser.username || null,
        displayName: profile.full_name || backendUser.username?.split('@')[0] || null,
        role: backendUser.role || 'user',
        profile: profile,
        is_2fa_enabled: backendUser.is_2fa_enabled || false,
        email_offers_opt_in: backendUser.email_offers_opt_in ?? false,
        has_premium_access: backendUser.has_premium_access ?? false,
        premium_features: backendUser.premium_features || [],
        wedding_id: backendUser.wedding_id || null,
    };
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial session check
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('wedding_auth_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(normalizeUser(data.user || data));
                } else {
                    localStorage.removeItem('wedding_auth_token');
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('Session check error:', error);
                localStorage.removeItem('wedding_auth_token');
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    // ── Login ─────────────────────────────────────────────────────────────────

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.toLowerCase(), password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            const token = data.token || data.accessToken;
            if (token) {
                localStorage.setItem('wedding_auth_token', token);
            }

            const user = normalizeUser(data.user);
            setCurrentUser(user);
            return { user, token };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }, []);

    const signIn = login;

    // ── Signup ────────────────────────────────────────────────────────────────

    const signup = useCallback(async (...args: any[]) => {
        const email = args[0] as string;
        const password = args[1] as string;
        const email_offers_opt_in = typeof args[2] === 'boolean' ? args[2] : false;
        const fullName = typeof args[2] === 'boolean' ? args[3] : args[2];
        const location = typeof args[2] === 'boolean' ? args[4] : null;
        const bio = typeof args[2] === 'boolean' ? args[5] : null;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    password,
                    email_offers_opt_in,
                    fullName,
                    location,
                    bio
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            const token = data.token || data.accessToken;
            if (token) {
                localStorage.setItem('wedding_auth_token', token);
            }

            const user = normalizeUser(data.user);
            setCurrentUser(user);
            return { data: { user, token }, error: null };
        } catch (error: any) {
            console.error('Signup error:', error);
            return { data: null, error };
        }
    }, []);

    // ── Logout ────────────────────────────────────────────────────────────────

    const logout = useCallback(async () => {
        localStorage.removeItem('wedding_auth_token');
        setCurrentUser(null);
    }, []);

    // ── Google Login (OAuth still uses Supabase for now) ───────────────────────

    const loginWithGoogle = useCallback(async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
        if (error) throw error;
        return data;
    }, []);

    const loginWithGithub = useCallback(async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            }
        });
        if (error) throw error;
        return data;
    }, []);


    const loginWithDiscord = useCallback(async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            }
        });
        if (error) throw error;
        return data;
    }, []);

    // ── Password Reset ────────────────────────────────────────────────────────

    const resetPassword = useCallback(async (email: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.toLowerCase() }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset link');
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
            throw error;
        }
    }, []);

    // ── Refresh Profile ───────────────────────────────────────────────────────

    const refreshProfile = useCallback(async () => {
        const token = localStorage.getItem('wedding_auth_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentUser(normalizeUser(data.user || data));
            }
        } catch (error) {
            console.error('Refresh profile error:', error);
        }
    }, []);

    // ── 2FA Toggle ────────────────────────────────────────────────────────────

    const enable2FA = useCallback(async (enabled: boolean) => {
        console.warn('Backend 2FA should be managed via /api/auth endpoints');
    }, []);

    // ── Email Preference ──────────────────────────────────────────────────────

    const updateEmailPreference = useCallback(async (enabled: boolean) => {
        const token = localStorage.getItem('wedding_auth_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/preferences/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ enabled }),
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentUser(normalizeUser(data.user));
            }
        } catch (error) {
            console.error('Update email preference error:', error);
            throw error;
        }
    }, []);

    const value: AuthContextType = {
        currentUser,
        loading,
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithGithub,
        loginWithDiscord,
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
