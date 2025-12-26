# DeepFace API Startup Guide

## ✅ Script Fixed

The `start_deepface.sh` script has been updated to:
- ✅ Verify virtual environment activation
- ✅ Check for required packages
- ✅ Auto-install missing packages if needed
- ✅ Use the correct Python from venv

## 🚀 How to Start

### Option 1: Use the Script (Recommended)
```bash
cd backend
./start_deepface.sh
```

The script will:
1. Activate the virtual environment
2. Check for required packages
3. Start the DeepFace API on port 8002

### Option 2: Manual Start
```bash
cd backend
source venv_deepface/bin/activate
python deepface_api.py
```

## ✅ Verify It's Running

```bash
# Check if API is responding
curl http://localhost:8002/

# Should return:
# {"status":"ok","service":"DeepFace Face Detection API",...}
```

## 🔧 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'fastapi'"

**Solution:**
```bash
cd backend
source venv_deepface/bin/activate
pip install fastapi uvicorn python-multipart opencv-python Pillow numpy deepface retina-face tf-keras tqdm requests
```

### Error: "Address already in use"

**Solution:**
```bash
# Find and kill existing process
lsof -ti :8002 | xargs kill -9

# Then restart
./start_deepface.sh
```

### Error: "Virtual environment not found"

**Solution:**
```bash
cd backend
/opt/homebrew/bin/python3.12 -m venv venv_deepface
source venv_deepface/bin/activate
pip install -r requirements.txt
```

## 📝 Current Status

- ✅ Virtual environment: `backend/venv_deepface/`
- ✅ Packages installed: fastapi, deepface, tensorflow, etc.
- ✅ Script updated: Auto-checks and installs if needed
- ✅ API endpoint: `http://localhost:8002`

## 🎯 Next Steps

1. **Start DeepFace API:**
   ```bash
   cd backend
   ./start_deepface.sh
   ```

2. **Verify it's working:**
   ```bash
   curl http://localhost:8002/health
   ```

3. **Use in frontend:**
   - Frontend is already configured with `VITE_DEEPFACE_API_URL=http://localhost:8002`
   - Face detection will automatically use DeepFace + RetinaFace

