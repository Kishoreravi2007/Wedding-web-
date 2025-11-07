@echo off
echo ========================================
echo Fixing Contact Form - Setting up environment
echo ========================================
echo.

REM Kill any existing node processes
echo Stopping existing Node processes...
taskkill /F /IM node.exe 2>nul
echo.

REM Create backend .env file with Supabase credentials
echo Creating backend/.env file...
(
echo PORT=5001
echo NODE_ENV=development
echo BACKEND_URL=http://localhost:5001
echo FRONTEND_URL=http://localhost:3000
echo.
echo SUPABASE_URL=https://dmsghmogmwmpxjaipbod.supabase.co
echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU1MDgsImV4cCI6MjA3NzA1MTUwOH0.ql_cJb4YSxj2mhUMd79t2IyafG3CURxNf8rKgRf2Iyw
echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NTUwOCwiZXhwIjoyMDc3MDUxNTA4fQ.0n0kzNlCjLMcVT-80sESkbusY84QWGdgbaaX3zxttok
echo.
echo JWT_SECRET=your-secret-key-change-in-production
) > backend\.env

echo ✅ Backend .env created
echo.

REM Create frontend .env file
echo Creating frontend/.env file...
(
echo VITE_SUPABASE_URL=https://dmsghmogmwmpxjaipbod.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU1MDgsImV4cCI6MjA3NzA1MTUwOH0.ql_cJb4YSxj2mhUMd79t2IyafG3CURxNf8rKgRf2Iyw
echo.
echo VITE_API_BASE_URL=http://localhost:5001
echo VITE_BACKEND_URL=http://localhost:5001
) > frontend\.env

echo ✅ Frontend .env created
echo.

echo ========================================
echo Starting Backend Server on port 5001...
echo ========================================
cd backend
start "Backend Server" cmd /k "node server.js"
cd ..
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Starting Frontend Server on port 3000...
echo ========================================
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo ✅ Servers Started!
echo ========================================
echo.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo Admin Messages: http://localhost:3000/admin/contact-messages
echo Contact Form: http://localhost:3000/company/contact
echo.
echo Press any key to close this window...
pause >nul

