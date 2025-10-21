# 🔧 Photo Booth Troubleshooting Guide

This guide helps you fix common Photo Booth issues and get your camera working properly.

## 🎯 Common Issues & Solutions

### **"Take Photo" Button is Disabled**

**Problem**: The "Take Photo" button is grayed out and not clickable.

**Causes & Solutions**:
1. **No faces detected** - Position your face in the center of the camera frame
2. **Poor lighting** - Ensure good lighting on your face
3. **Camera not started** - Click "Start Camera" first
4. **Face not visible** - Make sure your face is clearly visible

**Steps to Fix**:
1. Click "Start Camera" button
2. Position your face in the center of the frame
3. Ensure good lighting on your face
4. Look directly at the camera
5. Wait for green bounding boxes to appear around your face
6. Then the "Take Photo" button will be enabled

### **Camera Not Starting**

**Problem**: Camera doesn't start when you click "Start Camera".

**Causes & Solutions**:
1. **Browser permissions** - Allow camera access when prompted
2. **HTTPS required** - Use HTTPS or localhost (not HTTP)
3. **Camera in use** - Close other apps using the camera
4. **Browser compatibility** - Use Chrome, Firefox, Safari, or Edge

**Steps to Fix**:
1. Click "Allow" when browser asks for camera permission
2. Ensure you're using HTTPS or localhost
3. Close other apps that might be using the camera
4. Try refreshing the page
5. Try a different browser if issues persist

### **No Face Detection**

**Problem**: Camera works but no faces are detected.

**Causes & Solutions**:
1. **Poor lighting** - Use better lighting on your face
2. **Face positioning** - Center your face in the frame
3. **Distance** - Stay at arm's length from camera
4. **Obstructions** - Remove sunglasses, masks, or face coverings

**Steps to Fix**:
1. Ensure good lighting on your face
2. Position your face in the center of the camera frame
3. Look directly at the camera
4. Stay at a reasonable distance (not too close or far)
5. Remove any face coverings
6. Try different angles if needed

### **Models Not Loading**

**Problem**: "Loading face detection models..." message doesn't go away.

**Causes & Solutions**:
1. **Missing model files** - Models not downloaded
2. **Network issues** - Slow or failed downloads
3. **Browser cache** - Cached files are corrupted

**Steps to Fix**:
1. Check if models exist: `ls -la frontend/public/models/`
2. Download models: `cd backend && node setup-face-models.js`
3. Clear browser cache and refresh
4. Check browser console for errors
5. Try a different browser

### **Photo Not Saving**

**Problem**: Photo is taken but doesn't download.

**Causes & Solutions**:
1. **Browser popup blocker** - Allow downloads from this site
2. **File permissions** - Check download folder permissions
3. **Browser settings** - Check download settings

**Steps to Fix**:
1. Allow popups for this website
2. Check your browser's download settings
3. Ensure you have write permissions to the download folder
4. Try a different browser
5. Check if antivirus is blocking downloads

## 🔍 Diagnostic Tools

### **Built-in Diagnostic**
1. Click "Show Diagnostic" button in Photo Booth
2. Review all test results
3. Follow the suggested solutions
4. Run diagnostic again after fixes

### **Manual Checks**
1. **Check camera permissions** in browser settings
2. **Verify HTTPS** or localhost usage
3. **Test camera** in other applications
4. **Check browser console** for error messages
5. **Verify model files** are present

## 🛠️ Step-by-Step Troubleshooting

### **Step 1: Basic Checks**
- [ ] Using HTTPS or localhost
- [ ] Modern browser (Chrome, Firefox, Safari, Edge)
- [ ] Camera permissions allowed
- [ ] Good internet connection

### **Step 2: Camera Setup**
- [ ] Click "Start Camera"
- [ ] Allow camera access when prompted
- [ ] Position face in center of frame
- [ ] Ensure good lighting

### **Step 3: Face Detection**
- [ ] Wait for green bounding boxes
- [ ] Adjust lighting if needed
- [ ] Try different face positions
- [ ] Remove face coverings

### **Step 4: Photo Taking**
- [ ] Green bounding boxes visible
- [ ] "Take Photo" button enabled
- [ ] Click "Take Photo"
- [ ] Check downloads folder

## 🎯 Quick Fixes

### **Refresh Everything**
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache
3. Restart browser
4. Try again

### **Check Permissions**
1. Go to browser settings
2. Find camera permissions
3. Allow camera access
4. Refresh the page

### **Try Different Browser**
1. Open Chrome, Firefox, Safari, or Edge
2. Navigate to the Photo Booth
3. Test camera functionality
4. Compare results

### **Check Lighting**
1. Face a window or light source
2. Avoid backlighting
3. Ensure even lighting on face
4. Try different times of day

## 📱 Mobile-Specific Issues

### **Mobile Camera Issues**
- **Portrait mode**: Rotate device to landscape
- **Permissions**: Allow camera access in mobile browser
- **HTTPS required**: Use HTTPS, not HTTP
- **Touch controls**: Tap to focus camera

### **Mobile Performance**
- **Close other apps** to free up memory
- **Use WiFi** for better performance
- **Restart browser** if slow
- **Try different mobile browser**

## 🔧 Advanced Troubleshooting

### **Browser Console Errors**
1. Open browser console (F12)
2. Look for red error messages
3. Check for face-api.js errors
4. Check for camera access errors
5. Report errors for further help

### **Network Issues**
1. Check internet connection
2. Verify model files are loading
3. Check for firewall blocking
4. Try different network

### **Performance Issues**
1. Close other browser tabs
2. Restart browser
3. Check available memory
4. Try different device

## 🎉 Success Indicators

### **Everything Working**
- ✅ Camera starts successfully
- ✅ Green bounding boxes appear around faces
- ✅ "Take Photo" button is enabled
- ✅ Photos download automatically
- ✅ Face detection is accurate

### **Partial Success**
- ✅ Camera works but no face detection
- ✅ Face detection works but photo doesn't save
- ✅ Everything works but slowly

## 📞 Getting Help

### **If Nothing Works**
1. **Check browser console** for error messages
2. **Try different browser** (Chrome recommended)
3. **Check system requirements** (modern browser needed)
4. **Contact support** with specific error messages

### **Error Messages to Report**
- Camera access denied
- Models not loading
- Face detection failed
- Photo save failed
- Browser compatibility issues

## 🎯 Prevention Tips

### **Best Practices**
- **Use HTTPS** or localhost only
- **Allow camera permissions** when prompted
- **Ensure good lighting** for face detection
- **Use modern browsers** for best compatibility
- **Keep models updated** for best performance

### **Optimal Setup**
- **Good lighting** on your face
- **Centered positioning** in camera frame
- **Stable internet** connection
- **Modern browser** with latest updates
- **Sufficient device memory** available

The Photo Booth should work smoothly with proper setup and good lighting! 📸✨
