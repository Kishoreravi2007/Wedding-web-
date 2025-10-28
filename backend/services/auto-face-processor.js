/**
 * Automated Face Detection Service
 * 
 * Automatically processes photos in the background to extract face descriptors.
 * Runs on server startup and can be triggered via API.
 * 
 * IMPORTANT: This service queues photos for processing but doesn't do the actual
 * face detection (which requires browser environment). Instead, it provides an API
 * that the frontend Face Processor can call to get the list of unprocessed photos.
 */

const { PhotoDB, FaceDescriptorDB, PhotoFaceDB } = require('../lib/supabase-db');

class AutoFaceProcessor {
  constructor() {
    this.isProcessing = false;
    this.processingQueue = [];
    this.stats = {
      totalProcessed: 0,
      totalFaces: 0,
      errors: 0,
      lastRun: null,
      lastCheck: null
    };
  }

  /**
   * Check if there are photos that need processing
   */
  async checkUnprocessedPhotos() {
    try {
      const allPhotos = await PhotoDB.findAll();
      const unprocessedPhotos = [];

      for (const photo of allPhotos) {
        const faces = await PhotoFaceDB.findByPhotoId(photo.id);
        if (!faces || faces.length === 0) {
          unprocessedPhotos.push(photo);
        }
      }

      this.stats.lastCheck = new Date();
      return unprocessedPhotos;
    } catch (error) {
      console.error('Error checking unprocessed photos:', error);
      return [];
    }
  }

  /**
   * Mark a photo as processed (called by frontend after face detection)
   */
  async markPhotoProcessed(photoId, facesCount) {
    try {
      this.stats.totalProcessed++;
      this.stats.totalFaces += facesCount;
      return { success: true };
    } catch (error) {
      console.error('Error marking photo as processed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unprocessed photos for processing
   */
  async getUnprocessedPhotosList() {
    try {
      const unprocessedPhotos = await this.checkUnprocessedPhotos();
      
      console.log(`\n📊 Face Detection Status Check:`);
      console.log(`   Total unprocessed photos: ${unprocessedPhotos.length}`);
      
      return {
        status: 'success',
        unprocessedPhotos: unprocessedPhotos,
        count: unprocessedPhotos.length,
        needsProcessing: unprocessedPhotos.length > 0
      };
    } catch (error) {
      console.error('Error getting unprocessed photos:', error);
      return {
        status: 'error',
        error: error.message,
        unprocessedPhotos: [],
        count: 0
      };
    }
  }

  /**
   * Auto-check on startup
   */
  async checkOnStartup() {
    try {
      console.log('\n🤖 AUTO FACE DETECTION - Startup Check');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const unprocessedPhotos = await this.checkUnprocessedPhotos();
      
      if (unprocessedPhotos.length === 0) {
        console.log('✅ All photos have face descriptors!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        console.log(`⚠️  Found ${unprocessedPhotos.length} photo(s) without face descriptors`);
        console.log('\n📋 These photos need processing:');
        unprocessedPhotos.slice(0, 5).forEach((photo, i) => {
          console.log(`   ${i + 1}. ${photo.filename}`);
        });
        if (unprocessedPhotos.length > 5) {
          console.log(`   ... and ${unprocessedPhotos.length - 5} more`);
        }
        console.log('\n💡 Automatic processing will begin when:');
        console.log('   1. A photographer opens the Face Processor tool');
        console.log('   2. Or trigger via API: POST /api/auto-face-detection/trigger');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }

      return { count: unprocessedPhotos.length, photos: unprocessedPhotos };
    } catch (error) {
      console.error('Error during startup check:', error);
      return { count: 0, photos: [] };
    }
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      ...this.stats,
      isProcessing: this.isProcessing,
      queueLength: this.processingQueue.length
    };
  }

  /**
   * Record processing completion (called by frontend)
   */
  recordProcessing(photosProcessed, facesFound, errors = 0) {
    this.stats.totalProcessed += photosProcessed;
    this.stats.totalFaces += facesFound;
    this.stats.errors += errors;
    this.stats.lastRun = new Date();
  }
}

// Singleton instance
const autoFaceProcessor = new AutoFaceProcessor();

module.exports = autoFaceProcessor;

