/**
 * Google Cloud Storage Service
 * 
 * Handles file uploads and retrieval from GCS bucket.
 */

const { Storage } = require('@google-cloud/storage');

// Initialize storage client
// Implicitly uses GOOGLE_APPLICATION_CREDENTIALS or default auth
const storage = new Storage();

const bucketName = process.env.GCS_BUCKET_NAME || 'wedding-photos';
const bucket = storage.bucket(bucketName);

/**
 * Upload a file to GCS
 * @param {string} destination - Path in bucket (e.g. 'folder/file.jpg')
 * @param {Buffer} buffer - File content
 * @param {string} mimetype - File MIME type
 */
const uploadFile = async (destination, buffer, mimetype) => {
    try {
        const file = bucket.file(destination);

        await file.save(buffer, {
            contentType: mimetype,
            resumable: false // For smaller files, false is faster
        });

        // Make public if needed, or rely on bucket-level access control
        // await file.makePublic(); 

        return getPublicUrl(destination);
    } catch (error) {
        console.error('GCS Upload Error:', error);
        throw error;
    }
};

/**
 * Delete a file from GCS
 * @param {string} path - Path in bucket
 */
const deleteFile = async (path) => {
    try {
        const file = bucket.file(path);
        const [exists] = await file.exists();
        if (exists) {
            await file.delete();
        }
        return true;
    } catch (error) {
        console.error('GCS Delete Error:', error);
        throw error;
    }
};

/**
 * Get public URL for a file
 * @param {string} path - Path in bucket
 */
const getPublicUrl = (path) => {
    // Assuming public bucket or CDN
    return `https://storage.googleapis.com/${bucketName}/${path}`;
};

module.exports = {
    uploadFile,
    deleteFile,
    getPublicUrl,
    bucket
};
