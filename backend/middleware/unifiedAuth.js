/**
 * Unified Authentication Middleware
 * 
 * Supports both Photographer API Keys (for Desktop App) 
 * and JWT Tokens (for Photographer Portal).
 */

const { query } = require('../lib/db-gcp');
const { TokenManager } = require('../lib/secure-auth');

async function unifiedAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Missing or invalid Authorization header'
            });
        }

        const token = authHeader.substring(7);

        // 1. Try API Key Authentication First (Cloud SQL)
        const { rows } = await query(
            `SELECT pk.id, pk.photographer_id, pk.is_active, pk.expires_at, u.wedding_id 
             FROM photographer_api_keys pk
             JOIN users u ON pk.photographer_id = u.id
             WHERE pk.api_key = $1 AND pk.is_active = true`,
            [token]
        );

        if (rows.length > 0) {
            const keyData = rows[0];

            // Check expiration
            if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
                return res.status(401).json({ message: 'API key has expired' });
            }

            // Update last_used_at (non-blocking)
            query('UPDATE photographer_api_keys SET last_used_at = NOW() WHERE id = $1', [keyData.id])
                .catch(err => console.error('Error updating API key last_used_at:', err));

            // Attach photographer context
            req.photographer = {
                id: keyData.photographer_id,
                apiKeyId: keyData.id,
                weddingId: keyData.wedding_id,
                authType: 'api_key'
            };

            return next();
        }

        // 2. Fallback to JWT Authentication
        try {
            const user = await TokenManager.verifyToken(token);

            // Attach user context in a way compatible with photographer logic
            // Photographers logged in via JWT also have a wedding_id
            req.photographer = {
                id: user.id,
                weddingId: user.wedding_id,
                authType: 'jwt'
            };
            req.user = user; // Also set req.user for standard JWT logic

            return next();
        } catch (jwtError) {
            // If both failed
            return res.status(401).json({
                message: 'Invalid or expired authentication (API Key or Token)',
                details: jwtError.message
            });
        }

    } catch (error) {
        console.error('Unified authentication error:', error);
        res.status(500).json({
            message: 'Authentication error',
            error: error.message
        });
    }
}

module.exports = unifiedAuth;
