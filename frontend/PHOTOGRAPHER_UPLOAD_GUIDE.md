# Photographer Portal - Photo Upload Guide

## ✅ Setup Complete!

Your photographer portal is now ready to use with the following credentials:

### Login Credentials
- **Username**: `photographer`
- **Password**: `photo123`
- **Portal URL**: http://localhost:8080/photographer-login

## 🚀 How to Upload Photos

### Step 1: Login
1. Navigate to http://localhost:8080/photographer-login
2. Enter the credentials above
3. Click "Secure Sign In"

### Step 2: Select Wedding
1. After login, you'll see the photographer dashboard
2. Click on the "Upload Photos" tab
3. Select either "Parvathy Wedding" or "Sreedevi Wedding" from the dropdown

### Step 3: Upload Photos
1. Drag and drop photos into the upload area, OR
2. Click the upload area to browse and select files
3. You can select multiple photos at once
4. Click "Upload Photos" button
5. Wait for the upload to complete (progress will be shown)

### Step 4: View Uploaded Photos
1. Switch to "Recent Uploads" tab to see your latest uploads
2. Switch to "Photo Gallery" tab to view all photos
3. AI face detection will automatically run on uploaded photos

## 🔧 Troubleshooting

### "Authentication required" Error
- Make sure you're logged in
- Try logging out and logging back in
- Check that both frontend and backend servers are running

### "Error uploading photo to storage" ✅ FIXED
- **Issue**: Firebase Storage bucket was misconfigured
- **Solution**: Backend `.env` now uses correct bucket: `weddingweb-9421e.appspot.com`
- **Status**: Fixed - backend server restarted with correct configuration

### Upload Fails
- Check file size (max 10MB per photo)
- Ensure file is a valid image format (JPG, PNG, WebP, GIF)
- Check browser console for detailed error messages
- Verify backend server is running on port 5000
- Verify Firebase Storage bucket is correctly configured

### Photos Not Showing
- Refresh the page
- Check the "Photo Gallery" tab
- Verify Firebase configuration is correct

## 📊 Current Status

✅ Backend Server: Running on http://localhost:5000
✅ Frontend Server: Running on http://localhost:8080
✅ Photographer Account: Created and ready
✅ Authentication: Working
✅ File Upload: Configured and ready

## 🔐 Security Notes

- JWT tokens expire after 1 hour
- Photos are stored securely in Firebase Storage
- Only authenticated photographers can upload
- All uploads are logged with metadata

## 📝 Additional Features

- **AI Face Detection**: Automatically detects faces in uploaded photos
- **Face Tagging**: Tag people in photos for easy searching
- **Gallery Management**: View, edit, and delete photos
- **Statistics**: Track upload counts and views
- **Multi-Wedding Support**: Separate galleries for each wedding

## 🆘 Need Help?

If you encounter any issues:
1. Check browser console (F12) for error messages
2. Check backend terminal for server logs
3. Verify all environment variables are set correctly
4. Ensure Firebase credentials are valid

## 🎯 Quick Test

To test if everything is working:
1. Login with the credentials above
2. Select "Parvathy Wedding"
3. Upload a test image
4. Check "Recent Uploads" to see if it appears
5. Go to "Photo Gallery" to view the uploaded photo

---

**Made with ❤️ for your special day**