/**
 * Face Recognition Service
 * 
 * Provides face matching and recognition functionality using
 * face descriptors (512-dimensional vectors from DeepFace + RetinaFace)
 * 
 * DeepFace + RetinaFace provides superior performance for:
 * - Small faces
 * - Side profiles
 * - Low light conditions
 * - Crowded wedding halls
 */

const { FaceDescriptorDB } = require('./sql-db');

/**
 * Calculate Euclidean distance between two face descriptors
 * Face descriptors are 512-dimensional vectors from DeepFace + RetinaFace
 * DeepFace embeddings are normalized (unit vectors), so we can also use cosine distance
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
 * Calculate cosine distance (1 - cosine similarity)
 * For normalized descriptors, this can be more accurate
 */
function cosineDistance(descriptor1, descriptor2) {
  if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
    throw new Error('Descriptors must be arrays');
  }

  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < descriptor1.length; i++) {
    dotProduct += descriptor1[i] * descriptor2[i];
    norm1 += descriptor1[i] * descriptor1[i];
    norm2 += descriptor2[i] * descriptor2[i];
  }

  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  return 1 - similarity; // Convert similarity to distance
}

/**
 * Match a face descriptor against all known faces
 * Returns matches sorted by distance (most similar first)
 * @param {Array} descriptor - Face descriptor (512-dimensional array from DeepFace + RetinaFace)
 * @param {number} threshold - Distance threshold for matching
 * @param {string} weddingName - Optional: filter by wedding ('sister-a' or 'sister-b')
 */
async function matchFace(descriptor, threshold = 0.55, weddingName = null) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 FACE MATCHING DEBUG`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Threshold: ${threshold} (${((1 - threshold) * 100).toFixed(0)}%+ confidence required)`);
  console.log(`Wedding filter: ${weddingName || 'None (all weddings)'}`);
  console.log(`Descriptor length: ${descriptor.length} dimensions`);
  console.log(`Descriptor sample (first 5 values): [${descriptor.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);

  // Handle nested arrays (descriptor might be array of arrays)
  let flatDescriptor = descriptor;
  if (Array.isArray(descriptor[0]) && typeof descriptor[0][0] === 'number') {
    console.warn(`⚠️  Descriptor appears to be nested array, flattening...`);
    flatDescriptor = descriptor.flat();
    console.log(`   Flattened descriptor length: ${flatDescriptor.length} dimensions`);
  }

  // Validate descriptor dimension
  if (flatDescriptor.length !== 512 && flatDescriptor.length !== 128 && flatDescriptor.length !== 2622 && flatDescriptor.length !== 4096) {
    // Check if it's a multiple of 512 or 128 (might be concatenated)
    if (flatDescriptor.length % 512 === 0) {
      const numFaces = flatDescriptor.length / 512;
      console.warn(`⚠️  Descriptor appears to contain ${numFaces} concatenated 512-dim embeddings (total: ${flatDescriptor.length} dims).`);
      console.warn(`   This might indicate multiple faces were concatenated. Using first 512 dimensions.`);
      flatDescriptor = flatDescriptor.slice(0, 512);
    } else if (flatDescriptor.length % 128 === 0) {
      const numFaces = flatDescriptor.length / 128;
      console.warn(`⚠️  Descriptor appears to contain ${numFaces} concatenated 128-dim embeddings (total: ${flatDescriptor.length} dims).`);
      console.warn(`   This might indicate multiple faces were concatenated. Using first 128 dimensions.`);
      flatDescriptor = flatDescriptor.slice(0, 128);
    } else {
      const error = `Invalid descriptor dimension: ${descriptor.length}. Expected 512, 2622, or 4096 (DeepFace) or 128 (face-api.js) dimensions. Got ${descriptor.length} dimensions.`;
      console.error(`❌ ${error}`);
      console.error(`   Descriptor type: ${typeof descriptor}, isArray: ${Array.isArray(descriptor)}`);
      if (descriptor.length > 0) {
        console.error(`   First element type: ${typeof descriptor[0]}, isArray: ${Array.isArray(descriptor[0])}`);
      }
      throw new Error(error);
    }
  }

  // Use the flattened/validated descriptor
  descriptor = flatDescriptor;

  try {
    // Get face descriptors, optionally filtered by wedding
    let allDescriptors;

    if (weddingName) {
      // STRICT FILTERING: Filter face descriptors by wedding through photo relationship
      const { PhotoDB } = require('./sql-db');

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

    // Filter descriptors to only compare those with matching dimensions
    const queryDimension = descriptor.length;
    console.log(`🔍 Query descriptor dimension: ${queryDimension}`);

    const compatibleDescriptors = allDescriptors.filter(faceDesc => {
      const descDimension = faceDesc.descriptor?.length || 0;
      return descDimension === queryDimension;
    });

    // Log dimension distribution for debugging
    const dimensionCounts = {};
    allDescriptors.forEach(desc => {
      const dim = desc.descriptor?.length || 0;
      dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
    });
    console.log(`📊 Descriptor dimension distribution: ${JSON.stringify(dimensionCounts)}`);

    if (compatibleDescriptors.length === 0) {
      const dimensionCounts = {};
      allDescriptors.forEach(desc => {
        const dim = desc.descriptor?.length || 0;
        dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
      });
      console.warn(`⚠️  No compatible descriptors found!`);
      console.warn(`   Query descriptor: ${queryDimension} dimensions`);
      console.warn(`   Available descriptors: ${JSON.stringify(dimensionCounts)}`);
      console.warn(`   💡 Dimension mismatch detected:`);
      console.warn(`      - VGG-Face (DeepFace): 4096 dimensions`);
      console.warn(`      - Facenet (DeepFace): 512 dimensions`);
      console.warn(`      - face-api.js (legacy): 128 dimensions`);
      console.warn(`   📋 Action required: Reprocess existing photos using the Face Processor tool to migrate to ${queryDimension}-dim embeddings`);
      return {
        matches: [],
        bestMatch: null
      };
    }

    if (compatibleDescriptors.length < allDescriptors.length) {
      const skipped = allDescriptors.length - compatibleDescriptors.length;
      console.warn(`⚠️  Skipped ${skipped} descriptor(s) with incompatible dimensions (query: ${queryDimension}dim)`);
    }

    console.log(`✅ Comparing with ${compatibleDescriptors.length} compatible descriptor(s) (${queryDimension} dimensions)`);

    // Calculate distances to all known faces with matching dimensions
    // Try both euclidean and cosine distance, use the better one
    const matches = compatibleDescriptors.map(faceDesc => {
      const euclideanDist = euclideanDistance(descriptor, faceDesc.descriptor);
      const cosineDist = cosineDistance(descriptor, faceDesc.descriptor);

      // Use the smaller distance (better match)
      const distance = Math.min(euclideanDist, cosineDist);
      const confidence = Math.max(0, 1 - distance); // Convert distance to confidence

      return {
        faceDescriptorId: faceDesc.id,
        personId: faceDesc.person?.id,
        personName: faceDesc.person?.name,
        personRole: faceDesc.person?.role,
        distance,
        confidence,
        photoId: faceDesc.photo_id,
        euclideanDist, // For debugging
        cosineDist // For debugging
      };
    });

    // Sort by distance (closest first)
    matches.sort((a, b) => a.distance - b.distance);

    console.log('🎯 Face match distances (top 10):');
    matches.slice(0, 10).forEach((m, i) => {
      console.log(`   ${i + 1}. Photo ${m.photoId?.substring(0, 8)}... | Distance: ${m.distance.toFixed(4)} (${(m.confidence * 100).toFixed(1)}% confidence) | Person: ${m.personName || 'Unknown'}`);
      if (m.euclideanDist !== undefined && m.cosineDist !== undefined) {
        console.log(`      Euclidean: ${m.euclideanDist.toFixed(4)} | Cosine: ${m.cosineDist.toFixed(4)}`);
      }
    });

    // Filter by threshold - Use STRICT threshold to prevent false positives
    // For Facenet 128-dim embeddings, typical good matches are 0.3-0.45 distance
    // Distance < 0.35 = excellent match (65%+ confidence)
    // Distance 0.35-0.45 = good match (55-65% confidence)  
    // Distance > 0.45 = likely different person
    const goodMatches = matches.filter(m => m.distance <= threshold);

    if (goodMatches.length === 0 && matches.length > 0) {
      // If no matches with lenient threshold, try even more lenient for debugging
      const veryLenientThreshold = threshold * 1.3;
      const veryLenientMatches = matches.filter(m => m.distance <= veryLenientThreshold);
      if (veryLenientMatches.length > 0) {
        console.log(`⚠️  No matches with threshold ${threshold}, but found ${veryLenientMatches.length} with very lenient threshold ${veryLenientThreshold.toFixed(3)}`);
        console.log(`   Best match distance: ${veryLenientMatches[0].distance.toFixed(4)}`);
      }
    }

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
      if (matches.length > 0) {
        console.log(`📊 Closest matches (top 10):`);
        matches.slice(0, 10).forEach((m, i) => {
          console.log(`   ${i + 1}. Distance: ${m.distance.toFixed(4)} (${((1 - m.distance) * 100).toFixed(1)}% confidence) | Photo: ${m.photoId?.substring(0, 8)}...`);
        });
        const closestDistance = matches[0].distance;
        const distanceFromThreshold = closestDistance - threshold;
        console.log(`💡 Closest match distance: ${closestDistance.toFixed(4)}, threshold: ${threshold}`);
        console.log(`💡 Distance from threshold: ${distanceFromThreshold.toFixed(4)} (${(distanceFromThreshold / threshold * 100).toFixed(1)}% over threshold)`);

        // If closest match is very close to threshold, suggest using it anyway
        if (closestDistance <= threshold * 1.2) {
          console.log(`💡 Closest match is within 20% of threshold. Consider using lenient matching.`);
        }
      } else {
        console.log(`❌ No faces to compare against! Make sure photos have been processed with face detection.`);
      }
      return {
        matches: [],
        bestMatch: null
      };
    }

    // BALANCED VALIDATION: Best match should ideally be better than others
    const bestMatch = goodMatches[0];
    if (goodMatches.length > 1) {
      const secondBest = goodMatches[1];
      const distanceDiff = secondBest.distance - bestMatch.distance;
      const improvementRatio = distanceDiff / secondBest.distance;

      // Log but don't necessarily reject if improvement is small
      if (improvementRatio < 0.10) {
        console.warn(`⚠️  Best match very close to second best (${bestMatch.distance.toFixed(4)} vs ${secondBest.distance.toFixed(4)}, improvement: ${(improvementRatio * 100).toFixed(1)}%)`);
      }
    }

    // Accept matches within threshold
    if (bestMatch.distance > threshold * 0.95) {
      console.log(`ℹ️  Best match distance (${bestMatch.distance.toFixed(4)}) is close to threshold (${threshold})`);
    }

    // ADDITIONAL CHECK: If best match is borderline (>0.45)
    if (goodMatches.length > 1 && bestMatch.distance > 0.45) {
      const secondBest = goodMatches[1];
      const improvementRatio = (secondBest.distance - bestMatch.distance) / secondBest.distance;
      if (improvementRatio < 0.05) {
        console.warn(`⚠️  Borderline match (${bestMatch.distance.toFixed(4)}) very similar to second best`);
      }
    }

    // FINAL CHECK: Log all match details for debugging
    console.log(`🎯 Final match validation:`);
    console.log(`   Best match distance: ${bestMatch.distance.toFixed(4)}`);
    console.log(`   Best match confidence: ${((1 - bestMatch.distance) * 100).toFixed(1)}%`);
    console.log(`   Best match person: ${bestMatch.personName || 'Unknown'}`);
    console.log(`   Best match photo ID: ${bestMatch.photoId}`);
    if (goodMatches.length > 1) {
      console.log(`   Second best distance: ${goodMatches[1].distance.toFixed(4)}`);
      console.log(`   Improvement: ${((goodMatches[1].distance - bestMatch.distance) / goodMatches[1].distance * 100).toFixed(1)}%`);
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

    // Limit to top 10 matches, but filter out borderline matches
    // Keep matches that are clearly good (distance < 0.5) or at least 3% better than threshold
    const limitedMatches = finalMatches
      .filter(m => {
        // Accept if excellent match (< 0.5) OR at least 3% better than threshold
        return m.distance < 0.5 || m.distance < threshold * 0.97;
      })
      .slice(0, 10); // Limit to top 10

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
 * Should be array of 512 numbers (DeepFace + RetinaFace embeddings)
 * Also supports legacy 128-dim descriptors for backward compatibility
 */
function validateDescriptor(descriptor) {
  if (!Array.isArray(descriptor)) {
    return {
      valid: false,
      error: 'Descriptor must be an array'
    };
  }

  // Support both 512-dim (DeepFace) and 128-dim (legacy face-api.js) descriptors
  if (descriptor.length !== 512 && descriptor.length !== 128 && descriptor.length !== 2622 && descriptor.length !== 4096) {
    return {
      valid: false,
      error: `Descriptor must have exactly 512, 2622, or 4096 dimensions (DeepFace) or 128 dimensions (legacy). Got ${descriptor.length}`
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
    const { PeopleDB } = require('./sql-db');

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
    const { query } = require('./db-gcp');

    // Get counts via SQL
    const { rows: personRows } = await query('SELECT COUNT(*) as count FROM people');
    const { rows: descriptorRows } = await query('SELECT COUNT(*) as count FROM face_descriptors');
    const { rows: faceRows } = await query('SELECT COUNT(*) as count FROM photo_faces');
    const { rows: verifiedRows } = await query('SELECT COUNT(*) as count FROM photo_faces WHERE is_verified = true');

    const totalPeople = parseInt(personRows[0].count);
    const totalDescriptors = parseInt(descriptorRows[0].count);
    const totalFaces = parseInt(faceRows[0].count);
    const verifiedFaces = parseInt(verifiedRows[0].count);

    return {
      totalPeople,
      totalDescriptors,
      totalFaces,
      verifiedFaces,
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
 * Now supports anonymous face searches (selfies) by returning photos directly from matched descriptors
 */
async function findSimilarFaces(descriptor, limit = 10, threshold = 0.6, sister = null) {
  try {
    console.log(`🔍 findSimilarFaces: limit=${limit}, threshold=${threshold}, sister=${sister}`);

    // Match face with optional wedding filter
    const matchResult = await matchFace(descriptor, threshold, sister);

    if (!matchResult.matches || matchResult.matches.length === 0) {
      console.log('❌ No matches found in findSimilarFaces');
      return [];
    }

    console.log(`✅ Found ${matchResult.matches.length} face matches`);

    // Get unique photos from matched faces
    const { PhotoDB } = require('./sql-db');
    const photoMap = new Map();

    // Collect all unique photo IDs from matches
    for (const match of matchResult.matches) {
      if (match.photoId && !photoMap.has(match.photoId)) {
        try {
          const photo = await PhotoDB.findById(match.photoId);
          if (photo) {
            // Add match metadata to photo object
            photoMap.set(match.photoId, {
              ...photo,
              similarity: match.confidence,
              distance: match.distance,
              photo_id: match.photoId
            });
            console.log(`   ✓ Added photo ${match.photoId.substring(0, 8)}... (confidence: ${(match.confidence * 100).toFixed(1)}%)`);
          } else {
            console.warn(`   ⚠️  Photo ${match.photoId} not found in database`);
          }
        } catch (err) {
          console.error(`   ❌ Error fetching photo ${match.photoId}:`, err.message);
        }
      }
    }

    // Convert to array and sort by similarity (highest first)
    const photos = Array.from(photoMap.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    console.log(`✅ Returning ${photos.length} matched photos (sorted by similarity)`);
    if (photos.length > 0) {
      console.log(`   Top match: ${photos[0].filename} (${(photos[0].similarity * 100).toFixed(1)}% confidence)`);
    }

    return photos;
  } catch (error) {
    console.error('❌ Error in findSimilarFaces:', error);
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

