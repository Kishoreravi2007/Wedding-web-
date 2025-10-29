/**
 * Firebase Service
 * 
 * Provides database and storage operations for the frontend
 * Replaces Supabase service functionality
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

/**
 * Photo Service
 */
export const PhotoService = {
  /**
   * Get all photos with optional filters
   */
  async getAll(filters?: { sister?: string; eventType?: string }) {
    try {
      const photosRef = collection(db, 'photos');
      const constraints: QueryConstraint[] = [];
      
      if (filters?.sister) {
        constraints.push(where('sister', '==', filters.sister));
      }
      if (filters?.eventType) {
        constraints.push(where('event_type', '==', filters.eventType));
      }
      
      constraints.push(orderBy('uploaded_at', 'desc'));
      
      const q = query(photosRef, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
        updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at,
        uploaded_at: doc.data().uploaded_at?.toDate?.()?.toISOString() || doc.data().uploaded_at
      }));
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  },

  /**
   * Get photo by ID
   */
  async getById(photoId: string) {
    try {
      const photoRef = doc(db, 'photos', photoId);
      const photoSnap = await getDoc(photoRef);
      
      if (!photoSnap.exists()) {
        return null;
      }
      
      return {
        id: photoSnap.id,
        ...photoSnap.data(),
        created_at: photoSnap.data().created_at?.toDate?.()?.toISOString() || photoSnap.data().created_at,
        updated_at: photoSnap.data().updated_at?.toDate?.()?.toISOString() || photoSnap.data().updated_at,
        uploaded_at: photoSnap.data().uploaded_at?.toDate?.()?.toISOString() || photoSnap.data().uploaded_at
      };
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw error;
    }
  },

  /**
   * Upload photo (should be done through backend API for better control)
   */
  async upload(file: File, metadata: {
    sister: string;
    title?: string;
    description?: string;
    eventType?: string;
    tags?: string[];
  }) {
    try {
      // Upload file to Firebase Storage
      const fileName = `${metadata.sister}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          title: metadata.title || '',
          description: metadata.description || '',
          eventType: metadata.eventType || ''
        }
      });
      
      const publicUrl = await getDownloadURL(storageRef);
      
      // Create photo document in Firestore
      const photoData = {
        filename: file.name,
        file_path: fileName,
        public_url: publicUrl,
        size: file.size,
        mimetype: file.type,
        sister: metadata.sister,
        title: metadata.title || '',
        description: metadata.description || '',
        event_type: metadata.eventType || '',
        tags: metadata.tags || [],
        storage_provider: 'firebase',
        photographer_id: null,
        uploaded_at: Timestamp.now(),
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'photos'), photoData);
      
      return {
        id: docRef.id,
        ...photoData
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  /**
   * Update photo metadata
   */
  async update(photoId: string, updates: {
    title?: string;
    description?: string;
    event_type?: string;
    tags?: string[];
  }) {
    try {
      const photoRef = doc(db, 'photos', photoId);
      await updateDoc(photoRef, {
        ...updates,
        updated_at: Timestamp.now()
      });
      
      return await this.getById(photoId);
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  },

  /**
   * Delete photo
   */
  async delete(photoId: string) {
    try {
      const photo = await this.getById(photoId);
      
      if (!photo) {
        throw new Error('Photo not found');
      }
      
      // Delete from storage
      try {
        const storageRef = ref(storage, photo.file_path);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.warn('Error deleting from storage:', storageError);
      }
      
      // Delete from Firestore
      const photoRef = doc(db, 'photos', photoId);
      await deleteDoc(photoRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }
};

/**
 * Wishes Service
 */
export const WishesService = {
  /**
   * Get all wishes
   */
  async getAll(filters?: { sister?: string; is_approved?: boolean }) {
    try {
      const wishesRef = collection(db, 'wishes');
      const constraints: QueryConstraint[] = [];
      
      if (filters?.sister) {
        constraints.push(where('sister', '==', filters.sister));
      }
      if (filters?.is_approved !== undefined) {
        constraints.push(where('is_approved', '==', filters.is_approved));
      }
      
      constraints.push(orderBy('created_at', 'desc'));
      
      const q = query(wishesRef, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at
      }));
    } catch (error) {
      console.error('Error fetching wishes:', error);
      throw error;
    }
  },

  /**
   * Create wish
   */
  async create(wishData: {
    name: string;
    message: string;
    sister: string;
  }) {
    try {
      const wish = {
        ...wishData,
        is_approved: false,
        created_at: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'wishes'), wish);
      
      return {
        id: docRef.id,
        ...wish
      };
    } catch (error) {
      console.error('Error creating wish:', error);
      throw error;
    }
  },

  /**
   * Update wish
   */
  async update(wishId: string, updates: { is_approved?: boolean }) {
    try {
      const wishRef = doc(db, 'wishes', wishId);
      await updateDoc(wishRef, updates);
      
      const wishSnap = await getDoc(wishRef);
      return {
        id: wishSnap.id,
        ...wishSnap.data()
      };
    } catch (error) {
      console.error('Error updating wish:', error);
      throw error;
    }
  },

  /**
   * Delete wish
   */
  async delete(wishId: string) {
    try {
      const wishRef = doc(db, 'wishes', wishId);
      await deleteDoc(wishRef);
      return true;
    } catch (error) {
      console.error('Error deleting wish:', error);
      throw error;
    }
  }
};

/**
 * People Service (for face recognition)
 */
export const PeopleService = {
  /**
   * Get all people
   */
  async getAll(filters?: { sister?: string; role?: string }) {
    try {
      const peopleRef = collection(db, 'people');
      const constraints: QueryConstraint[] = [];
      
      if (filters?.sister) {
        constraints.push(where('sister', '==', filters.sister));
      }
      if (filters?.role) {
        constraints.push(where('role', '==', filters.role));
      }
      
      const q = query(peopleRef, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching people:', error);
      throw error;
    }
  },

  /**
   * Get person by ID
   */
  async getById(personId: string) {
    try {
      const personRef = doc(db, 'people', personId);
      const personSnap = await getDoc(personRef);
      
      if (!personSnap.exists()) {
        return null;
      }
      
      return {
        id: personSnap.id,
        ...personSnap.data()
      };
    } catch (error) {
      console.error('Error fetching person:', error);
      throw error;
    }
  }
};

export default {
  PhotoService,
  WishesService,
  PeopleService
};

