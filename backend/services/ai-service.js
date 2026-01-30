const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Service for WeddingWeb
 * Centralizes Gemini AI logic for bio generation and email content.
 */

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn("⚠️ GEMINI_API_KEY is missing. AI features will run in MOCK mode.");
}

const AIService = {
    /**
     * Clean AI response from unwanted artifacts (Markdown, prefixes, etc.)
     * @param {string} text - The raw AI response
     * @returns {string} - Cleaned text
     */
    cleanResponse(text) {
        if (!text) return "";

        let cleaned = text
            // Remove Markdown bold/italic
            .replace(/[*_]{1,2}/g, "")
            // Remove common AI prefixes/conversational filler
            .replace(/^(here is a|here is the|refined bio:|professional bio:|of course!|surely!|as a professional|as an ai|certainly!)\s*/i, "")
            // Remove quotes if the whole thing is quoted
            .replace(/^"(.*)"$/s, "$1")
            // Remove code blocks
            .replace(/```[a-z]*\n?([\s\S]*?)\n?```/g, "$1")
            // Final trim
            .trim();

        return cleaned;
    },

    /**
     * Generate content using Gemini
     * @param {string} prompt - The prompt for Gemini
     * @param {string} mockContent - Fallback content for mock mode
     * @returns {Promise<Object>} - { text, modelUsed, isMock }
     */
    async generateContent(prompt, mockContent = "AI Content Placeholder") {
        if (!genAI) {
            console.log("🤖 AI Service: Running in MOCK mode");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                text: mockContent,
                isMock: true,
                modelUsed: "mock"
            };
        }

        const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI Service] Attempting ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().trim();

                console.log(`[AI Service] ✅ SUCCESS with ${modelName}`);
                return {
                    text,
                    isMock: false,
                    modelUsed: modelName
                };
            } catch (apiError) {
                console.warn(`[AI Service] ❌ Model ${modelName} failed:`, apiError.message);
                lastError = apiError;
                continue;
            }
        }

        throw lastError || new Error("All AI models failed to respond.");
    },

    /**
     * Generate a welcome email for a new user
     * @param {string} name - User's name
     * @returns {Promise<Object>} - { subject, body }
     */
    async generateWelcomeEmail(name) {
        const prompt = `You are a warm and professional community manager for WeddingWeb. 
        Write a welcoming, engaging welcome email for a new user named "${name}" who just joined our platform.
        WeddingWeb is a digital platform for couples and wedding vendors (photographers, planners, etc).
        
        Requirements:
        1. Tone: Warm, exciting, and professional.
        2. Keep it concise (3-4 short paragraphs).
        3. Mention that they can now manage their wedding details or professional profile.
        4. Subject line should be catchy.
        
        Output format:
        Subject: [Catchy Subject]
        Body: [Email Content]`;

        const mockBody = `Hi ${name}, welcome to WeddingWeb! We're thrilled to have you join our community. Whether you're planning your big day or showcasing your professional services, we're here to help you every step of the way.`;

        const result = await this.generateContent(prompt, `Subject: Welcome to the Family, ${name}! 💍\n\nBody: ${mockBody}`);

        // Parse subject and body
        const text = result.text;
        const subjectMatch = text.match(/Subject:\s*(.*)/i);
        const bodyMatch = text.match(/Body:\s*([\s\S]*)/i);

        return {
            subject: subjectMatch ? subjectMatch[1].trim() : `Welcome to WeddingWeb, ${name}! 💍`,
            body: bodyMatch ? bodyMatch[1].trim() : text,
            isMock: result.isMock
        };
    },

    /**
     * Generate a refined professional bio
     * @param {Object} context - { name, type, draft }
     * @returns {Promise<Object>} - { bio, isMock }
     */
    async generateBio(context) {
        const { name, type, draft } = context;

        const prompt = `You are an elite high-end wedding industry copywriter. 
        Your goal is to transform a rough draft into a MASTERPIECE professional biography for a wedding vendor profile.

        Rules for the Bio:
        1. Tone: Sophisticated, passionate, yet approachable. Avoid corporate jargon.
        2. Structure: Start with a strong hook about their passion/philosophy. Mention their name ("${name || 'I'}") and specialty ("${type || 'wedding services'}").
        3. Flow: Use varied sentence structure to create a professional rhythm.
        4. Goal: Make the couple feel like they HAVE to book this person.
        5. Length: Keep it under 500 words. Do NOT use bullet points.
        6. NO Markdown: Do not use asterisks (*), hashtags (#), or any formatting tags.
        7. NO intro/outro: Do not say "Here is your bio" or "Hope this helps". Start immediately with the biography.

        User Info:
        - Professional Name: ${name}
        - Service Category: ${type}
        - Rough Source Content: ${draft}

        Refined Professional Biography (Start immediately):`;

        const mockBio = `I am ${name || 'a professional'}, specializing in ${type || 'wedding services'}. With a passion for excellence, i dedicate myself to making every moment unforgettable.`;

        const result = await this.generateContent(prompt, mockBio);

        return {
            bio: this.cleanResponse(result.text),
            isMock: result.isMock,
            modelUsed: result.modelUsed
        };
    }
};

module.exports = AIService;
