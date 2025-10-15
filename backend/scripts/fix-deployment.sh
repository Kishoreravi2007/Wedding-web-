#!/bin/bash

# Automated Face Detection Deployment Fix Script
# This script attempts to automatically fix common deployment issues

set -e

echo "🔧 Face Detection Deployment Fix Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${NC}ℹ️  $1${NC}"
}

# 1. Check if models exist in public directory
info "Step 1: Checking model files..."
if [ -d "frontend/public/models" ]; then
    MODEL_COUNT=$(find frontend/public/models -type f | wc -l)
    success "Models directory exists with $MODEL_COUNT files"
else
    error "Models directory not found!"
    info "Downloading models..."
    
    mkdir -p frontend/public/models
    cd frontend/public/models
    
    # Download from face-api.js repository
    MODELS_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
    
    curl -O "$MODELS_URL/tiny_face_detector_model-weights_manifest.json"
    curl -O "$MODELS_URL/tiny_face_detector_model-shard1"
    curl -O "$MODELS_URL/face_landmark_68_model-weights_manifest.json"
    curl -O "$MODELS_URL/face_landmark_68_model-shard1"
    curl -O "$MODELS_URL/face_recognition_model-weights_manifest.json"
    curl -O "$MODELS_URL/face_recognition_model-shard1"
    curl -O "$MODELS_URL/face_recognition_model-shard2"
    curl -O "$MODELS_URL/face_expression_model-weights_manifest.json"
    curl -O "$MODELS_URL/face_expression_model-shard1"
    
    cd ../../..
    success "Models downloaded"
fi

# 2. Create/update environment file
info "Step 2: Checking environment configuration..."
if [ ! -f "frontend/.env.production" ]; then
    warning ".env.production not found, creating..."
    
    cat > frontend/.env.production << EOF
# Production Environment Variables
VITE_API_BASE_URL=https://your-api-domain.com
VITE_MODEL_URL=/models
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
    
    warning "Created .env.production - PLEASE UPDATE WITH YOUR VALUES!"
else
    success ".env.production exists"
fi

# 3. Update vite.config.ts
info "Step 3: Checking Vite configuration..."
VITE_CONFIG="frontend/vite.config.ts"

if [ -f "$VITE_CONFIG" ]; then
    # Check if publicDir is set
    if grep -q "publicDir.*public" "$VITE_CONFIG"; then
        success "Vite config looks good"
    else
        warning "Updating Vite config..."
        # Backup original
        cp "$VITE_CONFIG" "$VITE_CONFIG.backup"
        
        # This would need manual update - just warn user
        warning "Please ensure your vite.config.ts has publicDir: 'public'"
    fi
else
    warning "vite.config.ts not found - using defaults"
fi

# 4. Create model copy script
info "Step 4: Creating model copy script..."
cat > scripts/copy-models.js << 'EOF'
const fs = require('fs-extra');
const path = require('path');

const source = path.join(__dirname, '../frontend/public/models');
const dest = path.join(__dirname, '../frontend/dist/models');

console.log('Copying models...');
console.log('From:', source);
console.log('To:', dest);

if (!fs.existsSync(source)) {
  console.error('❌ Source models directory not found!');
  process.exit(1);
}

fs.copy(source, dest)
  .then(() => {
    console.log('✅ Models copied successfully');
    const files = fs.readdirSync(dest);
    console.log(`Copied ${files.length} files`);
  })
  .catch(err => {
    console.error('❌ Error copying models:', err);
    process.exit(1);
  });
EOF

chmod +x scripts/copy-models.js
success "Model copy script created"

# 5. Update package.json scripts
info "Step 5: Checking package.json scripts..."
if grep -q "copy-models" frontend/package.json; then
    success "Build script includes model copy"
else
    warning "Add 'node ../scripts/copy-models.js' to your build script"
fi

# 6. Build and verify
info "Step 6: Building project..."
cd frontend

if npm run build; then
    success "Build successful"
    
    # Check if models are in dist
    if [ -d "dist/models" ]; then
        DIST_MODEL_COUNT=$(find dist/models -type f | wc -l)
        success "Models in dist directory: $DIST_MODEL_COUNT files"
    else
        error "Models not in dist directory!"
        warning "Copying models manually..."
        node ../scripts/copy-models.js
    fi
else
    error "Build failed!"
    exit 1
fi

cd ..

# 7. Create nginx config template
info "Step 7: Creating nginx config template..."
cat > nginx-face-detection.conf << 'EOF'
# Nginx Configuration for Face Detection
# Copy relevant sections to your nginx config

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    root /var/www/your-app/frontend/dist;
    index index.html;
    
    # Models directory with CORS
    location /models/ {
        alias /var/www/your-app/frontend/dist/models/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        
        types {
            application/json json;
            application/octet-stream shard1 shard2;
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for face processing
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        
        # Large uploads
        client_max_body_size 20M;
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
EOF

success "Nginx config template created: nginx-face-detection.conf"

# 8. Create Express server config snippet
info "Step 8: Creating Express config snippet..."
cat > backend/config/face-detection-middleware.js << 'EOF'
/**
 * Face Detection Middleware for Express
 * Add this to your server.js
 */

const express = require('express');
const path = require('path');

function setupFaceDetection(app) {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Serve models with CORS
  app.use('/models', express.static(
    path.join(__dirname, '../../frontend/dist/models'),
    {
      setHeaders: (res, filePath) => {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        
        // MIME types
        if (filePath.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json');
        } else if (filePath.includes('-shard')) {
          res.setHeader('Content-Type', 'application/octet-stream');
        }
        
        // Cache
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  ));
  
  // Increase timeouts for face processing
  app.use('/api/photos-enhanced', (req, res, next) => {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000);
    next();
  });
  
  console.log('✅ Face detection middleware configured');
}

module.exports = { setupFaceDetection };
EOF

success "Express middleware created: backend/config/face-detection-middleware.js"

# Summary
echo ""
echo "========================================"
success "Fix script completed!"
echo ""
info "Next steps:"
echo "  1. Update frontend/.env.production with your values"
echo "  2. Review and apply nginx-face-detection.conf to your server"
echo "  3. Add face-detection-middleware.js to your backend/server.js:"
echo "     const { setupFaceDetection } = require('./config/face-detection-middleware');"
echo "     setupFaceDetection(app);"
echo "  4. Deploy and test"
echo ""
info "Run diagnostics:"
echo "  node scripts/diagnose-face-detection.js https://your-domain.com"
echo ""
echo "========================================"

