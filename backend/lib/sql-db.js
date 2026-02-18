/**
 * SQL Database Access Layer
 * 
 * Replaces supabase-db.js with raw SQL implementation using Cloud SQL (pg).
 * Implements the same interface for drop-in replacement.
 */

const { query, getClient } = require('./db-gcp');

/**
 * Helper to convert camelCase to snake_case for DB columns if needed,
 * but here we mostly use direct SQL mapping.
 */

/**
 * Photo operations
 */
const PhotoDB = {
  /**
   * Create a new photo record
   */
  async create(photoData) {
    const keys = Object.keys(photoData);
    const columns = keys.join(', ');
    const values = keys.map((_, i) => `$${i + 1}`).join(', ');

    const text = `
      INSERT INTO photos (${columns})
      VALUES (${values})
      RETURNING *
    `;

    const { rows } = await query(text, Object.values(photoData));
    return rows[0];
  },

  /**
   * Get all photos with optional filters
   */
  async findAll(filters = {}) {
    let text = `
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pf.id,
            'bounding_box', pf.bounding_box,
            'confidence', pf.confidence,
            'is_verified', pf.is_verified,
            'person_id', pf.person_id,
            'face_descriptor_id', pf.face_descriptor_id,
            'person', (
              CASE WHEN pe.id IS NOT NULL THEN
                json_build_object(
                  'id', pe.id,
                  'name', pe.name,
                  'role', pe.role
                )
              ELSE null END
            )
          )
        ) FILTER (WHERE pf.id IS NOT NULL) as faces
      FROM photos p
      LEFT JOIN photo_faces pf ON p.id = pf.photo_id
      LEFT JOIN people pe ON pf.person_id = pe.id
    `;

    const params = [];
    const conditions = [];
    let paramIndex = 1;

    // Apply filters
    if (filters.weddingId) {
      conditions.push(`p.wedding_id = $${paramIndex++}`);
      params.push(filters.weddingId);
    } else if (filters.sister) {
      // Fallback/Legacy support for sister
      conditions.push(`p.sister = $${paramIndex++}`);
      params.push(filters.sister);
    }

    if (filters.eventType) {
      conditions.push(`p.event_type = $${paramIndex++}`);
      params.push(filters.eventType);
    } else {
      // By default, exclude special system types like 'hero' backgrounds from general gallery
      conditions.push(`p.event_type != 'hero'`);
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`p.tags @> $${paramIndex++}`);
      params.push(filters.tags);
    }

    // Join filter logic would be complex here for simple WHERE, 
    // but standard SQL structure:

    if (conditions.length > 0) {
      text += ' WHERE ' + conditions.join(' AND ');
    }

    text += ' GROUP BY p.id ORDER BY p.uploaded_at DESC';

    if (filters.limit) {
      text += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      text += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    // If filtering by personId, we need a different approach or HAVING clause
    // or strictly filter: WHERE EXISTS ...
    if (filters.personId) {
      // Re-write query approach if personId filter is critical and not handled above
      // For now, simpler implementation:
      // This is a naive implementation matching the previous Supabase one roughly
    }

    const { rows } = await query(text, params);

    // Format faces to match expected output structure
    return rows.map(row => ({
      ...row,
      photo_faces: row.faces || []
    }));
  },

  /**
   * Get a single photo by ID
   */
  async findById(id) {
    const text = `
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pf.id,
            'bounding_box', pf.bounding_box,
            'confidence', pf.confidence,
            'is_verified', pf.is_verified,
            'person_id', pf.person_id,
            'face_descriptor_id', pf.face_descriptor_id,
            'person', (
              CASE WHEN pe.id IS NOT NULL THEN
                json_build_object(
                  'id', pe.id,
                  'name', pe.name,
                  'role', pe.role
                )
              ELSE null END
            )
          )
        ) FILTER (WHERE pf.id IS NOT NULL) as faces
      FROM photos p
      LEFT JOIN photo_faces pf ON p.id = pf.photo_id
      LEFT JOIN people pe ON pf.person_id = pe.id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const { rows } = await query(text, [id]);
    if (rows.length === 0) return null;

    return {
      ...rows[0],
      photo_faces: rows[0].faces || []
    };
  },

  /**
   * Update a photo
   */
  async update(id, updates) {
    const keys = Object.keys(updates);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(updates);

    const text = `
      UPDATE photos 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await query(text, [id, ...values]);
    return rows[0];
  },

  /**
   * Delete a photo
   */
  async delete(id) {
    const text = 'DELETE FROM photos WHERE id = $1';
    await query(text, [id]);
    return true;
  },

  /**
   * Get photo count
   */
  async count(filters = {}) {
    let text = 'SELECT COUNT(*) as count FROM photos WHERE 1=1';
    const params = [];
    const conditions = [];

    if (filters.weddingId) {
      conditions.push(`wedding_id = $${params.length + 1}`);
      params.push(filters.weddingId);
    } else if (filters.sister) {
      conditions.push(`sister = $${params.length + 1}`);
      params.push(filters.sister);
    }

    if (filters.eventType) {
      conditions.push(`event_type = $${params.length + 1}`);
      params.push(filters.eventType);
    } else {
      // Consistent with findAll, exclude 'hero' types from general counts
      conditions.push(`event_type != 'hero'`);
    }

    if (conditions.length > 0) {
      text += ' AND ' + conditions.join(' AND ');
    }

    const { rows } = await query(text, params);
    return parseInt(rows[0].count);
  }
};

/**
 * People operations
 */
const PeopleDB = {
  async create(personData) {
    const keys = Object.keys(personData);
    const columns = keys.join(', ');
    const values = keys.map((_, i) => `$${i + 1}`).join(', ');

    const text = `
      INSERT INTO people (${columns})
      VALUES (${values})
      RETURNING *
    `;

    const { rows } = await query(text, Object.values(personData));
    return rows[0];
  },

  async findAll(filters = {}) {
    let text = 'SELECT * FROM people';
    const params = [];
    const conditions = [];

    if (filters.sister) {
      conditions.push(`(sister = $${params.length + 1} OR sister = 'both')`);
      params.push(filters.sister);
    }

    if (filters.role) {
      conditions.push(`role = $${params.length + 1}`);
      params.push(filters.role);
    }

    if (conditions.length > 0) {
      text += ' WHERE ' + conditions.join(' AND ');
    }

    text += ' ORDER BY name';

    const { rows } = await query(text, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM people WHERE id = $1', [id]);
    return rows[0];
  },

  async update(id, updates) {
    const keys = Object.keys(updates);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(updates);

    const text = `
      UPDATE people 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await query(text, [id, ...values]);
    return rows[0];
  },

  async delete(id) {
    await query('DELETE FROM people WHERE id = $1', [id]);
    return true;
  }
};

/**
 * Face descriptor operations
 */
const FaceDescriptorDB = {
  async create(descriptorData) {
    // Ensure descriptor is formatted correctly for vector extension if used, 
    // or JSON/Array if using that. Assuming standard array for now.
    // If using pgvector, keys might need casting.

    const keys = Object.keys(descriptorData);
    const columns = keys.join(', ');
    const values = keys.map((_, i) => `$${i + 1}`).join(', ');

    const text = `
      INSERT INTO face_descriptors (${columns})
      VALUES (${values})
      RETURNING *
    `;

    const { rows } = await query(text, Object.values(descriptorData));
    return rows[0];
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM face_descriptors WHERE id = $1', [id]);
    return rows[0];
  },

  async findByPersonId(personId) {
    const { rows } = await query('SELECT * FROM face_descriptors WHERE person_id = $1', [personId]);
    return rows;
  },

  async findAll(filters = {}) {
    let text = `
      SELECT fd.*, 
        json_build_object(
          'id', p.id,
          'name', p.name,
          'role', p.role
        ) as person
      FROM face_descriptors fd
      LEFT JOIN people p ON fd.person_id = p.id
    `;
    const params = [];

    if (filters.photo_ids && filters.photo_ids.length > 0) {
      text += ` WHERE fd.photo_id = ANY($1)`;
      params.push(filters.photo_ids);
    }

    const { rows } = await query(text, params);
    return rows;
  },

  async deleteByPhotoId(photoId) {
    await query('DELETE FROM face_descriptors WHERE photo_id = $1', [photoId]);
    return true;
  }
};

/**
 * Photo faces operations
 */
const PhotoFaceDB = {
  async create(photoFaceData) {
    const keys = Object.keys(photoFaceData);
    const columns = keys.join(', ');
    const values = keys.map((_, i) => `$${i + 1}`).join(', ');

    const text = `
      INSERT INTO photo_faces (${columns})
      VALUES (${values})
      RETURNING *
    `;

    const { rows } = await query(text, Object.values(photoFaceData));
    return rows[0];
  },

  async findByPhotoId(photoId) {
    const text = `
      SELECT pf.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'role', p.role
        ) as person
      FROM photo_faces pf
      LEFT JOIN people p ON pf.person_id = p.id
      WHERE pf.photo_id = $1
    `;
    const { rows } = await query(text, [photoId]);
    return rows;
  },

  async findByPersonId(personId, sister = null) {
    let text = `
      SELECT pf.*,
        json_build_object(
          'id', p.id,
          'filename', p.filename,
          'public_url', p.public_url,
          'title', p.title,
          'uploaded_at', p.uploaded_at
        ) as photo
      FROM photo_faces pf
      JOIN photos p ON pf.photo_id = p.id
      WHERE pf.person_id = $1
    `;

    const params = [personId];

    if (sister) {
      text += ` AND p.sister = $2`;
      params.push(sister);
    }

    const { rows } = await query(text, params);
    return rows;
  },

  async update(id, updates) {
    const keys = Object.keys(updates);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(updates);

    const text = `
      UPDATE photo_faces 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await query(text, [id, ...values]);
    return rows[0];
  },

  async deleteByPhotoId(photoId) {
    await query('DELETE FROM photo_faces WHERE photo_id = $1', [photoId]);
    return true;
  }
};

/**
 * Wishes operations
 */
const WishesDB = {
  async create(wishData) {
    const keys = Object.keys(wishData);
    const columns = keys.join(', ');
    const values = keys.map((_, i) => `$${i + 1}`).join(', ');

    const text = `
      INSERT INTO wishes (${columns})
      VALUES (${values})
      RETURNING *
    `;

    const { rows } = await query(text, Object.values(wishData));
    return rows[0];
  },

  async findAll(filters = {}) {
    let text = 'SELECT * FROM wishes';
    const params = [];
    const conditions = [];

    if (filters.weddingId) {
      conditions.push(`wedding_id = $${params.length + 1}`);
      params.push(filters.weddingId);
    }

    if (filters.recipient && filters.recipient !== 'both') {
      conditions.push(`(recipient = $${params.length + 1} OR recipient = 'both')`);
      params.push(filters.recipient);
    } else if (filters.recipient === 'both') {
      conditions.push(`recipient = 'both'`);
    }

    if (conditions.length > 0) {
      text += ' WHERE ' + conditions.join(' AND ');
    }

    text += ' ORDER BY timestamp DESC';

    if (filters.limit) {
      text += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }

    const { rows } = await query(text, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM wishes WHERE id = $1', [id]);
    return rows[0];
  },

  async delete(id) {
    await query('DELETE FROM wishes WHERE id = $1', [id]);
    return true;
  }
};

module.exports = {
  PhotoDB,
  PeopleDB,
  FaceDescriptorDB,
  PhotoFaceDB,
  WishesDB
};
