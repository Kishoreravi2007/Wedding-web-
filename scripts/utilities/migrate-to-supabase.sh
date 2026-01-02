#!/bin/bash

# Wedding Website - Complete Supabase Migration
# Run this script to migrate everything to Supabase

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Wedding Website - Supabase Migration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
  echo -e "${RED}❌ Error: backend/.env file not found${NC}"
  echo ""
  echo "Please create backend/.env with your Supabase credentials:"
  echo ""
  echo "SUPABASE_URL=https://xxxxx.supabase.co"
  echo "SUPABASE_ANON_KEY=your-anon-key"
  echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
  echo ""
  echo "See SUPABASE_QUICKSTART.md for detailed instructions"
  exit 1
fi

echo -e "${GREEN}1️⃣  Testing Supabase Connection...${NC}"
echo ""
cd backend
node test-supabase-connection.js

if [ $? -ne 0 ]; then
  echo ""
  echo -e "${RED}❌ Connection test failed${NC}"
  echo "Please check your Supabase credentials and setup"
  echo "See SUPABASE_QUICKSTART.md for help"
  exit 1
fi

echo ""
echo -e "${YELLOW}Continue with migration? (y/n)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
  echo "Migration cancelled"
  exit 0
fi

echo ""
echo -e "${GREEN}2️⃣  Migrating Photos to Supabase...${NC}"
echo ""
node migrate-to-supabase.js

if [ $? -ne 0 ]; then
  echo ""
  echo -e "${RED}❌ Photo migration failed${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}3️⃣  Migrating Face Detection Data...${NC}"
echo ""
node migrate-face-data.js

if [ $? -ne 0 ]; then
  echo ""
  echo -e "${YELLOW}⚠️  Face data migration failed (this is okay if you haven't run face detection yet)${NC}"
fi

cd ..

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Migration Complete! 🎉${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Your wedding website now uses Supabase!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start servers: ./start-all.sh"
echo "  2. Test gallery: http://localhost:3000/sreedevi/gallery"
echo "  3. Upload a test photo to verify everything works"
echo ""
echo "Verify in Supabase dashboard:"
echo "  - Storage > wedding-photos (should see your photos)"
echo "  - Table Editor > photos (should see photo records)"
echo ""

