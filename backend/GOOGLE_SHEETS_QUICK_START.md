# 🚀 Google Sheets Quick Start - Your Spreadsheet

## ✅ Your Spreadsheet Details

- **Spreadsheet URL**: [https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit](https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit)
- **Spreadsheet ID**: `1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY`
- **Sheet Name**: `contact-message`

## 📋 Quick Setup Steps

### 1. Set Up Google Service Account (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Sheets API**
4. Create a **Service Account** → Download JSON key file

### 2. Share Your Sheet (1 minute)

1. Open your sheet: [https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit](https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit)
2. Click **"Share"** button (top right)
3. Get the **client_email** from your downloaded JSON file (looks like: `something@project.iam.gserviceaccount.com`)
4. Paste the email → Give **"Editor"** permission → **"Send"**

### 3. Configure Backend (2 minutes)

Create or update `backend/.env` file:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_CREDENTIALS=./google-service-account.json
GOOGLE_SHEETS_SPREADSHEET_ID=1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY
GOOGLE_SHEETS_SHEET_NAME=contact-message
```

**Important**: Place your downloaded JSON file in the `backend` folder and name it `google-service-account.json`

### 4. Restart Backend Server

```bash
cd backend
# Stop your current server (Ctrl+C)
node server.js
```

### 5. Test It!

1. Submit a test message through your contact form
2. Check your Google Sheet - you should see the data appear automatically!

## 📊 What Gets Saved

When someone submits the contact form, these columns will be created automatically:

| Timestamp | Name | Email | Phone | Event Date | Guest Count | Message |
|-----------|------|-------|-------|------------|-------------|---------|

## ❓ Need Help?

See the full detailed guide: `backend/GOOGLE_SHEETS_SETUP.md`

## 🔒 Security Note

- Never commit the `google-service-account.json` file to Git
- It's already in `.gitignore` for safety
- For deployment, use the JSON string method (see full guide)

