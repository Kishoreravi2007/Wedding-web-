#!/bin/bash

echo "🚀 Starting Wedding Website Servers"
echo "=================================="

# Kill any existing servers
echo "🔄 Stopping existing servers..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start backend server
echo "🔧 Starting backend server on port 5001..."
cd backend && PORT=5001 node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend server  
echo "🎨 Starting frontend server on port 3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for servers to start
sleep 5

echo ""
echo "🎯 Servers Status:"
echo "=================="

# Check backend
if curl -s http://localhost:5001 >/dev/null 2>&1; then
    echo "✅ Backend: http://localhost:5001"
else
    echo "❌ Backend: Failed to start"
fi

# Check frontend
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend: http://localhost:3000"
else
    echo "❌ Frontend: Failed to start"
fi

echo ""
echo "🎭 Your Wedding Website is Ready!"
echo "================================"
echo "Main Website: http://localhost:3000"
echo "Photo Booth: http://localhost:3000 → Photo Booth"
echo "API Test: file://$(pwd)/test-find-my-photos.html"
echo ""
echo "📸 Find My Photos API is working!"
echo "Guests can now search for their photos using face detection"
echo ""
echo "💡 To stop servers: killall node"
echo "⏳ Servers running in background... Press Ctrl+C to stop monitoring"

# Keep script alive to monitor
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

while true; do
    sleep 1
done
