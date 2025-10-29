/**
 * Face Recognition API
 * 
 * Handles face matching, people management, and face-related operations
 */

const express = require('express');
const router = express.Router();
const { FaceDescriptorDB, PhotoFacesDB } = require('./lib/firestore-db');
const { 
  matchFace, 
  validateDescriptor, 
  addPersonWithFaces,
  getStatistics,
  findSimilarFaces
} = require('./lib/face-recognition');

// People DB operations
const { db } = require('./lib/firebase');
const PeopleDB = {
  async create(personData) {
    const { v4: uuidv4 } = require('uuid');
    const personId = uuidv4();
    const timestamp = new Date().toISOString();
    const person = {
      id: personId,
      ...personData,
      created_at: timestamp,
      updated_at: timestamp
    };
    await db.collection('people').doc(personId).set(person);
    return person;
  },
  async findAll(filters = {}) {
    let query = db.collection('people');
    if (filters.sister) query = query.where('sister', '==', filters.sister);
    if (filters.role) query = query.where('role', '==', filters.role);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },
  async findById(id) {
    const doc = await db.collection('people').doc(id).get();
    return doc.exists ? { ...doc.data(), id: doc.id } : null;
  },
  async update(id, updates) {
    await db.collection('people').doc(id).update({ ...updates, updated_at: new Date().toISOString() });
    return await this.findById(id);
  },
  async delete(id) {
    await db.collection('people').doc(id).delete();
    return true;
  }
};

const PhotoFaceDB = PhotoFacesDB;

/**
 * POST /api/faces/match
 * Match a face descriptor against known people
 */
router.post('/match', async (req, res) => {
  try {
    const { descriptor, threshold } = req.body;
    
    if (!descriptor) {
      return res.status(400).json({ message: 'Face descriptor is required' });
    }
    
    // Validate descriptor
    const validation = validateDescriptor(descriptor);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: 'Invalid descriptor',
        error: validation.error 
      });
    }
    
    // Match face
    const matchResult = await matchFace(
      descriptor, 
      threshold || 0.6
    );
    
    res.json({
      bestMatch: matchResult.bestMatch,
      matches: matchResult.matches,
      totalMatches: matchResult.matches.length
    });
  } catch (error) {
    console.error('Error matching face:', error);
    res.status(500).json({ 
      message: 'Error matching face',
      error: error.message 
    });
  }
});

/**
 * POST /api/faces/match-batch
 * Match multiple face descriptors at once
 */
router.post('/match-batch', async (req, res) => {
  try {
    const { descriptors, threshold } = req.body;
    
    if (!descriptors || !Array.isArray(descriptors)) {
      return res.status(400).json({ 
        message: 'Descriptors array is required' 
      });
    }
    
    // Validate all descriptors
    for (let i = 0; i < descriptors.length; i++) {
      const validation = validateDescriptor(descriptors[i]);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: `Invalid descriptor at index ${i}`,
          error: validation.error 
        });
      }
    }
    
    // Match all faces
    const results = [];
    for (const descriptor of descriptors) {
      const matchResult = await matchFace(descriptor, threshold || 0.6);
      results.push(matchResult);
    }
    
    res.json({
      results,
      totalFaces: descriptors.length,
      matched: results.filter(r => r.bestMatch !== null).length
    });
  } catch (error) {
    console.error('Error matching faces:', error);
    res.status(500).json({ 
      message: 'Error matching faces',
      error: error.message 
    });
  }
});

/**
 * POST /api/faces/find-similar
 * Find photos containing similar faces
 */
router.post('/find-similar', async (req, res) => {
  try {
    const { descriptor, limit, threshold } = req.body;
    
    if (!descriptor) {
      return res.status(400).json({ message: 'Face descriptor is required' });
    }
    
    const validation = validateDescriptor(descriptor);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: 'Invalid descriptor',
        error: validation.error 
      });
    }
    
    const similarFaces = await findSimilarFaces(
      descriptor,
      limit || 10,
      threshold || 0.6
    );
    
    res.json({
      faces: similarFaces,
      total: similarFaces.length
    });
  } catch (error) {
    console.error('Error finding similar faces:', error);
    res.status(500).json({ 
      message: 'Error finding similar faces',
      error: error.message 
    });
  }
});

/**
 * GET /api/faces/statistics
 * Get face recognition statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      message: 'Error retrieving statistics',
      error: error.message 
    });
  }
});

/**
 * POST /api/faces/verify/:faceId
 * Manually verify a face identification
 */
router.post('/verify/:faceId', async (req, res) => {
  try {
    const { faceId } = req.params;
    const { personId, isVerified } = req.body;
    
    const updates = {
      is_verified: isVerified !== undefined ? isVerified : true
    };
    
    if (personId) {
      updates.person_id = personId;
    }
    
    const updatedFace = await PhotoFaceDB.update(faceId, updates);
    
    res.json({
      message: 'Face verification updated',
      face: updatedFace
    });
  } catch (error) {
    console.error('Error verifying face:', error);
    res.status(500).json({ 
      message: 'Error verifying face',
      error: error.message 
    });
  }
});

/**
 * GET /api/people
 * Get all people
 */
router.get('/people', async (req, res) => {
  try {
    const { sister, role } = req.query;
    
    const filters = { sister, role };
    const people = await PeopleDB.findAll(filters);
    
    res.json({
      people,
      total: people.length
    });
  } catch (error) {
    console.error('Error getting people:', error);
    res.status(500).json({ 
      message: 'Error retrieving people',
      error: error.message 
    });
  }
});

/**
 * GET /api/people/:id
 * Get a specific person with their photos
 */
router.get('/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const person = await PeopleDB.findById(id);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    // Get their face descriptors
    const descriptors = await FaceDescriptorDB.findByPersonId(id);
    
    // Get photos they appear in
    const photoFaces = await PhotoFaceDB.findByPersonId(id);
    
    res.json({
      person,
      descriptorCount: descriptors.length,
      photoCount: photoFaces.length,
      photos: photoFaces.map(pf => pf.photo)
    });
  } catch (error) {
    console.error('Error getting person:', error);
    res.status(500).json({ 
      message: 'Error retrieving person',
      error: error.message 
    });
  }
});

/**
 * POST /api/people
 * Create a new person with optional face descriptors
 */
router.post('/people', async (req, res) => {
  try {
    const { name, role, sister, avatarUrl, faceDescriptors, photoIds } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ 
        message: 'Name and role are required' 
      });
    }
    
    // Validate role
    const validRoles = ['bride', 'groom', 'family', 'friend', 'vendor', 'other'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }
    
    const personData = {
      name,
      role,
      sister: sister || 'both',
      avatar_url: avatarUrl || null
    };
    
    let person;
    
    // If face descriptors provided, add them
    if (faceDescriptors && Array.isArray(faceDescriptors) && faceDescriptors.length > 0) {
      person = await addPersonWithFaces(personData, faceDescriptors, photoIds);
    } else {
      person = await PeopleDB.create(personData);
    }
    
    res.status(201).json({
      message: 'Person created successfully',
      person
    });
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ 
      message: 'Error creating person',
      error: error.message 
    });
  }
});

/**
 * PATCH /api/people/:id
 * Update a person's information
 */
router.patch('/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, sister, avatarUrl } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (sister !== undefined) updates.sister = sister;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    
    const person = await PeopleDB.update(id, updates);
    
    res.json({
      message: 'Person updated successfully',
      person
    });
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ 
      message: 'Error updating person',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/people/:id
 * Delete a person (cascades to their face descriptors)
 */
router.delete('/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await PeopleDB.delete(id);
    
    res.json({
      message: 'Person deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ 
      message: 'Error deleting person',
      error: error.message 
    });
  }
});

/**
 * POST /api/people/:id/descriptors
 * Add face descriptors for an existing person
 */
router.post('/people/:id/descriptors', async (req, res) => {
  try {
    const { id } = req.params;
    const { descriptors, photoIds } = req.body;
    
    if (!descriptors || !Array.isArray(descriptors)) {
      return res.status(400).json({ 
        message: 'Descriptors array is required' 
      });
    }
    
    // Validate person exists
    const person = await PeopleDB.findById(id);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    // Validate and add descriptors
    const addedDescriptors = [];
    for (let i = 0; i < descriptors.length; i++) {
      const validation = validateDescriptor(descriptors[i]);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: `Invalid descriptor at index ${i}`,
          error: validation.error 
        });
      }
      
      const descriptor = await FaceDescriptorDB.create({
        person_id: id,
        descriptor: descriptors[i],
        photo_id: photoIds && photoIds[i] ? photoIds[i] : null,
        confidence: 1.0
      });
      
      addedDescriptors.push(descriptor);
    }
    
    res.status(201).json({
      message: `Added ${addedDescriptors.length} face descriptor(s)`,
      descriptors: addedDescriptors
    });
  } catch (error) {
    console.error('Error adding descriptors:', error);
    res.status(500).json({ 
      message: 'Error adding face descriptors',
      error: error.message 
    });
  }
});

module.exports = router;

