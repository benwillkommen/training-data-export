const fs = require('fs');
const { google } = require('googleapis');
const authorize = require('./authorize')
const { promisify } = require('util');
const { isRowEmpty, stripBodyWeightRows, extractDay } = require('./rowProcessing')
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
        .then(cleanedRows => addHeaders(cleanedRows))
        .then(cleanedRows => writeData(cleanedRows));
}

function cleanSheet(sheetPromise) {
    return sheetPromise.then(sheet => {
        const rows = sheet.data.values;
        const cleanedRows = stripBodyWeightRows(rows.filter(r => !isRowEmpty(r)));
        const specialCharsRemovedRows = cleanedRows.map(row => row.map(cell => typeof cell === "string" ? cell.replace(/["]*/g, "") : cell));
        const dayLabeledRows = extractDays(specialCharsRemovedRows, 1);
        const weekLabeledRows = dayLabeledRows.map(r => {
            r.unshift(parseInt(sheet.data.sheetTitle.replace(/\D/g, '')));
            return r;
        });

        return weekLabeledRows;
    });
}

function extractDays(cleanedRows) {
    return extractDay(cleanedRows, 1).concat(extractDay(cleanedRows, 2)).concat(extractDay(cleanedRows, 3)).concat(extractDay(cleanedRows, 4));
}


function writeData(rows) {
    fs.writeFile(`./data/spreadsheet-export-${new Date().getTime()}.csv`, convertArrayToCSV(rows))
}

function downloadSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    //sheetTitles = sheetTitles.slice(0, 2); // comment when ready to process them all

    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);

    const sheetPromises = sheetTitles.map(sheetTitle => {
        sleep(200);
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

function addHeaders(rows) {
    rows.unshift(["Week", "Day", "Exercise", "Sets", "Reps", "Instructions", "Weight", "Notes"])
    return rows;
}