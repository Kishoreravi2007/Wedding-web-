# 🔧 Google Sheets Feedback Troubleshooting

If feedbacks are not appearing in your Google Sheet, follow these steps:

## ✅ Quick Checklist

1. **Check your `.env` file** has these variables:
   ```env
   GOOGLE_SHEETS_CREDENTIALS=./google-service-account.json
   GOOGLE_SHEETS_SPREADSHEET_ID=1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY
   GOOGLE_SHEETS_SHEET_NAME=contact-message
   GOOGLE_SHEETS_FEEDBACK_SHEET_NAME=Feedback
   ```

2. **Verify the sheet name matches exactly** (case-sensitive):
   - Open your Google Sheet: [https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit](https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit)
   - Check the tab name at the bottom - it should be exactly "Feedback" (not "feedback" or "FEEDBACK")
   - If it doesn't exist, create a new sheet tab and name it "Feedback"

3. **Check backend console logs** when submitting feedback:
   - Look for messages like:
     - `📊 Writing feedback to Google Sheet: "Feedback"...`
     - `✅ Feedback written to Google Sheet successfully`
     - Or error messages starting with `❌` or `⚠️`

4. **Restart your backend server** after updating `.env`:
   ```bash
   cd backend
   # Stop server (Ctrl+C)
   node server.js
   ```

## 🔍 Common Issues

### Issue: "Google Sheets not configured"
**Solution:**
- Make sure `GOOGLE_SHEETS_CREDENTIALS` and `GOOGLE_SHEETS_SPREADSHEET_ID` are set in `.env`
- Restart the backend server

### Issue: "Sheet not found" or "The caller does not have permission"
**Solution:**
1. Make sure the "Feedback" sheet tab exists in your spreadsheet
2. Share the sheet with the service account email: `google-sheet@wedding-web-474912.iam.gserviceaccount.com`
3. Give it "Editor" permissions

### Issue: Sheet name doesn't match
**Solution:**
- The sheet name is case-sensitive
- If your sheet is named "feedback" (lowercase), update `.env`:
  ```env
  GOOGLE_SHEETS_FEEDBACK_SHEET_NAME=feedback
  ```
- Or rename the sheet tab in Google Sheets to exactly "Feedback"

### Issue: Feedback saves to database but not to Google Sheets
**Solution:**
1. Check backend console for error messages
2. Verify all environment variables are set correctly
3. Make sure the service account has access to the sheet
4. Check if the "Feedback" sheet tab exists

## 🧪 Test the Integration

1. Submit a test feedback through your website
2. Check the backend console - you should see:
   ```
   📊 Writing feedback to Google Sheet: "Feedback" in spreadsheet 1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY
   ✅ Feedback written to Google Sheet successfully
      Sheet: "Feedback", Row added with 7 cells
   ```

3. Check your Google Sheet - the feedback should appear in the "Feedback" tab

## 📋 Verify Your Configuration

Run this in your backend directory to check environment variables:
```bash
node -e "require('dotenv').config(); console.log('Spreadsheet ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID); console.log('Feedback Sheet Name:', process.env.GOOGLE_SHEETS_FEEDBACK_SHEET_NAME || 'Feedback (default)'); console.log('Credentials:', process.env.GOOGLE_SHEETS_CREDENTIALS ? 'Set' : 'Missing');"
```

## 🔗 Related Files

- Feedback route: `backend/routes/feedback.js`
- Google Sheets utility: `backend/lib/google-sheets.js`
- Environment example: `backend/env.example`

