# Wedding Website - Complete Supabase Migration (PowerShell)
# Run this script to migrate everything to Supabase

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Wedding Website - Supabase Migration" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ Error: backend\.env file not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create backend\.env with your Supabase credentials:"
    Write-Host ""
    Write-Host "SUPABASE_URL=https://xxxxx.supabase.co"
    Write-Host "SUPABASE_ANON_KEY=your-anon-key"
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    Write-Host ""
    Write-Host "See SUPABASE_QUICKSTART.md for detailed instructions"
    exit 1
}

Write-Host "1️⃣  Testing Supabase Connection..." -ForegroundColor Green
Write-Host ""
Set-Location backend
node test-supabase-connection.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Connection test failed" -ForegroundColor Red
    Write-Host "Please check your Supabase credentials and setup"
    Write-Host "See SUPABASE_QUICKSTART.md for help"
    Set-Location ..
    exit 1
}

Write-Host ""
$response = Read-Host "Continue with migration? (y/n)"

if ($response -notmatch "^[Yy]$") {
    Write-Host "Migration cancelled"
    Set-Location ..
    exit 0
}

Write-Host ""
Write-Host "2️⃣  Migrating Photos to Supabase..." -ForegroundColor Green
Write-Host ""
node migrate-to-supabase.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Photo migration failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "3️⃣  Migrating Face Detection Data..." -ForegroundColor Green
Write-Host ""
node migrate-face-data.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  Face data migration failed (this is okay if you haven't run face detection yet)" -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Migration Complete! 🎉" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "✅ Your wedding website now uses Supabase!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Start servers: .\start-all.ps1 (or .\start-all.sh in Git Bash)"
Write-Host "  2. Test gallery: http://localhost:3000/sreedevi/gallery"
Write-Host "  3. Upload a test photo to verify everything works"
Write-Host ""
Write-Host "Verify in Supabase dashboard:"
Write-Host "  - Storage > wedding-photos (should see your photos)"
Write-Host "  - Table Editor > photos (should see photo records)"
Write-Host ""

