const { calculatePremiumTotal } = require('./backend/lib/premium-pricing');

// Test Cases
const testCases = [
    { features: ['website'], duration: 1, name: '1 Month Website' },
    { features: ['website'], duration: 12, name: '12 Month Website (7x multiplier)' },
    { features: ['website', 'photo-gallery', 'mobile-app'], duration: 12, name: 'High Amount (Should be capped)' }
];

testCases.forEach(tc => {
    console.log(`--- Testing: ${tc.name} ---`);
    const result = calculatePremiumTotal(tc);
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('\n');
});
