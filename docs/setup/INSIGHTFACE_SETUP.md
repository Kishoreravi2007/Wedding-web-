# InsightFace Setup Guide

## Python Version Requirement

**Important**: InsightFace requires `onnxruntime`, which currently supports **Python 3.8-3.13**. 

If you're using Python 3.14 or newer, you have two options:

### Option 1: Use Python 3.11 or 3.12 (Recommended)

1. Install Python 3.12 (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install python@3.12
   
   # Or download from python.org
   ```

2. Create a virtual environment with Python 3.12:
   ```bash
   python3.12 -m venv venv_insightface
   source venv_insightface/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install insightface onnxruntime opencv-python numpy
   ```

### Option 2: Use System Python 3.11/3.12

If you have Python 3.11 or 3.12 installed:

```bash
# Check available Python versions
python3.12 --version
python3.11 --version

# Use the available version
python3.12 -m pip install insightface onnxruntime opencv-python numpy
```

## Quick Installation (macOS)

```bash
# Navigate to backend directory
cd backend

# Install using pip3 (will use system Python)
pip3 install insightface onnxruntime opencv-python numpy

# If onnxruntime fails (Python 3.14), use Python 3.12:
python3.12 -m pip install insightface onnxruntime opencv-python numpy
```

## Verify Installation

```bash
python3 -c "from insightface.app import FaceAnalysis; print('✅ InsightFace installed successfully')"
```

If you get an error about onnxruntime, you need to use Python 3.11 or 3.12.

## Testing

Once installed, test with:

```bash
python3 backend/test_insightface.py path/to/your/image.jpg
```

Or use the main script:

```bash
python3 backend/insightface_processor.py path/to/your/image.jpg --output annotated.jpg
```

