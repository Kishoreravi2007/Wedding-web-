#!/bin/bash

# Start DeepFace API Service
# This script activates the virtual environment and starts the DeepFace API

cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv_deepface" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: /opt/homebrew/bin/python3.12 -m venv venv_deepface"
    echo "Then: source venv_deepface/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source venv_deepface/bin/activate

# Check if deepface_api.py exists
if [ ! -f "deepface_api.py" ]; then
    echo "❌ deepface_api.py not found!"
    exit 1
fi

echo "🚀 Starting DeepFace API on http://localhost:8002"
echo "Press Ctrl+C to stop"
echo ""

# Start the API
python deepface_api.py

