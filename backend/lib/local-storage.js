/**
 * Local Disk Storage Service
 * 
 * Handles file uploads and retrieval from the local filesystem.
 * This is a drop-in replacement for gcs-storage.js.
 */

const fs = require('fs').promises;
const path = require('path');

// Root directory for uploads (relative to project root)
const UPLOADS_ROOT = path.join(__dirname, '..', process.env.LOCAL_STORAGE_PATH || 'uploads');

/**
 * Upload a file to local disk
 * @param {string} destination - Path relative to uploads root (e.g. 'sister-a/file.jpg')
 * @param {Buffer} buffer - File content
 * @param {string} mimetype - File MIME type (unused for local storage but kept for API compatibility)
 */
const uploadFile = async (destination, buffer, mimetype) => {
    console.log(`📂 LOCAL STORAGE: Attemping to save file to ${destination}`);
    try {
        const fullPath = path.join(UPLOADS_ROOT, destination);
        const dirPath = path.dirname(fullPath);

        // Ensure directory exists
        await fs.mkdir(dirPath, { recursive: true });

        // Save file
        await fs.writeFile(fullPath, buffer);
        console.log(`✅ File saved to local storage: ${destination}`);

        return getPublicUrl(destination);
    } catch (error) {
        console.error('Local Storage Upload Error:', error);
        throw error;
    }
};

/**
 * Delete a file from local disk
 * @param {string} destination - Path relative to uploads root
 */
const deleteFile = async (destination) => {
    try {
        const fullPath = path.join(UPLOADS_ROOT, destination);

        try {
            await fs.access(fullPath);
            await fs.unlink(fullPath);
            console.log(`🗑️ File deleted from local storage: ${destination}`);
        } catch (err) {
            // File doesn't exist, which is fine for a delete operation
            console.warn(`⚠️ File not found for deletion: ${destination}`);
        }

        return true;
    } catch (error) {
        console.error('Local Storage Delete Error:', error);
        throw error;
    }
};

/**
 * Get public URL for a file
 * @param {string} destination - Path relative to uploads root
 */
const getPublicUrl = (destination) => {
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
    // Normalize path to use forward slashes for URL
    const normalizedPath = destination.split(path.sep).join('/');
    return `${backendUrl}/uploads/${normalizedPath}`;
};

module.exports = {
    uploadFile,
    deleteFile,
    getPublicUrl
};
