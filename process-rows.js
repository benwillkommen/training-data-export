const fs = require('fs');
const fse = require('fs-extra');
const uuid = require('uuid');
const { google } = require('googleapis');
const { authorize, getAuthClientAsync } = require('./authorize')
const { promisify } = require('util');
const { isRowEmpty, stripBodyWeightRows, extractDay } = require('./rowProcessing')
const { convertArrayToCSV } = require('convert-array-to-csv');
const sleep = require('system-sleep');

const SPREADSHEET_ID = process.argv[2] || '1Au638nEKSAa2xl8WucH_XW3tw8urKooXJHr9kmlkf1E';
const TRAINING_DATA_DIR = process.env.TRAINING_DATA_DIR || "./data"

const COLUMN_HEADERS = ["week", "day", "exercise", "sets", "reps", "instructions", "weight", "notes", "supersetId"];

const readFileAsync = promisify(fs.readFile);
const authorizeAsync = promisify(authorize);


(async function () {
    const credentials = JSON.parse(await readFileAsync('credentials.json'));
    const authClient = await getAuthClientAsync(credentials);
    downloadSpreadsheetAsync(SPREADSHEET_ID, authClient);
})();

// Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//     if (err) return console.log('Error loading client secret file:', err);

//     function withAuth(callback, spreadsheetId, auth) {
//         callback(spreadsheetId, auth);
//     }

//     const processWithAuth = withAuth.bind(null, downloadSpreadsheetAsync, SPREADSHEET_ID);

//     // Authorize a client with credentials, then call the Google Sheets API.
//     authorize(JSON.parse(content), processWithAuth);
// });

function downloadSpreadsheetAsync(spreadsheetId, auth) {
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


function ensureAllColumnsExist(rows) {
    return rows.map(r => {
        const fillerArray = [];
        for (let i = 0; i < COLUMN_HEADERS.length - r.length; i++) {
            fillerArray.push("");
        }
        return r.concat(fillerArray);
    });
}

function associateSuperSets(cleanedRows) {

    const superSetIndices = cleanedRows
        .map((row, i) => { return { value: row[2].toLowerCase().trim(), index: i } })
        .filter(rowObj => rowObj.value.includes("superset"))
        .map(rowObj => rowObj.index);

    const groupedSuperSetIndices = superSetIndices.reduce((collection, next) => {
        if (collection.length === 0) {
            return [[next]];
        }

        const lastGroup = collection.slice(-1)[0];
        const lastValue = lastGroup.slice(-1)[0];
        if (next - lastValue > 2) {
            return collection.concat([[next]]);
        }

        return collection.slice(0, -1).concat([lastGroup.concat(next)]);

    }, []);

    const superSetRanges = groupedSuperSetIndices.map(si => {
        return {
            id: uuid(),
            start: si[0] - 1,
            end: si.slice(-1)[0] + 1
        }
    })

    const rowsWithAssociatedSuperSets = cleanedRows.map((row, i) => {
        for (let superSetRange of superSetRanges) {
            if (i >= superSetRange.start && i <= superSetRange.end) {
                return row.slice(0, -1).concat(superSetRange.id);
            }
        }
        return row.slice(0, -1).concat("")
    }).filter((row, i) => !superSetIndices.includes(i));

    return rowsWithAssociatedSuperSets
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
    const filePath = `${TRAINING_DATA_DIR}/clean-phase-1/${new Date().getTime()}.csv`;
    fse.outputFile(filePath, convertArrayToCSV(rows))
}

function downloadSheetsAsync(spreadsheetId, sheetTitles, sheetsClient, downloadBatchDirectoryName) {
    //sheetTitles = sheetTitles.filter(title => title === "Week 99"); // comment when ready to process them all

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
        }).then(s => {
            const filePath = `${TRAINING_DATA_DIR}/sheet-json-responses/${downloadBatchDirectoryName}/${s.data.sheetTitle}.json`;
            fse.outputFile(filePath, JSON.stringify(s.data, null, 3));
            return s;
        });
    });

    return sheetPromises;
}

function addHeaders(rows) {
    rows.unshift(COLUMN_HEADERS)
    return rows;
}