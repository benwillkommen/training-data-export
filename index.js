const fs = require('fs');
const { google } = require('googleapis');
const authorize = require('./authorize')
const { promisify } = require('util');
const { isRowEmpty, stripBodyWeightRows, extractAndLabelDay } = require('./rowProcessing')
const { convertArrayToCSV } = require('convert-array-to-csv');
const sleep = require('system-sleep');

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
        .then(sheetPromises => sheetPromises.map(cleanSheet))
        .then(cleanedSheetPromises => Promise.all(cleanedSheetPromises))
        .then(cleanedSheets => cleanedSheets.sort((x, y) => x[0][0] > y[0][0]))
        .then(cleanedSheets => cleanedSheets.reduce((prev, curr) => prev.concat(curr), []))
        .then(cleanedRows => fs.writeFile(`./data/spreadsheet-export-${new Date().getTime()}`, convertArrayToCSV(cleanedRows)));
}

function cleanSheet(sheetPromise) {

    return sheetPromise.then(sheet => {
        const rows = sheet.data.values;
        const cleanedRows = stripBodyWeightRows(rows.filter(r => !isRowEmpty(r)));
        const dayLabeledRows = labelDays(cleanedRows, 1);
        const weekLabeledRows = dayLabeledRows.map(r => {
            r.unshift(parseInt(sheet.data.sheetTitle.replace(/\D/g, '')));
            return r;
        });
        return weekLabeledRows;
    });
}

function labelDays(cleanedRows) {
    return extractAndLabelDay(cleanedRows, 1).concat(extractAndLabelDay(cleanedRows, 2)).concat(extractAndLabelDay(cleanedRows, 3)).concat(extractAndLabelDay(cleanedRows, 4));
}


function downloadSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    //sheetTitles = sheetTitles.slice(0, 1); // uncomment when ready to process them all

    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);

    const sheetPromises = sheetTitles.map(sheetTitle => {
        sleep(500);
        console.log(`getting sheet: ${sheetTitle}`)
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
