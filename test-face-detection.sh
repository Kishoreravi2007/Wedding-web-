#!/bin/bash

# Test script for face detection system
# This script verifies that all components are working correctly

echo "🔍 Testing Face Detection System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if reference images exist
echo "📁 Checking reference images..."
if [ -d "backend/reference_images/sister_a" ]; then
    SISTER_A_COUNT=$(ls -1 backend/reference_images/sister_a | wc -l)
    echo -e "${GREEN}✓${NC} Sister A: $SISTER_A_COUNT guests detected"
else
    echo -e "${RED}✗${NC} Sister A reference images not found"
fi

if [ -d "backend/reference_images/sister_b" ]; then
    SISTER_B_COUNT=$(ls -1 backend/reference_images/sister_b | wc -l)
    echo -e "${GREEN}✓${NC} Sister B: $SISTER_B_COUNT guests detected"
else
    echo -e "${RED}✗${NC} Sister B reference images not found"
fi

echo ""

# Check if guest mappings exist
echo "📋 Checking guest mappings..."
if [ -f "backend/guest_mapping_sister_a.json" ]; then
    echo -e "${GREEN}✓${NC} Sister A guest mapping exists"
else
    echo -e "${RED}✗${NC} Sister A guest mapping not found"
fi

if [ -f "backend/guest_mapping_sister_b.json" ]; then
    echo -e "${GREEN}✓${NC} Sister B guest mapping exists"
else
    echo -e "${RED}✗${NC} Sister B guest mapping not found"
fi

echo ""

# Check if gallery photos exist
echo "📸 Checking gallery photos..."
if [ -d "uploads/wedding_gallery/sister_a" ]; then
    PHOTOS_A=$(find uploads/wedding_gallery/sister_a -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" \) | wc -l)
    echo -e "${GREEN}✓${NC} Sister A: $PHOTOS_A photos"
else
    echo -e "${RED}✗${NC} Sister A gallery not found"
fi

if [ -d "uploads/wedding_gallery/sister_b" ]; then
    PHOTOS_B=$(find uploads/wedding_gallery/sister_b -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | wc -l)
    echo -e "${GREEN}✓${NC} Sister B: $PHOTOS_B photos"
else
    echo -e "${RED}✗${NC} Sister B gallery not found"
fi

echo ""

# Check if Python dependencies are installed
echo "🐍 Checking Python dependencies..."
if python3 -c "import cv2" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} OpenCV installed"
else
    echo -e "${RED}✗${NC} OpenCV not installed"
    echo -e "${YELLOW}  Run: pip3 install -r backend/requirements.txt${NC}"
fi

if python3 -c "import deepface" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} DeepFace installed"
else
    echo -e "${RED}✗${NC} DeepFace not installed"
    echo -e "${YELLOW}  Run: pip3 install -r backend/requirements.txt${NC}"
fi

echo ""

# Check if Node dependencies are installed
echo "📦 Checking Node.js dependencies..."
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${RED}✗${NC} Backend dependencies not installed"
    echo -e "${YELLOW}  Run: cd backend && npm install${NC}"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${RED}✗${NC} Frontend dependencies not installed"
    echo -e "${YELLOW}  Run: cd frontend && npm install${NC}"
fi

echo ""

# Check if servers are running
echo "🚀 Checking servers..."
if lsof -i :5001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend server running on port 5001"
else
    echo -e "${YELLOW}⚠${NC} Backend server not running"
    echo -e "${YELLOW}  Run: cd backend && node server.js${NC}"
fi

if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend server running on port 5173"
else
    echo -e "${YELLOW}⚠${NC} Frontend server not running"
    echo -e "${YELLOW}  Run: cd frontend && npm run dev${NC}"
fi

echo ""
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Guests Detected: $(($SISTER_A_COUNT + $SISTER_B_COUNT))"
echo "Total Photos: $(($PHOTOS_A + $PHOTOS_B))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Face detection system is ready to use!"
echo ""
echo "Access the admin panel at: http://localhost:5173/face-admin"
echo ""

