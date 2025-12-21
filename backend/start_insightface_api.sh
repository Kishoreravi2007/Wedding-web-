#!/bin/bash
# Start InsightFace API server

cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv_insightface" ]; then
    source venv_insightface/bin/activate
    echo "✅ Activated InsightFace virtual environment"
else
    echo "⚠️  Virtual environment not found. Make sure to create it first:"
    echo "   python3.12 -m venv venv_insightface"
    echo "   source venv_insightface/bin/activate"
    echo "   pip install insightface onnxruntime opencv-python numpy fastapi uvicorn"
    exit 1
fi

# Check if required packages are installed
python -c "import insightface; import onnxruntime; import fastapi; import uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Required packages not installed. Installing..."
    pip install insightface onnxruntime opencv-python numpy fastapi uvicorn python-multipart
fi

echo "🚀 Starting InsightFace API server on port 8001..."
echo "📖 API Documentation: http://localhost:8001/docs"
echo "🔍 Health check: http://localhost:8001/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python -m uvicorn insightface_api:app --host 0.0.0.0 --port 8001 --reload

