/**
 * Face Processing Service
 * 
 * Provides automated face detection, recognition, and batch processing
 * for wedding photo galleries with robust error handling and quality checks.
 */

const { PhotoDB, PeopleDB, FaceDescriptorDB, PhotoFaceDB } = require('../lib/supabase-db');
const { matchFace, validateDescriptor } = require('../lib/face-recognition');
const EventEmitter = require('events');

// Processing queue and events
class FaceProcessingService extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
    this.stats = {
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      unidentifiedFaces: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Process a single photo for face detection and recognition
   * 
   * @param {string} photoId - Photo ID to process
   * @param {Array} faceDescriptors - Array of face descriptors from client
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result
   */
  async processSinglePhoto(photoId, faceDescriptors, options = {}) {
    const startTime = Date.now();
    const {
      confidenceThreshold = 0.6,
      minFaceSize = 0.02, // 2% of image dimensions
      maxFaces = 50,
      autoVerify = false
    } = options;

    const result = {
      photoId,
      success: false,
      detectedFaces: 0,
      identifiedFaces: 0,
      unidentifiedFaces: 0,
      lowQualityFaces: 0,
      errors: [],
      processingTime: 0,
      faces: []
    };

    try {
      // Validate photo exists
      const photo = await PhotoDB.findById(photoId);
      if (!photo) {
        throw new Error(`Photo not found: ${photoId}`);
      }

      // Validate and process each face descriptor
      if (!Array.isArray(faceDescriptors) || faceDescriptors.length === 0) {
        result.errors.push('No face descriptors provided');
        return result;
      }

      if (faceDescriptors.length > maxFaces) {
        result.errors.push(`Too many faces detected (${faceDescriptors.length}), limiting to ${maxFaces}`);
        faceDescriptors = faceDescriptors.slice(0, maxFaces);
      }

      result.detectedFaces = faceDescriptors.length;

      // Process each detected face
      for (let i = 0; i < faceDescriptors.length; i++) {
        const faceData = faceDescriptors[i];
        
        try {
          // Validate face data structure
          if (!faceData.descriptor || !faceData.boundingBox) {
            result.errors.push(`Face ${i}: Missing descriptor or bounding box`);
            result.lowQualityFaces++;
            continue;
          }

          // Validate descriptor
          const validation = validateDescriptor(faceData.descriptor);
          if (!validation.valid) {
            result.errors.push(`Face ${i}: ${validation.error}`);
            result.lowQualityFaces++;
            continue;
          }

          // Check face size (quality check)
          const faceArea = faceData.boundingBox.width * faceData.boundingBox.height;
          if (faceArea < minFaceSize) {
            result.errors.push(`Face ${i}: Too small (${(faceArea * 100).toFixed(2)}% of image)`);
            result.lowQualityFaces++;
            continue;
          }

          // Match face against known people
          const matchResult = await matchFace(faceData.descriptor, confidenceThreshold);
          
          let personId = null;
          let confidence = 0;
          let isVerified = autoVerify;

          if (matchResult.bestMatch) {
            personId = matchResult.bestMatch.personId;
            confidence = matchResult.bestMatch.confidence;
            result.identifiedFaces++;
            
            // Auto-verify if confidence is very high
            if (confidence >= 0.85) {
              isVerified = true;
            }
          } else {
            result.unidentifiedFaces++;
          }

          // Store face in photo_faces table
          const photoFace = await PhotoFaceDB.create({
            photo_id: photoId,
            person_id: personId,
            bounding_box: faceData.boundingBox,
            confidence: confidence,
            is_verified: isVerified
          });

          // Store face descriptor for future matching
          if (personId) {
            await FaceDescriptorDB.create({
              person_id: personId,
              descriptor: faceData.descriptor,
              photo_id: photoId,
              confidence: confidence
            });
          }

          result.faces.push({
            faceId: photoFace.id,
            personId: personId,
            personName: matchResult.bestMatch?.personName || 'Unknown',
            confidence: confidence,
            isVerified: isVerified,
            boundingBox: faceData.boundingBox
          });

        } catch (faceError) {
          result.errors.push(`Face ${i}: ${faceError.message}`);
          result.lowQualityFaces++;
        }
      }

      result.success = result.identifiedFaces > 0 || result.unidentifiedFaces > 0;
      result.processingTime = Date.now() - startTime;

      // Update statistics
      this.updateStats(result);

      // Emit events
      this.emit('photoProcessed', result);
      if (result.unidentifiedFaces > 0) {
        this.emit('unidentifiedFaces', { photoId, count: result.unidentifiedFaces });
      }

      return result;

    } catch (error) {
      result.errors.push(error.message);
      result.processingTime = Date.now() - startTime;
      this.stats.errorCount++;
      this.emit('processingError', { photoId, error: error.message });
      return result;
    }
  }

  /**
   * Process multiple photos in batch
   * 
   * @param {Array} photoBatch - Array of {photoId, faceDescriptors}
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Batch processing result
   */
  async processBatch(photoBatch, options = {}) {
    const {
      concurrency = 3,
      onProgress = null
    } = options;

    const batchResult = {
      totalPhotos: photoBatch.length,
      processed: 0,
      successful: 0,
      failed: 0,
      totalFacesDetected: 0,
      totalFacesIdentified: 0,
      totalUnidentified: 0,
      results: []
    };

    // Process in chunks for concurrency control
    for (let i = 0; i < photoBatch.length; i += concurrency) {
      const chunk = photoBatch.slice(i, i + concurrency);
      
      const chunkPromises = chunk.map(({ photoId, faceDescriptors }) => 
        this.processSinglePhoto(photoId, faceDescriptors, options)
      );

      const chunkResults = await Promise.allSettled(chunkPromises);
      
      for (const settledResult of chunkResults) {
        batchResult.processed++;
        
        if (settledResult.status === 'fulfilled') {
          const result = settledResult.value;
          batchResult.results.push(result);
          
          if (result.success) {
            batchResult.successful++;
            batchResult.totalFacesDetected += result.detectedFaces;
            batchResult.totalFacesIdentified += result.identifiedFaces;
            batchResult.totalUnidentified += result.unidentifiedFaces;
          } else {
            batchResult.failed++;
          }
        } else {
          batchResult.failed++;
          batchResult.results.push({
            success: false,
            errors: [settledResult.reason.message]
          });
        }

        // Call progress callback
        if (onProgress) {
          onProgress({
            processed: batchResult.processed,
            total: batchResult.totalPhotos,
            percentage: Math.round((batchResult.processed / batchResult.totalPhotos) * 100)
          });
        }
      }
    }

    return batchResult;
  }

  /**
   * Add photos to processing queue
   */
  async addToQueue(photos, options = {}) {
    const queueItem = {
      id: Date.now().toString(),
      photos,
      options,
      status: 'pending',
      addedAt: new Date(),
      result: null
    };

    this.queue.push(queueItem);
    this.emit('queueUpdated', { queueLength: this.queue.length });

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return queueItem.id;
  }

  /**
   * Process items in queue
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    this.emit('queueProcessingStarted');

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      item.status = 'processing';
      
      try {
        const result = await this.processBatch(item.photos, item.options);
        item.result = result;
        item.status = 'completed';
        this.emit('queueItemCompleted', item);
      } catch (error) {
        item.status = 'failed';
        item.error = error.message;
        this.emit('queueItemFailed', item);
      }
    }

    this.processing = false;
    this.emit('queueProcessingCompleted');
  }

  /**
   * Update processing statistics
   */
  updateStats(result) {
    this.stats.totalProcessed++;
    
    if (result.success) {
      this.stats.successCount++;
    } else {
      this.stats.errorCount++;
    }
    
    this.stats.unidentifiedFaces += result.unidentifiedFaces;
    
    // Update average processing time
    const totalTime = this.stats.averageProcessingTime * (this.stats.totalProcessed - 1);
    this.stats.averageProcessingTime = 
      (totalTime + result.processingTime) / this.stats.totalProcessed;
  }

  /**
   * Get current processing statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      isProcessing: this.processing
    };
  }

  /**
   * Get unidentified faces across all photos
   */
  async getUnidentifiedFaces(options = {}) {
    const { limit = 50, offset = 0, photoId = null } = options;
    
    const { supabase } = require('../server');
    
    let query = supabase
      .from('photo_faces')
      .select(`
        id,
        bounding_box,
        confidence,
        photo:photos (
          id,
          filename,
          public_url,
          title
        )
      `)
      .is('person_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (photoId) {
      query = query.eq('photo_id', photoId);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      faces: data,
      total: count,
      hasMore: count > offset + limit
    };
  }

  /**
   * Re-process failed or low-confidence faces
   */
  async reprocessFaces(faceIds, newThreshold = 0.5) {
    const results = [];
    
    for (const faceId of faceIds) {
      try {
        // Get face data
        const { supabase } = require('../server');
        const { data: face } = await supabase
          .from('photo_faces')
          .select('*, photo:photos(*)')
          .eq('id', faceId)
          .single();
        
        if (!face) {
          results.push({ faceId, success: false, error: 'Face not found' });
          continue;
        }
        
        // Get descriptor from face_descriptors table
        const { data: descriptors } = await supabase
          .from('face_descriptors')
          .select('descriptor')
          .eq('photo_id', face.photo_id)
          .limit(1);
        
        if (!descriptors || descriptors.length === 0) {
          results.push({ faceId, success: false, error: 'No descriptor found' });
          continue;
        }
        
        // Re-match with new threshold
        const matchResult = await matchFace(descriptors[0].descriptor, newThreshold);
        
        if (matchResult.bestMatch) {
          // Update face with new match
          await PhotoFaceDB.update(faceId, {
            person_id: matchResult.bestMatch.personId,
            confidence: matchResult.bestMatch.confidence,
            is_verified: false // Require manual verification
          });
          
          results.push({
            faceId,
            success: true,
            personId: matchResult.bestMatch.personId,
            personName: matchResult.bestMatch.personName,
            confidence: matchResult.bestMatch.confidence
          });
        } else {
          results.push({ faceId, success: false, error: 'No match found' });
        }
        
      } catch (error) {
        results.push({ faceId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Get face detection quality report for a photo
   */
  async getFaceQualityReport(photoId) {
    const { supabase } = require('../server');
    
    const { data: faces } = await supabase
      .from('photo_faces')
      .select(`
        id,
        confidence,
        bounding_box,
        is_verified,
        person:people (name, role)
      `)
      .eq('photo_id', photoId);
    
    if (!faces) return null;
    
    const report = {
      totalFaces: faces.length,
      identifiedFaces: faces.filter(f => f.person).length,
      unidentifiedFaces: faces.filter(f => !f.person).length,
      verifiedFaces: faces.filter(f => f.is_verified).length,
      highConfidence: faces.filter(f => f.confidence >= 0.8).length,
      mediumConfidence: faces.filter(f => f.confidence >= 0.6 && f.confidence < 0.8).length,
      lowConfidence: faces.filter(f => f.confidence < 0.6).length,
      averageConfidence: faces.reduce((sum, f) => sum + f.confidence, 0) / faces.length || 0,
      faces: faces.map(f => ({
        id: f.id,
        person: f.person?.name || 'Unknown',
        role: f.person?.role,
        confidence: f.confidence,
        isVerified: f.is_verified,
        size: f.bounding_box.width * f.bounding_box.height
      }))
    };
    
    return report;
  }
}

// Export singleton instance
const faceProcessingService = new FaceProcessingService();

module.exports = {
  faceProcessingService,
  FaceProcessingService
};

