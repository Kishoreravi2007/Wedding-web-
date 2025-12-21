/**
 * Supabase Database Helper
 * 
 * Provides a clean interface for database operations related to photos,
 * people, and face recognition.
 */

const { supabase } = require('./supabase');

/**
 * Photo operations
 */
const PhotoDB = {
  /**
   * Create a new photo record
   */
  async create(photoData) {
    const { data, error } = await supabase
      .from('photos')
      .insert([photoData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all photos with optional filters
   */
  async findAll(filters = {}) {
    let query = supabase
      .from('photos')
      .select(`
        *,
        photo_faces (
          id,
          bounding_box,
          confidence,
          is_verified,
          person_id,
          face_descriptor_id,
          people (
            id,
            name,
            role
          ),
          face_descriptors (
            id,
            descriptor
          )
        )
      `)
      .order('uploaded_at', { ascending: false });
    
    // Apply filters
    if (filters.sister) {
      query = query.eq('sister', filters.sister);
    }
    
    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    if (filters.personId) {
      query = query.eq('photo_faces.person_id', filters.personId);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a single photo by ID
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('photos')
      .select(`
        *,
        photo_faces (
          id,
          bounding_box,
          confidence,
          is_verified,
          person_id,
          face_descriptor_id,
          people (
            id,
            name,
            role
          ),
          face_descriptors (
            id,
            descriptor
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a photo
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('photos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a photo
   */
  async delete(id) {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Get photo count
   */
  async count(filters = {}) {
    let query = supabase
      .from('photos')
      .select('id', { count: 'exact', head: true });
    
    if (filters.sister) {
      query = query.eq('sister', filters.sister);
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    return count;
  }
};

/**
 * People operations
 */
const PeopleDB = {
  /**
   * Create a new person
   */
  async create(personData) {
    const { data, error } = await supabase
      .from('people')
      .insert([personData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all people
   */
  async findAll(filters = {}) {
    let query = supabase
      .from('people')
      .select('*')
      .order('name');
    
    if (filters.sister) {
      query = query.or(`sister.eq.${filters.sister},sister.eq.both`);
    }
    
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a single person by ID
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a person
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('people')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a person
   */
  async delete(id) {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Face descriptor operations
 */
const FaceDescriptorDB = {
  /**
   * Create a new face descriptor
   */
  async create(descriptorData) {
    const { data, error } = await supabase
      .from('face_descriptors')
      .insert([descriptorData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a single face descriptor by ID
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('face_descriptors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all face descriptors for a person
   */
  async findByPersonId(personId) {
    const { data, error } = await supabase
      .from('face_descriptors')
      .select('*')
      .eq('person_id', personId);
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all face descriptors (for face matching)
   * @param {Object} filters - Optional filters
   * @param {Array} filters.photo_ids - Filter by photo IDs
   */
  async findAll(filters = {}) {
    let query = supabase
      .from('face_descriptors')
      .select(`
        *,
        person:people (
          id,
          name,
          role
        )
      `);
    
    // Filter by photo IDs if provided
    if (filters.photo_ids && filters.photo_ids.length > 0) {
      query = query.in('photo_id', filters.photo_ids);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete face descriptors for a photo
   */
  async deleteByPhotoId(photoId) {
    const { error } = await supabase
      .from('face_descriptors')
      .delete()
      .eq('photo_id', photoId);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Photo faces operations
 */
const PhotoFaceDB = {
  /**
   * Create a new photo face record
   */
  async create(photoFaceData) {
    const { data, error } = await supabase
      .from('photo_faces')
      .insert([photoFaceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all faces for a photo
   */
  async findByPhotoId(photoId) {
    const { data, error } = await supabase
      .from('photo_faces')
      .select(`
        *,
        person:people (
          id,
          name,
          role
        )
      `)
      .eq('photo_id', photoId);
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all photos containing a specific person
   */
  async findByPersonId(personId) {
    const { data, error } = await supabase
      .from('photo_faces')
      .select(`
        *,
        photo:photos (
          id,
          filename,
          public_url,
          title,
          uploaded_at
        )
      `)
      .eq('person_id', personId);
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a photo face
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('photo_faces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete faces for a photo
   */
  async deleteByPhotoId(photoId) {
    const { error } = await supabase
      .from('photo_faces')
      .delete()
      .eq('photo_id', photoId);
    
    if (error) throw error;
    return true;
  }
};

module.exports = {
  PhotoDB,
  PeopleDB,
  FaceDescriptorDB,
  PhotoFaceDB
};
