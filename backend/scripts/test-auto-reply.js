/**
 * Test Script for AI Auto-Reply Flow
 * 
 * Verifies that the AI correctly filters content and generates appropriate responses.
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const AIService = require('../services/ai-service');

async function testAutoReplyFlow() {
    console.log('🧪 Starting AI Auto-Reply Verification...');

    const testCases = [
        {
            name: 'Valid WeddingWeb Query',
            from: 'test@example.com',
            subject: 'How do I add a portfolio?',
            body: 'Hi, I just signed up. How can I upload photos to my professional portfolio?',
            expectedType: 'support'
        },
        {
            name: 'Unrelated Query (Spam/Off-topic)',
            from: 'spam@irrelevant.com',
            subject: 'Best pizza in Palakkad?',
            body: 'Hey, do you know where I can get the best pizza in Palakkad city?',
            expectedType: 'refusal'
        },
        {
            name: 'Mixed Query',
            from: 'couple@planning.com',
            subject: 'Invite features and weather',
            body: 'Does your digital invite support face recognition? Also, do you think it will rain tomorrow in Kerala?',
            expectedType: 'support'
        }
    ];

    for (const test of testCases) {
        console.log(`\n--- Test Case: ${test.name} ---`);
        console.log(`From: ${test.from} | Subject: ${test.subject}`);

        try {
            const result = await AIService.generateSupportResponse({
                from: test.from,
                subject: test.subject,
                body: test.body
            });

            console.log('AI RESPONSE:');
            console.log('--------------------------------------------------');
            console.log(result.text);
            console.log('--------------------------------------------------');

            const isRefusal = result.text.includes("I'm sorry, I can only assist with queries related to WeddingWeb");

            if (test.expectedType === 'refusal' && !isRefusal) {
                console.error('❌ FAILED: AI should have refused this query.');
            } else if (test.expectedType === 'support' && isRefusal) {
                console.error('❌ FAILED: AI should have provided support for this query.');
            } else {
                console.log('✅ SUCCESS: AI responded appropriately.');
            }

        } catch (error) {
            console.error(`❌ ERROR in test case ${test.name}:`, error.message);
        }
    }

    console.log('\n🌟 AI FLOW VERIFICATION COMPLETE 🌟');
    process.exit(0);
}

testAutoReplyFlow();
