# DeepFace + RetinaFace Setup Guide

## ⚠️ Python Version Requirement

**Important:** DeepFace requires TensorFlow, which doesn't support Python 3.14 yet. 

**Recommended:** Use Python 3.11 or 3.12

## Setup Options

### Option 1: Use pyenv (Recommended)

Install pyenv to manage Python versions:

```bash
# Install pyenv (if not already installed)
brew install pyenv

# Install Python 3.12
pyenv install 3.12.7

# Set local Python version for this project
cd backend
pyenv local 3.12.7

# Verify Python version
python --version  # Should show Python 3.12.7

# Install dependencies
pip install -r requirements.txt
```

### Option 2: Use Python 3.11/3.12 directly

If you have Python 3.11 or 3.12 installed:

```bash
cd backend

# Use python3.12 or python3.11
python3.12 -m pip install -r requirements.txt

# Or create a virtual environment
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Option 3: Use Homebrew Python 3.12

```bash
# Install Python 3.12 via Homebrew
brew install python@3.12

# Use it
/opt/homebrew/bin/python3.12 -m pip install -r requirements.txt
```

## After Installation

1. **Start DeepFace API (Easy Way):**
   ```bash
   cd backend
   ./start_deepface.sh
   ```

   **Or manually:**
   ```bash
   cd backend
   source venv_deepface/bin/activate
   python deepface_api.py
   ```

2. **Verify it's running:**
   ```bash
   curl http://localhost:8002/
   ```

3. **Update frontend .env:**
   ```bash
   # In frontend/.env
   VITE_DEEPFACE_API_URL=http://localhost:8002
   ```

## Troubleshooting

### TensorFlow not found
- Make sure you're using Python 3.11 or 3.12
- Check: `python --version`

### Import errors
- Make sure all dependencies are installed: `pip list | grep deepface`
- Try: `pip install --upgrade deepface tensorflow`

### Port already in use
- Change port in `deepface_api.py`: `port=8002` to another port
- Update `VITE_DEEPFACE_API_URL` accordingly

