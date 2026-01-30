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

        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI Service] Attempting ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().trim();

                if (!text) {
                    throw new Error(`Empty response from model ${modelName}`);
                }

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

        console.warn(`[AI Service] ⚠️ All models failed. Falling back to MOCK content.`);
        return {
            text: mockContent,
            isMock: true,
            modelUsed: "fallback-mock"
        };
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
    },

    /**
     * Generate a professional support response to a user's email enquiry
     * @param {Object} context - { from, subject, body }
     * @returns {Promise<Object>} - { text, isMock }
     */
    async generateSupportResponse(context) {
        const { from, subject, body } = context;

        const prompt = `You are "WeddingWeb AI Support", a highly organized and friendly support agent.
        Your goal is to reply to a support enquiry from ${from || 'a user'}.

        CRITICAL SECURITY & CONTEXT RULES:
        1. YOU ONLY REPRESENT WEDDINGWEB (weddingweb.co.in).
        2. IF THE EMAIL IS NOT RELATED TO WEDDINGWEB OR WEDDING INDUSTRY SERVICES, YOU MUST REPLY WITH: 
           "I'm sorry, I can only assist with queries related to WeddingWeb and our wedding service platform. I apologize for any inconvenience." 
           (Do not attempt to answer unrelated questions).
        3. Platform Features for reference: 
           - Digital Wedding Invites & Portfolios
           - Vendor Listings (Photographers, Planners, etc.)
           - Face Recognition Photo Galleries
           - AI Bio Generator for Professionals
           - Real-time Notifications for Leads
           - Two-Factor Authentication (2FA) security
        4. Tone: Helpful, empathetic, and professional.
        5. Structure: Greet them, address their specific question if it's WeddingWeb-related, and offer further help if needed.

        Inbound Email:
        From: ${from}
        Subject: ${subject}
        Content: ${body}

        WeddingWeb AI Support Response (Start immediately):`;

        let mockResponse = `Hi there! Thank you for reaching out to WeddingWeb Support regarding "${subject}". One of our team members (or our AI) will look into this shortly. We are here to help you make your wedding digital and organized!`;

        // Smart Mock: If it looks totally unrelated, provide the refusal in mock mode too
        const lowBody = body.toLowerCase();
        const lowSub = subject.toLowerCase();
        const keywords = ['wedding', 'invite', 'photo', 'portfolio', 'vendor', 'support', 'help', 'account', 'login', '2fa', 'bio'];
        const isRelated = keywords.some(k => lowBody.includes(k) || lowSub.includes(k));

        if (!isRelated) {
            mockResponse = "I'm sorry, I can only assist with queries related to WeddingWeb and our wedding service platform. I apologize for any inconvenience.";
        }

        const result = await this.generateContent(prompt, mockResponse);

        return {
            text: this.cleanResponse(result.text),
            isMock: result.isMock,
            modelUsed: result.modelUsed
        };
    }
};

module.exports = AIService;
