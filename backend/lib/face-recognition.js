/**
 * Face Recognition Service
 * 
 * Provides face matching and recognition functionality using
 * face descriptors (128-dimensional vectors from face-api.js)
 */

const { FaceDescriptorDB } = require('./supabase-db');

/**
 * Calculate Euclidean distance between two face descriptors
 * Face descriptors are 128-dimensional vectors
 */
function euclideanDistance(descriptor1, descriptor2) {
  if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
    throw new Error('Descriptors must be arrays');
  }
  
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }
  
  return Math.sqrt(sum);
}

/**
 * Match a face descriptor against all known faces
 * Returns matches sorted by distance (most similar first)
 */
async function matchFace(descriptor, threshold = 0.6) {
  try {
    // Get all face descriptors with person information
    const allDescriptors = await FaceDescriptorDB.findAll();
    
    if (!allDescriptors || allDescriptors.length === 0) {
      return {
        matches: [],
        bestMatch: null
      };
    }
    
    // Calculate distances to all known faces
    const matches = allDescriptors.map(faceDesc => {
      const distance = euclideanDistance(descriptor, faceDesc.descriptor);
      const confidence = Math.max(0, 1 - distance); // Convert distance to confidence
      
      return {
        faceDescriptorId: faceDesc.id,
        personId: faceDesc.person?.id,
        personName: faceDesc.person?.name,
        personRole: faceDesc.person?.role,
        distance,
        confidence,
        photoId: faceDesc.photo_id
      };
    });
    
    // Sort by distance (closest first)
    matches.sort((a, b) => a.distance - b.distance);
    
    // Filter by threshold
    const goodMatches = matches.filter(m => m.distance <= threshold);
    
    // Group by person and get best match per person
    const personMatches = new Map();
    goodMatches.forEach(match => {
      if (match.personId) {
        const existing = personMatches.get(match.personId);
        if (!existing || match.distance < existing.distance) {
          personMatches.set(match.personId, match);
        }
      }
    });
    
    const uniqueMatches = Array.from(personMatches.values())
      .sort((a, b) => a.distance - b.distance);
    
    // If we have matches associated with people, return those
    if (uniqueMatches.length > 0) {
      return {
        matches: uniqueMatches,
        bestMatch: uniqueMatches[0]
      };
    }

    // Fallback: no person associations yet (common right after automatic processing)
    // Return top matches based purely on distance so guests still see their photos.
    const fallbackMatches = matches
      .filter(match => match.distance <= threshold && match.photoId)
      .slice(0, 10); // limit to top 10

    return {
      matches: fallbackMatches,
      bestMatch: fallbackMatches.length > 0 ? fallbackMatches[0] : null
    };
  } catch (error) {
    console.error('Error matching face:', error);
    throw error;
  }
}

/**
 * Match multiple faces at once
 * Returns array of match results for each face
 */
async function matchFaces(descriptors, threshold = 0.6) {
  const results = [];
  
  for (const descriptor of descriptors) {
    const matchResult = await matchFace(descriptor, threshold);
    results.push(matchResult);
  }
  
  return results;
}

/**
 * Validate a face descriptor
 * Should be array of 128 numbers
 */
function validateDescriptor(descriptor) {
  if (!Array.isArray(descriptor)) {
    return {
      valid: false,
      error: 'Descriptor must be an array'
    };
  }
  
  if (descriptor.length !== 128) {
    return {
      valid: false,
      error: 'Descriptor must have exactly 128 dimensions'
    };
  }
  
  if (!descriptor.every(val => typeof val === 'number' && !isNaN(val))) {
    return {
      valid: false,
      error: 'Descriptor must contain only valid numbers'
    };
  }
  
  return { valid: true };
}

/**
 * Add a new person with their face descriptors
 */
async function addPersonWithFaces(personData, faceDescriptors, photoIds) {
  try {
    const { PeopleDB } = require('./supabase-db');
    
    // Validate all descriptors first
    for (const desc of faceDescriptors) {
      const validation = validateDescriptor(desc);
      if (!validation.valid) {
        throw new Error(`Invalid face descriptor: ${validation.error}`);
      }
    }
    
    // Create person
    const person = await PeopleDB.create(personData);
    
    // Add face descriptors
    const descriptorPromises = faceDescriptors.map((descriptor, index) => {
      return FaceDescriptorDB.create({
        person_id: person.id,
        descriptor: descriptor,
        photo_id: photoIds && photoIds[index] ? photoIds[index] : null,
        confidence: 1.0 // High confidence for manually added reference faces
      });
    });
    
    await Promise.all(descriptorPromises);
    
    return person;
  } catch (error) {
    console.error('Error adding person with faces:', error);
    throw error;
  }
}

/**
 * Get statistics about face recognition
 */
async function getStatistics() {
  try {
    const { PeopleDB } = require('./supabase-db');
    const { supabase } = require('../server');
    
    // Get counts
    const { count: totalPeople } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalDescriptors } = await supabase
      .from('face_descriptors')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalFaces } = await supabase
      .from('photo_faces')
      .select('*', { count: 'exact', head: true });
    
    const { count: verifiedFaces } = await supabase
      .from('photo_faces')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);
    
    return {
      totalPeople: totalPeople || 0,
      totalDescriptors: totalDescriptors || 0,
      totalFaces: totalFaces || 0,
      verifiedFaces: verifiedFaces || 0,
      averageDescriptorsPerPerson: totalPeople > 0 
        ? (totalDescriptors / totalPeople).toFixed(2) 
        : 0
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
}

/**
 * Find similar faces across all photos
 * Useful for finding all photos containing the same person
 */
async function findSimilarFaces(descriptor, limit = 10, threshold = 0.6) {
  try {
    const matchResult = await matchFace(descriptor, threshold);
    
    if (!matchResult.bestMatch) {
      return [];
    }
    
    // Get all photo faces for the matched person
    const { PhotoFaceDB } = require('./supabase-db');
    const photoFaces = await PhotoFaceDB.findByPersonId(matchResult.bestMatch.personId);
    
    return photoFaces.slice(0, limit);
  } catch (error) {
    console.error('Error finding similar faces:', error);
    throw error;
  }
}

module.exports = {
  matchFace,
  matchFaces,
  validateDescriptor,
  euclideanDistance,
  addPersonWithFaces,
  getStatistics,
  findSimilarFaces
};

