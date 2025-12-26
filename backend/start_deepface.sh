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

# Verify activation worked
if [ -z "$VIRTUAL_ENV" ]; then
    echo "❌ Failed to activate virtual environment!"
    exit 1
fi

# Check if deepface_api.py exists
if [ ! -f "deepface_api.py" ]; then
    echo "❌ deepface_api.py not found!"
    exit 1
fi

# Verify Python and packages
if ! python -c "import fastapi; import deepface" 2>/dev/null; then
    echo "❌ Required packages not installed in virtual environment!"
    echo "Installing packages..."
    pip install -q fastapi uvicorn python-multipart opencv-python Pillow numpy deepface retina-face tf-keras tqdm requests
fi

echo "🚀 Starting DeepFace API on http://localhost:8002"
echo "Press Ctrl+C to stop"
echo ""

# Start the API using the venv's Python explicitly
python deepface_api.py

