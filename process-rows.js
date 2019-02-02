const fs = require('fs-extra');
const { promisify } = require('util');
const fsAsync = {
    readFile: promisify(fs.readFile),
    readdir: promisify(fs.readdir)
}
const uuid = require('uuid');
const { google } = require('googleapis');
const { getAuthClientAsync } = require('./authorize')
const { isRowEmpty, stripBodyWeightRows, extractDay } = require('./rowProcessing')
const { convertArrayToCSV } = require('convert-array-to-csv');
const sleep = require('system-sleep');
const sheetRepository = require('./sheetRepository');
const { consolidateSheet } = require('./sheetConsolidation')

const SPREADSHEET_ID = process.argv[2] || '1Au638nEKSAa2xl8WucH_XW3tw8urKooXJHr9kmlkf1E';
const { TRAINING_DATA_DIR, COLUMN_HEADERS } = require('./constants');

(async function () {
    //const sheets = await sheetRepository.getSheetsFromFileSystem("C:\\dev\\training-data-export\\data\\sheet-json-responses\\batch-1548518308304");

    // just going to read from file system for now, since repository methods return same results whether
    // reading from google drive or file system
    const credentials = JSON.parse(await fsAsync.readFile('credentials.json'));
    const authClient = await getAuthClientAsync(credentials);
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient });

    const sheetsFromGoogleDrive = await sheetRepository.getSheetsFromGoogleDrive(SPREADSHEET_ID, sheetsClient);
    const { persistedSheets, batchPath } = await sheetRepository.persistSheetsToFileSystem(sheetsFromGoogleDrive);

    // this is unnecessary, as we could have passed in sheetsFromGoogleDrive or persistedSheets
    // just exercising the repository.
    const sheetsFromFileSystem = await sheetRepository.getSheetsFromFileSystem(batchPath);

    const cleanedSheets = cleanSheets(sheetsFromFileSystem);
    const rows = flattenSheets(cleanedSheets);
    const rowsWithAllColumns = ensureAllColumnsExist(rows);
    const rowsWithAssociatedSupersets = associateSuperSets(rowsWithAllColumns);
    const cleanedRows = addHeaders(rowsWithAssociatedSupersets);
    await writeData(cleanedRows);

    //shittyDownloadSpreadsheetAsync(SPREADSHEET_ID, authClient);
})();

function cleanSheets(sheets) {
    return sheets.map(consolidateSheet)

}

function flattenSheets(sheets) {
    return sheets.reduce((prev, curr) => prev.concat(curr), [])
}


function shittyDownloadSpreadsheetAsync(spreadsheetId, auth) {
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


async function writeData(rows) {
    const filePath = `${TRAINING_DATA_DIR}/clean-phase-1/${new Date().getTime()}.csv`;
    await fs.outputFile(filePath, convertArrayToCSV(rows))
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
            fs.outputFile(filePath, JSON.stringify(s.data, null, 3));
            return s;
        });
    });

    return sheetPromises;
}

function addHeaders(rows) {
    rows.unshift(COLUMN_HEADERS)
    return rows;
}