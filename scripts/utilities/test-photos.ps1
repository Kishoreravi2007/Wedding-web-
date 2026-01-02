Write-Host "=== Wedding Photo System Status ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend
Write-Host "[1] Testing Backend..." -ForegroundColor Yellow
try {
    $r = curl http://localhost:5000 -UseBasicParsing -TimeoutSec 3
    Write-Host "     Backend is running (Status: $($r.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "     Backend is NOT running!" -ForegroundColor Red
}

# Test 2: Photos API
Write-Host "[2] Testing Photos API..." -ForegroundColor Yellow
try {
    $photos = (curl "http://localhost:5000/api/photos-local?sister=sister-b" -UseBasicParsing -TimeoutSec 3).Content | ConvertFrom-Json
    Write-Host "     Found $($photos.Count) photos" -ForegroundColor Green
    Write-Host "     Sample URL: $($photos[0].public_url)" -ForegroundColor Gray
} catch {
    Write-Host "     Photos API failed!" -ForegroundColor Red
}

# Test 3: Photo File Access
Write-Host "[3] Testing Photo File..." -ForegroundColor Yellow
try {
    $img = curl "http://localhost:5000/uploads/wedding_gallery/sister_b/1.jpeg" -UseBasicParsing -Method Head -TimeoutSec 3
    Write-Host "     Photo file accessible (Status: $($img.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "     Photo file not accessible!" -ForegroundColor Red
}

# Test 4: Frontend
Write-Host "[4] Testing Frontend..." -ForegroundColor Yellow
try {
    $f = curl http://localhost:5173 -UseBasicParsing -TimeoutSec 3
    Write-Host "     Frontend is running (Status: $($f.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "     Frontend is NOT running!" -ForegroundColor Red
    Write-Host "     Start with: cd frontend; npm run dev" -ForegroundColor Yellow
}

# Test 5: IP Access
Write-Host "[5] Testing IP Access..." -ForegroundColor Yellow
try {
    $photos = (curl "http://172.20.10.3:5000/api/photos-local?sister=sister-b" -UseBasicParsing -TimeoutSec 3).Content | ConvertFrom-Json
    Write-Host "     API accessible via IP" -ForegroundColor Green
    Write-Host "     URL from IP: $($photos[0].public_url)" -ForegroundColor Gray
} catch {
    Write-Host "     Not accessible via IP (Firewall?)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
