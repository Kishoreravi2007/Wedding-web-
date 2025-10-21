/**
 * Firebase Authentication Context
 * 
 * Provides Firebase authentication state and methods
 * throughout the React application.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { firebaseAuth, AuthUser } from '../lib/firebase-auth';

interface FirebaseAuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  getIdToken: () => Promise<string | null>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true);
    try {
      const authUser = await firebaseAuth.signIn(email, password);
      setUser(authUser);
      return authUser;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await firebaseAuth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return firebaseAuth.hasRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return firebaseAuth.hasAnyRole(roles);
  };

  const getIdToken = async (): Promise<string | null> => {
    return await firebaseAuth.getIdToken();
  };

  const value: FirebaseAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasRole,
    hasAnyRole,
    getIdToken
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = (): FirebaseAuthContextType => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

// Higher-order component for role-based access
interface WithRoleProps {
  roles: string[];
  fallback?: ReactNode;
}

export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  { roles, fallback = null }: WithRoleProps
) => {
  return (props: P) => {
    const { hasAnyRole } = useFirebaseAuth();
    
    if (!hasAnyRole(roles)) {
      return <>{fallback}</>;
    }
    
    return <Component {...props} />;
  };
};

// Hook for role-based rendering
export const useRole = (role: string): boolean => {
  const { hasRole } = useFirebaseAuth();
  return hasRole(role);
};

// Hook for multiple roles
export const useAnyRole = (roles: string[]): boolean => {
  const { hasAnyRole } = useFirebaseAuth();
  return hasAnyRole(roles);
};
