#!/bin/bash

echo "🎭 Face Detection Test Setup"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the Wedding-web-1 root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Kill existing servers on our ports
echo "🔄 Stopping any existing servers..."
if check_port 3000; then
    echo "   Stopping frontend server on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

if check_port 8080; then
    echo "   Stopping any server on port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
fi

if check_port 5000; then
    echo "   Stopping any server on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
fi

if check_port 5001; then
    echo "   Stopping backend server on port 5001..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
fi

sleep 2

# Start backend server
echo "🚀 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🚀 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for servers to start
sleep 5

# Check if servers are running
echo ""
echo "🔍 Checking servers..."

if check_port 5001; then
    echo "✅ Backend server running on http://localhost:5001"
else
    echo "❌ Backend server failed to start"
fi

if check_port 3000; then
    echo "✅ Frontend server running on http://localhost:3000"
else
    echo "❌ Frontend server failed to start"
fi

echo ""
echo "🎯 Face Detection Testing Options:"
echo "================================="
echo ""
echo "1. 🌐 Main Wedding Website:"
echo "   http://localhost:3000"
echo ""
echo "2. 📸 Photo Booth (Face Detection):"
echo "   http://localhost:3000 → Navigate to Photo Booth"
echo ""
echo "3. 🧪 Standalone Face Detection Test:"
echo "   file://$(pwd)/test-face-detection.html"
echo ""
echo "4. 🔧 Face Detection HTML Test:"
echo "   http://localhost:3000/face-detection.html"
echo ""

# Open the test page
if command -v open >/dev/null 2>&1; then
    echo "🌐 Opening test page in browser..."
    open "file://$(pwd)/test-face-detection.html"
elif command -v xdg-open >/dev/null 2>&1; then
    echo "🌐 Opening test page in browser..."
    xdg-open "file://$(pwd)/test-face-detection.html"
fi

echo ""
echo "💡 Testing Instructions:"
echo "======================="
echo ""
echo "1. Check if models load successfully (green status)"
echo "2. Try 'Test Photo' button for basic face detection"
echo "3. Try 'Start Webcam' for real-time detection"
echo "4. Check browser console (F12) for detailed logs"
echo ""
echo "🛑 To stop servers:"
echo "   Press Ctrl+C or run: killall node"
echo ""

# Keep script running to monitor
echo "📊 Server PIDs: Backend=$BACKEND_PID, Frontend=$FRONTEND_PID"
echo "⏳ Servers are running. Press Ctrl+C to stop..."

# Wait for user to stop
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Keep alive
while true; do
    sleep 1
done
