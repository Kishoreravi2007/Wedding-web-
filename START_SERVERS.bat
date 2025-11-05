@echo off
echo =========================================
echo Starting WeddingWeb Servers
echo =========================================
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo.
echo =========================================
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo =========================================
echo.
echo Press any key to close this window...
pause >nul

