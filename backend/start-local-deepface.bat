@echo off
echo 🚀 Starting DeepFace API locally...

:: Set environment variables
set PORT=8002
set PYTHONUNBUFFERED=1

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH.
    pause
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist venv_deepface (
    echo 📦 Creating virtual environment...
    python -m venv venv_deepface
)

:: Activate virtual environment
echo 🔌 Activating virtual environment...
call venv_deepface\Scripts\activate

:: Install requirements
echo 📥 Installing dependencies (this may take a while)...
pip install -r requirements.txt

:: Start the API
echo 🏁 Starting Uvicorn...
uvicorn deepface_api:app --host 0.0.0.0 --port 8002 --reload

pause
