const fs = require('fs');
const { google } = require('googleapis');
const authorize = require('./authorize')
const { promisify } = require('util');

const SPREADSHEET_ID = process.argv[2] || '1Au638nEKSAa2xl8WucH_XW3tw8urKooXJHr9kmlkf1E'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);

    function withAuth(callback, spreadsheetId, auth) {
        callback(spreadsheetId, auth);
    }

    const processWithAuth = withAuth.bind(null, downloadSpreadsheetAsync, SPREADSHEET_ID);

    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), processWithAuth);
});

function downloadSpreadsheetAsync(spreadsheetId, auth) {
    const sheetsClient = google.sheets({ version: 'v4', auth });
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);

    getSpreadsheetAsync({ spreadsheetId })
        .then(res => res.data.sheets.map(s => s.properties.title))
        .then(sheetTitles => downloadSheetsAsync(spreadsheetId, sheetTitles, sheetsClient))
        .then(sheetPromises => sheetPromises.map(processSheet));
}

function processSheet(sheetPromise) {
    sheetPromise.then(sheet => {
        const rows = sheet.data.values;
        console.log(sheet.data.sheetTitle);

        for (let i = 0; i < rows.length; i++) {
            console.log(rows[i])
        }

    });
}

function downloadSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    sheetTitles = sheetTitles.slice(0, 3); // uncomment when ready to process them all

    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);

    const sheetPromises = sheetTitles.map(sheetTitle => {
        return getSheetAsync({
            spreadsheetId: spreadsheetId,
            range: sheetTitle,
        }).then(s => {
            s.data.sheetTitle = sheetTitle;
            return s;
        });
    });

    return sheetPromises;
}
