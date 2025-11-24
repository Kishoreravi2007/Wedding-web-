const { google } = require('googleapis');
require('dotenv').config();

/**
 * Initialize Google Sheets API client
 * @returns {Promise<Object>} Google Sheets API client
 */
async function getSheetsClient() {
  try {
    // Check if credentials are provided
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (!credentials) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set');
    }

    // Parse credentials JSON
    let auth;
    try {
      const credentialsObj = JSON.parse(credentials);
      auth = new google.auth.GoogleAuth({
        credentials: credentialsObj,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (parseError) {
      // If parsing fails, try reading from file path
      const credentialsPath = credentials;
      auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    return sheets;
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw error;
  }
}

/**
 * Write contact message to Google Sheet
 * @param {Object} messageData - The contact message data
 * @param {string} messageData.name - Contact name
 * @param {string} messageData.email - Contact email
 * @param {string} messageData.phone - Contact phone (optional)
 * @param {string} messageData.eventDate - Event date (optional)
 * @param {string} messageData.guestCount - Guest count (optional)
 * @param {string} messageData.message - Message content
 * @returns {Promise<Object>} Result of the append operation
 */
async function writeContactMessageToSheet(messageData) {
  try {
    // Check if Google Sheets is configured - if not, silently skip
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    
    if (!spreadsheetId || !credentials) {
      console.log('Google Sheets not configured - skipping sheet write');
      return { success: false, error: 'Google Sheets not configured' };
    }

    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Contact Messages';
    const sheets = await getSheetsClient();

    // Format the date
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'short',
      timeStyle: 'short',
    });

    // Prepare row data
    const rowData = [
      timestamp,
      messageData.name || '',
      messageData.email || '',
      messageData.phone || '',
      messageData.eventDate || '',
      messageData.guestCount || '',
      messageData.message || '',
    ];

    // Check if sheet exists, create headers if it's the first row
    const range = `${sheetName}!A:G`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:G1`,
    });

    const existingHeaders = response.data.values?.[0];
    const hasHeaders = existingHeaders && existingHeaders.length > 0;

    // If no headers exist, add them
    if (!hasHeaders) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            'Timestamp',
            'Name',
            'Email',
            'Phone',
            'Event Date',
            'Guest Count',
            'Message',
          ]],
        },
      });
    }

    // Append the new row
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:G`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    });

    console.log('Contact message written to Google Sheet successfully');
    return {
      success: true,
      updatedCells: appendResponse.data.updates?.updatedCells || 0,
    };
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    // Don't throw error - we don't want to fail the entire request if Google Sheets fails
    // The message is already saved to Supabase
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Write feedback to Google Sheet
 * @param {Object} feedbackData - The feedback data
 * @param {string} feedbackData.name - Feedback name
 * @param {string} feedbackData.email - Feedback email (optional)
 * @param {number} feedbackData.rating - Rating (1-5)
 * @param {string} feedbackData.category - Feedback category
 * @param {string} feedbackData.message - Feedback message
 * @param {string} feedbackData.page_url - Page URL where feedback was submitted (optional)
 * @returns {Promise<Object>} Result of the append operation
 */
async function writeFeedbackToSheet(feedbackData) {
  try {
    // Check if Google Sheets is configured - if not, silently skip
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    
    if (!spreadsheetId || !credentials) {
      console.log('⚠️ Google Sheets not configured - skipping feedback sheet write');
      console.log('   Spreadsheet ID:', spreadsheetId ? '✓ Set' : '✗ Missing');
      console.log('   Credentials:', credentials ? '✓ Set' : '✗ Missing');
      return { success: false, error: 'Google Sheets not configured' };
    }

    const sheetName = process.env.GOOGLE_SHEETS_FEEDBACK_SHEET_NAME || 'Feedback';
    console.log(`📊 Writing feedback to Google Sheet: "${sheetName}" in spreadsheet ${spreadsheetId}`);
    const sheets = await getSheetsClient();

    // Format the date
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'short',
      timeStyle: 'short',
    });

    // Prepare row data
    const rowData = [
      timestamp,
      feedbackData.name || 'Anonymous',
      feedbackData.email || '',
      feedbackData.rating || '',
      feedbackData.category || 'general',
      feedbackData.message || '',
      feedbackData.page_url || '',
    ];

    // Check if sheet exists, create headers if it's the first row
    const range = `${sheetName}!A:G`;
    let response;
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:G1`,
      });
    } catch (error) {
      // Sheet might not exist, we'll create headers
      console.log(`⚠️ Sheet "${sheetName}" might not exist or error accessing it:`, error.message);
      console.log(`   Will attempt to create headers...`);
      response = { data: { values: null } };
    }

    const existingHeaders = response.data.values?.[0];
    const hasHeaders = existingHeaders && existingHeaders.length > 0;

    // If no headers exist, add them
    if (!hasHeaders) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            'Timestamp',
            'Name',
            'Email',
            'Rating',
            'Category',
            'Message',
            'Page URL',
          ]],
        },
      });
    }

    // Append the new row
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:G`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    });

    console.log('✅ Feedback written to Google Sheet successfully');
    console.log(`   Sheet: "${sheetName}", Row added with ${appendResponse.data.updates?.updatedCells || 0} cells`);
    return {
      success: true,
      updatedCells: appendResponse.data.updates?.updatedCells || 0,
    };
  } catch (error) {
    console.error('❌ Error writing feedback to Google Sheet:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      sheetName: process.env.GOOGLE_SHEETS_FEEDBACK_SHEET_NAME || 'Feedback',
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    });
    // Don't throw error - we don't want to fail the entire request if Google Sheets fails
    // The feedback is already saved to Supabase
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete contact message from Google Sheet by matching data
 * @param {Object} messageData - The contact message data to match
 * @param {string} messageData.email - Contact email
 * @param {string} messageData.message - Message content
 * @param {string} messageData.name - Contact name
 * @returns {Promise<Object>} Result of the delete operation
 */
async function deleteContactMessageFromSheet(messageData) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    
    if (!spreadsheetId || !credentials) {
      console.log('Google Sheets not configured - skipping contact message sheet delete');
      return { success: false, error: 'Google Sheets not configured' };
    }

    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Contact Messages';
    const sheets = await getSheetsClient();

    // Get all rows from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:G`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      // Only headers or empty sheet
      console.log('No data rows found in sheet');
      return { success: false, error: 'No data found' };
    }

    // Find the row index (skip header row, so start from index 1)
    // Column order: Timestamp (0), Name (1), Email (2), Phone (3), Event Date (4), Guest Count (5), Message (6)
    let rowIndex = -1;
    console.log(`🔍 Searching for contact message in sheet "${sheetName}":`);
    console.log(`   Looking for email: "${messageData.email}"`);
    console.log(`   Looking for message: "${messageData.message?.substring(0, 50)}..."`);
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowEmail = row[2] || '';
      const rowMessage = row[6] || '';
      
      // More flexible matching - trim and compare
      const emailMatch = rowEmail.trim().toLowerCase() === (messageData.email || '').trim().toLowerCase();
      const messageMatch = rowMessage.trim() === (messageData.message || '').trim();
      
      console.log(`   Row ${i + 1}: email="${rowEmail}", message="${rowMessage.substring(0, 30)}..."`);
      
      if (emailMatch && messageMatch) {
        rowIndex = i + 1; // +1 because Google Sheets is 1-indexed
        console.log(`   ✅ Match found at row ${rowIndex}`);
        break;
      }
    }

    if (rowIndex === -1) {
      console.log('❌ Contact message not found in Google Sheet');
      console.log(`   Total rows checked: ${rows.length - 1}`);
      return { success: false, error: 'Row not found' };
    }

    // Get sheet ID
    const sheetId = await getSheetId(sheets, spreadsheetId, sheetName);
    console.log(`🗑️ Deleting row ${rowIndex} from sheet ID ${sheetId}...`);
    
    // Delete the row
    const deleteResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-indexed for API
              endIndex: rowIndex,
            },
          },
        }],
      },
    });

    console.log(`✅ Contact message deleted from Google Sheet (row ${rowIndex})`);
    console.log(`   Delete response:`, deleteResponse.data);
    return { success: true, deletedRow: rowIndex };
  } catch (error) {
    console.error('❌ Error deleting contact message from Google Sheet:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });
    return { success: false, error: error.message };
  }
}

/**
 * Delete feedback from Google Sheet by matching data
 * @param {Object} feedbackData - The feedback data to match
 * @param {string} feedbackData.email - Feedback email (optional)
 * @param {number} feedbackData.rating - Rating
 * @param {string} feedbackData.message - Feedback message
 * @returns {Promise<Object>} Result of the delete operation
 */
async function deleteFeedbackFromSheet(feedbackData) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    
    if (!spreadsheetId || !credentials) {
      console.log('Google Sheets not configured - skipping feedback sheet delete');
      return { success: false, error: 'Google Sheets not configured' };
    }

    const sheetName = process.env.GOOGLE_SHEETS_FEEDBACK_SHEET_NAME || 'Feedback';
    const sheets = await getSheetsClient();

    // Get all rows from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:G`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      // Only headers or empty sheet
      console.log('No data rows found in feedback sheet');
      return { success: false, error: 'No data found' };
    }

    // Find the row index (skip header row, so start from index 1)
    // Column order: Timestamp (0), Name (1), Email (2), Rating (3), Category (4), Message (5), Page URL (6)
    let rowIndex = -1;
    console.log(`🔍 Searching for feedback in sheet "${sheetName}":`);
    console.log(`   Looking for email: "${feedbackData.email || '(no email)'}"`);
    console.log(`   Looking for rating: ${feedbackData.rating}`);
    console.log(`   Looking for message: "${feedbackData.message?.substring(0, 50)}..."`);
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowEmail = row[2] || '';
      const rowRating = row[3];
      const rowMessage = row[5] || '';
      
      // More flexible matching
      const emailMatch = !feedbackData.email || 
                        rowEmail.trim().toLowerCase() === feedbackData.email.trim().toLowerCase();
      const ratingMatch = String(rowRating) === String(feedbackData.rating);
      const messageMatch = rowMessage.trim() === (feedbackData.message || '').trim();
      
      console.log(`   Row ${i + 1}: email="${rowEmail}", rating="${rowRating}", message="${rowMessage.substring(0, 30)}..."`);
      
      if (emailMatch && ratingMatch && messageMatch) {
        rowIndex = i + 1; // +1 because Google Sheets is 1-indexed
        console.log(`   ✅ Match found at row ${rowIndex}`);
        break;
      }
    }

    if (rowIndex === -1) {
      console.log('❌ Feedback not found in Google Sheet');
      console.log(`   Total rows checked: ${rows.length - 1}`);
      return { success: false, error: 'Row not found' };
    }

    // Get sheet ID
    const sheetId = await getSheetId(sheets, spreadsheetId, sheetName);
    console.log(`🗑️ Deleting row ${rowIndex} from sheet ID ${sheetId}...`);
    
    // Delete the row
    const deleteResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-indexed for API
              endIndex: rowIndex,
            },
          },
        }],
      },
    });

    console.log(`✅ Feedback deleted from Google Sheet (row ${rowIndex})`);
    console.log(`   Delete response:`, deleteResponse.data);
    return { success: true, deletedRow: rowIndex };
  } catch (error) {
    console.error('❌ Error deleting feedback from Google Sheet:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });
    return { success: false, error: error.message };
  }
}

/**
 * Get sheet ID by sheet name
 * @param {Object} sheets - Google Sheets API client
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {string} sheetName - Sheet name
 * @returns {Promise<number>} Sheet ID
 */
async function getSheetId(sheets, spreadsheetId, sheetName) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    return sheet.properties.sheetId;
  } catch (error) {
    console.error('Error getting sheet ID:', error);
    throw error;
  }
}

module.exports = {
  writeContactMessageToSheet,
  writeFeedbackToSheet,
  deleteContactMessageFromSheet,
  deleteFeedbackFromSheet,
  getSheetsClient,
};

