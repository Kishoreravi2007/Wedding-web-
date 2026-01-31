require('dotenv').config({ path: __dirname + '/../.env' });
const AIService = require('../services/ai-service');

async function testAI() {
    console.log('🧪 Testing AI Bio Generation...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);

    try {
        const result = await AIService.generateBio({
            name: 'Test User',
            type: 'Wedding Host',
            draft: 'I am not married yet. I love planning events.'
        });

        console.log('\n✅ AI Response Received:');
        console.log('Model Used:', result.modelUsed);
        console.log('Is Mock:', result.isMock);
        console.log('Bio Content:', result.bio);

        if (result.isMock && process.env.GEMINI_API_KEY) {
            console.warn('\n⚠️ Note: System fell back to MOCK even though API key is present. Check model names or quota.');
        }
    } catch (error) {
        console.error('\n❌ AI Test Failed:');
        console.error(error);
    }
}

testAI();
