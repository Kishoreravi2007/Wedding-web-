/**
 * Firestore Database Helper
 * 
 * Provides database operations using Firestore
 * Replaces Supabase database functionality
 */

const { db, admin } = require('./firebase');
const { v4: uuidv4 } = require('uuid');

/**
 * Photo Database Operations
 */
const PhotoDB = {
  /**
   * Create a new photo record
   */
  async create(photoData) {
    try {
      const photoId = uuidv4();
      const timestamp = admin.firestore.Timestamp.now();
      
      const photo = {
        id: photoId,
        ...photoData,
        storage_provider: photoData.storage_provider || 'firebase',
        created_at: timestamp,
        updated_at: timestamp,
        uploaded_at: photoData.uploaded_at || timestamp
      };
      
      await db.collection('photos').doc(photoId).set(photo);
      console.log(`✅ Photo created: ${photoId}`);
      
      return { ...photo, id: photoId };
    } catch (error) {
      console.error('Error creating photo:', error);
      throw error;
    }
  },

  /**
   * Find all photos with optional filters
   */
  async findAll(filters = {}) {
    try {
      let query = db.collection('photos');
      
      // Apply filters
      if (filters.sister) {
        query = query.where('sister', '==', filters.sister);
      }
      if (filters.event_type) {
        query = query.where('event_type', '==', filters.event_type);
      }
      if (filters.photographer_id) {
        query = query.where('photographer_id', '==', filters.photographer_id);
      }
      
      // Order by upload date (descending)
      query = query.orderBy('uploaded_at', 'desc');
      
      const snapshot = await query.get();
      const photos = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        photos.push({
          ...data,
          id: doc.id,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
          uploaded_at: data.uploaded_at?.toDate?.()?.toISOString() || data.uploaded_at
        });
      });
      
      return photos;
    } catch (error) {
      console.error('Error finding photos:', error);
      throw error;
    }
  },

  /**
   * Find photo by ID
   */
  async findById(photoId) {
    try {
      const doc = await db.collection('photos').doc(photoId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
        uploaded_at: data.uploaded_at?.toDate?.()?.toISOString() || data.uploaded_at
      };
    } catch (error) {
      console.error('Error finding photo:', error);
      throw error;
    }
  },

  /**
   * Update photo record
   */
  async update(photoId, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: admin.firestore.Timestamp.now()
      };
      
      await db.collection('photos').doc(photoId).update(updateData);
      console.log(`✅ Photo updated: ${photoId}`);
      
      return await PhotoDB.findById(photoId);
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  },

  /**
   * Delete photo record
   */
  async delete(photoId) {
    try {
      await db.collection('photos').doc(photoId).delete();
      console.log(`✅ Photo deleted: ${photoId}`);
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },

  /**
   * Search photos with face recognition
   */
  async searchByFaces(faceDescriptorIds) {
    try {
      // Get photo_faces that match the descriptors
      const photoFacesQuery = db.collection('photo_faces')
        .where('face_descriptor_id', 'in', faceDescriptorIds);
      
      const snapshot = await photoFacesQuery.get();
      const photoIds = new Set();
      
      snapshot.forEach(doc => {
        photoIds.add(doc.data().photo_id);
      });
      
      if (photoIds.size === 0) {
        return [];
      }
      
      // Get photos by IDs (Firestore limits to 10 per query)
      const photoIdArray = Array.from(photoIds);
      const photos = [];
      
      for (let i = 0; i < photoIdArray.length; i += 10) {
        const batch = photoIdArray.slice(i, i + 10);
        const photosQuery = db.collection('photos')
          .where(admin.firestore.FieldPath.documentId(), 'in', batch);
        
        const photosSnapshot = await photosQuery.get();
        photosSnapshot.forEach(doc => {
          const data = doc.data();
          photos.push({
            ...data,
            id: doc.id,
            created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
            updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
            uploaded_at: data.uploaded_at?.toDate?.()?.toISOString() || data.uploaded_at
          });
        });
      }
      
      return photos;
    } catch (error) {
      console.error('Error searching photos by faces:', error);
      throw error;
    }
  }
};

/**
 * Wishes Database Operations
 */
const WishesDB = {
  /**
   * Create a new wish
   */
  async create(wishData) {
    try {
      const wishId = uuidv4();
      const timestamp = admin.firestore.Timestamp.now();
      
      const wish = {
        id: wishId,
        ...wishData,
        is_approved: wishData.is_approved !== undefined ? wishData.is_approved : false,
        created_at: timestamp
      };
      
      await db.collection('wishes').doc(wishId).set(wish);
      console.log(`✅ Wish created: ${wishId}`);
      
      return { ...wish, id: wishId };
    } catch (error) {
      console.error('Error creating wish:', error);
      throw error;
    }
  },

  /**
   * Find all wishes with optional filters
   */
  async findAll(filters = {}) {
    try {
      let query = db.collection('wishes');
      
      if (filters.sister) {
        query = query.where('sister', '==', filters.sister);
      }
      if (filters.is_approved !== undefined) {
        query = query.where('is_approved', '==', filters.is_approved);
      }
      
      query = query.orderBy('created_at', 'desc');
      
      const snapshot = await query.get();
      const wishes = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        wishes.push({
          ...data,
          id: doc.id,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at
        });
      });
      
      return wishes;
    } catch (error) {
      console.error('Error finding wishes:', error);
      throw error;
    }
  },

  /**
   * Update wish
   */
  async update(wishId, updates) {
    try {
      await db.collection('wishes').doc(wishId).update(updates);
      console.log(`✅ Wish updated: ${wishId}`);
      
      const doc = await db.collection('wishes').doc(wishId).get();
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at
      };
    } catch (error) {
      console.error('Error updating wish:', error);
      throw error;
    }
  },

  /**
   * Delete wish
   */
  async delete(wishId) {
    try {
      await db.collection('wishes').doc(wishId).delete();
      console.log(`✅ Wish deleted: ${wishId}`);
      return true;
    } catch (error) {
      console.error('Error deleting wish:', error);
      throw error;
    }
  }
};

/**
 * Face Descriptors Database Operations
 */
const FaceDescriptorDB = {
  /**
   * Create a new face descriptor
   */
  async create(descriptorData) {
    try {
      const descriptorId = uuidv4();
      const timestamp = admin.firestore.Timestamp.now();
      
      const descriptor = {
        id: descriptorId,
        ...descriptorData,
        created_at: timestamp
      };
      
      await db.collection('face_descriptors').doc(descriptorId).set(descriptor);
      console.log(`✅ Face descriptor created: ${descriptorId}`);
      
      return { ...descriptor, id: descriptorId };
    } catch (error) {
      console.error('Error creating face descriptor:', error);
      throw error;
    }
  },

  /**
   * Find all face descriptors
   */
  async findAll(filters = {}) {
    try {
      let query = db.collection('face_descriptors');
      
      if (filters.person_id) {
        query = query.where('person_id', '==', filters.person_id);
      }
      if (filters.photo_id) {
        query = query.where('photo_id', '==', filters.photo_id);
      }
      
      const snapshot = await query.get();
      const descriptors = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        descriptors.push({
          ...data,
          id: doc.id,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at
        });
      });
      
      return descriptors;
    } catch (error) {
      console.error('Error finding face descriptors:', error);
      throw error;
    }
  },

  /**
   * Delete face descriptor
   */
  async delete(descriptorId) {
    try {
      await db.collection('face_descriptors').doc(descriptorId).delete();
      console.log(`✅ Face descriptor deleted: ${descriptorId}`);
      return true;
    } catch (error) {
      console.error('Error deleting face descriptor:', error);
      throw error;
    }
  }
};

/**
 * Photo Faces Database Operations
 */
const PhotoFacesDB = {
  /**
   * Create a new photo face record
   */
  async create(photoFaceData) {
    try {
      const photoFaceId = uuidv4();
      const timestamp = admin.firestore.Timestamp.now();
      
      const photoFace = {
        id: photoFaceId,
        ...photoFaceData,
        is_verified: photoFaceData.is_verified !== undefined ? photoFaceData.is_verified : false,
        created_at: timestamp,
        updated_at: timestamp
      };
      
      await db.collection('photo_faces').doc(photoFaceId).set(photoFace);
      console.log(`✅ Photo face created: ${photoFaceId}`);
      
      return { ...photoFace, id: photoFaceId };
    } catch (error) {
      console.error('Error creating photo face:', error);
      throw error;
    }
  },

  /**
   * Find all photo faces
   */
  async findAll(filters = {}) {
    try {
      let query = db.collection('photo_faces');
      
      if (filters.photo_id) {
        query = query.where('photo_id', '==', filters.photo_id);
      }
      if (filters.person_id) {
        query = query.where('person_id', '==', filters.person_id);
      }
      
      const snapshot = await query.get();
      const photoFaces = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        photoFaces.push({
          ...data,
          id: doc.id,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        });
      });
      
      return photoFaces;
    } catch (error) {
      console.error('Error finding photo faces:', error);
      throw error;
    }
  },

  /**
   * Delete photo face
   */
  async delete(photoFaceId) {
    try {
      await db.collection('photo_faces').doc(photoFaceId).delete();
      console.log(`✅ Photo face deleted: ${photoFaceId}`);
      return true;
    } catch (error) {
      console.error('Error deleting photo face:', error);
      throw error;
    }
  }
};

module.exports = {
  PhotoDB,
  WishesDB,
  FaceDescriptorDB,
  PhotoFacesDB
};

