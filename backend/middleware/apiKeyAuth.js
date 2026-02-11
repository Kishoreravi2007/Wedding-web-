/**
 * Shared API Key Authentication Middleware
 * 
 * Authenticates requests using photographer API keys stored in Cloud SQL.
 */

const { query } = require('../lib/db-gcp');

/**
 * Authenticate photographer via API key
 * Extracts Bearer token, validates against DB, 
 * and attaches photographer context to request.
 */
async function authenticateApiKey(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Missing or invalid Authorization header. Use: Authorization: Bearer <api_key>'
            });
        }

        const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Find the API key in database (Cloud SQL)
        const { rows } = await query(
            `SELECT pk.id, pk.photographer_id, pk.is_active, pk.expires_at, u.wedding_id 
       FROM photographer_api_keys pk
       JOIN users u ON pk.photographer_id = u.id
       WHERE pk.api_key = $1 AND pk.is_active = true`,
            [apiKey]
        );

        const keyData = rows[0];

        if (!keyData) {
            return res.status(401).json({
                message: 'Invalid or inactive API key'
            });
        }

        // Check expiration
        if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
            return res.status(401).json({
                message: 'API key has expired'
            });
        }

        // Update last_used_at (non-blocking)
        query('UPDATE photographer_api_keys SET last_used_at = NOW() WHERE id = $1', [keyData.id])
            .catch(err => console.error('Error updating API key last_used_at:', err));

        // Attach photographer info and their assigned wedding context to request
        req.photographer = {
            id: keyData.photographer_id,
            apiKeyId: keyData.id,
            weddingId: keyData.wedding_id
        };

        next();
    } catch (error) {
        console.error('API key authentication error:', error);
        res.status(500).json({
            message: 'Authentication error',
            error: error.message
        });
    }
}

module.exports = authenticateApiKey;
