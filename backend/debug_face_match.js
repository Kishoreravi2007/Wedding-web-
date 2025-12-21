/**
 * Debug script to check face matching accuracy
 * Run this to see what's happening with face matching
 */

const { matchFace } = require('./lib/face-recognition');

async function debugFaceMatch() {
  console.log('🔍 Face Matching Debug Tool');
  console.log('=' .repeat(60));
  
  // Example: Test with a sample descriptor (128 zeros for testing)
  // In real usage, you'd use an actual face descriptor
  const testDescriptor = new Array(128).fill(0.1);
  
  console.log('\n1. Testing with lenient threshold (0.6):');
  const result1 = await matchFace(testDescriptor, 0.6, 'sister-a');
  console.log(`   Matches found: ${result1.matches.length}`);
  if (result1.bestMatch) {
    console.log(`   Best match distance: ${result1.bestMatch.distance.toFixed(4)}`);
    console.log(`   Best match confidence: ${((1 - result1.bestMatch.distance) * 100).toFixed(1)}%`);
  }
  
  console.log('\n2. Testing with strict threshold (0.3):');
  const result2 = await matchFace(testDescriptor, 0.3, 'sister-a');
  console.log(`   Matches found: ${result2.matches.length}`);
  if (result2.bestMatch) {
    console.log(`   Best match distance: ${result2.bestMatch.distance.toFixed(4)}`);
    console.log(`   Best match confidence: ${((1 - result2.bestMatch.distance) * 100).toFixed(1)}%`);
  }
  
  console.log('\n3. Testing with ultra strict threshold (0.25):');
  const result3 = await matchFace(testDescriptor, 0.25, 'sister-a');
  console.log(`   Matches found: ${result3.matches.length}`);
  if (result3.bestMatch) {
    console.log(`   Best match distance: ${result3.bestMatch.distance.toFixed(4)}`);
    console.log(`   Best match confidence: ${((1 - result3.bestMatch.distance) * 100).toFixed(1)}%`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 Tips:');
  console.log('   - Distance < 0.25 = Excellent match (75%+ confidence)');
  console.log('   - Distance 0.25-0.3 = Good match (70-75% confidence)');
  console.log('   - Distance > 0.3 = Poor match (<70% confidence)');
  console.log('   - If wrong photos appear, check the distance values above');
}

// Run if called directly
if (require.main === module) {
  debugFaceMatch().catch(console.error);
}

module.exports = { debugFaceMatch };

