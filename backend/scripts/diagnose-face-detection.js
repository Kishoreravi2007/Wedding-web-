#!/usr/bin/env node

/**
 * Face Detection Deployment Diagnostics
 * 
 * Run this script to diagnose face detection issues in production
 * Usage: node scripts/diagnose-face-detection.js [production-url]
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    }).on('error', (err) => {
      resolve({
        status: 0,
        error: err.message,
        ok: false
      });
    });
  });
}

async function diagnose(productionUrl) {
  log('\n🔍 FACE DETECTION DEPLOYMENT DIAGNOSTICS\n', 'blue');
  log('='.repeat(50), 'blue');
  
  const baseUrl = productionUrl || 'http://localhost:5173';
  info(`Testing URL: ${baseUrl}\n`);
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Test 1: Check if models directory is accessible
  log('\n📁 Test 1: Model Files Accessibility', 'cyan');
  log('-'.repeat(50));
  
  const modelFiles = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1'
  ];
  
  for (const file of modelFiles) {
    const url = `${baseUrl}/models/${file}`;
    const result = await checkUrl(url);
    
    if (result.ok) {
      success(`${file} - Accessible (${result.status})`);
      results.passed++;
    } else if (result.error) {
      error(`${file} - Network Error: ${result.error}`);
      results.failed++;
    } else {
      error(`${file} - HTTP ${result.status}`);
      results.failed++;
    }
  }
  
  // Test 2: Check CORS headers
  log('\n🔒 Test 2: CORS Configuration', 'cyan');
  log('-'.repeat(50));
  
  const manifestUrl = `${baseUrl}/models/tiny_face_detector_model-weights_manifest.json`;
  const corsResult = await checkUrl(manifestUrl);
  
  if (corsResult.ok) {
    const corsHeader = corsResult.headers['access-control-allow-origin'];
    if (corsHeader) {
      success(`CORS header present: ${corsHeader}`);
      results.passed++;
    } else {
      warning('CORS header missing - may cause issues with cross-origin requests');
      results.warnings++;
    }
    
    const contentType = corsResult.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      success(`Content-Type correct: ${contentType}`);
      results.passed++;
    } else {
      warning(`Content-Type may be incorrect: ${contentType || 'not set'}`);
      results.warnings++;
    }
  } else {
    error('Cannot check CORS - model file not accessible');
    results.failed++;
  }
  
  // Test 3: Check if it's HTTPS
  log('\n🔐 Test 3: HTTPS Configuration', 'cyan');
  log('-'.repeat(50));
  
  if (baseUrl.startsWith('https://')) {
    success('Using HTTPS - Required for camera access');
    results.passed++;
  } else if (baseUrl.includes('localhost')) {
    warning('Using HTTP on localhost - OK for development');
    results.warnings++;
  } else {
    error('Using HTTP in production - Camera access will fail!');
    results.failed++;
  }
  
  // Test 4: Check local model files
  log('\n📦 Test 4: Local Model Files', 'cyan');
  log('-'.repeat(50));
  
  const publicModelsPath = path.join(__dirname, '../frontend/public/models');
  const distModelsPath = path.join(__dirname, '../frontend/dist/models');
  
  if (fs.existsSync(publicModelsPath)) {
    const files = fs.readdirSync(publicModelsPath);
    success(`public/models exists with ${files.length} files`);
    results.passed++;
  } else {
    error('public/models directory not found');
    results.failed++;
  }
  
  if (fs.existsSync(distModelsPath)) {
    const files = fs.readdirSync(distModelsPath);
    success(`dist/models exists with ${files.length} files`);
    results.passed++;
  } else {
    warning('dist/models directory not found - may need to build');
    results.warnings++;
  }
  
  // Test 5: Check environment files
  log('\n⚙️  Test 5: Environment Configuration', 'cyan');
  log('-'.repeat(50));
  
  const envFiles = [
    '../.env',
    '../.env.local',
    '../.env.production',
    '../frontend/.env',
    '../frontend/.env.local',
    '../frontend/.env.production'
  ];
  
  let foundEnv = false;
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, envFile);
    if (fs.existsSync(envPath)) {
      success(`Found ${envFile}`);
      foundEnv = true;
      
      const content = fs.readFileSync(envPath, 'utf-8');
      if (content.includes('VITE_MODEL_URL')) {
        success('  - Contains VITE_MODEL_URL');
      } else {
        warning('  - Missing VITE_MODEL_URL');
      }
      
      if (content.includes('VITE_API_BASE_URL')) {
        success('  - Contains VITE_API_BASE_URL');
      } else {
        warning('  - Missing VITE_API_BASE_URL');
      }
    }
  }
  
  if (foundEnv) {
    results.passed++;
  } else {
    warning('No environment files found');
    results.warnings++;
  }
  
  // Test 6: Check package.json dependencies
  log('\n📚 Test 6: Dependencies', 'cyan');
  log('-'.repeat(50));
  
  const packageJsonPath = path.join(__dirname, '../frontend/package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    if (pkg.dependencies && pkg.dependencies['face-api.js']) {
      success(`face-api.js: ${pkg.dependencies['face-api.js']}`);
      results.passed++;
    } else {
      error('face-api.js not found in dependencies');
      results.failed++;
    }
    
    if (pkg.dependencies && pkg.dependencies['@tensorflow/tfjs-core']) {
      success(`@tensorflow/tfjs-core: ${pkg.dependencies['@tensorflow/tfjs-core']}`);
      results.passed++;
    } else {
      warning('@tensorflow/tfjs-core not found - may be needed');
      results.warnings++;
    }
    
    // Check for problematic dependencies
    if (pkg.dependencies && pkg.dependencies['@tensorflow/tfjs-node']) {
      warning('@tensorflow/tfjs-node found - may cause issues in browser');
      results.warnings++;
    }
  }
  
  // Summary
  log('\n📊 DIAGNOSTIC SUMMARY', 'blue');
  log('='.repeat(50), 'blue');
  success(`Passed: ${results.passed}`);
  if (results.warnings > 0) warning(`Warnings: ${results.warnings}`);
  if (results.failed > 0) error(`Failed: ${results.failed}`);
  
  log('\n💡 RECOMMENDATIONS', 'yellow');
  log('-'.repeat(50));
  
  if (results.failed > 0) {
    log('\n1. Fix Critical Issues:', 'red');
    log('   - Ensure model files are accessible at /models/');
    log('   - Check static file serving configuration');
    log('   - Verify build process includes models directory');
    log('   - Add CORS headers for model files');
  }
  
  if (results.warnings > 0) {
    log('\n2. Address Warnings:', 'yellow');
    log('   - Set up HTTPS for production');
    log('   - Configure environment variables');
    log('   - Add proper MIME types for model files');
  }
  
  log('\n3. Next Steps:', 'cyan');
  log('   - Read FACE_DETECTION_DEPLOYMENT_DEBUG.md for detailed fixes');
  log('   - Run deployment checklist before going live');
  log('   - Test in production environment');
  log('   - Visit /debug/face-detection page in browser');
  
  log('\n' + '='.repeat(50) + '\n', 'blue');
  
  if (results.failed === 0) {
    success('All critical tests passed! ✨');
  } else {
    error(`${results.failed} critical issue(s) found. Fix before deployment.`);
  }
}

// Run diagnostics
const productionUrl = process.argv[2];

if (productionUrl && !productionUrl.startsWith('http')) {
  error('Invalid URL. Please provide full URL (http:// or https://)');
  process.exit(1);
}

diagnose(productionUrl).catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});

