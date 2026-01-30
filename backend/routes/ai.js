const express = require('express');
const router = express.Router();
const AIService = require('../services/ai-service');
const { authMiddleware } = require('../lib/secure-auth');

/**
 * POST /api/ai/generate-bio
 * Generate a professional bio using Gemini
 */
router.post('/generate-bio', authMiddleware.verifyToken, async (req, res) => {
    try {
        console.log('🤖 AI Bio Request Received');

        const { draft, name, type } = req.body || {};

        if (!draft) {
            return res.status(400).json({ message: 'Draft text is required' });
        }

        const result = await AIService.generateBio({ name, type, draft });

        return res.json({
            bio: result.bio,
            isMock: result.isMock,
            modelUsed: result.modelUsed
        });

    } catch (error) {
        console.error('AI Generation General Error:', error);
        res.status(500).json({
            message: 'Failed to generate bio',
            error: error.message
        });
    }
});

module.exports = router;
