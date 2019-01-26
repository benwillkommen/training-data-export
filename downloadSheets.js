const fs = require('fs');
const authorize = require('./authorize');

function downloadAllSheets(spreadsheetId) {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err)
            return console.log('Error loading client secret file:', err);

        function withAuth(callback, spreadsheetId, auth) {
            callback(spreadsheetId, auth);
        }
        const processWithAuth = withAuth.bind(null, _downloadSpreadsheetAsync, spreadsheetId);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), processWithAuth);
    });
}

function _downloadSpreadsheetAsync(spreadsheetId, auth) {
    const sheetsClient = google.sheets({ version: 'v4', auth });
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);

    const downloadBatchDirectoryName = `batch-${new Date().getTime()}`;

    getSpreadsheetAsync({ spreadsheetId })
        .then(res => {
            return res.data.sheets.map(s => s.properties.title).slice(1);
        })
        .then(sheetTitles => downloadSheetsAsync(spreadsheetId, sheetTitles, sheetsClient, downloadBatchDirectoryName))
        .then(sheetPromises => sheetPromises.map(cleanSheet))
        .then(cleanedSheetPromises => Promise.all(cleanedSheetPromises))
        .then(cleanedSheets => cleanedSheets.sort((x, y) => x[0][0] > y[0][0]))
        .then(cleanedSheets => cleanedSheets.reduce((prev, curr) => prev.concat(curr), []))
        .then(cleanedRows => ensureAllColumnsExist(cleanedRows))
        .then(cleanedRows => associateSuperSets(cleanedRows))
        .then(cleanedRows => addHeaders(cleanedRows))
        .then(cleanedRows => writeData(cleanedRows));
}
