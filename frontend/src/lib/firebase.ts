/**
 * Firebase Client Configuration
 * 
 * Provides typed Firebase client for frontend operations
 * Replaces Supabase functionality with Firebase
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration - Use environment variables or fallback to defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB8BGBnEsJhDRhJO3Bvdevh792Gh8A9Uj8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kishore-75492.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kishore-75492",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kishore-75492.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "904463871757",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:904463871757:web:e742970921a623a5718a44",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0YJHHJ26L8"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize analytics only in browser environment
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Analytics not available:', error);
    }
  }
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Database types (matching previous Supabase schema)
export interface Database {
  photos: {
    id: string;
    filename: string;
    file_path: string;
    public_url: string;
    size: number;
    mimetype: string;
    sister: 'sister-a' | 'sister-b';
    title: string | null;
    description: string | null;
    event_type: string | null;
    tags: string[];
    storage_provider: 'firebase' | 'supabase';
    photographer_id: string | null;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
  };
  people: {
    id: string;
    name: string;
    role: 'bride' | 'groom' | 'family' | 'friend' | 'vendor' | 'other';
    avatar_url: string | null;
    sister: 'sister-a' | 'sister-b' | 'both' | null;
    created_at: string;
    updated_at: string;
  };
  face_descriptors: {
    id: string;
    person_id: string | null;
    descriptor: number[];
    photo_id: string | null;
    confidence: number | null;
    created_at: string;
  };
  photo_faces: {
    id: string;
    photo_id: string;
    person_id: string | null;
    face_descriptor_id: string | null;
    bounding_box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    confidence: number | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
  wishes: {
    id: string;
    name: string;
    message: string;
    sister: 'sister-a' | 'sister-b' | 'both';
    created_at: string;
    is_approved: boolean;
  };
}

// Helper function to check Firebase connection
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    // Try to read from Firestore to verify connection
    const { collection, getDocs, limit, query } = await import('firebase/firestore');
    const photosRef = collection(db, 'photos');
    await getDocs(query(photosRef, limit(1)));
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
}

// Helper function to get storage bucket URL
export function getStorageBucketUrl(): string {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}`;
}

// Helper function to generate public URL for a storage file
export function getPublicUrl(filePath: string): string {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/${filePath}`;
}

export { app, auth, db, storage, analytics, firebaseConfig };
