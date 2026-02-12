const { calculatePremiumTotal, FEATURE_CATALOG } = require('./lib/premium-pricing');

console.log('--- Testing Pricing Logic ---');

const testFeature = 'website';
const featuresInCatalog = FEATURE_CATALOG.map(f => f.key);
console.log('Catalog Keys (first 5):', featuresInCatalog.slice(0, 5));
console.log(`Is '${testFeature}' in catalog?`, featuresInCatalog.includes(testFeature));

const input = { features: [testFeature], duration: 1 };
console.log(`Testing calculation with:`, JSON.stringify(input));

const result = calculatePremiumTotal(input);
console.log('Result:', JSON.stringify(result, null, 2));

if (result.total > 0) {
    console.log('✅ Pricing logic works!');
} else {
    console.error('❌ Pricing logic returned 0!');
}
