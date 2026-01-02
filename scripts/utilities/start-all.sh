#!/bin/bash

# Wedding Website - Complete Startup Script
# Starts both backend and frontend servers

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Wedding Website - Starting Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the project directory
PROJECT_DIR="/Users/kishoreravi/Desktop/projects/Wedding-web-1"

# Check if running from project directory
if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${YELLOW}Warning: Project directory not found at $PROJECT_DIR${NC}"
  echo "Please update the PROJECT_DIR variable in this script"
  exit 1
fi

# Kill any existing servers
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "node server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start Backend Server
echo -e "${GREEN}Starting Backend Server...${NC}"
cd "$PROJECT_DIR/backend"

# Start backend in background
PORT=5002 node server.js > /tmp/wedding-backend.log 2>&1 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"
echo "  Log file: /tmp/wedding-backend.log"

# Wait for backend to start
sleep 3

# Check if backend is running
if lsof -i :5002 > /dev/null 2>&1; then
  echo -e "${GREEN}  ✅ Backend running on http://localhost:5002${NC}"
else
  echo -e "${YELLOW}  ⚠️  Backend may not have started. Check /tmp/wedding-backend.log${NC}"
fi

# Start Frontend Server
echo ""
echo -e "${GREEN}Starting Frontend Server...${NC}"
cd "$PROJECT_DIR/frontend"

# Start frontend in background
npm run dev > /tmp/wedding-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"
echo "  Log file: /tmp/wedding-frontend.log"

# Wait for frontend to start
echo "  Waiting for frontend to start..."
sleep 6

# Check if frontend is running
FRONTEND_PORT=3000
if lsof -i :3000 > /dev/null 2>&1; then
  FRONTEND_PORT=3000
elif lsof -i :3001 > /dev/null 2>&1; then
  FRONTEND_PORT=3001
elif lsof -i :3002 > /dev/null 2>&1; then
  FRONTEND_PORT=3002
fi

if lsof -i :$FRONTEND_PORT > /dev/null 2>&1; then
  echo -e "${GREEN}  ✅ Frontend running on http://localhost:$FRONTEND_PORT${NC}"
else
  echo -e "${YELLOW}  ⚠️  Frontend may not have started. Check /tmp/wedding-frontend.log${NC}"
fi

# Display startup summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Services Started Successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Backend:${NC}  http://localhost:5002"
echo -e "${GREEN}Frontend:${NC} http://localhost:$FRONTEND_PORT"
echo ""
echo -e "${BLUE}📱 Quick Access URLs:${NC}"
echo ""
echo "  Home:                http://localhost:$FRONTEND_PORT/"
echo "  Sister A Gallery:    http://localhost:$FRONTEND_PORT/parvathy"
echo "  Sister B Gallery:    http://localhost:$FRONTEND_PORT/sreedevi"
echo "  Photographer Login:  http://localhost:$FRONTEND_PORT/photographer-login"
echo "  Face Detection Admin: http://localhost:$FRONTEND_PORT/face-admin"
echo ""
echo -e "${BLUE}📋 Current Stats:${NC}"
echo "  Sister A Photos: $(find "$PROJECT_DIR/uploads/wedding_gallery/sister_a" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "  Sister B Photos: $(find "$PROJECT_DIR/uploads/wedding_gallery/sister_b" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "  Detected Guests: Sister A: $(ls -1 "$PROJECT_DIR/backend/reference_images/sister_a" 2>/dev/null | wc -l | tr -d ' '), Sister B: $(ls -1 "$PROJECT_DIR/backend/reference_images/sister_b" 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "  Backend:  tail -f /tmp/wedding-backend.log"
echo "  Frontend: tail -f /tmp/wedding-frontend.log"
echo ""
echo -e "${YELLOW}To stop servers: Press Ctrl+C or run: pkill -f 'node server.js'; pkill -f vite${NC}"
echo ""
echo -e "${GREEN}🎉 Wedding website is ready!${NC}"
echo ""

# Keep script running to show logs
echo "Press Ctrl+C to stop all services..."
echo ""

# Tail both logs
tail -f /tmp/wedding-backend.log /tmp/wedding-frontend.log

