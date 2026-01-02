# Wedding Website - Start Servers Script
# Run this script to start both backend and frontend servers

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " Wedding Website - Starting Servers" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PSScriptRoot\backend'; Write-Host 'BACKEND SERVER' -ForegroundColor Green; npm start"
)

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend  
Write-Host "[2/2] Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PSScriptRoot\frontend'; Write-Host 'FRONTEND SERVER' -ForegroundColor Green; npm run dev"
)

# Wait for servers to start
Write-Host ""
Write-Host "Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:8080"

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host " Servers Started!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two PowerShell windows will open - don't close them!" -ForegroundColor Red
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

