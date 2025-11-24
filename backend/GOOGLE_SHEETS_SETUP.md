# 📊 Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration so that contact form submissions are automatically saved to a Google Sheet.

## 🎯 Overview

When someone submits a message through the contact form, it will be:
1. Saved to your Supabase database (as before)
2. **Automatically added to a Google Sheet** (new feature)

## 📋 Prerequisites

1. A Google account
2. A Google Cloud Project (or create one)
3. Node.js backend with `googleapis` package installed

## 🚀 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter a project name (e.g., "Wedding Website Contact Forms")
4. Click **"Create"**
5. Wait for the project to be created and select it

### Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it and click **"Enable"**
4. Wait for the API to be enabled

### Step 3: Create a Service Account

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"Service Account"**
3. Enter a name (e.g., "wedding-contact-sheets")
4. Click **"Create and Continue"**
5. Skip the optional steps and click **"Done"**

### Step 4: Create and Download Service Account Key

1. Click on the service account you just created
2. Go to the **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **"JSON"** format
5. Click **"Create"** - this will download a JSON file
6. **Save this file securely** - you'll need it in the next step

### Step 5: Create a Google Sheet

**✅ Your Spreadsheet is Already Set Up!**

Your Google Sheet is ready at: [https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit](https://docs.google.com/spreadsheets/d/1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY/edit)

- **Spreadsheet ID**: `1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY`
- **Sheet Name**: `contact-message`

If you need to create a new sheet in the future:
1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it something like "Wedding Contact Messages"
4. **Copy the Spreadsheet ID** from the URL:
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

### Step 6: Share the Sheet with Service Account

1. In your Google Sheet, click **"Share"** (top right)
2. Get the **client email** from the service account JSON file you downloaded
   - It looks like: `wedding-contact-sheets@your-project.iam.gserviceaccount.com`
3. Paste this email in the "Add people" field
4. Give it **"Editor"** permissions
5. Click **"Send"** (you can uncheck "Notify people" if you want)

### Step 7: Configure Backend Environment Variables

You have two options for providing credentials:

#### Option A: JSON File (Recommended for Local Development)

1. Place the downloaded JSON file in your `backend` folder
2. Name it something like `google-service-account.json`
3. Add to your `.env` file:

```env
GOOGLE_SHEETS_CREDENTIALS=./google-service-account.json
GOOGLE_SHEETS_SPREADSHEET_ID=1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY
GOOGLE_SHEETS_SHEET_NAME=contact-message
```

#### Option B: JSON String (Recommended for Deployment)

1. Open the downloaded JSON file
2. Copy its entire contents
3. Convert it to a single-line string (remove all line breaks)
4. Add to your `.env` file:

```env
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
GOOGLE_SHEETS_SPREADSHEET_ID=1PZq37wQiGTOcXLEOh5xm60kpDvM9LU4GV8GBPm_8acY
GOOGLE_SHEETS_SHEET_NAME=contact-message
```

**Note:** For deployment platforms (Render, Heroku, etc.), use Option B and add the `GOOGLE_SHEETS_CREDENTIALS` as an environment variable in your platform's dashboard.

### Step 8: Test the Integration

1. Make sure your backend server is running
2. Submit a test message through the contact form
3. Check your Google Sheet - you should see:
   - Headers in the first row (if it's the first submission)
   - A new row with the contact information

## 📝 Sheet Structure

The Google Sheet will automatically have these columns:

| Timestamp | Name | Email | Phone | Event Date | Guest Count | Message |
|-----------|------|-------|-------|------------|-------------|---------|
| 1/15/2024, 10:30 AM | John Doe | john@example.com | +1234567890 | 06-15-2024 | 150 | Hello... |

## 🔧 Troubleshooting

### Issue: "GOOGLE_SHEETS_CREDENTIALS environment variable is not set"

**Solution:** Make sure you've added the `GOOGLE_SHEETS_CREDENTIALS` to your `.env` file and restarted your server.

### Issue: "GOOGLE_SHEETS_SPREADSHEET_ID environment variable is not set"

**Solution:** Make sure you've added the `GOOGLE_SHEETS_SPREADSHEET_ID` to your `.env` file. You can find it in the Google Sheet URL.

### Issue: "The caller does not have permission"

**Solution:** Make sure you've shared the Google Sheet with the service account email (from the JSON file) with "Editor" permissions.

### Issue: "Sheet not found"

**Solution:** 
- Check that the `GOOGLE_SHEETS_SHEET_NAME` matches the exact name of the sheet tab (case-sensitive)
- If you haven't specified a sheet name, it defaults to "Contact Messages"
- Make sure the sheet exists in your spreadsheet

### Issue: Messages save to database but not to Google Sheets

**Solution:**
- Check your backend console logs for error messages
- Verify all environment variables are set correctly
- Make sure the Google Sheets API is enabled in your Google Cloud project
- Verify the service account has access to the sheet

## 🔒 Security Notes

1. **Never commit the service account JSON file to Git**
   - Add it to `.gitignore`
   - Use environment variables for deployment

2. **Keep your service account key secure**
   - Don't share it publicly
   - Rotate keys periodically

3. **Limit service account permissions**
   - Only give it access to the specific sheet it needs
   - Don't give it access to your entire Google Drive

## ✅ Verification Checklist

- [ ] Google Cloud Project created
- [ ] Google Sheets API enabled
- [ ] Service Account created
- [ ] Service Account key downloaded
- [ ] Google Sheet created
- [ ] Sheet shared with service account email
- [ ] Environment variables configured
- [ ] Backend server restarted
- [ ] Test message submitted successfully
- [ ] Data appears in Google Sheet

## 📚 Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [googleapis Node.js Library](https://github.com/googleapis/google-api-nodejs-client)

## 🆘 Need Help?

If you encounter issues:
1. Check the backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure the Google Sheets API is enabled
4. Ensure the service account has proper permissions

The integration is designed to be non-blocking - if Google Sheets fails, the message will still be saved to your Supabase database, and you'll see an error in the console logs.

