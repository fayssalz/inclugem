/**
 * Utility functions for syncing Gem Inclusions with Google Sheets
 * via Google Apps Script Web App.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `// ====================================================
// HYPERION GEM INCLUSIONS DATABASE - GOOGLE APPS SCRIPT
// ====================================================
// Instructions:
// 1. Open your Google Sheet.
// 2. Click Extensions > Apps Script.
// 3. Delete default code, paste this script, and click Save.
// 4. Click Deploy > New deployment.
// 5. Select type: "Web app".
// 6. Description: "Hyperion Inclusions API".
// 7. Execute as: "Me" (your email).
// 8. Who has access: "Anyone".
// 9. Click Deploy, authorize access, and copy the Web App URL!

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var val = row[j];
      if (header === 'tags' || header === 'references') {
        try {
          val = typeof val === 'string' ? JSON.parse(val) : val;
        } catch(err) {
          val = [];
        }
      }
      obj[header] = val;
    }
    result.push(obj);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var contents = {};
  try {
    contents = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON payload' })).setMimeType(ContentService.MimeType.JSON);
  }

  var action = contents.action || 'save';
  var record = contents.record || {};

  var headers = [
    'id', 'imageNumber', 'title', 'gemType', 'taxonomy', 'origin', 
    'enhancement', 'lighting', 'photographer', 'fieldOfView', 
    'magnification', 'datePosted', 'description', 'imageUrl', 'thumbUrl', 
    'tags', 'references'
  ];

  // Initialize headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  var data = sheet.getDataRange().getValues();
  var existingRowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(record.id)) {
      existingRowIndex = i + 1; // 1-indexed row number
      break;
    }
  }

  if (action === 'delete') {
    if (existingRowIndex > 0) {
      sheet.deleteRow(existingRowIndex);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Deleted record' })).setMimeType(ContentService.MimeType.JSON);
  }

  var rowValues = headers.map(function(h) {
    var val = record[h];
    if (h === 'tags' || h === 'references') {
      return JSON.stringify(val || []);
    }
    return val !== undefined && val !== null ? String(val) : '';
  });

  if (existingRowIndex > 0) {
    sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, record: record })).setMimeType(ContentService.MimeType.JSON);
}`;

/**
 * Fetches all inclusion records from Google Sheets Web App URL.
 *
 * @param {string} scriptUrl - Google Apps Script Web App URL.
 * @returns {Promise<Array>}
 */
export async function fetchFromGoogleSheet(scriptUrl) {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/')) {
    throw new Error('Please configure a valid Google Apps Script Web App URL in Settings.');
  }

  const response = await fetch(scriptUrl);
  if (!response.ok) {
    throw new Error(`Google Sheet request failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Google Sheet returned invalid format. Expected JSON array.');
  }

  return data;
}

/**
 * Saves or deletes a record in Google Sheets.
 *
 * @param {string} scriptUrl - Google Apps Script Web App URL.
 * @param {Object} record - Inclusion record object.
 * @param {'save'|'delete'} action - Action type.
 * @returns {Promise<Object>}
 */
export async function saveToGoogleSheet(scriptUrl, record, action = 'save') {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/')) {
    throw new Error('Please configure a valid Google Apps Script Web App URL in Settings.');
  }

  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8' // Google Apps Script Web App standard
    },
    body: JSON.stringify({
      action,
      record
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to save to Google Sheet (HTTP ${response.status})`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Google Sheet save failed');
  }

  return json;
}
