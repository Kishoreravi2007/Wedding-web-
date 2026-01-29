const express = require('express');
const router = express.Router();

// Initialize Gemini client if key is present
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
    } else {
        console.warn("⚠️ GEMINI_API_KEY is missing. AI features will run in MOCK mode.");
    }
} catch (e) {
    console.warn("⚠️ '@google/generative-ai' package not found. Running in MOCK mode only.");
}

/**
 * POST /api/ai/generate-bio
 * Generate a professional bio using Gemini
 */
router.post('/generate-bio', async (req, res) => {
    try {
        console.log('🤖 AI Bio Request Received (Gemini)');

        const { draft, name, type } = req.body || {};

        if (!draft) {
            return res.status(400).json({ message: 'Draft text is required' });
        }

        // --- MOCK MODE (If no Key or SDK) ---
        if (!genAI) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockBios = [
                `I am ${name || 'a professional'}, specializing in ${type || 'wedding services'}. With a passion for excellence, I dedicate myself to making every moment unforgettable.`,
                `Experienced ${type || 'provider'} with a keen eye for detail. ${name || 'I'} bring years of expertise to every project.`,
                `Passionate about ${type || 'weddings'}, I strive to tell your unique love story through my work.`
            ];
            const index = draft.length % mockBios.length;
            return res.json({
                bio: mockBios[index],
                isMock: true,
                message: "Generated (Mock Mode - Add GEMINI_API_KEY for Real AI)"
            });
        }

        // --- REAL AI MODE (Gemini) ---
        // Listing models specifically seen in the user's key list
        const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
        let lastError = null;

        const prompt = `You are a professional wedding industry copywriter. Rewrite the user's rough bio into a polished, professional, and engaging profile bio for a wedding vendor (photographer, planner, etc). Keep it under 500 words. Tone: Warm, Professional, Trustworthy.

User Info:
Name: ${name}
Service Type: ${type}
Rough Draft: ${draft}

Professional Bio:`;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI] Attempting ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const generatedBio = response.text().trim();

                console.log(`[AI] ✅ SUCCESS with ${modelName}`);
                return res.json({
                    bio: generatedBio,
                    isMock: false,
                    modelUsed: modelName
                });
            } catch (apiError) {
                console.warn(`[AI] ❌ Model ${modelName} failed:`, apiError.message);
                lastError = apiError;
                // If it's a 404, we definitely want to try the next one
                // If it's a 429, we still try the next one as different models have different limits
                continue;
            }
        }

        // If we reach here, all models failed
        throw lastError || new Error("All AI models failed to respond.");

    } catch (error) {
        console.error('AI Generation General Error:', error);
        res.status(500).json({
            message: 'Failed to generate bio',
            error: error.message,
            tip: "Check if your GEMINI_API_KEY is valid and has generous rate limits."
        });
    }
});

module.exports = router;
