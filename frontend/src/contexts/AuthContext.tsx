import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type { Session, SignUpResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface ProfilePayload {
  full_name?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

interface User {
  id: string;
  email?: string | null;
  profile?: ProfilePayload | null;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<SignUpResponse>;
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

const mapSessionToUser = (session: Session | null): User | null => {
  if (!session) {
    return null;
  }

  const metadata = session.user.user_metadata as ProfilePayload | undefined;
  return {
    id: session.user.id,
    email: session.user.email,
    profile: metadata ?? null,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async (session: Session | null) => {
    setCurrentUser(mapSessionToUser(session));
  }, []);

  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setCurrentUser(mapSessionToUser(session));
  }, []);
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      await hydrateUser(session);
      setLoading(false);
    };

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [hydrateUser]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    refreshProfile,
    resetPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
