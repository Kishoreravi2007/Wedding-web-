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
 * @param {Array} descriptor - Face descriptor (128-dimensional array)
 * @param {number} threshold - Distance threshold for matching
 * @param {string} weddingName - Optional: filter by wedding ('sister-a' or 'sister-b')
 */
async function matchFace(descriptor, threshold = 0.6, weddingName = null) {
  try {
    // Get face descriptors, optionally filtered by wedding
    let allDescriptors;
    
    if (weddingName) {
      // STRICT FILTERING: Filter face descriptors by wedding through photo relationship
      const { PhotoDB } = require('./supabase-db');
      
      console.log(`🔍 Step 1: Getting photos for wedding: ${weddingName}`);
      
      // First, get all photos for this wedding
      const weddingPhotos = await PhotoDB.findAll({ sister: weddingName });
      const photoIds = weddingPhotos.map(p => p.id);
      
      console.log(`📸 Found ${weddingPhotos.length} photos for ${weddingName}`);
      console.log(`   Photo IDs: ${photoIds.slice(0, 5).join(', ')}${photoIds.length > 5 ? '...' : ''}`);
      
      if (photoIds.length === 0) {
        console.log(`⚠️  No photos found for wedding: ${weddingName}`);
        return {
          matches: [],
          bestMatch: null
        };
      }
      
      // CRITICAL: Verify all photos belong to the correct wedding
      const wrongWeddingPhotos = weddingPhotos.filter(p => p.sister !== weddingName);
      if (wrongWeddingPhotos.length > 0) {
        console.error(`❌ ERROR: Found ${wrongWeddingPhotos.length} photos with wrong sister field!`);
        wrongWeddingPhotos.forEach(p => {
          console.error(`   Photo ${p.id} (${p.filename}): sister=${p.sister}, expected=${weddingName}`);
        });
      }
      
      // Get face descriptors only from photos in this wedding
      console.log(`🔍 Step 2: Getting face descriptors for ${photoIds.length} photos`);
      allDescriptors = await FaceDescriptorDB.findAll({ photo_ids: photoIds });
      console.log(`✅ Filtered to ${allDescriptors.length} face descriptors from ${photoIds.length} photos (wedding: ${weddingName})`);
      
      // CRITICAL: Double-check all descriptors are from correct photos
      const wrongDescriptors = allDescriptors.filter(desc => !photoIds.includes(desc.photo_id));
      if (wrongDescriptors.length > 0) {
        console.error(`❌ ERROR: Found ${wrongDescriptors.length} face descriptors from wrong photos!`);
        console.error(`   These will be filtered out`);
        allDescriptors = allDescriptors.filter(desc => photoIds.includes(desc.photo_id));
        console.log(`✅ After filtering: ${allDescriptors.length} valid descriptors`);
      }
    } else {
      // Get all face descriptors
      allDescriptors = await FaceDescriptorDB.findAll();
    }
    
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

    console.log('🎯 Face match distances:', matches.slice(0, 10).map(m => ({
      photoId: m.photoId,
      distance: Number(m.distance.toFixed(4)),
      confidence: Number(m.confidence.toFixed(4)),
      person: m.personName || null
    })));
    
    // Filter by threshold - STRICT: only accept matches below threshold
    const goodMatches = matches.filter(m => m.distance <= threshold);
    
    console.log(`📊 Match statistics:`);
    console.log(`   Total faces compared: ${matches.length}`);
    console.log(`   Matches within threshold (${threshold}): ${goodMatches.length}`);
    if (goodMatches.length > 0) {
      console.log(`   Best match distance: ${goodMatches[0].distance.toFixed(4)} (confidence: ${((1 - goodMatches[0].distance) * 100).toFixed(1)}%)`);
      if (goodMatches.length > 1) {
        console.log(`   Second best distance: ${goodMatches[1].distance.toFixed(4)}`);
      }
    }
    
    if (goodMatches.length === 0) {
      console.log(`⚠️  No matches found within threshold ${threshold}`);
      return {
        matches: [],
        bestMatch: null
      };
    }
    
    // STRICT VALIDATION: Best match must be significantly better than others
    // This prevents matching similar-looking people
    const bestMatch = goodMatches[0];
    if (goodMatches.length > 1) {
      const secondBest = goodMatches[1];
      const distanceDiff = secondBest.distance - bestMatch.distance;
      const improvementRatio = distanceDiff / secondBest.distance;
      
      // Require at least 15% improvement over second best match
      // This ensures we're matching to the correct person, not just a similar face
      if (improvementRatio < 0.15) {
        console.log(`⚠️  Best match too close to second best (${bestMatch.distance.toFixed(4)} vs ${secondBest.distance.toFixed(4)}, improvement: ${(improvementRatio * 100).toFixed(1)}%)`);
        console.log(`   Rejecting match to prevent false positive`);
        return {
          matches: [],
          bestMatch: null
        };
      }
    }
    
    // ADDITIONAL VALIDATION: Best match must have good confidence
    // Distance < 0.4 = excellent match (>60% confidence)
    // Distance 0.4-0.45 = good match (55-60% confidence)
    if (bestMatch.distance > threshold * 0.9) {
      // Match is too close to threshold - might be false positive
      console.log(`⚠️  Best match distance (${bestMatch.distance.toFixed(4)}) too close to threshold (${threshold})`);
      console.log(`   Rejecting to prevent false positive`);
      return {
        matches: [],
        bestMatch: null
      };
    }
    
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
    
    const uniquePersonMatches = Array.from(personMatches.values())
      .sort((a, b) => a.distance - b.distance);
    
    // Group by photo to avoid duplicate photos
    const photoMatches = new Map();
    goodMatches.forEach(match => {
      if (match.photoId) {
        const existing = photoMatches.get(match.photoId);
        if (!existing || match.distance < existing.distance) {
          photoMatches.set(match.photoId, match);
        }
      }
    });
    
    const uniquePhotoMatches = Array.from(photoMatches.values())
      .sort((a, b) => a.distance - b.distance);
    
    // Prefer person matches if available, otherwise use photo matches
    const finalMatches = uniquePersonMatches.length > 0 ? uniquePersonMatches : uniquePhotoMatches;
    
    // Limit to top 10 matches to prevent showing too many false positives
    const limitedMatches = finalMatches.slice(0, 10);
    
    console.log(`✅ Found ${limitedMatches.length} valid match(es) after strict filtering`);
    console.log(`   Best match distance: ${limitedMatches[0].distance.toFixed(4)} (confidence: ${((1 - limitedMatches[0].distance) * 100).toFixed(1)}%)`);
    
    return {
      matches: limitedMatches,
      bestMatch: limitedMatches[0]
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

