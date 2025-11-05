@echo off
echo ========================================
echo Starting WeddingWeb Backend Server
echo ========================================
echo.
echo Make sure you have created a .env file with:
echo   SUPABASE_URL=your_supabase_url
echo   SUPABASE_ANON_KEY=your_supabase_key
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
node server.js
pause

