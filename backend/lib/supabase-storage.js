const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase storage configuration missing!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload a file to Supabase Storage
 * @param {string} bucketName - Name of the bucket
 * @param {string} filePath - Path within the bucket (folder/filename)
 * @param {Buffer} buffer - File content
 * @param {string} mimeType - Content type
 */
async function uploadFile(bucketName, filePath, buffer, mimeType) {
    try {
        // Ensure bucket exists (optional, could be done once at startup)
        // await createBucketIfNotExists(bucketName);

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, buffer, {
                contentType: mimeType,
                upsert: true
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('❌ Supabase upload error:', error.message);
        throw error;
    }
}

/**
 * Delete a file from Supabase Storage
 */
async function deleteFile(bucketName, filePath) {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Supabase delete error:', error.message);
        throw error;
    }
}

/**
 * Get public URL for a file
 */
function getPublicUrl(bucketName, filePath) {
    const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
    return data.publicUrl;
}

/**
 * Ensure bucket exists and is public
 */
async function createBucketIfNotExists(bucketName) {
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) throw listError;

        const bucketExists = buckets.find(b => b.name === bucketName);
        if (!bucketExists) {
            console.log(`📡 Creating Supabase bucket: ${bucketName}...`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                allowedMimeTypes: ['image/*'],
                fileSizeLimit: 10485760 // 10MB
            });
            if (createError) throw createError;
            console.log(`✅ Bucket ${bucketName} created.`);
        }
    } catch (error) {
        console.error('❌ Error creating bucket:', error.message);
    }
}

module.exports = {
    uploadFile,
    deleteFile,
    getPublicUrl,
    createBucketIfNotExists
};
