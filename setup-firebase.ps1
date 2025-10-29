# Firebase Migration Setup Script for Windows
Write-Host "🔥 Firebase Migration Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the project root
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Step 2: Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

Set-Location ..

Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Download your Firebase service account key from:"
Write-Host "   https://console.firebase.google.com/project/kishore-75492/settings/serviceaccounts/adminsdk" -ForegroundColor White
Write-Host ""
Write-Host "2. Save it as: backend\weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json" -ForegroundColor White
Write-Host ""
Write-Host "3. Set up Firestore Database and Firebase Storage in Firebase Console" -ForegroundColor White
Write-Host ""
Write-Host "4. Configure Security Rules (see FIREBASE_MIGRATION_COMPLETE.md)" -ForegroundColor White
Write-Host ""
Write-Host "5. Start the servers:" -ForegroundColor White
Write-Host "   Backend:  cd backend && npm start" -ForegroundColor Gray
Write-Host "   Frontend: cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For detailed instructions, see: FIREBASE_MIGRATION_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""

