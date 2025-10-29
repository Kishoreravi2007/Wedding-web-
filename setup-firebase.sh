#!/bin/bash

echo "🔥 Firebase Migration Setup Script"
echo "=================================="
echo ""

# Check if we're in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Step 1: Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"
echo ""

echo "📦 Step 2: Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

cd ..

echo "✅ All dependencies installed successfully!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Download your Firebase service account key from:"
echo "   https://console.firebase.google.com/project/kishore-75492/settings/serviceaccounts/adminsdk"
echo ""
echo "2. Save it as: backend/weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json"
echo ""
echo "3. Set up Firestore Database and Firebase Storage in Firebase Console"
echo ""
echo "4. Configure Security Rules (see FIREBASE_MIGRATION_COMPLETE.md)"
echo ""
echo "5. Start the servers:"
echo "   Backend:  cd backend && npm start"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "📖 For detailed instructions, see: FIREBASE_MIGRATION_COMPLETE.md"
echo ""

