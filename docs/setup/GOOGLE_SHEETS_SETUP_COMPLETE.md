# ✅ Google Sheets Setup - Almost Complete!

## 🎯 What's Done

✅ Service account credentials file created: `backend/google-service-account.json`  
✅ Spreadsheet ID configured: `1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY`  
✅ Contact Messages sheet name: `contact-message`  
✅ Feedback sheet name: `Feedback`  
✅ Service account email: `google-sheet@wedding-web-474912.iam.gserviceaccount.com`

## 📋 Final Steps (2 minutes)

### Step 1: Share Your Google Sheet with Service Account

**IMPORTANT:** You must share your Google Sheet with the service account email!

1. Open your Google Sheet: [https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit](https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit)

2. Click the **"Share"** button (top right corner)

3. Add this email address:
   ```
   google-sheet@wedding-web-474912.iam.gserviceaccount.com
   ```

4. Give it **"Editor"** permissions

5. Click **"Send"** (you can uncheck "Notify people" if you want)

### Step 2: Configure Your .env File

Create or update `backend/.env` file with these lines:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_CREDENTIALS=./google-service-account.json
GOOGLE_SHEETS_SPREADSHEET_ID=1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY
GOOGLE_SHEETS_SHEET_NAME=contact-message
GOOGLE_SHEETS_FEEDBACK_SHEET_NAME=Feedback
```

### Step 3: Restart Your Backend Server

```bash
cd backend
# Stop your current server (Ctrl+C if running)
node server.js
```

### Step 4: Test It!

1. **Test Contact Form:**
   - Go to your contact form page
   - Submit a test message
   - Check the `contact-message` sheet - you should see the data appear automatically! 🎉

2. **Test Feedback Form:**
   - Go to your feedback page
   - Submit test feedback
   - Check the `Feedback` sheet - you should see the data appear automatically! 🎉

## 📊 What Will Appear in Your Sheets

### Contact Messages Sheet (`contact-message`)

The first time someone submits a contact message, these headers will be created automatically:

| Timestamp | Name | Email | Phone | Event Date | Guest Count | Message |
|-----------|------|-------|-------|------------|-------------|---------|

### Feedback Sheet (`Feedback`)

The first time someone submits feedback, these headers will be created automatically:

| Timestamp | Name | Email | Rating | Category | Message | Page URL |
|-----------|------|-------|--------|----------|---------|----------|

Then each new submission will add a new row with the respective information.

## 🔒 Security Note

✅ The `google-service-account.json` file is already in `.gitignore` - it won't be committed to Git.

⚠️ **Never share this file publicly or commit it to version control!**

## ❓ Troubleshooting

### "The caller does not have permission"
- Make sure you shared the sheet with `google-sheet@wedding-web-474912.iam.gserviceaccount.com`
- Make sure you gave it "Editor" permissions (not just "Viewer")

### "Sheet not found"
- For contact messages: Verify the sheet name is exactly `contact-message` (case-sensitive)
- For feedback: Verify the sheet name is exactly `Feedback` (case-sensitive)
- Make sure both sheet tabs exist in your spreadsheet

### Messages/Feedback save to database but not to Google Sheets
- Check your backend console logs for error messages
- Verify your `.env` file has all Google Sheets variables:
  - `GOOGLE_SHEETS_CREDENTIALS`
  - `GOOGLE_SHEETS_SPREADSHEET_ID`
  - `GOOGLE_SHEETS_SHEET_NAME` (for contact messages)
  - `GOOGLE_SHEETS_FEEDBACK_SHEET_NAME` (for feedback)
- Make sure you restarted the server after adding the `.env` variables

## 🎉 You're All Set!

Once you complete Step 1 (sharing the sheet), both your contact form submissions and feedback will automatically appear in your Google Sheets!

- **Contact Messages** → `contact-message` sheet
- **Feedback** → `Feedback` sheet

