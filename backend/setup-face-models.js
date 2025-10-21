/**
 * Face Detection Models Setup Script
 * 
 * This script downloads the required face-api.js models
 * and places them in the correct directory for the face detection feature.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Model URLs and file paths
const models = [
  {
    name: 'tiny_face_detector_model',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
    filename: 'tiny_face_detector_model-weights_manifest.json'
  },
  {
    name: 'tiny_face_detector_model_shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',
    filename: 'tiny_face_detector_model-shard1'
  },
  {
    name: 'face_landmark_68_model',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
    filename: 'face_landmark_68_model-weights_manifest.json'
  },
  {
    name: 'face_landmark_68_model_shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',
    filename: 'face_landmark_68_model-shard1'
  },
  {
    name: 'face_recognition_model',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json',
    filename: 'face_recognition_model-weights_manifest.json'
  },
  {
    name: 'face_recognition_model_shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1',
    filename: 'face_recognition_model-shard1'
  },
  {
    name: 'face_recognition_model_shard2',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2',
    filename: 'face_recognition_model-shard2'
  },
  {
    name: 'face_expression_model',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json',
    filename: 'face_expression_model-weights_manifest.json'
  },
  {
    name: 'face_expression_model_shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1',
    filename: 'face_expression_model-shard1'
  }
];

// Create models directory
const modelsDir = path.join(__dirname, '..', 'frontend', 'public', 'models');

async function setupFaceModels() {
  console.log('🤖 Setting up Face Detection Models');
  console.log('===================================\n');
  
  try {
    // Create models directory
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
      console.log('✅ Created models directory');
    } else {
      console.log('ℹ️  Models directory already exists');
    }
    
    // Download each model
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const filePath = path.join(modelsDir, model.filename);
      
      // Skip if file already exists
      if (fs.existsSync(filePath)) {
        console.log(`ℹ️  ${model.filename} already exists, skipping...`);
        continue;
      }
      
      console.log(`📥 Downloading ${model.filename}...`);
      
      try {
        await downloadFile(model.url, filePath);
        console.log(`✅ Downloaded ${model.filename}`);
      } catch (error) {
        console.error(`❌ Failed to download ${model.filename}:`, error.message);
      }
    }
    
    // Verify all models are present
    console.log('\n🔍 Verifying models...');
    let allModelsPresent = true;
    
    for (const model of models) {
      const filePath = path.join(modelsDir, model.filename);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing: ${model.filename}`);
        allModelsPresent = false;
      } else {
        console.log(`✅ Found: ${model.filename}`);
      }
    }
    
    if (allModelsPresent) {
      console.log('\n🎉 Face Detection Models Setup Complete!');
      console.log('=====================================');
      console.log('');
      console.log('✅ All models downloaded successfully');
      console.log('✅ Models are ready for face detection');
      console.log('✅ Face detection feature is ready to use');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('   1. Start your frontend server');
      console.log('   2. Navigate to /face-detection.html');
      console.log('   3. Upload a photo or start webcam');
      console.log('   4. Enjoy real-time face detection!');
      console.log('');
      console.log('🔧 Model Files Location:');
      console.log(`   ${modelsDir}`);
      console.log('');
      console.log('📊 Models Included:');
      console.log('   - TinyFaceDetector: Fast face detection');
      console.log('   - FaceLandmark68Net: Facial landmark detection');
      console.log('   - FaceRecognitionNet: Face recognition');
      console.log('   - FaceExpressionNet: Emotion detection');
    } else {
      console.log('\n❌ Some models are missing. Please check the download errors above.');
    }
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify the models directory is writable');
    console.error('   3. Try running the script again');
    process.exit(1);
  }
}

// Download file from URL
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (error) => {
        fs.unlink(filePath, () => {}); // Delete partial file
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Run the setup
setupFaceModels();
