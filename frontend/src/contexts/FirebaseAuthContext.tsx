/**
 * Firebase Authentication Context
 * 
 * Provides authentication functionality using Firebase Auth
 * Replaces the previous Supabase authentication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface User {
  id: string;
  uid: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role?: string) => Promise<void>;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Get ID token to fetch custom claims
        const idTokenResult = await user.getIdTokenResult();
        const role = idTokenResult.claims.role as string || 'user';
        
        setCurrentUser({
          id: user.uid,
          uid: user.uid,
          email: user.email,
          username: user.displayName,
          displayName: user.displayName,
          role: role
        });
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get ID token with custom claims
      const idTokenResult = await user.getIdTokenResult();
      const role = idTokenResult.claims.role as string || 'user';
      
      // Store token in localStorage for backend API calls
      const idToken = await user.getIdToken();
      localStorage.setItem('accessToken', idToken);
      
      setCurrentUser({
        id: user.uid,
        uid: user.uid,
        email: user.email,
        username: user.displayName,
        displayName: user.displayName,
        role: role
      });
      
      console.log('✅ Login successful:', user.email);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string, displayName: string, role: string = 'user') => {
    try {
      // First, create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, { displayName });
      
      // Call backend to set custom claims for role
      const idToken = await user.getIdToken();
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ 
            email, 
            displayName,
            role 
          }),
        });
        
        if (!response.ok) {
          console.warn('Failed to set custom claims on backend');
        }
      } catch (backendError) {
        console.warn('Backend registration endpoint not available:', backendError);
      }
      
      console.log('✅ Signup successful:', user.email);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('accessToken');
      setCurrentUser(null);
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
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

// Export FirebaseAuthContext as default for compatibility
export default AuthProvider;
