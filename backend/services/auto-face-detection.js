/**
 * Automatic Face Detection Service
 * 
 * Automatically processes uploaded photos for face detection
 * Runs the clustering script when new photos are uploaded
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class AutoFaceDetection {
  constructor() {
    this.processing = new Set(); // Track which galleries are being processed
    this.queue = new Map(); // Queue for pending processing jobs
  }

  /**
   * Trigger face detection for a specific gallery
   */
  async triggerFaceDetection(sister) {
    const galleryKey = sister; // 'sister-a' or 'sister-b'
    
    // Prevent duplicate processing
    if (this.processing.has(galleryKey)) {
      console.log(`⏳ Face detection already running for ${galleryKey}, queuing...`);
      this.queue.set(galleryKey, Date.now());
      return { status: 'queued', message: `Face detection queued for ${galleryKey}` };
    }

    this.processing.add(galleryKey);

    try {
      console.log(`🔍 Starting automatic face detection for ${galleryKey}...`);
      
      const result = await this.runClusteringScript(sister);
      
      console.log(`✅ Face detection completed for ${galleryKey}`);
      console.log(`   Detected ${result.guestsFound} guests`);
      
      this.processing.delete(galleryKey);
      
      // Check if there's a queued job for this gallery
      if (this.queue.has(galleryKey)) {
        this.queue.delete(galleryKey);
        console.log(`🔄 Processing queued job for ${galleryKey}...`);
        // Run again for newly uploaded photos
        setTimeout(() => this.triggerFaceDetection(sister), 1000);
      }
      
      return {
        status: 'completed',
        message: `Face detection completed for ${galleryKey}`,
        guestsFound: result.guestsFound
      };
      
    } catch (error) {
      console.error(`❌ Face detection failed for ${galleryKey}:`, error.message);
      this.processing.delete(galleryKey);
      throw error;
    }
  }

  /**
   * Run the Python clustering script
   */
  async runClusteringScript(sister) {
    return new Promise((resolve, reject) => {
      const sisterName = sister.replace('-', '_'); // sister-a -> sister_a
      const projectRoot = path.join(__dirname, '../..');
      
      const args = [
        path.join(projectRoot, 'backend/cluster_faces.py'),
        '--gallery', `uploads/wedding_gallery/${sisterName}`,
        '--output', `backend/reference_images/${sisterName}`,
        '--mapping', `backend/guest_mapping_${sisterName}.json`
      ];

      console.log(`Running: python3 ${args.join(' ')}`);

      const pythonProcess = spawn('python3', args, {
        cwd: projectRoot,
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(`[Face Detection ${sister}]`, output.trim());
      });

      pythonProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        // Only log actual errors, not warnings
        if (!output.includes('Warning') && !output.includes('NotOpenSSLWarning')) {
          console.error(`[Face Detection ${sister} Error]`, output.trim());
        }
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          // Parse output to find number of guests
          const guestsMatch = stdout.match(/Found (\d+) unique guests/);
          const guestsFound = guestsMatch ? parseInt(guestsMatch[1]) : 0;
          
          resolve({
            success: true,
            guestsFound,
            output: stdout
          });
        } else {
          reject(new Error(`Python script exited with code ${code}\n${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  /**
   * Check if clustering has been run for a gallery
   */
  async hasBeenClustered(sister) {
    try {
      const sisterName = sister.replace('-', '_');
      const mappingFile = path.join(__dirname, '..', `guest_mapping_${sisterName}.json`);
      await fs.access(mappingFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get statistics for a gallery
   */
  async getStats(sister) {
    try {
      const sisterName = sister.replace('-', '_');
      const mappingFile = path.join(__dirname, '..', `guest_mapping_${sisterName}.json`);
      const mappingData = await fs.readFile(mappingFile, 'utf8');
      const mapping = JSON.parse(mappingData);
      
      const guestCount = Object.keys(mapping).length;
      const photoCount = new Set(Object.values(mapping).flat()).size;
      
      return {
        guestCount,
        photoCount,
        lastProcessed: (await fs.stat(mappingFile)).mtime
      };
    } catch (error) {
      return null;
    }
  }
}

// Create singleton instance
const autoFaceDetection = new AutoFaceDetection();

module.exports = autoFaceDetection;

